"""
================================================================
Routes Candidats - BaraCorrespondance AI
================================================================
"""

from datetime import datetime
from flask import Blueprint, request, g, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Candidate, CVAnalysis, JobApplication
from app.utils.helpers import success_response, error_response, paginated_response
from app.utils.validators import allowed_cv_file

candidates_bp = Blueprint('candidates', __name__)


# ================================================================
# MIDDLEWARE - Vérifier que l'utilisateur est un candidat
# ================================================================

def get_current_candidate():
    """Obtenir le profil candidat de l'utilisateur connecté"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'candidate':
        return None, error_response("Accès réservé aux candidats", 403)
    
    if not user.candidate:
        return None, error_response("Profil candidat non trouvé", 404)
    
    return user.candidate, None


# ================================================================
# PROFIL CANDIDAT
# ================================================================

@candidates_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtenir le profil du candidat connecté"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    return success_response({
        'profile': candidate.to_dict(include_user=True)
    })


@candidates_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Mettre à jour le profil candidat
    
    Body JSON:
    {
        "title": "Développeur Full Stack",
        "summary": "Passionné par le développement...",
        "skills": ["Python", "JavaScript", "React"],
        "experience_years": 5,
        "experience_level": "senior",
        "education_level": "bac+5",
        "city": "Conakry",
        "willing_to_relocate": true,
        "desired_salary_min": 5000000,
        "desired_salary_max": 8000000,
        "desired_job_types": ["CDI", "CDD"],
        "is_available": true
    }
    """
    candidate, error = get_current_candidate()
    if error:
        return error
    
    data = request.get_json()
    if not data:
        return error_response("Données JSON requises", 400)
    
    # Champs modifiables du profil candidat
    allowed_fields = [
        'title', 'summary', 'skills', 'experience_years', 'experience_level',
        'work_experience', 'education_level', 'education', 'languages',
        'certifications', 'city', 'country', 'address', 'willing_to_relocate',
        'desired_salary_min', 'desired_salary_max', 'salary_currency',
        'desired_job_types', 'desired_sectors', 'is_public', 'is_available'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(candidate, field, data[field])
    
    # Mettre à jour aussi les infos utilisateur si fournies
    user = candidate.user
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    try:
        db.session.commit()
        return success_response({
            'profile': candidate.to_dict(include_user=True)
        }, "Profil mis à jour avec succès")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


# ================================================================
# ANALYSES CV
# ================================================================

@candidates_bp.route('/cv-analysis', methods=['GET'])
@jwt_required()
def get_latest_analysis():
    """Obtenir la dernière analyse de CV"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    analysis = CVAnalysis.query.filter_by(
        candidate_id=candidate.id,
        is_latest=True
    ).first()
    
    if not analysis:
        return error_response(
            "Aucune analyse trouvée. Uploadez votre CV d'abord.",
            404
        )
    
    return success_response({
        'analysis': analysis.to_dict()
    })


@candidates_bp.route('/cv-analysis/history', methods=['GET'])
@jwt_required()
def get_analysis_history():
    """Obtenir l'historique des analyses de CV"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = CVAnalysis.query.filter_by(candidate_id=candidate.id)\
        .order_by(CVAnalysis.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[a.to_dict() for a in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page
    )


# ================================================================
# CANDIDATURES
# ================================================================

@candidates_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_applications():
    """Obtenir les candidatures du candidat"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')  # Filtrer par statut
    
    query = JobApplication.query.filter_by(candidate_id=candidate.id)
    
    if status:
        query = query.filter_by(status=status)
    
    query = query.order_by(JobApplication.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[app.to_dict(include_job=True) for app in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page
    )


@candidates_bp.route('/applications/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    """Obtenir une candidature spécifique"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    application = JobApplication.query.filter_by(
        id=application_id,
        candidate_id=candidate.id
    ).first()
    
    if not application:
        return error_response("Candidature non trouvée", 404)
    
    return success_response({
        'application': application.to_dict(include_job=True)
    })


@candidates_bp.route('/applications/<int:application_id>/withdraw', methods=['POST'])
@jwt_required()
def withdraw_application(application_id):
    """Retirer une candidature"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    application = JobApplication.query.filter_by(
        id=application_id,
        candidate_id=candidate.id
    ).first()
    
    if not application:
        return error_response("Candidature non trouvée", 404)
    
    if application.status in ['hired', 'rejected']:
        return error_response("Impossible de retirer cette candidature", 400)
    
    # Décrémenter le compteur de candidatures du job
    if application.job:
        application.job.applications_count -= 1
    
    db.session.delete(application)
    db.session.commit()
    
    return success_response(message="Candidature retirée")


# ================================================================
# STATISTIQUES
# ================================================================

@candidates_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Obtenir les statistiques du candidat"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    # Compter les candidatures par statut
    total_applications = JobApplication.query.filter_by(
        candidate_id=candidate.id
    ).count()
    
    pending_applications = JobApplication.query.filter_by(
        candidate_id=candidate.id,
        status='pending'
    ).count()
    
    shortlisted = JobApplication.query.filter_by(
        candidate_id=candidate.id,
        status='shortlisted'
    ).count()
    
    interviews = JobApplication.query.filter_by(
        candidate_id=candidate.id,
        status='interview'
    ).count()
    
    # Score CV
    latest_analysis = CVAnalysis.query.filter_by(
        candidate_id=candidate.id,
        is_latest=True
    ).first()
    
    cv_score = latest_analysis.overall_score if latest_analysis else None
    
    return success_response({
        'stats': {
            'profile_views': candidate.profile_views,
            'profile_completion': candidate.calculate_profile_completion(),
            'cv_score': cv_score,
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'shortlisted': shortlisted,
            'interviews': interviews,
            'has_cv': bool(candidate.cv_url)
        }
    })


# ================================================================
# PROFIL PUBLIC (pour les entreprises)
# ================================================================

@candidates_bp.route('/public/<int:candidate_id>', methods=['GET'])
@jwt_required()
def get_public_profile(candidate_id):
    """Obtenir le profil public d'un candidat (pour les entreprises)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Vérifier que c'est une entreprise
    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)
    
    candidate = Candidate.query.get(candidate_id)
    
    if not candidate:
        return error_response("Candidat non trouvé", 404)
    
    if not candidate.is_public:
        return error_response("Ce profil n'est pas public", 403)
    
    # Incrémenter les vues
    candidate.profile_views += 1
    db.session.commit()
    
    # Retourner un profil partiel (sans données sensibles)
    profile = candidate.to_dict(include_user=True)
    
    # Masquer certaines infos si le candidat le souhaite
    # (à personnaliser selon les besoins)
    
    return success_response({
        'profile': profile
    })
