"""
================================================================
Routes Matches - BaraCorrespondance AI
================================================================
Gestion des correspondances automatiques CV-Emploi
"""

from flask import Blueprint, request, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import io as io_module

from app import db
from app.models import User, Candidate, Company, Match, CVAnalysis
from app.utils.helpers import success_response, error_response, safe_int
from app.services.pdf_generator import pdf_generator

matches_bp = Blueprint('matches', __name__)


@matches_bp.route('', methods=['GET'])
@jwt_required()
def get_matches():
    """
    Récupérer les matchs de l'utilisateur

    Query params:
    - status: Filtrer par statut (new, viewed, interested, etc.)
    - min_score: Score minimum (default: 0)
    - limit: Nombre max (default: 20)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    min_score = request.args.get('min_score', 0, type=float)
    limit = request.args.get('limit', 20, type=int)
    status = request.args.get('status')

    if user.role == 'candidate':
        # Matchs pour le candidat
        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if not candidate:
            return error_response("Profil candidat non trouvé", 404)

        query = Match.query.filter_by(candidate_id=candidate.id)

    elif user.role == 'company':
        # Matchs pour l'entreprise
        company = Company.query.filter_by(user_id=user_id).first()
        if not company:
            return error_response("Profil entreprise non trouvé", 404)

        # Récupérer les matchs pour tous les jobs de l'entreprise
        query = Match.query.join(Match.job).filter_by(company_id=company.id)

    else:
        return error_response("Type d'utilisateur non supporté", 400)

    # Filtres
    if min_score > 0:
        query = query.filter(Match.match_score >= min_score)

    if status:
        query = query.filter_by(status=status)

    # Récupérer les matchs
    matches = query.order_by(
        Match.match_score.desc(),
        Match.created_at.desc()
    ).limit(limit).all()

    # Sérialiser avec les détails
    matches_data = [
        m.to_dict(
            include_candidate=(user.role == 'company'),
            include_job=(user.role == 'candidate'),
            include_analysis=True
        )
        for m in matches
    ]

    return success_response({
        'matches': matches_data,
        'total': len(matches),
        'role': user.role
    })


@matches_bp.route('/<int:match_id>', methods=['GET'])
@jwt_required()
def get_match(match_id):
    """Récupérer les détails d'un match"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    match = Match.query.get(match_id)
    if not match:
        return error_response("Match non trouvé", 404)

    # Vérifier les permissions
    if user.role == 'candidate':
        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if not candidate or match.candidate_id != candidate.id:
            return error_response("Accès interdit", 403)

        # Marquer comme vu par le candidat
        match.mark_viewed_by_candidate()

    elif user.role == 'company':
        company = Company.query.filter_by(user_id=user_id).first()
        if not company:
            return error_response("Profil entreprise non trouvé", 404)

        # Vérifier que le job appartient à cette entreprise
        if match.job.company_id != company.id:
            return error_response("Accès interdit", 403)

        # Marquer comme vu par l'entreprise
        match.mark_viewed_by_company()

    return success_response({
        'match': match.to_dict(
            include_candidate=True,
            include_job=True,
            include_analysis=True
        )
    })


@matches_bp.route('/<int:match_id>/action', methods=['PUT'])
@jwt_required()
def set_match_action(match_id):
    """
    Définir une action sur un match

    Body:
    {
        "action": "interested|not_interested|applied|contacted",
        "notes": "Notes optionnelles"
    }
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    if not user or not data:
        return error_response("Données invalides", 400)

    match = Match.query.get(match_id)
    if not match:
        return error_response("Match non trouvé", 404)

    action = data.get('action')
    notes = data.get('notes')

    if not action:
        return error_response("Action requise", 400)

    try:
        if user.role == 'candidate':
            candidate = Candidate.query.filter_by(user_id=user_id).first()
            if not candidate or match.candidate_id != candidate.id:
                return error_response("Accès interdit", 403)

            match.set_candidate_action(action, notes)

        elif user.role == 'company':
            company = Company.query.filter_by(user_id=user_id).first()
            if not company or match.job.company_id != company.id:
                return error_response("Accès interdit", 403)

            match.set_company_action(action, notes)

        else:
            return error_response("Type d'utilisateur non supporté", 400)

        db.session.commit()

        return success_response({
            'match': match.to_dict(include_candidate=True, include_job=True),
            'message': 'Action enregistrée avec succès'
        })

    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


@matches_bp.route('/<int:match_id>/favorite', methods=['PUT'])
@jwt_required()
def toggle_favorite(match_id):
    """Marquer/démarquer un match comme favori"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json() or {}

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    match = Match.query.get(match_id)
    if not match:
        return error_response("Match non trouvé", 404)

    is_favorite = data.get('is_favorite', True)

    try:
        if user.role == 'candidate':
            candidate = Candidate.query.filter_by(user_id=user_id).first()
            if not candidate or match.candidate_id != candidate.id:
                return error_response("Accès interdit", 403)

            match.is_favorite_candidate = is_favorite

        elif user.role == 'company':
            company = Company.query.filter_by(user_id=user_id).first()
            if not company or match.job.company_id != company.id:
                return error_response("Accès interdit", 403)

            match.is_favorite_company = is_favorite

        else:
            return error_response("Type d'utilisateur non supporté", 400)

        db.session.commit()

        return success_response({
            'match': match.to_dict(),
            'message': 'Favori mis à jour'
        })

    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


