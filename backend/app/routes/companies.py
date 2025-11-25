"""
================================================================
Routes Entreprises - BaraCorrespondance AI
================================================================
"""

from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Company, Job, JobApplication, Candidate
from app.utils.helpers import success_response, error_response, paginated_response

companies_bp = Blueprint('companies', __name__)


# ================================================================
# HELPER - Vérifier que l'utilisateur est une entreprise
# ================================================================

def get_current_company():
    """Obtenir le profil entreprise de l'utilisateur connecté"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'company':
        return None, error_response("Accès réservé aux entreprises", 403)
    
    if not user.company:
        return None, error_response("Profil entreprise non trouvé", 404)
    
    return user.company, None


# ================================================================
# PROFIL ENTREPRISE
# ================================================================

@companies_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtenir le profil de l'entreprise connectée"""
    company, error = get_current_company()
    if error:
        return error
    
    return success_response({
        'profile': company.to_dict(include_user=True, include_jobs=True)
    })


@companies_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Mettre à jour le profil entreprise
    
    Body JSON:
    {
        "name": "TechCorp Guinée",
        "description": "Leader dans la technologie...",
        "slogan": "Innovation pour tous",
        "sector": "Technologie",
        "industry": "Software",
        "size": "medium",
        "employee_count": "51-200",
        "founded_year": 2015,
        "website": "https://techcorp.gn",
        "city": "Conakry",
        "address": "123 Rue Principale",
        "primary_color": "#2563EB",
        "secondary_color": "#1E40AF",
        "contact_email": "contact@techcorp.gn",
        "contact_phone": "+224 XXX XXX XXX"
    }
    """
    company, error = get_current_company()
    if error:
        return error
    
    data = request.get_json()
    if not data:
        return error_response("Données JSON requises", 400)
    
    # Champs modifiables
    allowed_fields = [
        'name', 'description', 'slogan', 'sector', 'industry',
        'size', 'employee_count', 'founded_year', 'website',
        'address', 'city', 'country', 'primary_color', 'secondary_color',
        'linkedin_url', 'facebook_url', 'twitter_url',
        'contact_email', 'contact_phone'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(company, field, data[field])
    
    # Mettre à jour les infos utilisateur si fournies
    user = company.user
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    try:
        db.session.commit()
        return success_response({
            'profile': company.to_dict(include_user=True)
        }, "Profil mis à jour avec succès")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


# ================================================================
# GESTION DES CANDIDATURES REÇUES
# ================================================================

@companies_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_received_applications():
    """Obtenir toutes les candidatures reçues par l'entreprise"""
    company, error = get_current_company()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    job_id = request.args.get('job_id', type=int)
    status = request.args.get('status')
    
    # Joindre avec Job pour filtrer par entreprise
    query = JobApplication.query.join(Job).filter(Job.company_id == company.id)
    
    if job_id:
        query = query.filter(JobApplication.job_id == job_id)
    
    if status:
        query = query.filter(JobApplication.status == status)
    
    query = query.order_by(JobApplication.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[app.to_dict(include_job=True, include_candidate=True) for app in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page
    )


@companies_bp.route('/applications/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application_detail(application_id):
    """Obtenir le détail d'une candidature"""
    company, error = get_current_company()
    if error:
        return error
    
    application = JobApplication.query.join(Job).filter(
        JobApplication.id == application_id,
        Job.company_id == company.id
    ).first()
    
    if not application:
        return error_response("Candidature non trouvée", 404)
    
    # Marquer comme vue
    if not application.viewed_at:
        application.viewed_at = datetime.utcnow()
        if application.status == 'pending':
            application.status = 'viewed'
        db.session.commit()
    
    return success_response({
        'application': application.to_dict(include_job=True, include_candidate=True)
    })


@companies_bp.route('/applications/<int:application_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(application_id):
    """
    Mettre à jour le statut d'une candidature
    
    Body JSON:
    {
        "status": "shortlisted" | "interview" | "offered" | "hired" | "rejected",
        "notes": "Notes optionnelles"
    }
    """
    company, error = get_current_company()
    if error:
        return error
    
    data = request.get_json()
    new_status = data.get('status')
    
    valid_statuses = ['pending', 'viewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected']
    if new_status not in valid_statuses:
        return error_response(f"Statut invalide. Valeurs acceptées: {valid_statuses}", 400)
    
    application = JobApplication.query.join(Job).filter(
        JobApplication.id == application_id,
        Job.company_id == company.id
    ).first()
    
    if not application:
        return error_response("Candidature non trouvée", 404)
    
    application.status = new_status
    if 'notes' in data:
        application.company_notes = data['notes']
    
    db.session.commit()
    
    # TODO: Envoyer notification au candidat
    
    return success_response({
        'application': application.to_dict()
    }, f"Statut mis à jour: {new_status}")


@companies_bp.route('/applications/<int:application_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(application_id):
    """Marquer/démarquer une candidature comme favorite"""
    company, error = get_current_company()
    if error:
        return error
    
    application = JobApplication.query.join(Job).filter(
        JobApplication.id == application_id,
        Job.company_id == company.id
    ).first()
    
    if not application:
        return error_response("Candidature non trouvée", 404)
    
    application.is_favorite = not application.is_favorite
    db.session.commit()
    
    status = "ajoutée aux" if application.is_favorite else "retirée des"
    return success_response({
        'is_favorite': application.is_favorite
    }, f"Candidature {status} favoris")


# ================================================================
# RECHERCHE DE CANDIDATS
# ================================================================

@companies_bp.route('/search-candidates', methods=['GET'])
@jwt_required()
def search_candidates():
    """
    Rechercher des candidats
    
    Query params:
    - skills: compétences (séparées par virgule)
    - experience_level: junior, intermediate, senior
    - min_experience: années minimum
    - max_experience: années maximum
    - city: ville
    - education_level: niveau d'études
    - is_available: true/false
    """
    company, error = get_current_company()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Construire la requête
    query = Candidate.query.filter_by(is_public=True)
    
    # Filtre par disponibilité
    is_available = request.args.get('is_available')
    if is_available == 'true':
        query = query.filter_by(is_available=True)
    
    # Filtre par ville
    city = request.args.get('city')
    if city:
        query = query.filter(Candidate.city.ilike(f'%{city}%'))
    
    # Filtre par niveau d'expérience
    experience_level = request.args.get('experience_level')
    if experience_level:
        query = query.filter_by(experience_level=experience_level)
    
    # Filtre par années d'expérience
    min_exp = request.args.get('min_experience', type=int)
    max_exp = request.args.get('max_experience', type=int)
    if min_exp:
        query = query.filter(Candidate.experience_years >= min_exp)
    if max_exp:
        query = query.filter(Candidate.experience_years <= max_exp)
    
    # Filtre par niveau d'études
    education_level = request.args.get('education_level')
    if education_level:
        query = query.filter_by(education_level=education_level)
    
    # Filtre par compétences (recherche dans JSON)
    skills = request.args.get('skills')
    if skills:
        skill_list = [s.strip() for s in skills.split(',')]
        for skill in skill_list:
            query = query.filter(Candidate.skills.contains([skill]))
    
    # Ordonner par date de mise à jour
    query = query.order_by(Candidate.updated_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[c.to_dict(include_user=True) for c in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page
    )


# ================================================================
# STATISTIQUES
# ================================================================

@companies_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Obtenir les statistiques de l'entreprise"""
    company, error = get_current_company()
    if error:
        return error
    
    # Offres d'emploi
    total_jobs = Job.query.filter_by(company_id=company.id).count()
    active_jobs = Job.query.filter_by(company_id=company.id, is_active=True).count()
    
    # Candidatures
    total_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id
    ).count()
    
    pending_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.status.in_(['pending', 'viewed'])
    ).count()
    
    shortlisted = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.status == 'shortlisted'
    ).count()
    
    return success_response({
        'stats': {
            'profile_views': company.profile_views,
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'shortlisted': shortlisted,
            'subscription_plan': company.subscription_plan
        }
    })


# ================================================================
# PROFIL PUBLIC (pour consultation)
# ================================================================

@companies_bp.route('/public/<int:company_id>', methods=['GET'])
def get_public_profile(company_id):
    """Obtenir le profil public d'une entreprise"""
    company = Company.query.get(company_id)
    
    if not company:
        return error_response("Entreprise non trouvée", 404)
    
    # Incrémenter les vues
    company.profile_views += 1
    db.session.commit()
    
    # Retourner le profil public avec les offres actives
    return success_response({
        'profile': company.to_dict(include_jobs=True)
    })
