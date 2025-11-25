"""
================================================================
Routes - BaraCorrespondance AI
================================================================
Export de tous les blueprints
"""

from app.routes.auth import auth_bp
from app.routes.candidates import candidates_bp
from app.routes.companies import companies_bp
from app.routes.jobs import jobs_bp
from app.routes.analysis import analysis_bp
from app.routes.uploads import uploads_bp
from app.routes.matching import matching_bp
from app.routes.notifications import notifications_bp

__all__ = [
    'auth_bp',
    'candidates_bp',
    'companies_bp',
    'jobs_bp',
    'analysis_bp',
    'uploads_bp',
    'matching_bp',
    'notifications_bp'
]
