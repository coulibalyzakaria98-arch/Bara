"""
================================================================
BaraCorrespondance AI - Application Factory
================================================================
"""

import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_marshmallow import Marshmallow

from app.config import config

# Extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
ma = Marshmallow()


def create_app(config_name=None):
    """Factory pattern pour créer l'application Flask"""
    
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # CORS FIRST - must be before other extensions
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })
    
    # Initialiser les extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    
    # Enregistrer les blueprints (routes)
    register_blueprints(app)
    
    # Enregistrer les gestionnaires d'erreurs
    register_error_handlers(app)
    
    # Configurer JWT callbacks
    register_jwt_callbacks(app)
    
    # Créer les dossiers d'upload si nécessaires
    create_upload_folders(app)
    
    # Route de santé
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'BaraCorrespondance AI API is running',
            'version': '1.0.0'
        })
    
    @app.route('/')
    def index():
        return jsonify({
            'name': 'BaraCorrespondance AI API',
            'version': '1.0.0',
            'description': 'Plateforme de matching CV-Entreprise avec IA',
            'endpoints': {
                'auth': '/api/auth',
                'candidates': '/api/candidates',
                'companies': '/api/companies',
                'jobs': '/api/jobs',
                'analysis': '/api/analysis',
                'health': '/api/health'
            }
        })
    
    return app


def register_blueprints(app):
    """Enregistrer tous les blueprints"""
    from app.routes.auth import auth_bp
    from app.routes.candidates import candidates_bp
    from app.routes.companies import companies_bp
    from app.routes.jobs import jobs_bp
    from app.routes.analysis import analysis_bp
    from app.routes.uploads import uploads_bp
    from app.routes.matching import matching_bp
    from app.routes.notifications import notifications_bp
    from app.routes.posters import posters_bp
    from app.routes.matches import matches_bp
    from app.routes.messages import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(candidates_bp, url_prefix='/api/candidates')
    app.register_blueprint(companies_bp, url_prefix='/api/companies')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    app.register_blueprint(matching_bp, url_prefix='/api/matching')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(posters_bp, url_prefix='/api/posters')
    app.register_blueprint(matches_bp, url_prefix='/api/matches')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')


def register_error_handlers(app):
    """Enregistrer les gestionnaires d'erreurs globaux"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            'message': str(error.description) if hasattr(error, 'description') else 'Requête invalide'
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'Authentification requise'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': 'Forbidden',
            'message': 'Accès interdit'
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Not Found',
            'message': 'Ressource non trouvée'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': 'Erreur interne du serveur'
        }), 500


def register_jwt_callbacks(app):
    """Configurer les callbacks JWT"""
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'error': 'Token Expired',
            'message': 'Votre session a expiré, veuillez vous reconnecter'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"[JWT DEBUG] invalid_token_loader called with error: {error}")
        return jsonify({
            'success': False,
            'error': 'Invalid Token',
            'message': 'Token invalide'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print(f"[JWT DEBUG] unauthorized_loader called with error: {error}")
        return jsonify({
            'success': False,
            'error': 'Missing Token',
            'message': 'Token d\'authentification manquant'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'error': 'Token Revoked',
            'message': 'Token révoqué'
        }), 401


def create_upload_folders(app):
    """Créer les dossiers d'upload"""
    upload_base = app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
    folders = ['cv', 'avatars', 'logos', 'posters']
    
    for folder in folders:
        path = os.path.join(upload_base, folder)
        os.makedirs(path, exist_ok=True)
