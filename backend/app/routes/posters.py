"""
================================================================
Routes Posters - BaraCorrespondance AI
================================================================
Gestion de la génération d'affiches d'emploi par IA
"""

from flask import Blueprint, request, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os
import time

from app import db
from app.models import User, Company, Job, Poster
from app.services.poster_generator import poster_generator
from app.utils.helpers import success_response, error_response, safe_int

posters_bp = Blueprint('posters', __name__)


@posters_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_poster():
    """
    Générer une affiche pour une offre d'emploi

    Body:
    {
        "job_id": int,
        "style": "modern|classic|creative|minimal|professional",
        "color_scheme": "blue|purple|green|orange|red",
        "template_type": "gradient|split|minimal",
        "include_logo": bool (optional),
        "include_qr_code": bool (optional)
    }
    """
    user_id = safe_int(get_jwt_identity())
    data = request.get_json()

    # Validation
    if not data or 'job_id' not in data:
        return error_response("job_id requis", 400)

    job_id = data.get('job_id')

    # Vérifier que le job existe et appartient à l'utilisateur
    user = User.query.get(user_id)
    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = Company.query.filter_by(user_id=user_id).first()
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return error_response("Offre d'emploi non trouvée", 404)

    try:
        start_time = time.time()

        # Préparer les données pour le générateur
        job_data = {
            'title': job.title,
            'description': job.description,
            'company_name': company.name,
            'location': job.location or job.city,
            'contract_type': job.contract_type,
            'required_skills': job.required_skills or [],
            'benefits': job.benefits or []
        }

        # Générer le contenu IA
        current_app.logger.info(f"🎨 Génération de contenu IA pour job {job_id}")
        ai_content = poster_generator.generate_poster_content(job_data)

        # Créer l'enregistrement Poster
        poster = Poster(
            job_id=job_id,
            company_id=company.id,
            title=job.title,
            description=job.description[:500] if job.description else None,
            style=data.get('style', 'modern'),
            color_scheme=data.get('color_scheme', 'blue'),
            template_type=data.get('template_type', 'gradient'),
            ai_headline=ai_content.get('headline'),
            ai_tagline=ai_content.get('tagline'),
            ai_description=ai_content.get('description'),
            ai_keywords=ai_content.get('keywords', []),
            include_logo=data.get('include_logo', True),
            include_qr_code=data.get('include_qr_code', False),
            generation_method='template',
            ai_model_used=current_app.config.get('OPENAI_MODEL', 'gpt-4o-mini')
        )

        db.session.add(poster)
        db.session.flush()  # Pour obtenir l'ID

        # Créer le fichier image
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
        posters_folder = os.path.join(upload_folder, 'posters')
        os.makedirs(posters_folder, exist_ok=True)

        # Nom de fichier unique
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_name = f"poster_{job_id}_{timestamp}.png"
        file_path = os.path.join(posters_folder, file_name)

        # Préparer les données pour la création d'image
        poster_data = {
            'title': job.title,
            'ai_headline': ai_content.get('headline'),
            'ai_tagline': ai_content.get('tagline'),
            'ai_description': ai_content.get('description'),
            'company_name': company.name,
            'call_to_action': ai_content.get('call_to_action', 'Postulez maintenant!'),
            'width': 1080,
            'height': 1920,
            'color_scheme': poster.color_scheme,
            'template_type': poster.template_type
        }

        # Générer l'image
        current_app.logger.info(f"🖼️ Création de l'image pour poster {poster.id}")
        image_result = poster_generator.create_poster_image(poster_data, file_path)

        if not image_result.get('success'):
            db.session.rollback()
            return error_response(f"Erreur création image: {image_result.get('error')}", 500)

        # Mettre à jour le poster avec les infos du fichier
        poster.file_name = file_name
        poster.file_path = file_path
        poster.file_url = f"/api/posters/{poster.id}/download"
        poster.file_size = image_result.get('file_size')
        poster.generation_time = round(time.time() - start_time, 2)

        db.session.commit()

        current_app.logger.info(f"✅ Poster {poster.id} créé avec succès en {poster.generation_time}s")

        return success_response({
            'poster': poster.to_dict(include_job=True),
            'message': 'Affiche générée avec succès'
        }, 201)

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur génération poster: {str(e)}")
        return error_response(f"Erreur lors de la génération: {str(e)}", 500)