@matches_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_match_stats():
    """Récupérer les statistiques de matching"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    if user.role == 'candidate':
        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if not candidate:
            return error_response("Profil candidat non trouvé", 404)

        total_matches = Match.query.filter_by(candidate_id=candidate.id).count()
        new_matches = Match.query.filter_by(candidate_id=candidate.id, status='new').count()
        mutual_interest = Match.query.filter_by(
            candidate_id=candidate.id,
            is_mutual_interest=True
        ).count()

        # Score moyen
        avg_score = db.session.query(db.func.avg(Match.match_score)).filter_by(
            candidate_id=candidate.id
        ).scalar() or 0

        return success_response({
            'total_matches': total_matches,
            'new_matches': new_matches,
            'mutual_interest': mutual_interest,
            'average_score': round(float(avg_score), 1),
            'cv_analyses_count': CVAnalysis.query.filter_by(candidate_id=candidate.id).count()
        })

    elif user.role == 'company':
        company = Company.query.filter_by(user_id=user_id).first()
        if not company:
            return error_response("Profil entreprise non trouvé", 404)

        # Matchs pour tous les jobs de l'entreprise
        total_matches = db.session.query(Match).join(Match.job).filter_by(
            company_id=company.id
        ).count()

        new_matches = db.session.query(Match).join(Match.job).filter(
            Match.status == 'new',
            Match.job.has(company_id=company.id)
        ).count()

        mutual_interest = db.session.query(Match).join(Match.job).filter(
            Match.is_mutual_interest == True,
            Match.job.has(company_id=company.id)
        ).count()

        return success_response({
            'total_matches': total_matches,
            'new_matches': new_matches,
            'mutual_interest': mutual_interest
        })


@matches_bp.route('/<int:match_id>/download-pdf', methods=['GET'])
@jwt_required()
def download_match_pdf(match_id):
    """
    Télécharger le rapport PDF d'un match

    Permissions:
    - Candidat ou entreprise du match uniquement
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    # Récupérer le match avec toutes les relations
    match = Match.query.get(match_id)
    if not match:
        return error_response("Match non trouvé", 404)

    # Vérifier les permissions
    has_access = False

    if user.role == 'candidate':
        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if candidate and match.candidate_id == candidate.id:
            has_access = True

    elif user.role == 'company':
        company = Company.query.filter_by(user_id=user_id).first()
        if company and match.job.company_id == company.id:
            has_access = True

    if not has_access:
        return error_response("Accès non autorisé", 403)

    try:
        # Préparer les données du match
        match_data = match.to_dict(include_candidate=True, include_job=True)

        # Générer le PDF
        pdf_content = pdf_generator.generate_match_report(match_data, user.role)

        # Nom du fichier
        entity_name = ""
        if user.role == 'candidate':
            entity_name = match.job.title.replace(' ', '_') if match.job.title else 'job'
        else:
            entity_name = match.candidate.full_name.replace(' ', '_') if match.candidate.full_name else 'candidat'

        filename = f"match_rapport_{entity_name}_{datetime.now().strftime('%Y%m%d')}.pdf"

        # Retourner le PDF
        return send_file(
            io_module.BytesIO(pdf_content),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        current_app.logger.error(f"Erreur génération PDF match: {str(e)}")
        return error_response(f"Erreur lors de la génération du PDF: {str(e)}", 500)

    return error_response("Type d'utilisateur non supporté", 400)
