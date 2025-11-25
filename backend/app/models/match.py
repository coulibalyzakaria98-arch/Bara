"""
================================================================
Modèle Match - Correspondances automatiques CV-Emploi
================================================================
"""

from datetime import datetime
from app import db


class Match(db.Model):
    """Correspondance entre un candidat et une offre d'emploi"""

    __tablename__ = 'matches'

    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    cv_analysis_id = db.Column(db.Integer, db.ForeignKey('cv_analyses.id'))

    # Score de correspondance (0-100)
    match_score = db.Column(db.Float, nullable=False)

    # Détails du matching
    match_details = db.Column(db.JSON, default=dict)
    """
    Structure match_details:
    {
        "skills_match": {
            "score": 85,
            "matched_skills": ["Python", "SQL", "Docker"],
            "missing_skills": ["Kubernetes"],
            "matched_count": 8,
            "required_count": 10
        },
        "experience_match": {
            "score": 90,
            "candidate_years": 5,
            "required_min_years": 3,
            "required_max_years": 7,
            "level_match": true
        },
        "education_match": {
            "score": 80,
            "candidate_level": "Master",
            "required_level": "Licence",
            "meets_requirement": true
        },
        "location_match": {
            "score": 100,
            "candidate_location": "Conakry",
            "job_location": "Conakry",
            "is_remote": false
        },
        "keywords_match": {
            "score": 75,
            "matched_keywords": ["API", "Backend", "Django"],
            "total_keywords": 15
        }
    }
    """

    # Raisons du match
    match_reasons = db.Column(db.JSON, default=list)
    """
    [
        "Compétences techniques fortement alignées (85%)",
        "Expérience correspond au niveau recherché",
        "Formation supérieure aux exigences",
        "Localisation géographique parfaite"
    ]
    """

    # Points d'attention
    concerns = db.Column(db.JSON, default=list)
    """
    [
        "Manque de compétence en Kubernetes",
        "Pas d'expérience avec AWS"
    ]
    """

    # Statut du match
    status = db.Column(db.String(50), default='new')
    # new, viewed_by_company, viewed_by_candidate, both_viewed,
    # company_interested, candidate_interested, both_interested,
    # rejected_by_company, rejected_by_candidate, expired

    # Flags
    is_auto_matched = db.Column(db.Boolean, default=True)  # Match auto vs manuel
    is_mutual_interest = db.Column(db.Boolean, default=False)  # Les 2 parties intéressées
    is_favorite_company = db.Column(db.Boolean, default=False)  # Entreprise a marqué favori
    is_favorite_candidate = db.Column(db.Boolean, default=False)  # Candidat a marqué favori

    # Notifications envoyées
    company_notified_at = db.Column(db.DateTime)
    candidate_notified_at = db.Column(db.DateTime)

    # Vues
    viewed_by_company_at = db.Column(db.DateTime)
    viewed_by_candidate_at = db.Column(db.DateTime)

    # Actions
    company_action = db.Column(db.String(50))  # interested, not_interested, contacted
    candidate_action = db.Column(db.String(50))  # interested, not_interested, applied
    company_action_at = db.Column(db.DateTime)
    candidate_action_at = db.Column(db.DateTime)

    # Notes privées
    company_notes = db.Column(db.Text)
    candidate_notes = db.Column(db.Text)

    # Métadonnées
    matching_algorithm_version = db.Column(db.String(20), default='1.0')

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = db.Column(db.DateTime)  # Expiration du match (optionnel)

    # Relations
    candidate = db.relationship('Candidate', backref='matches')
    job = db.relationship('Job', backref='matches')
    cv_analysis = db.relationship('CVAnalysis', backref='matches')

    # Contrainte d'unicité : un candidat ne peut matcher qu'une fois avec un job
    __table_args__ = (
        db.UniqueConstraint('candidate_id', 'job_id', name='unique_candidate_job_match'),
    )

    def to_dict(self, include_candidate=False, include_job=False, include_analysis=False):
        """Sérialiser le match en dictionnaire"""
        data = {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'job_id': self.job_id,
            'cv_analysis_id': self.cv_analysis_id,
            'match_score': round(self.match_score, 1) if self.match_score else 0,
            'match_details': self.match_details or {},
            'match_reasons': self.match_reasons or [],
            'concerns': self.concerns or [],
            'status': self.status,
            'is_auto_matched': self.is_auto_matched,
            'is_mutual_interest': self.is_mutual_interest,
            'is_favorite_company': self.is_favorite_company,
            'is_favorite_candidate': self.is_favorite_candidate,
            'company_notified_at': self.company_notified_at.isoformat() if self.company_notified_at else None,
            'candidate_notified_at': self.candidate_notified_at.isoformat() if self.candidate_notified_at else None,
            'viewed_by_company_at': self.viewed_by_company_at.isoformat() if self.viewed_by_company_at else None,
            'viewed_by_candidate_at': self.viewed_by_candidate_at.isoformat() if self.viewed_by_candidate_at else None,
            'company_action': self.company_action,
            'candidate_action': self.candidate_action,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_candidate and self.candidate:
            data['candidate'] = {
                'id': self.candidate.id,
                'user_id': self.candidate.user_id,
                'full_name': self.candidate.full_name,
                'title': self.candidate.title,
                'location': self.candidate.location,
                'avatar_url': self.candidate.avatar_url,
                'skills': self.candidate.skills or [],
                'experience_years': self.candidate.experience_years
            }

        if include_job and self.job:
            data['job'] = {
                'id': self.job.id,
                'title': self.job.title,
                'company_id': self.job.company_id,
                'location': self.job.location,
                'contract_type': self.job.contract_type,
                'required_skills': self.job.required_skills or [],
                'salary_min': self.job.salary_min if self.job.show_salary else None,
                'salary_max': self.job.salary_max if self.job.show_salary else None,
                'is_active': self.job.is_active
            }

            # Inclure info entreprise
            if self.job.company:
                data['job']['company'] = {
                    'id': self.job.company.id,
                    'name': self.job.company.name,
                    'logo_url': self.job.company.logo_url,
                    'sector': self.job.company.sector
                }

        if include_analysis and self.cv_analysis:
            data['cv_analysis'] = {
                'id': self.cv_analysis.id,
                'overall_score': self.cv_analysis.overall_score,
                'file_name': self.cv_analysis.file_name,
                'created_at': self.cv_analysis.created_at.isoformat() if self.cv_analysis.created_at else None
            }

        return data

    def mark_viewed_by_company(self):
        """Marquer comme vu par l'entreprise"""
        if not self.viewed_by_company_at:
            self.viewed_by_company_at = datetime.utcnow()
            self._update_status()

    def mark_viewed_by_candidate(self):
        """Marquer comme vu par le candidat"""
        if not self.viewed_by_candidate_at:
            self.viewed_by_candidate_at = datetime.utcnow()
            self._update_status()

    def set_company_action(self, action, notes=None):
        """Définir l'action de l'entreprise"""
        self.company_action = action
        self.company_action_at = datetime.utcnow()
        if notes:
            self.company_notes = notes
        self._update_status()

    def set_candidate_action(self, action, notes=None):
        """Définir l'action du candidat"""
        self.candidate_action = action
        self.candidate_action_at = datetime.utcnow()
        if notes:
            self.candidate_notes = notes
        self._update_status()

    def _update_status(self):
        """Mettre à jour le statut en fonction des actions"""
        # Les deux ont vu
        if self.viewed_by_company_at and self.viewed_by_candidate_at:
            if self.status == 'new' or self.status == 'viewed_by_company' or self.status == 'viewed_by_candidate':
                self.status = 'both_viewed'

        # Les deux sont intéressés
        if self.company_action == 'interested' and self.candidate_action == 'interested':
            self.status = 'both_interested'
            self.is_mutual_interest = True

        # Rejet
        if self.company_action == 'not_interested':
            self.status = 'rejected_by_company'
        elif self.candidate_action == 'not_interested':
            self.status = 'rejected_by_candidate'

        db.session.commit()

    def get_match_grade(self):
        """Retourner une note basée sur le score de match"""
        if self.match_score >= 90:
            return 'Excellent', '🌟'
        elif self.match_score >= 80:
            return 'Très bon', '⭐'
        elif self.match_score >= 70:
            return 'Bon', '✨'
        elif self.match_score >= 60:
            return 'Correct', '👍'
        else:
            return 'Faible', '💡'

    def __repr__(self):
        return f'<Match {self.id} - Candidate:{self.candidate_id} Job:{self.job_id} Score:{self.match_score}>'
