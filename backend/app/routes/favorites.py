"""
================================================================
Routes Favorites - BaraCorrespondance AI
================================================================
Gestion des favoris (jobs pour candidats, candidats pour entreprises)
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Favorite, Job, Candidate
from app.utils.helpers import success_response, error_response, safe_int

favorites_bp = Blueprint('favorites', __name__)


@favorites_bp.route('', methods=['GET'])
@jwt_required()
def get_favorites():
    """
    Récupérer tous les favoris de l'utilisateur connecté

    Query params:
        - type: 'job' ou 'candidate' (optionnel, pour filtrer)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    # Filtrer par type si spécifié
    favorite_type = request.args.get('type')
    if favorite_type and favorite_type not in ['job', 'candidate']:
        return error_response("Type invalide. Utilisez 'job' ou 'candidate'", 400)

    # Récupérer les favoris
    favorites = Favorite.get_user_favorites(user_id, favorite_type)

    # Sérialiser avec détails
    favorites_data = [fav.to_dict(include_details=True) for fav in favorites]

    return success_response({
        'favorites': favorites_data,
        'count': len(favorites_data)
    })


@favorites_bp.route('/job/<int:job_id>', methods=['POST'])
@jwt_required()
def add_job_favorite(job_id):
    """
    Ajouter un job aux favoris (candidats uniquement)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    # Vérifier que le job existe
    job = Job.query.get(job_id)
    if not job:
        return error_response("Offre d'emploi non trouvée", 404)

    # Vérifier si déjà en favoris
    if Favorite.is_favorited(user_id, job_id=job_id):
        return error_response("Cette offre est déjà dans vos favoris", 400)

    # Créer le favori
    favorite = Favorite(
        user_id=user_id,
        job_id=job_id,
        favorite_type='job',
        notes=request.json.get('notes') if request.json else None
    )

    try:
        db.session.add(favorite)
        db.session.commit()

        return success_response({
            'favorite': favorite.to_dict(include_details=True),
            'message': 'Offre ajoutée aux favoris'
        }, 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur lors de l'ajout aux favoris: {str(e)}", 500)


@favorites_bp.route('/candidate/<int:candidate_id>', methods=['POST'])
@jwt_required()
def add_candidate_favorite(candidate_id):
    """
    Ajouter un candidat aux favoris (entreprises uniquement)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    # Vérifier que le candidat existe
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("Candidat non trouvé", 404)

    # Vérifier si déjà en favoris
    if Favorite.is_favorited(user_id, candidate_id=candidate_id):
        return error_response("Ce candidat est déjà dans vos favoris", 400)

    # Créer le favori
    favorite = Favorite(
        user_id=user_id,
        candidate_id=candidate_id,
        favorite_type='candidate',
        notes=request.json.get('notes') if request.json else None
    )

    try:
        db.session.add(favorite)
        db.session.commit()

        return success_response({
            'favorite': favorite.to_dict(include_details=True),
            'message': 'Candidat ajouté aux favoris'
        }, 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur lors de l'ajout aux favoris: {str(e)}", 500)


@favorites_bp.route('/job/<int:job_id>', methods=['DELETE'])
@jwt_required()
def remove_job_favorite(job_id):
    """
    Retirer un job des favoris
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    # Trouver le favori
    favorite = Favorite.query.filter_by(
        user_id=user_id,
        job_id=job_id,
        favorite_type='job'
    ).first()

    if not favorite:
        return error_response("Ce favori n'existe pas", 404)

    try:
        db.session.delete(favorite)
        db.session.commit()

        return success_response({'message': 'Offre retirée des favoris'})
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur lors de la suppression: {str(e)}", 500)


@favorites_bp.route('/candidate/<int:candidate_id>', methods=['DELETE'])
@jwt_required()
def remove_candidate_favorite(candidate_id):
    """
    Retirer un candidat des favoris
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    # Trouver le favori
    favorite = Favorite.query.filter_by(
        user_id=user_id,
        candidate_id=candidate_id,
        favorite_type='candidate'
    ).first()

    if not favorite:
        return error_response("Ce favori n'existe pas", 404)

    try:
        db.session.delete(favorite)
        db.session.commit()

        return success_response({'message': 'Candidat retiré des favoris'})
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur lors de la suppression: {str(e)}", 500)


@favorites_bp.route('/<int:favorite_id>/notes', methods=['PUT'])
@jwt_required()
def update_favorite_notes(favorite_id):
    """
    Mettre à jour les notes d'un favori
    """
    user_id = safe_int(get_jwt_identity())

    favorite = Favorite.query.get(favorite_id)
    if not favorite:
        return error_response("Favori non trouvé", 404)

    if favorite.user_id != user_id:
        return error_response("Accès refusé", 403)

    data = request.get_json()
    if not data or 'notes' not in data:
        return error_response("Notes requises", 400)

    try:
        favorite.notes = data['notes']
        db.session.commit()

        return success_response({
            'favorite': favorite.to_dict(include_details=True),
            'message': 'Notes mises à jour'
        })
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur lors de la mise à jour: {str(e)}", 500)


@favorites_bp.route('/check/job/<int:job_id>', methods=['GET'])
@jwt_required()
def check_job_favorite(job_id):
    """
    Vérifier si un job est dans les favoris
    """
    user_id = safe_int(get_jwt_identity())
    is_favorited = Favorite.is_favorited(user_id, job_id=job_id)

    return success_response({
        'is_favorited': is_favorited,
        'job_id': job_id
    })


@favorites_bp.route('/check/candidate/<int:candidate_id>', methods=['GET'])
@jwt_required()
def check_candidate_favorite(candidate_id):
    """
    Vérifier si un candidat est dans les favoris
    """
    user_id = safe_int(get_jwt_identity())
    is_favorited = Favorite.is_favorited(user_id, candidate_id=candidate_id)

    return success_response({
        'is_favorited': is_favorited,
        'candidate_id': candidate_id
    })


@favorites_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_favorites_stats():
    """
    Statistiques sur les favoris de l'utilisateur
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    # Compter par type
    job_favorites = Favorite.query.filter_by(user_id=user_id, favorite_type='job').count()
    candidate_favorites = Favorite.query.filter_by(user_id=user_id, favorite_type='candidate').count()

    return success_response({
        'total': job_favorites + candidate_favorites,
        'jobs': job_favorites,
        'candidates': candidate_favorites
    })
