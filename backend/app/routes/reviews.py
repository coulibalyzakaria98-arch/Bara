"""
================================================================
Routes Reviews - BaraCorrespondance AI
================================================================
API pour le système d'avis et notations
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc

from app import db
from app.models import User, Candidate, Company, Review
from app.utils.helpers import success_response, error_response, safe_int

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    """
    Créer un nouvel avis

    Body:
        - reviewed_id: ID du candidat ou de l'entreprise
        - reviewed_type: 'candidate' ou 'company'
        - rating: Note de 1 à 5
        - title: Titre (optionnel)
        - comment: Commentaire (optionnel)
        - professionalism: Note 1-5 (optionnel)
        - communication: Note 1-5 (optionnel)
        - reliability: Note 1-5 (optionnel)
        - skills: Note 1-5 (optionnel)
        - is_public: Boolean (défaut: True)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    data = request.get_json()

    # Validation
    if not data.get('reviewed_id') or not data.get('reviewed_type'):
        return error_response("reviewed_id et reviewed_type sont requis", 400)

    if not data.get('rating') or not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
        return error_response("rating doit être un entier entre 1 et 5", 400)

    reviewed_type = data['reviewed_type']
    if reviewed_type not in ['candidate', 'company']:
        return error_response("reviewed_type doit être 'candidate' ou 'company'", 400)

    # Vérifier que l'entité existe
    reviewed_id = safe_int(data['reviewed_id'])
    if reviewed_type == 'candidate':
        reviewed = Candidate.query.get(reviewed_id)
        if not reviewed:
            return error_response("Candidat non trouvé", 404)
        # Un candidat ne peut pas s'évaluer lui-même
        if user.role == 'candidate' and user.candidate and user.candidate.id == reviewed_id:
            return error_response("Vous ne pouvez pas vous évaluer vous-même", 400)
    else:  # company
        reviewed = Company.query.get(reviewed_id)
        if not reviewed:
            return error_response("Entreprise non trouvée", 404)
        # Une entreprise ne peut pas s'évaluer elle-même
        if user.role == 'company' and user.company and user.company.id == reviewed_id:
            return error_response("Vous ne pouvez pas vous évaluer vous-même", 400)

    # Vérifier qu'il n'y a pas déjà un avis
    existing = Review.query.filter_by(
        reviewer_id=user_id,
        reviewed_id=reviewed_id,
        reviewed_type=reviewed_type
    ).first()

    if existing:
        return error_response("Vous avez déjà laissé un avis pour cette entité", 400)

    # Créer l'avis
    review = Review(
        reviewer_id=user_id,
        reviewed_id=reviewed_id,
        reviewed_type=reviewed_type,
        rating=data['rating'],
        title=data.get('title'),
        comment=data.get('comment'),
        professionalism=data.get('professionalism'),
        communication=data.get('communication'),
        reliability=data.get('reliability'),
        skills=data.get('skills'),
        is_public=data.get('is_public', True)
    )

    db.session.add(review)
    db.session.commit()

    return success_response(review.to_dict(), "Avis créé avec succès", 201)


@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    """Modifier un avis (seulement le sien)"""
    user_id = safe_int(get_jwt_identity())
    review = Review.query.get(review_id)

    if not review:
        return error_response("Avis non trouvé", 404)

    if review.reviewer_id != user_id:
        return error_response("Vous ne pouvez modifier que vos propres avis", 403)

    data = request.get_json()

    # Update fields
    if 'rating' in data:
        if not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
            return error_response("rating doit être un entier entre 1 et 5", 400)
        review.rating = data['rating']

    if 'title' in data:
        review.title = data['title']

    if 'comment' in data:
        review.comment = data['comment']

    if 'professionalism' in data:
        review.professionalism = data['professionalism']

    if 'communication' in data:
        review.communication = data['communication']

    if 'reliability' in data:
        review.reliability = data['reliability']

    if 'skills' in data:
        review.skills = data['skills']

    if 'is_public' in data:
        review.is_public = data['is_public']

    db.session.commit()

    return success_response(review.to_dict(), "Avis mis à jour avec succès")


@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """Supprimer un avis (seulement le sien)"""
    user_id = safe_int(get_jwt_identity())
    review = Review.query.get(review_id)

    if not review:
        return error_response("Avis non trouvé", 404)

    if review.reviewer_id != user_id:
        return error_response("Vous ne pouvez supprimer que vos propres avis", 403)

    db.session.delete(review)
    db.session.commit()

    return success_response(None, "Avis supprimé avec succès")


