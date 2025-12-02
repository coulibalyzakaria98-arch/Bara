"""
================================================================
Modèle Favorite - Système de favoris
================================================================
Permet aux candidats de sauvegarder des jobs favoris
et aux entreprises de marquer des candidats favoris
"""

from datetime import datetime
from app import db


class Favorite(db.Model):
    """Système de favoris pour jobs et candidats"""

    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Type de favori
    favorite_type = db.Column(db.String(20), nullable=False)  # 'job' ou 'candidate'

    # Job favori (pour candidats)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=True)

    # Candidat favori (pour entreprises)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=True)

    # Notes personnelles (optionnel)
    notes = db.Column(db.Text)

    # Dates
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = db.relationship('User', backref=db.backref('favorites', lazy='dynamic', cascade='all, delete-orphan'))
    job = db.relationship('Job', backref=db.backref('favorited_by', lazy='dynamic'))
    candidate = db.relationship('Candidate', backref=db.backref('favorited_by', lazy='dynamic'))

    # Contraintes uniques
    __table_args__ = (
        db.UniqueConstraint('user_id', 'job_id', name='unique_user_job_favorite'),
        db.UniqueConstraint('user_id', 'candidate_id', name='unique_user_candidate_favorite'),
    )

    def to_dict(self, include_details=False):
        """Sérialiser le favori en dictionnaire"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'favorite_type': self.favorite_type,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        # Inclure les détails du job ou du candidat
        if include_details:
            if self.favorite_type == 'job' and self.job:
                data['job'] = self.job.to_dict(include_company=True)
            elif self.favorite_type == 'candidate' and self.candidate:
                data['candidate'] = self.candidate.to_dict()
        else:
            if self.favorite_type == 'job':
                data['job_id'] = self.job_id
            elif self.favorite_type == 'candidate':
                data['candidate_id'] = self.candidate_id

        return data

    @staticmethod
    def is_favorited(user_id, job_id=None, candidate_id=None):
        """Vérifier si un job ou candidat est déjà en favoris"""
        if job_id:
            return Favorite.query.filter_by(
                user_id=user_id,
                job_id=job_id,
                favorite_type='job'
            ).first() is not None
        elif candidate_id:
            return Favorite.query.filter_by(
                user_id=user_id,
                candidate_id=candidate_id,
                favorite_type='candidate'
            ).first() is not None
        return False

    @staticmethod
    def get_user_favorites(user_id, favorite_type=None):
        """Récupérer tous les favoris d'un utilisateur"""
        query = Favorite.query.filter_by(user_id=user_id)
        if favorite_type:
            query = query.filter_by(favorite_type=favorite_type)
        return query.order_by(Favorite.created_at.desc()).all()

    def __repr__(self):
        return f'<Favorite {self.id}: User {self.user_id} - {self.favorite_type}>'
