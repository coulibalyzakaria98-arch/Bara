"""
================================================================
Routes Matching - BaraCorrespondance AI
================================================================
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import User, Candidate, Job
from app.utils.helpers import success_response, error_response, safe_int
from app.services.matching_service import matching_service

matching_bp = Blueprint('matching', __name__)


@matching_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_matched_jobs():
    """
    Obtenir les offres correspondant au profil du candidat

    Query params:
    - limit: Nombre max de résultats (default: 20)
    - min_score: Score minimum (default: 50)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)

    # Paramètres
    limit = request.args.get('limit', 20, type=int)
    min_score = request.args.get('min_score', 50, type=int)

    # Obtenir les matchs
    matches = matching_service.get_matched_jobs_for_candidate(
        candidate.id,
        limit=limit,
        min_score=min_score
    )

    return success_response({
        'matches': matches,
        'total': len(matches)
    })


@matching_bp.route('/candidates', methods=['GET'])
@jwt_required()
def get_matched_candidates():
    """
    Obtenir les candidats correspondant aux offres de l'entreprise

    Query params:
    - job_id: ID de l'offre spécifique (optionnel)
    - limit: Nombre max de résultats (default: 20)
    - min_score: Score minimum (default: 50)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = user.company
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    # Paramètres
    job_id = request.args.get('job_id', type=int)
    limit = request.args.get('limit', 20, type=int)
    min_score = request.args.get('min_score', 50, type=int)

    if job_id:
        # Vérifier que l'offre appartient à l'entreprise
        job = Job.query.get(job_id)
        if not job or job.company_id != company.id:
            return error_response("Offre non trouvée", 404)

        matches = matching_service.get_matched_candidates_for_job(
            job_id,
            limit=limit,
            min_score=min_score
        )

        return success_response({
            'job': job.to_dict(),
            'matches': matches,
            'total': len(matches)
        })
    else:
        # Obtenir les matchs pour toutes les offres actives
        jobs = Job.query.filter_by(
            company_id=company.id,
            is_active=True
        ).all()

        all_matches = {}
        for job in jobs:
            matches = matching_service.get_matched_candidates_for_job(
                job.id,
                limit=5,  # Limiter par offre
                min_score=min_score
            )
            if matches:
                all_matches[job.id] = {
                    'job': job.to_dict(),
                    'matches': matches,
                    'total': len(matches)
                }

        return success_response({
            'jobs_with_matches': all_matches,
            'total_jobs': len(all_matches)
        })


@matching_bp.route('/score', methods=['POST'])
@jwt_required()
def calculate_match():
    """
    Calculer le score de matching entre un candidat et une offre

    Body:
    - job_id: ID de l'offre
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)

    data = request.get_json()
    job_id = data.get('job_id')

    if not job_id:
        return error_response("job_id requis", 400)

    job = Job.query.get(job_id)
    if not job:
        return error_response("Offre non trouvée", 404)

    # Calculer le score
    match_result = matching_service.calculate_match_score(candidate, job)

    return success_response({
        'job': job.to_dict(include_company=True),
        'match': match_result
    })
