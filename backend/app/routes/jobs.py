"""
================================================================
Routes Offres d'Emploi - BaraCorrespondance AI
================================================================
"""

from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Company, Job, JobApplication, Candidate
from app.utils.helpers import success_response, error_response, paginated_response, safe_int
from app.services.matcher import MatcherService

jobs_bp = Blueprint('jobs', __name__)


# ================================================================
# HELPER
# ================================================================

def get_current_company():
    """Obtenir le profil entreprise de l'utilisateur connecté"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'company':
        return None, error_response("Accès réservé aux entreprises", 403)
    
    if not user.company:
        return None, error_response("Profil entreprise non trouvé", 404)
    
    return user.company, None


def get_current_candidate():
    """Obtenir le profil candidat de l'utilisateur connecté"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'candidate':
        return None, error_response("Accès réservé aux candidats", 403)
    
    if not user.candidate:
        return None, error_response("Profil candidat non trouvé", 404)
    
    return user.candidate, None


# ================================================================
# LISTE PUBLIQUE DES OFFRES
# ================================================================

@jobs_bp.route('/', methods=['GET'])
def list_jobs():
    """
    Lister les offres d'emploi actives (public)
    
    Query params:
    - page: numéro de page
    - per_page: éléments par page
    - search: recherche textuelle
    - city: ville
    - contract_type: type de contrat
    - experience_level: niveau d'expérience
    - is_remote: télétravail
    - skills: compétences (séparées par virgule)
    - sector: secteur d'activité
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Base query - offres actives et non expirées
    query = Job.query.filter_by(is_active=True)
    
    # Recherche textuelle
    search = request.args.get('search')
    if search:
        search_filter = f'%{search}%'
        query = query.filter(
            db.or_(
                Job.title.ilike(search_filter),
                Job.description.ilike(search_filter)
            )
        )
    
    # Filtre par ville
    city = request.args.get('city')
    if city:
        query = query.filter(Job.city.ilike(f'%{city}%'))
    
    # Filtre par type de contrat
    contract_type = request.args.get('contract_type')
    if contract_type:
        query = query.filter_by(contract_type=contract_type)
    
    # Filtre par niveau d'expérience
    experience_level = request.args.get('experience_level')
    if experience_level:
        query = query.filter_by(experience_level=experience_level)
    
    # Filtre télétravail
    is_remote = request.args.get('is_remote')
    if is_remote == 'true':
        query = query.filter_by(is_remote=True)
    
    # Filtre par secteur (via company)
    sector = request.args.get('sector')
    if sector:
        query = query.join(Company).filter(Company.sector.ilike(f'%{sector}%'))

    # Filtre par salaire minimum
    min_salary = request.args.get('min_salary', type=int)
    if min_salary:
        query = query.filter(Job.salary_min >= min_salary)

    # Filtre par salaire maximum
    max_salary = request.args.get('max_salary', type=int)
    if max_salary:
        query = query.filter(Job.salary_max <= max_salary)

    # Filtre par niveau d'éducation
    education_level = request.args.get('education_level')
    if education_level:
        query = query.filter_by(education_level=education_level)

    # Filtre par compétences (AND - toutes les compétences requises)
    skills = request.args.get('skills')
    if skills:
        skills_list = [s.strip() for s in skills.split(',')]
        for skill in skills_list:
            query = query.filter(Job.required_skills.contains([skill]))

    # Filtre par années d'expérience minimum
    min_experience = request.args.get('min_experience', type=int)
    if min_experience is not None:
        query = query.filter(Job.min_experience_years <= min_experience)

    # Tri personnalisé
    sort_by = request.args.get('sort_by', 'recent')
    if sort_by == 'salary_desc':
        query = query.order_by(Job.salary_max.desc().nullslast())
    elif sort_by == 'salary_asc':
        query = query.order_by(Job.salary_min.asc().nullslast())
    elif sort_by == 'experience_desc':
        query = query.order_by(Job.min_experience_years.desc().nullslast())
    elif sort_by == 'experience_asc':
        query = query.order_by(Job.min_experience_years.asc().nullslast())
    else:  # recent (default)
        # Ordonner: urgent d'abord, puis featured, puis récent
        query = query.order_by(
            Job.is_urgent.desc(),
            Job.is_featured.desc(),
            Job.created_at.desc()
        )
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[job.to_dict(include_company=True) for job in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page
    )


@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Obtenir les détails d'une offre d'emploi"""
    job = Job.query.get(job_id)
    
    if not job:
        return error_response("Offre non trouvée", 404)
    
    # Incrémenter les vues
    job.views_count += 1
    db.session.commit()
    
    return success_response({
        'job': job.to_dict(include_company=True)
    })


