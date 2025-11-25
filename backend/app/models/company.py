"""
================================================================
Modèle Company - Profil des entreprises/recruteurs
================================================================
"""

from datetime import datetime
from app import db


class Company(db.Model):
    """Profil entreprise lié à un utilisateur"""
    
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    
    # Informations de l'entreprise
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    slogan = db.Column(db.String(300))
    
    # Secteur et industrie
    sector = db.Column(db.String(100))  # Ex: "Technologie", "Finance", "Santé"
    industry = db.Column(db.String(100))
    
    # Taille et détails
    size = db.Column(db.String(50))  # startup, small, medium, large, enterprise
    employee_count = db.Column(db.String(50))  # "1-10", "11-50", "51-200", etc.
    founded_year = db.Column(db.Integer)
    website = db.Column(db.String(500))
    
    # Localisation
    address = db.Column(db.String(500))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100), default='Guinée')
    
    # Branding / Identité visuelle
    logo_url = db.Column(db.String(500))
    cover_image_url = db.Column(db.String(500))
    primary_color = db.Column(db.String(7), default='#2563EB')  # Couleur hex
    secondary_color = db.Column(db.String(7), default='#1E40AF')
    
    # Réseaux sociaux
    linkedin_url = db.Column(db.String(500))
    facebook_url = db.Column(db.String(500))
    twitter_url = db.Column(db.String(500))
    
    # Contact
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    
    # Vérification
    is_verified = db.Column(db.Boolean, default=False)
    
    # Abonnement
    subscription_plan = db.Column(db.String(50), default='free')  # free, basic, premium
    subscription_expires = db.Column(db.DateTime)
    
    # Statistiques
    profile_views = db.Column(db.Integer, default=0)
    total_jobs_posted = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    jobs = db.relationship('Job', backref='company', cascade='all, delete-orphan')
    
    def to_dict(self, include_user=False, include_jobs=False):
        """Sérialiser l'entreprise en dictionnaire"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'slogan': self.slogan,
            'sector': self.sector,
            'industry': self.industry,
            'size': self.size,
            'employee_count': self.employee_count,
            'founded_year': self.founded_year,
            'website': self.website,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'logo_url': self.logo_url,
            'cover_image_url': self.cover_image_url,
            'primary_color': self.primary_color,
            'secondary_color': self.secondary_color,
            'linkedin_url': self.linkedin_url,
            'facebook_url': self.facebook_url,
            'twitter_url': self.twitter_url,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'is_verified': self.is_verified,
            'subscription_plan': self.subscription_plan,
            'profile_views': self.profile_views,
            'total_jobs_posted': self.total_jobs_posted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'email': self.user.email,
                'full_name': self.user.full_name,
                'phone': self.user.phone
            }
        
        if include_jobs:
            data['jobs'] = [job.to_dict() for job in self.jobs if job.is_active]
            data['active_jobs_count'] = len(data['jobs'])
        
        return data
    
    def __repr__(self):
        return f'<Company {self.name}>'
