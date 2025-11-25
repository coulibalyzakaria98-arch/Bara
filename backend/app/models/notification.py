"""
================================================================
Modèle Notification - Système de notifications
================================================================
"""

from datetime import datetime
from app import db


class Notification(db.Model):
    """Notification utilisateur"""

    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Type de notification
    type = db.Column(db.String(50), nullable=False)
    # Types: new_match, application_received, application_status,
    #        profile_view, new_job, message, system

    # Contenu
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text)

    # Données additionnelles (JSON)
    data = db.Column(db.JSON, default=dict)
    # Ex: {"job_id": 123, "candidate_id": 456}

    # Statut
    is_read = db.Column(db.Boolean, default=False)

    # Lien d'action
    action_url = db.Column(db.String(500))

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)

    # Relation
    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic'))

    def mark_as_read(self):
        """Marquer comme lue"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def to_dict(self):
        """Sérialiser la notification"""
        return {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'data': self.data or {},
            'is_read': self.is_read,
            'action_url': self.action_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }

    def __repr__(self):
        return f'<Notification {self.id} - {self.type}>'


def create_notification(user_id, type, title, message=None, data=None, action_url=None):
    """Helper pour créer une notification"""
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        data=data or {},
        action_url=action_url
    )
    db.session.add(notification)
    db.session.commit()
    return notification
