"""
================================================================
Modèle CVAnalysis - Résultats d'analyse de CV par l'IA
================================================================
"""

from datetime import datetime
from app import db


class CVAnalysis(db.Model):
    """Stockage des résultats d'analyse de CV"""
    
    __tablename__ = 'cv_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    
    # Informations sur le fichier
    file_url = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255))
    file_type = db.Column(db.String(20))  # pdf, docx
    file_size = db.Column(db.Integer)  # en bytes
    
    # Contenu extrait
    raw_text = db.Column(db.Text)  # Texte brut extrait du CV
    
    # Données extraites par l'IA (JSON)
    extracted_data = db.Column(db.JSON, default=dict)
    """
    Structure extracted_data:
    {
        "personal_info": {
            "name": "Mamadou Diallo",
            "email": "mamadou@email.com",
            "phone": "+224 XXX XXX XXX",
            "address": "Conakry, Guinée",
            "linkedin": "linkedin.com/in/..."
        },
        "skills": {
            "technical": ["Python", "JavaScript", "SQL"],
            "soft": ["Communication", "Leadership", "Travail d'équipe"],
            "languages": [
                {"name": "Français", "level": "Natif"},
                {"name": "Anglais", "level": "Professionnel"}
            ]
        },
        "experience": [
            {
                "company": "TechCorp",
                "title": "Développeur Senior",
                "start_date": "2020-01",
                "end_date": "2023-12",
                "duration_months": 48,
                "description": "...",
                "achievements": ["...", "..."]
            }
        ],
        "education": [
            {
                "institution": "Université de Conakry",
                "degree": "Master",
                "field": "Informatique",
                "year": "2019"
            }
        ],
        "certifications": ["AWS Certified", "..."],
        "projects": [
            {
                "name": "Projet X",
                "description": "...",
                "technologies": ["Python", "Django"]
            }
        ],
        "total_experience_years": 5
    }
    """
    
    # Scores
    overall_score = db.Column(db.Float, default=0)  # Score global 0-100
    scores_breakdown = db.Column(db.JSON, default=dict)
    """
    Structure scores_breakdown:
    {
        "technical_skills": 85,
        "experience": 70,
        "education": 80,
        "presentation": 75,
        "completeness": 90,
        "keywords_density": 65
    }
    """
    
    # Recommandations d'amélioration
    recommendations = db.Column(db.JSON, default=list)
    """
    Structure recommendations:
    [
        {
            "type": "improvement",  # improvement, warning, tip
            "priority": "high",  # high, medium, low
            "category": "skills",  # skills, experience, education, format
            "title": "Ajoutez plus de compétences techniques",
            "message": "Votre CV manque de mots-clés techniques...",
            "suggestion": "Ajoutez des compétences comme Python, SQL..."
        }
    ]
    """
    
    # Mots-clés extraits (pour le matching)
    keywords = db.Column(db.JSON, default=list)
    
    # Métadonnées d'analyse
    analysis_version = db.Column(db.String(20), default='1.0')
    processing_time = db.Column(db.Float)  # en secondes
    
    # Statut
    is_latest = db.Column(db.Boolean, default=True)  # Dernière analyse pour ce candidat
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self, include_raw_text=False):
        """Sérialiser l'analyse en dictionnaire"""
        data = {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'file_size_mb': round(self.file_size / (1024 * 1024), 2) if self.file_size else None,
            'extracted_data': self.extracted_data or {},
            'overall_score': self.overall_score,
            'scores_breakdown': self.scores_breakdown or {},
            'recommendations': self.recommendations or [],
            'keywords': self.keywords or [],
            'analysis_version': self.analysis_version,
            'processing_time': self.processing_time,
            'is_latest': self.is_latest,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_raw_text:
            data['raw_text'] = self.raw_text
        
        return data
    
    def get_score_grade(self):
        """Retourner une note basée sur le score"""
        if self.overall_score >= 90:
            return 'A', 'Excellent'
        elif self.overall_score >= 80:
            return 'B', 'Très bien'
        elif self.overall_score >= 70:
            return 'C', 'Bien'
        elif self.overall_score >= 60:
            return 'D', 'Correct'
        else:
            return 'E', 'À améliorer'
    
    def __repr__(self):
        return f'<CVAnalysis {self.id} - Score: {self.overall_score}>'
