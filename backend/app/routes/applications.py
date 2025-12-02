"""
================================================================
Routes Candidatures - BaraCorrespondance AI
================================================================
Gestion des candidatures aux offres d'emploi
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Candidate, Company, JobApplication
from app.utils.helpers import success_response, error_response, paginated_response, safe_int
from app.models.notification import create_notification

applications_bp = Blueprint('applications', __name__)


@applications_bp.route('/my-applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    """
    Récupérer les candidatures du candidat connecté

    Query params:
    - status: Filtrer par statut (pending, reviewed, accepted, rejected)
    - page: numéro de page
    - per_page: éléments par page
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')

    query = JobApplication.query.filter_by(candidate_id=candidate.id)

    if status:
        query = query.filter_by(status=status)

    query = query.order_by(JobApplication.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    # Compter par statut
    stats = {
        'total': JobApplication.query.filter_by(candidate_id=candidate.id).count(),
        'pending': JobApplication.query.filter_by(candidate_id=candidate.id, status='pending').count(),
        'reviewed': JobApplication.query.filter_by(candidate_id=candidate.id, status='reviewed').count(),
        'accepted': JobApplication.query.filter_by(candidate_id=candidate.id, status='accepted').count(),
        'rejected': JobApplication.query.filter_by(candidate_id=candidate.id, status='rejected').count()
    }

    return paginated_response(
        items=[app.to_dict(include_job=True, include_company=True) for app in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page,
        extra_data={'stats': stats}
    )


@applications_bp.route('/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    """Récupérer les détails d'une candidature"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    application = JobApplication.query.get(application_id)
    if not application:
        return error_response("Candidature non trouvée", 404)

    # Vérifier les permissions
    if user.role == 'candidate':
        if application.candidate_id != user.candidate.id:
            return error_response("Accès non autorisé", 403)
        return success_response(application.to_dict(include_job=True, include_company=True))

    elif user.role == 'company':
        if application.job.company_id != user.company.id:
            return error_response("Accès non autorisé", 403)
        return success_response(application.to_dict(include_candidate=True))

    return error_response("Type d'utilisateur non supporté", 400)


@applications_bp.route('/<int:application_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(application_id):
    """
    Mettre à jour le statut d'une candidature (entreprise uniquement)

    Body JSON:
    {
        "status": "pending|reviewed|accepted|rejected",
        "notes": "Notes optionnelles"
    }
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = user.company
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    application = JobApplication.query.get(application_id)
    if not application:
        return error_response("Candidature non trouvée", 404)

    # Vérifier que la candidature est pour un job de cette entreprise
    if application.job.company_id != company.id:
        return error_response("Accès non autorisé", 403)

    data = request.get_json()
    if not data:
        return error_response("Données requises", 400)

    new_status = data.get('status')
    notes = data.get('notes')

    if not new_status:
        return error_response("Statut requis", 400)

    valid_statuses = ['pending', 'reviewed', 'accepted', 'rejected']
    if new_status not in valid_statuses:
        return error_response(f"Statut invalide. Valeurs possibles: {', '.join(valid_statuses)}", 400)

    try:
        old_status = application.status
        application.status = new_status

        if notes:
            application.company_notes = notes

        db.session.commit()

        # Envoyer une notification au candidat
        try:
            status_messages = {
                'reviewed': 'Votre candidature a été examinée',
                'accepted': '🎉 Félicitations ! Votre candidature a été acceptée',
                'rejected': 'Votre candidature n\'a pas été retenue cette fois'
            }

            if new_status in status_messages and application.candidate.user_id:
                create_notification(
                    user_id=application.candidate.user_id,
                    notification_type='application_update',
                    title=f'Mise à jour candidature - {application.job.title}',
                    message=status_messages[new_status],
                    data={
                        'application_id': application.id,
                        'job_id': application.job_id,
                        'old_status': old_status,
                        'new_status': new_status
                    }
                )
        except Exception as e:
            print(f"Erreur notification: {e}")

        return success_response(
            application.to_dict(include_candidate=True),
            f"Statut mis à jour: {new_status}"
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


@applications_bp.route('/<int:application_id>', methods=['DELETE'])
@jwt_required()
def withdraw_application(application_id):
    """Retirer une candidature (candidat uniquement)"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)

    application = JobApplication.query.get(application_id)
    if not application:
        return error_response("Candidature non trouvée", 404)

    if application.candidate_id != candidate.id:
        return error_response("Accès non autorisé", 403)

    # Ne pas permettre de retirer une candidature acceptée
    if application.status == 'accepted':
        return error_response("Impossible de retirer une candidature acceptée", 400)

    try:
        job = application.job
        db.session.delete(application)

        # Décrémenter le compteur
        if job.applications_count > 0:
            job.applications_count -= 1

        db.session.commit()

        return success_response(message="Candidature retirée")

    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


@applications_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_application_stats():
    """Récupérer les statistiques de candidatures"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    stats = {}

    if user.role == 'candidate':
        candidate = user.candidate
        if not candidate:
            return error_response("Profil candidat non trouvé", 404)

        stats = {
            'total': JobApplication.query.filter_by(candidate_id=candidate.id).count(),
            'pending': JobApplication.query.filter_by(candidate_id=candidate.id, status='pending').count(),
            'reviewed': JobApplication.query.filter_by(candidate_id=candidate.id, status='reviewed').count(),
            'accepted': JobApplication.query.filter_by(candidate_id=candidate.id, status='accepted').count(),
            'rejected': JobApplication.query.filter_by(candidate_id=candidate.id, status='rejected').count()
        }

    elif user.role == 'company':
        company = user.company
        if not company:
            return error_response("Profil entreprise non trouvé", 404)

        # Compter toutes les candidatures pour les jobs de l'entreprise
        from app.models import Job
        total = db.session.query(JobApplication).join(Job).filter(
            Job.company_id == company.id
        ).count()

        pending = db.session.query(JobApplication).join(Job).filter(
            Job.company_id == company.id,
            JobApplication.status == 'pending'
        ).count()

        reviewed = db.session.query(JobApplication).join(Job).filter(
            Job.company_id == company.id,
            JobApplication.status == 'reviewed'
        ).count()

        accepted = db.session.query(JobApplication).join(Job).filter(
            Job.company_id == company.id,
            JobApplication.status == 'accepted'
        ).count()

        rejected = db.session.query(JobApplication).join(Job).filter(
            Job.company_id == company.id,
            JobApplication.status == 'rejected'
        ).count()

        stats = {
            'total': total,
            'pending': pending,
            'reviewed': reviewed,
            'accepted': accepted,
            'rejected': rejected
        }

    return success_response(stats)
