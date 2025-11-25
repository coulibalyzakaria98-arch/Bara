"""
================================================================
Modèle Poster - Affiches d'emploi générées par IA
================================================================
"""

from datetime import datetime
from app import db


class Poster(db.Model):
    """Affiche d'emploi générée par IA"""

    __tablename__ = 'posters'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)

    # Informations de génération
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)

    # Style et template
    style = db.Column(db.String(50))  # modern, classic, creative, minimal, professional
    color_scheme = db.Column(db.String(50))  # blue, purple, green, orange, red, custom
    template_type = db.Column(db.String(50))  # default, full-image, split, gradient

    # Contenu généré par IA
    ai_headline = db.Column(db.String(500))  # Titre accrocheur généré
    ai_tagline = db.Column(db.String(500))   # Slogan généré
    ai_description = db.Column(db.Text)       # Description optimisée
    ai_keywords = db.Column(db.JSON, default=list)  # Mots-clés suggérés

    # Fichier généré
    file_name = db.Column(db.String(255))
    file_path = db.Column(db.String(500))
    file_url = db.Column(db.String(500))
    file_size = db.Column(db.Integer)  # En bytes

    # Format
    format = db.Column(db.String(20), default='png')  # png, jpg, pdf
    width = db.Column(db.Integer, default=1080)
    height = db.Column(db.Integer, default=1920)

    # Métadonnées
    generation_method = db.Column(db.String(50), default='template')  # template, ai-image, hybrid
    ai_model_used = db.Column(db.String(100))  # gpt-4, dall-e-3, etc.
    generation_time = db.Column(db.Float)  # Temps en secondes

    # Options personnalisées
    custom_colors = db.Column(db.JSON, default=dict)  # {primary, secondary, accent}
    include_logo = db.Column(db.Boolean, default=True)
    include_qr_code = db.Column(db.Boolean, default=False)
    qr_code_url = db.Column(db.String(500))

    # Statistiques
    views_count = db.Column(db.Integer, default=0)
    downloads_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)

    # Statut
    is_active = db.Column(db.Boolean, default=True)
    is_published = db.Column(db.Boolean, default=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)

    # Relations
    job = db.relationship('Job', backref='posters')
    company = db.relationship('Company', backref='posters')

    def to_dict(self, include_job=False, include_company=False):
        """Sérialiser l'affiche en dictionnaire"""
        data = {
            'id': self.id,
            'job_id': self.job_id,
            'company_id': self.company_id,
            'title': self.title,
            'description': self.description,
            'style': self.style,
            'color_scheme': self.color_scheme,
            'template_type': self.template_type,
            'ai_headline': self.ai_headline,
            'ai_tagline': self.ai_tagline,
            'ai_description': self.ai_description,
            'ai_keywords': self.ai_keywords or [],
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_url': self.file_url,
            'file_size': self.file_size,
            'format': self.format,
            'width': self.width,
            'height': self.height,
            'generation_method': self.generation_method,
            'ai_model_used': self.ai_model_used,
            'generation_time': self.generation_time,
            'custom_colors': self.custom_colors or {},
            'include_logo': self.include_logo,
            'include_qr_code': self.include_qr_code,
            'qr_code_url': self.qr_code_url,
            'views_count': self.views_count,
            'downloads_count': self.downloads_count,
            'shares_count': self.shares_count,
            'is_active': self.is_active,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None
        }

        if include_job and self.job:
            data['job'] = self.job.to_dict(include_company=False)

        if include_company and self.company:
            data['company'] = {
                'id': self.company.id,
                'name': self.company.name,
                'logo_url': self.company.logo_url,
                'sector': self.company.sector
            }

        return data

    def increment_views(self):
        """Incrémenter le compteur de vues"""
        self.views_count += 1
        db.session.commit()

    def increment_downloads(self):
        """Incrémenter le compteur de téléchargements"""
        self.downloads_count += 1
        db.session.commit()

    def increment_shares(self):
        """Incrémenter le compteur de partages"""
        self.shares_count += 1
        db.session.commit()

    def __repr__(self):
        return f'<Poster {self.id} - Job:{self.job_id}>'
