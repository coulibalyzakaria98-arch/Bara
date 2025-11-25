"""
================================================================
Services - BaraCorrespondance AI
================================================================
Services métier de l'application
"""

from app.services.cv_analyzer import CVAnalyzerService
from app.services.matcher import MatcherService

__all__ = [
    'CVAnalyzerService',
    'MatcherService'
]
