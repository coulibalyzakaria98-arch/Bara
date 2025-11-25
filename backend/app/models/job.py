"""
================================================================
Modèle Job - Offres d'emploi et candidatures
================================================================
"""

from datetime import datetime
from app import db


class Job(db.Model):
    """Offre d'emploi publiée par une entreprise"""
    
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Informations sur le poste
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    department = db.Column(db.String(100))
    
    # Compétences requises
    required_skills = db.Column(db.JSON, default=list)  # ["Python", "SQL"]
    nice_to_have_skills = db.Column(db.JSON, default=list)
    
    # Expérience
    min_experience_years = db.Column(db.Integer, default=0)
    max_experience_years = db.Column(db.Integer)
    experience_level = db.Column(db.String(50))  # junior, intermediate, senior
    
    # Formation
    education_level = db.Column(db.String(50))  # bac, bac+2, bac+3, bac+5
    
    # Type de contrat
    contract_type = db.Column(db.String(50))  # CDI, CDD, Stage, Freelance, Alternance
    is_remote = db.Column(db.Boolean, default=False)
    remote_type = db.Column(db.String(50))  # full, hybrid, occasional
    
    # Localisation
    location = db.Column(db.String(200))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100), default='Guinée')
    
    # Salaire
    salary_min = db.Column(db.Integer)
    salary_max = db.Column(db.Integer)
    salary_currency = db.Column(db.String(10), default='GNF')
    salary_period = db.Column(db.String(20), default='month')  # month, year, hour
    show_salary = db.Column(db.Boolean, default=True)
    
    # Avantages
    benefits = db.Column(db.JSON, default=list)  # ["Assurance", "Transport", "Formation"]
    
    # Statut
    is_active = db.Column(db.Boolean, default=True)
    is_urgent = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    positions_count = db.Column(db.Integer, default=1)
    
    # Matching automatique
    auto_match = db.Column(db.Boolean, default=True)
    match_threshold = db.Column(db.Integer, default=60)  # Score minimum pour match
    
    # Dates
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime)
    
    # Statistiques
    views_count = db.Column(db.Integer, default=0)
    applications_count = db.Column(db.Integer, default=0)
    
    # Relations
    applications = db.relationship('JobApplication', backref='job', cascade='all, delete-orphan')
    
    def is_expired(self):
        """Vérifier si l'offre a expiré"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False
    
    def to_dict(self, include_company=False):
        """Sérialiser l'offre en dictionnaire"""
        data = {
            'id': self.id,
            'company_id': self.company_id,
            'title': self.title,
            'description': self.description,
            'department': self.department,
            'required_skills': self.required_skills or [],
            'nice_to_have_skills': self.nice_to_have_skills or [],
            'min_experience_years': self.min_experience_years,
            'max_experience_years': self.max_experience_years,
            'experience_level': self.experience_level,
            'education_level': self.education_level,
            'contract_type': self.contract_type,
            'is_remote': self.is_remote,
            'remote_type': self.remote_type,
            'location': self.location,
            'city': self.city,
            'country': self.country,
            'salary_min': self.salary_min if self.show_salary else None,
            'salary_max': self.salary_max if self.show_salary else None,
            'salary_currency': self.salary_currency,
            'salary_period': self.salary_period,
            'benefits': self.benefits or [],
            'is_active': self.is_active,
            'is_urgent': self.is_urgent,
            'is_featured': self.is_featured,
            'positions_count': self.positions_count,
            'is_expired': self.is_expired(),
            'views_count': self.views_count,
            'applications_count': self.applications_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }
        
        if include_company and self.company:
            data['company'] = {
                'id': self.company.id,
                'name': self.company.name,
                'logo_url': self.company.logo_url,
                'city': self.company.city,
                'sector': self.company.sector,
                'is_verified': self.company.is_verified
            }
        
        return data
    
    def __repr__(self):
        return f'<Job {self.title}>'


class JobApplication(db.Model):
    """Candidature à une offre d'emploi"""
    
    __tablename__ = 'job_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    
    # Statut de la candidature
    status = db.Column(db.String(50), default='pending')
    # pending, viewed, shortlisted, interview, offered, hired, rejected
    
    # Score de matching
    match_score = db.Column(db.Float)
    match_details = db.Column(db.JSON, default=dict)
    """
    Format match_details:
    {
        "skills_match": 85,
        "experience_match": 70,
        "education_match": 90,
        "overall": 82
    }
    """
    
    # Lettre de motivation
    cover_letter = db.Column(db.Text)
    
    # Notes de l'entreprise
    company_notes = db.Column(db.Text)
    
    # Flags
    is_favorite = db.Column(db.Boolean, default=False)  # Marqué par l'entreprise
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    viewed_at = db.Column(db.DateTime)
    
    # Contrainte d'unicité
    __table_args__ = (
        db.UniqueConstraint('job_id', 'candidate_id', name='unique_job_candidate'),
    )
    
    def to_dict(self, include_job=False, include_candidate=False):
        """Sérialiser la candidature"""
        data = {
            'id': self.id,
            'job_id': self.job_id,
            'candidate_id': self.candidate_id,
            'status': self.status,
            'match_score': self.match_score,
            'match_details': self.match_details or {},
            'cover_letter': self.cover_letter,
            'is_favorite': self.is_favorite,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None
        }
        
        if include_job and self.job:
            data['job'] = self.job.to_dict(include_company=True)
        
        if include_candidate and self.candidate:
            data['candidate'] = self.candidate.to_dict(include_user=True)
        
        return data
    
    def __repr__(self):
        return f'<JobApplication {self.id} - Job:{self.job_id} Candidate:{self.candidate_id}>'
