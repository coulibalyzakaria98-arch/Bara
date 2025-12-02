"""
================================================================
Modèle SkillTest - BaraCorrespondance AI
================================================================
Système de tests de compétences pour candidats
"""

from datetime import datetime
from app import db


class SkillTest(db.Model):
    """
    Modèle pour les tests de compétences

    Permet de créer des tests (QCM) pour évaluer les compétences des candidats
    """
    __tablename__ = 'skill_tests'

    id = db.Column(db.Integer, primary_key=True)

    # Informations du test
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    skill_category = db.Column(db.String(100), nullable=False)  # 'Python', 'JavaScript', 'Marketing', etc.
    difficulty = db.Column(db.String(20), nullable=False)  # 'easy', 'medium', 'hard'

    # Questions (JSON)
    # Format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": 0, "points": 10}]
    questions = db.Column(db.JSON, nullable=False)

    # Configuration
    duration_minutes = db.Column(db.Integer, default=30)  # Durée du test
    pass_score = db.Column(db.Integer, default=70)  # Score minimum pour réussir (%)

    # Métadonnées
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    results = db.relationship('TestResult', backref='test', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_answers=False):
        """Convertir en dictionnaire"""
        test_dict = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'skill_category': self.skill_category,
            'difficulty': self.difficulty,
            'duration_minutes': self.duration_minutes,
            'pass_score': self.pass_score,
            'is_active': self.is_active,
            'total_questions': len(self.questions) if self.questions else 0,
            'total_points': sum(q.get('points', 0) for q in self.questions) if self.questions else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_answers:
            # Pour les administrateurs uniquement
            test_dict['questions'] = self.questions
        else:
            # Pour les candidats: masquer les réponses correctes
            test_dict['questions'] = [{
                'id': idx,
                'question': q['question'],
                'options': q['options'],
                'points': q.get('points', 10)
            } for idx, q in enumerate(self.questions)] if self.questions else []

        return test_dict

    @property
    def completion_count(self):
        """Nombre de candidats ayant passé le test"""
        return self.results.count()

    @property
    def pass_rate(self):
        """Taux de réussite"""
        total = self.results.count()
        if total == 0:
            return 0.0
        passed = self.results.filter_by(passed=True).count()
        return round((passed / total) * 100, 1)

    @property
    def average_score(self):
        """Score moyen"""
        from sqlalchemy import func
        result = db.session.query(func.avg(TestResult.score)).filter_by(test_id=self.id).scalar()
        return round(result, 1) if result else 0.0

    def __repr__(self):
        return f'<SkillTest {self.id}: {self.title}>'


class TestResult(db.Model):
    """
    Modèle pour les résultats de tests

    Stocke les réponses et résultats des candidats
    """
    __tablename__ = 'test_results'

    id = db.Column(db.Integer, primary_key=True)

    # Relations
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    test_id = db.Column(db.Integer, db.ForeignKey('skill_tests.id'), nullable=False)

    # Résultats
    score = db.Column(db.Integer, nullable=False)  # Score obtenu (%)
    points_earned = db.Column(db.Integer, default=0)  # Points gagnés
    points_total = db.Column(db.Integer, default=0)  # Points totaux possibles
    passed = db.Column(db.Boolean, default=False)  # Test réussi ou non

    # Réponses (JSON)
    # Format: [{"question_id": 0, "answer": 2, "is_correct": true, "points": 10}]
    answers = db.Column(db.JSON)

    # Timing
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    duration_seconds = db.Column(db.Integer)  # Durée réelle du test

    def to_dict(self, include_answers=False):
        """Convertir en dictionnaire"""
        from app.models import Candidate

        candidate = Candidate.query.get(self.candidate_id)

        result_dict = {
            'id': self.id,
            'candidate': {
                'id': candidate.id if candidate else None,
                'name': candidate.full_name if candidate else 'N/A',
                'avatar_url': candidate.avatar_url if candidate else None
            },
            'test': {
                'id': self.test.id if self.test else None,
                'title': self.test.title if self.test else 'N/A',
                'skill_category': self.test.skill_category if self.test else None
            },
            'score': self.score,
            'points_earned': self.points_earned,
            'points_total': self.points_total,
            'passed': self.passed,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'duration_seconds': self.duration_seconds
        }

        if include_answers:
            result_dict['answers'] = self.answers

        return result_dict

    def __repr__(self):
        return f'<TestResult {self.id}: {self.score}% for test {self.test_id}>'
