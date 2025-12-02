"""
================================================================
Models - BaraCorrespondance AI
================================================================
Export de tous les modèles de la base de données
"""

from app.models.user import User
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.job import Job, JobApplication
from app.models.cv_analysis import CVAnalysis
from app.models.notification import Notification, create_notification
from app.models.poster import Poster
from app.models.match import Match
from app.models.message import Message
from app.models.favorite import Favorite
from app.models.review import Review
from app.models.skill_test import SkillTest, TestResult

__all__ = [
    'User',
    'Candidate',
    'Company',
    'Job',
    'JobApplication',
    'CVAnalysis',
    'Notification',
    'create_notification',
    'Poster',
    'Match',
    'Message',
    'Favorite',
    'Review',
    'SkillTest',
    'TestResult'
]