@posters_bp.route('', methods=['GET'])
@jwt_required()
def get_posters():
    """
    Récupérer toutes les affiches de l'entreprise

    Query params:
    - job_id: Filtrer par offre d'emploi
    - limit: Nombre max (default: 20)
    """
    user_id = safe_int(get_jwt_identity())

    user = User.query.get(user_id)
    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = Company.query.filter_by(user_id=user_id).first()
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    query = Poster.query.filter_by(company_id=company.id)

    # Filtrer par job_id si fourni
    job_id = request.args.get('job_id', type=int)
    if job_id:
        query = query.filter_by(job_id=job_id)

    limit = request.args.get('limit', 20, type=int)

    posters = query.order_by(Poster.created_at.desc()).limit(limit).all()

    return success_response({
        'posters': [p.to_dict(include_job=True) for p in posters],
        'total': len(posters)
    })


@posters_bp.route('/<int:poster_id>', methods=['GET'])
@jwt_required()
def get_poster(poster_id):
    """Récupérer une affiche par ID"""
    user_id = safe_int(get_jwt_identity())

    user = User.query.get(user_id)
    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = Company.query.filter_by(user_id=user_id).first()
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    poster = Poster.query.filter_by(id=poster_id, company_id=company.id).first()
    if not poster:
        return error_response("Affiche non trouvée", 404)

    return success_response({
        'poster': poster.to_dict(include_job=True, include_company=True)
    })


@posters_bp.route('/<int:poster_id>/download', methods=['GET'])
def download_poster(poster_id):
    """Télécharger l'image d'une affiche (public)"""
    poster = Poster.query.get(poster_id)

    if not poster:
        return error_response("Affiche non trouvée", 404)

    if not os.path.exists(poster.file_path):
        return error_response("Fichier non trouvé", 404)

    # Incrémenter le compteur de téléchargements
    poster.increment_downloads()

    return send_file(
        poster.file_path,
        mimetype='image/png',
        as_attachment=True,
        download_name=poster.file_name
    )


@posters_bp.route('/<int:poster_id>/view', methods=['GET'])
def view_poster(poster_id):
    """Voir l'image d'une affiche (public, inline)"""
    poster = Poster.query.get(poster_id)

    if not poster:
        return error_response("Affiche non trouvée", 404)

    if not os.path.exists(poster.file_path):
        return error_response("Fichier non trouvé", 404)

    # Incrémenter le compteur de vues
    poster.increment_views()

    return send_file(
        poster.file_path,
        mimetype='image/png'
    )


@posters_bp.route('/<int:poster_id>', methods=['DELETE'])
@jwt_required()
def delete_poster(poster_id):
    """Supprimer une affiche"""
    user_id = safe_int(get_jwt_identity())

    user = User.query.get(user_id)
    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = Company.query.filter_by(user_id=user_id).first()
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    poster = Poster.query.filter_by(id=poster_id, company_id=company.id).first()
    if not poster:
        return error_response("Affiche non trouvée", 404)

    try:
        # Supprimer le fichier physique
        if poster.file_path and os.path.exists(poster.file_path):
            os.remove(poster.file_path)

        # Supprimer l'enregistrement
        db.session.delete(poster)
        db.session.commit()

        return success_response({
            'message': 'Affiche supprimée avec succès'
        })

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression poster: {str(e)}")
        return error_response("Erreur lors de la suppression", 500)


@posters_bp.route('/<int:poster_id>/publish', methods=['PUT'])
@jwt_required()
def publish_poster(poster_id):
    """Publier/dépublier une affiche"""
    user_id = safe_int(get_jwt_identity())
    data = request.get_json() or {}

    user = User.query.get(user_id)
    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = Company.query.filter_by(user_id=user_id).first()
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    poster = Poster.query.filter_by(id=poster_id, company_id=company.id).first()
    if not poster:
        return error_response("Affiche non trouvée", 404)

    try:
        poster.is_published = data.get('is_published', True)
        if poster.is_published and not poster.published_at:
            poster.published_at = datetime.utcnow()

        db.session.commit()

        status = "publiée" if poster.is_published else "dépubliée"
        return success_response({
            'poster': poster.to_dict(),
            'message': f'Affiche {status} avec succès'
        })

    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)
