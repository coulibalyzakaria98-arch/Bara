"""
================================================================
Modèle Candidate - Profil des candidats/chercheurs d'emploi
================================================================
"""

from datetime import datetime
from app import db


class Candidate(db.Model):
    """Profil candidat lié à un utilisateur"""
    
    __tablename__ = 'candidates'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    
    # Informations professionnelles
    title = db.Column(db.String(200))  # Ex: "Développeur Full Stack"
    summary = db.Column(db.Text)  # Bio / Résumé professionnel
    
    # Compétences (stockées en JSON)
    skills = db.Column(db.JSON, default=list)  # ["Python", "JavaScript", "SQL"]
    
    # Expérience
    experience_years = db.Column(db.Integer, default=0)
    experience_level = db.Column(db.String(50))  # junior, intermediate, senior, expert
    work_experience = db.Column(db.JSON, default=list)  # Liste des expériences
    """
    Format work_experience:
    [
        {
            "company": "Nom entreprise",
            "title": "Titre du poste",
            "start_date": "2020-01",
            "end_date": "2023-06",  # ou "present"
            "description": "Description des responsabilités",
            "achievements": ["Réalisation 1", "Réalisation 2"]
        }
    ]
    """
    
    # Formation
    education_level = db.Column(db.String(50))  # bac, bac+2, bac+3, bac+5, doctorate
    education = db.Column(db.JSON, default=list)  # Liste des formations
    """
    Format education:
    [
        {
            "institution": "Université de Conakry",
            "degree": "Master",
            "field": "Informatique",
            "start_date": "2018",
            "end_date": "2020"
        }
    ]
    """
    
    # Langues
    languages = db.Column(db.JSON, default=list)
    """
    Format languages:
    [
        {"name": "Français", "level": "Natif"},
        {"name": "Anglais", "level": "Courant"}
    ]
    """
    
    # Certifications
    certifications = db.Column(db.JSON, default=list)
    
    # Localisation
    city = db.Column(db.String(100))
    country = db.Column(db.String(100), default='Guinée')
    address = db.Column(db.String(300))
    willing_to_relocate = db.Column(db.Boolean, default=False)
    
    # Préférences d'emploi
    desired_salary_min = db.Column(db.Integer)
    desired_salary_max = db.Column(db.Integer)
    salary_currency = db.Column(db.String(10), default='GNF')
    desired_job_types = db.Column(db.JSON, default=list)  # ["CDI", "CDD", "Freelance", "Stage"]
    desired_sectors = db.Column(db.JSON, default=list)  # Secteurs souhaités
    
    # CV
    cv_url = db.Column(db.String(500))
    cv_filename = db.Column(db.String(255))
    cv_uploaded_at = db.Column(db.DateTime)
    
    # Visibilité
    is_public = db.Column(db.Boolean, default=True)
    is_available = db.Column(db.Boolean, default=True)  # Recherche active
    
    # Statistiques
    profile_views = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    cv_analyses = db.relationship('CVAnalysis', backref='candidate', cascade='all, delete-orphan')
    applications = db.relationship('JobApplication', backref='candidate', cascade='all, delete-orphan')
    
    def calculate_profile_completion(self):
        """Calculer le pourcentage de complétion du profil"""
        fields = [
            self.title,
            self.summary,
            bool(self.skills),
            self.experience_level,
            self.education_level,
            self.city,
            self.cv_url,
            bool(self.work_experience),
            bool(self.education)
        ]
        filled = sum(1 for f in fields if f)
        return int((filled / len(fields)) * 100)
    
    def to_dict(self, include_user=False):
        """Sérialiser le candidat en dictionnaire"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'summary': self.summary,
            'skills': self.skills or [],
            'experience_years': self.experience_years,
            'experience_level': self.experience_level,
            'work_experience': self.work_experience or [],
            'education_level': self.education_level,
            'education': self.education or [],
            'languages': self.languages or [],
            'certifications': self.certifications or [],
            'city': self.city,
            'country': self.country,
            'willing_to_relocate': self.willing_to_relocate,
            'desired_salary_min': self.desired_salary_min,
            'desired_salary_max': self.desired_salary_max,
            'salary_currency': self.salary_currency,
            'desired_job_types': self.desired_job_types or [],
            'desired_sectors': self.desired_sectors or [],
            'cv_url': self.cv_url,
            'cv_filename': self.cv_filename,
            'is_public': self.is_public,
            'is_available': self.is_available,
            'profile_completion': self.calculate_profile_completion(),
            'profile_views': self.profile_views,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'email': self.user.email,
                'full_name': self.user.full_name,
                'phone': self.user.phone,
                'avatar_url': self.user.avatar_url
            }
        
        return data
    
    def __repr__(self):
        return f'<Candidate {self.id} - {self.title}>'
