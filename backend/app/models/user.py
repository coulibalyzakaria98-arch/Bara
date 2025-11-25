"""
================================================================
Modèle User - Utilisateurs de la plateforme
================================================================
"""

from datetime import datetime
import bcrypt
from app import db


class User(db.Model):
    """Modèle de base pour tous les utilisateurs"""
    
    __tablename__ = 'users'
    
    # Colonnes principales
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'candidate', 'company', 'admin'
    
    # Informations personnelles
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    avatar_url = db.Column(db.String(500))
    
    # Statut
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255))
    reset_token = db.Column(db.String(255))
    reset_token_expires = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relations
    candidate = db.relationship('Candidate', backref='user', uselist=False, cascade='all, delete-orphan')
    company = db.relationship('Company', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def __init__(self, email, password, role, **kwargs):
        """Initialiser un nouvel utilisateur"""
        self.email = email.lower().strip()
        self.set_password(password)
        self.role = role
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def set_password(self, password):
        """Hasher et définir le mot de passe"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'), 
            salt
        ).decode('utf-8')
    
    def check_password(self, password):
        """Vérifier le mot de passe"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )
    
    @property
    def full_name(self):
        """Retourner le nom complet"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        return self.email.split('@')[0]
    
    def to_dict(self, include_profile=False):
        """Sérialiser l'utilisateur en dictionnaire"""
        data = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_profile:
            if self.role == 'candidate' and self.candidate:
                data['profile'] = self.candidate.to_dict()
            elif self.role == 'company' and self.company:
                data['profile'] = self.company.to_dict()
        
        return data
    
    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
