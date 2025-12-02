"""
================================================================
Modèle Review - BaraCorrespondance AI
================================================================
Système d'avis et notations pour candidats et entreprises
"""

from datetime import datetime
from sqlalchemy import UniqueConstraint
from app import db


class Review(db.Model):
    """
    Modèle pour les avis et notations

    Un utilisateur peut laisser un avis sur:
    - Un candidat (par une entreprise)
    - Une entreprise (par un candidat)
    """
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)

    # Reviewer (celui qui laisse l'avis)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reviewer = db.relationship('User', foreign_keys=[reviewer_id], backref='reviews_given')

    # Reviewed (celui qui reçoit l'avis)
    reviewed_id = db.Column(db.Integer, nullable=False)  # ID du candidat ou de l'entreprise
    reviewed_type = db.Column(db.String(20), nullable=False)  # 'candidate' ou 'company'

    # Contenu de l'avis
    rating = db.Column(db.Integer, nullable=False)  # Note de 1 à 5 étoiles
    title = db.Column(db.String(200))  # Titre de l'avis (optionnel)
    comment = db.Column(db.Text)  # Commentaire détaillé

    # Aspects spécifiques (optionnels, note de 1 à 5)
    professionalism = db.Column(db.Integer)  # Professionnalisme
    communication = db.Column(db.Integer)  # Communication
    reliability = db.Column(db.Integer)  # Fiabilité
    skills = db.Column(db.Integer)  # Compétences (pour candidats) ou qualité des offres (pour entreprises)

    # Métadonnées
    is_public = db.Column(db.Boolean, default=True)  # Avis public ou privé
    is_verified = db.Column(db.Boolean, default=False)  # Vérifié (candidat/entreprise a vraiment travaillé ensemble)
    helpful_count = db.Column(db.Integer, default=0)  # Nombre de "utile" reçus

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Contrainte unique: un utilisateur ne peut laisser qu'un seul avis sur un candidat/entreprise
    __table_args__ = (
        UniqueConstraint('reviewer_id', 'reviewed_id', 'reviewed_type',
                        name='unique_reviewer_reviewed'),
    )

    def to_dict(self):
        """Convertir en dictionnaire"""
        from app.models import User, Candidate, Company

        # Get reviewer info
        reviewer_info = {
            'id': self.reviewer.id if self.reviewer else None,
            'role': self.reviewer.role if self.reviewer else None
        }

        # Add reviewer name based on role
        if self.reviewer:
            if self.reviewer.role == 'candidate' and self.reviewer.candidate:
                reviewer_info['name'] = self.reviewer.candidate.full_name
                reviewer_info['avatar_url'] = self.reviewer.candidate.avatar_url
            elif self.reviewer.role == 'company' and self.reviewer.company:
                reviewer_info['name'] = self.reviewer.company.name
                reviewer_info['avatar_url'] = self.reviewer.company.logo_url

        # Get reviewed info
        reviewed_info = {
            'id': self.reviewed_id,
            'type': self.reviewed_type
        }

        if self.reviewed_type == 'candidate':
            candidate = Candidate.query.get(self.reviewed_id)
            if candidate:
                reviewed_info['name'] = candidate.full_name
                reviewed_info['avatar_url'] = candidate.avatar_url
        elif self.reviewed_type == 'company':
            company = Company.query.get(self.reviewed_id)
            if company:
                reviewed_info['name'] = company.name
                reviewed_info['avatar_url'] = company.logo_url

        return {
            'id': self.id,
            'reviewer': reviewer_info,
            'reviewed': reviewed_info,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'professionalism': self.professionalism,
            'communication': self.communication,
            'reliability': self.reliability,
            'skills': self.skills,
            'is_public': self.is_public,
            'is_verified': self.is_verified,
            'helpful_count': self.helpful_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def get_average_rating(reviewed_id, reviewed_type):
        """Obtenir la note moyenne pour un candidat ou une entreprise"""
        from sqlalchemy import func

        result = db.session.query(func.avg(Review.rating)).filter(
            Review.reviewed_id == reviewed_id,
            Review.reviewed_type == reviewed_type,
            Review.is_public == True
        ).scalar()

        return round(result, 1) if result else 0.0

    @staticmethod
    def get_rating_distribution(reviewed_id, reviewed_type):
        """Obtenir la distribution des notes (combien de 5 étoiles, 4 étoiles, etc.)"""
        from sqlalchemy import func

        distribution = {}
        for rating in range(1, 6):
            count = Review.query.filter(
                Review.reviewed_id == reviewed_id,
                Review.reviewed_type == reviewed_type,
                Review.rating == rating,
                Review.is_public == True
            ).count()
            distribution[str(rating)] = count

        return distribution

    @staticmethod
    def get_aspect_averages(reviewed_id, reviewed_type):
        """Obtenir les moyennes des aspects spécifiques"""
        from sqlalchemy import func

        aspects = db.session.query(
            func.avg(Review.professionalism).label('professionalism'),
            func.avg(Review.communication).label('communication'),
            func.avg(Review.reliability).label('reliability'),
            func.avg(Review.skills).label('skills')
        ).filter(
            Review.reviewed_id == reviewed_id,
            Review.reviewed_type == reviewed_type,
            Review.is_public == True
        ).first()

        return {
            'professionalism': round(aspects.professionalism, 1) if aspects.professionalism else 0.0,
            'communication': round(aspects.communication, 1) if aspects.communication else 0.0,
            'reliability': round(aspects.reliability, 1) if aspects.reliability else 0.0,
            'skills': round(aspects.skills, 1) if aspects.skills else 0.0
        }

    def __repr__(self):
        return f'<Review {self.id}: {self.rating}★ for {self.reviewed_type} {self.reviewed_id}>'