@reviews_bp.route('/candidate/<int:candidate_id>', methods=['GET'])
def get_candidate_reviews(candidate_id):
    """Obtenir tous les avis d'un candidat"""
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("Candidat non trouvé", 404)

    # Query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    only_public = request.args.get('only_public', 'true').lower() == 'true'

    query = Review.query.filter_by(
        reviewed_id=candidate_id,
        reviewed_type='candidate'
    )

    if only_public:
        query = query.filter_by(is_public=True)

    query = query.order_by(desc(Review.created_at))

    # Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    reviews = [review.to_dict() for review in pagination.items]

    # Stats
    average_rating = Review.get_average_rating(candidate_id, 'candidate')
    rating_distribution = Review.get_rating_distribution(candidate_id, 'candidate')
    aspect_averages = Review.get_aspect_averages(candidate_id, 'candidate')

    return success_response({
        'reviews': reviews,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
            'total_items': pagination.total
        },
        'stats': {
            'average_rating': average_rating,
            'total_reviews': pagination.total,
            'rating_distribution': rating_distribution,
            'aspect_averages': aspect_averages
        }
    })


@reviews_bp.route('/company/<int:company_id>', methods=['GET'])
def get_company_reviews(company_id):
    """Obtenir tous les avis d'une entreprise"""
    company = Company.query.get(company_id)
    if not company:
        return error_response("Entreprise non trouvée", 404)

    # Query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    only_public = request.args.get('only_public', 'true').lower() == 'true'

    query = Review.query.filter_by(
        reviewed_id=company_id,
        reviewed_type='company'
    )

    if only_public:
        query = query.filter_by(is_public=True)

    query = query.order_by(desc(Review.created_at))

    # Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    reviews = [review.to_dict() for review in pagination.items]

    # Stats
    average_rating = Review.get_average_rating(company_id, 'company')
    rating_distribution = Review.get_rating_distribution(company_id, 'company')
    aspect_averages = Review.get_aspect_averages(company_id, 'company')

    return success_response({
        'reviews': reviews,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
            'total_items': pagination.total
        },
        'stats': {
            'average_rating': average_rating,
            'total_reviews': pagination.total,
            'rating_distribution': rating_distribution,
            'aspect_averages': aspect_averages
        }
    })


@reviews_bp.route('/stats/<string:entity_type>/<int:entity_id>', methods=['GET'])
def get_review_stats(entity_type, entity_id):
    """Obtenir uniquement les statistiques d'avis"""
    if entity_type not in ['candidate', 'company']:
        return error_response("entity_type doit être 'candidate' ou 'company'", 400)

    # Vérifier que l'entité existe
    if entity_type == 'candidate':
        entity = Candidate.query.get(entity_id)
    else:
        entity = Company.query.get(entity_id)

    if not entity:
        return error_response(f"{entity_type.capitalize()} non trouvé", 404)

    average_rating = Review.get_average_rating(entity_id, entity_type)
    rating_distribution = Review.get_rating_distribution(entity_id, entity_type)
    aspect_averages = Review.get_aspect_averages(entity_id, entity_type)
    total_reviews = Review.query.filter_by(
        reviewed_id=entity_id,
        reviewed_type=entity_type,
        is_public=True
    ).count()

    return success_response({
        'average_rating': average_rating,
        'total_reviews': total_reviews,
        'rating_distribution': rating_distribution,
        'aspect_averages': aspect_averages
    })


@reviews_bp.route('/<int:review_id>/helpful', methods=['POST'])
@jwt_required()
def mark_helpful(review_id):
    """Marquer un avis comme utile"""
    review = Review.query.get(review_id)

    if not review:
        return error_response("Avis non trouvé", 404)

    review.helpful_count += 1
    db.session.commit()

    return success_response({'helpful_count': review.helpful_count}, "Merci pour votre retour")


@reviews_bp.route('/my-reviews', methods=['GET'])
@jwt_required()
def get_my_reviews():
    """Obtenir tous les avis laissés par l'utilisateur connecté"""
    user_id = safe_int(get_jwt_identity())

    reviews = Review.query.filter_by(reviewer_id=user_id).order_by(desc(Review.created_at)).all()

    return success_response({
        'reviews': [review.to_dict() for review in reviews],
        'total': len(reviews)
    })


@reviews_bp.route('/about-me', methods=['GET'])
@jwt_required()
def get_reviews_about_me():
    """Obtenir tous les avis reçus par l'utilisateur connecté"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    if user.role == 'candidate':
        if not user.candidate:
            return error_response("Profil candidat non trouvé", 404)
        entity_id = user.candidate.id
        entity_type = 'candidate'
    elif user.role == 'company':
        if not user.company:
            return error_response("Profil entreprise non trouvé", 404)
        entity_id = user.company.id
        entity_type = 'company'
    else:
        return error_response("Type d'utilisateur invalide", 400)

    reviews = Review.query.filter_by(
        reviewed_id=entity_id,
        reviewed_type=entity_type
    ).order_by(desc(Review.created_at)).all()

    # Stats
    average_rating = Review.get_average_rating(entity_id, entity_type)
    rating_distribution = Review.get_rating_distribution(entity_id, entity_type)
    aspect_averages = Review.get_aspect_averages(entity_id, entity_type)

    return success_response({
        'reviews': [review.to_dict() for review in reviews],
        'total': len(reviews),
        'stats': {
            'average_rating': average_rating,
            'rating_distribution': rating_distribution,
            'aspect_averages': aspect_averages
        }
    })
