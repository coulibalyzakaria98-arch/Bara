"""
================================================================
Message Model - BaraCorrespondance AI
================================================================
Messages entre candidats et entreprises pour les matchs mutuels
"""

from datetime import datetime
from app import db


class Message(db.Model):
    """Messages entre candidats et entreprises"""
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    sender_type = db.Column(db.String(20), nullable=False)  # 'candidate' ou 'company'
    sender_id = db.Column(db.Integer, nullable=False)  # ID du candidat ou de l'entreprise
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    match = db.relationship('Match', backref=db.backref('messages', lazy='dynamic', cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<Message {self.id} - Match {self.match_id} from {self.sender_type}>'

    def to_dict(self, include_match=False):
        """Convertir en dictionnaire"""
        data = {
            'id': self.id,
            'match_id': self.match_id,
            'sender_type': self.sender_type,
            'sender_id': self.sender_id,
            'content': self.content,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_match and self.match:
            data['match'] = self.match.to_dict()

        return data

    def mark_as_read(self):
        """Marquer le message comme lu"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
            db.session.commit()
