"""
================================================================
Routes d'Authentification - BaraCorrespondance AI
================================================================
"""

import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, g
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)

from app import db
from app.models import User, Candidate, Company
from app.utils.validators import validate_email, validate_password
from app.utils.helpers import success_response, error_response

auth_bp = Blueprint('auth', __name__)


# ================================================================
# INSCRIPTION
# ================================================================

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Inscription d'un nouvel utilisateur (candidat ou entreprise)
    
    Body JSON:
    {
        "email": "user@example.com",
        "password": "SecurePass123!",
        "role": "candidate" | "company",
        "first_name": "Mamadou",      # Pour candidats
        "last_name": "Diallo",         # Pour candidats
        "company_name": "TechCorp"     # Pour entreprises
    }
    """
    data = request.get_json()
    
    if not data:
        return error_response("Données JSON requises", 400)
    
    # Validation des champs obligatoires
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', '').lower()
    
    if not email or not password or not role:
        return error_response("Email, mot de passe et rôle sont requis", 400)
    
    # Validation de l'email
    if not validate_email(email):
        return error_response("Format d'email invalide", 400)
    
    # Validation du mot de passe
    is_valid, message = validate_password(password)
    if not is_valid:
        return error_response(message, 400)
    
    # Validation du rôle
    if role not in ['candidate', 'company']:
        return error_response("Le rôle doit être 'candidate' ou 'company'", 400)
    
    # Vérifier si l'email existe déjà
    if User.query.filter_by(email=email).first():
        return error_response("Cet email est déjà utilisé", 409)
    
    # Créer l'utilisateur
    try:
        verification_token = secrets.token_urlsafe(32)
        
        user = User(
            email=email,
            password=password,
            role=role,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            phone=data.get('phone'),
            verification_token=verification_token
        )
        
        db.session.add(user)
        db.session.flush()  # Obtenir l'ID
        
        # Créer le profil associé
        if role == 'candidate':
            candidate = Candidate(
                user_id=user.id,
                title=data.get('title'),
                city=data.get('city'),
                country=data.get('country', 'Guinée')
            )
            db.session.add(candidate)
            
        elif role == 'company':
            company_name = data.get('company_name')
            if not company_name:
                db.session.rollback()
                return error_response("Le nom de l'entreprise est requis", 400)
            
            company = Company(
                user_id=user.id,
                name=company_name,
                sector=data.get('sector'),
                city=data.get('city'),
                country=data.get('country', 'Guinée')
            )
            db.session.add(company)
        
        db.session.commit()
        
        # Générer les tokens (identity as string for consistency)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # TODO: Envoyer email de vérification
        
        return success_response({
            'user': user.to_dict(include_profile=True),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer'
        }, "Inscription réussie! Vérifiez votre email.", 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur lors de l'inscription: {str(e)}", 500)


# ================================================================
# CONNEXION
# ================================================================

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Connexion d'un utilisateur
    
    Body JSON:
    {
        "email": "user@example.com",
        "password": "SecurePass123!"
    }
    """
    data = request.get_json()
    
    if not data:
        return error_response("Données JSON requises", 400)
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return error_response("Email et mot de passe requis", 400)
    
    # Trouver l'utilisateur
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return error_response("Email ou mot de passe incorrect", 401)
    
    if not user.is_active:
        return error_response("Votre compte a été désactivé", 403)
    
    # Mettre à jour la dernière connexion
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Générer les tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return success_response({
        'user': user.to_dict(include_profile=True),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer'
    }, "Connexion réussie")


# ================================================================
# RAFRAÎCHIR LE TOKEN
# ================================================================

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Rafraîchir le token d'accès"""
    current_user_id = get_jwt_identity()
    
    user = User.query.get(current_user_id)
    if not user or not user.is_active:
        return error_response("Utilisateur non trouvé ou inactif", 401)
    
    # Ensure identity stored as string in refreshed token
    new_access_token = create_access_token(identity=str(current_user_id))
    
    return success_response({
        'access_token': new_access_token,
        'token_type': 'Bearer'
    }, "Token rafraîchi")


# ================================================================
# PROFIL UTILISATEUR CONNECTÉ
# ================================================================

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtenir les informations de l'utilisateur connecté"""
    current_user_id = get_jwt_identity()
    
    user = User.query.get(current_user_id)
    if not user:
        return error_response("Utilisateur non trouvé", 404)
    
    return success_response({
        'user': user.to_dict(include_profile=True)
    })


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Mettre à jour les informations de base de l'utilisateur"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    user = User.query.get(current_user_id)
    if not user:
        return error_response("Utilisateur non trouvé", 404)
    
    # Champs modifiables
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    db.session.commit()
    
    return success_response({
        'user': user.to_dict(include_profile=True)
    }, "Profil mis à jour")


# ================================================================
# CHANGEMENT DE MOT DE PASSE
# ================================================================

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Changer le mot de passe
    
    Body JSON:
    {
        "current_password": "ancien_mdp",
        "new_password": "nouveau_mdp"
    }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    
    if not current_password or not new_password:
        return error_response("Mot de passe actuel et nouveau requis", 400)
    
    user = User.query.get(current_user_id)
    if not user:
        return error_response("Utilisateur non trouvé", 404)
    
    if not user.check_password(current_password):
        return error_response("Mot de passe actuel incorrect", 401)
    
    # Valider le nouveau mot de passe
    is_valid, message = validate_password(new_password)
    if not is_valid:
        return error_response(message, 400)
    
    user.set_password(new_password)
    db.session.commit()
    
    return success_response(message="Mot de passe modifié avec succès")


# ================================================================
# MOT DE PASSE OUBLIÉ
# ================================================================

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Demander une réinitialisation de mot de passe
    
    Body JSON:
    {
        "email": "user@example.com"
    }
    """
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email:
        return error_response("Email requis", 400)
    
    user = User.query.filter_by(email=email).first()
    
    # Toujours retourner succès pour éviter l'énumération d'emails
    if user:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        
        # TODO: Envoyer email avec le lien de réinitialisation
    
    return success_response(
        message="Si cet email existe, un lien de réinitialisation a été envoyé"
    )


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Réinitialiser le mot de passe avec le token
    
    Body JSON:
    {
        "token": "reset_token",
        "password": "nouveau_mdp"
    }
    """
    data = request.get_json()
    token = data.get('token', '')
    new_password = data.get('password', '')
    
    if not token or not new_password:
        return error_response("Token et nouveau mot de passe requis", 400)
    
    user = User.query.filter_by(reset_token=token).first()
    
    if not user:
        return error_response("Token invalide", 400)
    
    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        return error_response("Token expiré", 400)
    
    # Valider le nouveau mot de passe
    is_valid, message = validate_password(new_password)
    if not is_valid:
        return error_response(message, 400)
    
    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    
    return success_response(message="Mot de passe réinitialisé avec succès")


# ================================================================
# VÉRIFICATION EMAIL
# ================================================================

@auth_bp.route('/verify-email/<token>', methods=['POST'])
def verify_email(token):
    """Vérifier l'email avec le token"""
    user = User.query.filter_by(verification_token=token).first()
    
    if not user:
        return error_response("Token de vérification invalide", 400)
    
    if user.is_verified:
        return error_response("Email déjà vérifié", 400)
    
    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    
    return success_response(message="Email vérifié avec succès")


# ================================================================
# DÉCONNEXION
# ================================================================

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Déconnexion (côté client, supprimer le token)
    Note: Pour une vraie révocation, implémenter une blacklist de tokens
    """
    return success_response(message="Déconnexion réussie")