# ================================================================
# GESTION DES OFFRES (ENTREPRISE)
# ================================================================

@jobs_bp.route('/company', methods=['GET'])
@jwt_required()
def list_company_jobs():
    """Lister les offres de l'entreprise connectée"""
    company, error = get_current_company()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_active = request.args.get('is_active')
    
    query = Job.query.filter_by(company_id=company.id)
    
    if is_active == 'true':
        query = query.filter_by(is_active=True)
    elif is_active == 'false':
        query = query.filter_by(is_active=False)
    
    query = query.order_by(Job.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[job.to_dict() for job in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page
    )


@jobs_bp.route('/', methods=['POST'])
@jwt_required()
def create_job():
    """
    Créer une nouvelle offre d'emploi
    
    Body JSON:
    {
        "title": "Développeur Python Senior",
        "description": "Nous recherchons...",
        "department": "Engineering",
        "required_skills": ["Python", "Django", "PostgreSQL"],
        "nice_to_have_skills": ["Docker", "AWS"],
        "min_experience_years": 3,
        "max_experience_years": 7,
        "experience_level": "senior",
        "education_level": "bac+5",
        "contract_type": "CDI",
        "is_remote": true,
        "remote_type": "hybrid",
        "city": "Conakry",
        "salary_min": 5000000,
        "salary_max": 8000000,
        "benefits": ["Assurance", "Formation"],
        "is_urgent": false,
        "positions_count": 1,
        "auto_match": true
    }
    """
    company, error = get_current_company()
    if error:
        return error
    
    data = request.get_json()
    if not data:
        return error_response("Données JSON requises", 400)
    
    # Validation des champs obligatoires
    if not data.get('title'):
        return error_response("Le titre est requis", 400)
    if not data.get('description'):
        return error_response("La description est requise", 400)
    
    # Créer l'offre
    job = Job(
        company_id=company.id,
        title=data.get('title'),
        description=data.get('description'),
        department=data.get('department'),
        required_skills=data.get('required_skills', []),
        nice_to_have_skills=data.get('nice_to_have_skills', []),
        min_experience_years=data.get('min_experience_years', 0),
        max_experience_years=data.get('max_experience_years'),
        experience_level=data.get('experience_level'),
        education_level=data.get('education_level'),
        contract_type=data.get('contract_type'),
        is_remote=data.get('is_remote', False),
        remote_type=data.get('remote_type'),
        location=data.get('location'),
        city=data.get('city', company.city),
        country=data.get('country', company.country),
        salary_min=data.get('salary_min'),
        salary_max=data.get('salary_max'),
        salary_currency=data.get('salary_currency', 'GNF'),
        salary_period=data.get('salary_period', 'month'),
        show_salary=data.get('show_salary', True),
        benefits=data.get('benefits', []),
        is_urgent=data.get('is_urgent', False),
        positions_count=data.get('positions_count', 1),
        auto_match=data.get('auto_match', True),
        match_threshold=data.get('match_threshold', 60),
        published_at=datetime.utcnow()
    )
    
    db.session.add(job)
    company.total_jobs_posted += 1
    
    try:
        db.session.commit()
        
        # Lancer le matching automatique si activé
        if job.auto_match:
            matcher = MatcherService()
            matcher.find_matches_for_job(job.id)
        
        return success_response({
            'job': job.to_dict()
        }, "Offre créée avec succès", 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    """Mettre à jour une offre d'emploi"""
    company, error = get_current_company()
    if error:
        return error
    
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return error_response("Offre non trouvée", 404)
    
    data = request.get_json()
    
    # Champs modifiables
    allowed_fields = [
        'title', 'description', 'department', 'required_skills',
        'nice_to_have_skills', 'min_experience_years', 'max_experience_years',
        'experience_level', 'education_level', 'contract_type', 'is_remote',
        'remote_type', 'location', 'city', 'country', 'salary_min', 'salary_max',
        'salary_currency', 'salary_period', 'show_salary', 'benefits',
        'is_active', 'is_urgent', 'is_featured', 'positions_count',
        'auto_match', 'match_threshold', 'expires_at'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(job, field, data[field])
    
    try:
        db.session.commit()
        return success_response({
            'job': job.to_dict()
        }, "Offre mise à jour")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    """Supprimer une offre d'emploi"""
    company, error = get_current_company()
    if error:
        return error
    
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return error_response("Offre non trouvée", 404)
    
    db.session.delete(job)
    db.session.commit()
    
    return success_response(message="Offre supprimée")


@jobs_bp.route('/<int:job_id>/toggle-status', methods=['POST'])
@jwt_required()
def toggle_job_status(job_id):
    """Activer/désactiver une offre"""
    company, error = get_current_company()
    if error:
        return error
    
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return error_response("Offre non trouvée", 404)
    
    job.is_active = not job.is_active
    db.session.commit()
    
    status = "activée" if job.is_active else "désactivée"
    return success_response({
        'is_active': job.is_active
    }, f"Offre {status}")


# ================================================================
# CANDIDATURES À UNE OFFRE
# ================================================================

@jobs_bp.route('/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_job(job_id):
    """
    Postuler à une offre d'emploi
    
    Body JSON:
    {
        "cover_letter": "Lettre de motivation optionnelle"
    }
    """
    candidate, error = get_current_candidate()
    if error:
        return error
    
    job = Job.query.get(job_id)
    if not job:
        return error_response("Offre non trouvée", 404)
    
    if not job.is_active:
        return error_response("Cette offre n'est plus active", 400)
    
    # Vérifier si déjà candidaté
    existing = JobApplication.query.filter_by(
        job_id=job_id,
        candidate_id=candidate.id
    ).first()
    
    if existing:
        return error_response("Vous avez déjà postulé à cette offre", 409)
    
    # Calculer le score de matching
    matcher = MatcherService()
    match_result = matcher.calculate_match_score(candidate, job)
    
    data = request.get_json() or {}
    
    # Créer la candidature
    application = JobApplication(
        job_id=job_id,
        candidate_id=candidate.id,
        cover_letter=data.get('cover_letter'),
        match_score=match_result['overall'],
        match_details=match_result
    )
    
    db.session.add(application)
    job.applications_count += 1
    
    try:
        db.session.commit()
        
        # TODO: Notifier l'entreprise
        
        return success_response({
            'application': application.to_dict(include_job=True)
        }, "Candidature envoyée avec succès", 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


@jobs_bp.route('/<int:job_id>/applications', methods=['GET'])
@jwt_required()
def get_job_applications(job_id):
    """Obtenir les candidatures pour une offre (entreprise)"""
    company, error = get_current_company()
    if error:
        return error
    
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return error_response("Offre non trouvée", 404)
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    sort_by = request.args.get('sort_by', 'date')  # date, score
    
    query = JobApplication.query.filter_by(job_id=job_id)
    
    if status:
        query = query.filter_by(status=status)
    
    if sort_by == 'score':
        query = query.order_by(JobApplication.match_score.desc())
    else:
        query = query.order_by(JobApplication.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[app.to_dict(include_candidate=True) for app in pagination.items],
        total=pagination.total,
        page=page,
        per_page=per_page
    )


# ================================================================
# MATCHING
# ================================================================

@jobs_bp.route('/<int:job_id>/run-matching', methods=['POST'])
@jwt_required()
def run_matching(job_id):
    """Lancer le matching pour une offre"""
    company, error = get_current_company()
    if error:
        return error
    
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return error_response("Offre non trouvée", 404)
    
    matcher = MatcherService()
    results = matcher.find_matches_for_job(job_id)
    
    return success_response({
        'matches_found': results['total_found'],
        'top_candidates': results['top_candidates']
    }, f"{results['total_found']} candidats correspondants trouvés")


@jobs_bp.route('/<int:job_id>/check-match', methods=['GET'])
@jwt_required()
def check_candidate_match(job_id):
    """Vérifier le score de matching d'un candidat avec une offre"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    job = Job.query.get(job_id)
    if not job:
        return error_response("Offre non trouvée", 404)
    
    matcher = MatcherService()
    match_result = matcher.calculate_match_score(candidate, job)
    
    return success_response({
        'match_score': match_result
    })
