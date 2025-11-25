"""
================================================================
Routes Upload de fichiers - BaraCorrespondance AI
================================================================
"""

import os
from datetime import datetime
from flask import Blueprint, request, current_app, send_from_directory, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename

from app import db
from app.models import User, Candidate, Company, CVAnalysis
from app.utils.helpers import success_response, error_response, safe_int
from app.utils.validators import allowed_cv_file, allowed_image_file, generate_unique_filename
from app.services.cv_analyzer import CVAnalyzerService
from app.services.ai_analyzer import ai_analyzer_service
from app.services.pdf_generator import pdf_generator
from app.services.auto_matcher import auto_matcher

uploads_bp = Blueprint('uploads', __name__)


# Route de test pour debug
@uploads_bp.route('/debug-headers', methods=['POST', 'OPTIONS'])
def debug_headers():
    """Route de test pour voir les headers"""
    print("=== DEBUG HEADERS ===")
    for key, value in request.headers:
        print(f"{key}: {value}")
    print("=====================")
    return {"headers_received": dict(request.headers)}, 200


# ================================================================
# UPLOAD CV
# ================================================================

@uploads_bp.route('/cv', methods=['POST', 'OPTIONS'])
def upload_cv():
    """
    Uploader un CV pour analyse

    Form data:
    - cv: fichier CV (PDF, DOC, DOCX)
    - analyze: true/false (lancer l'analyse automatiquement)
    """
    # Handle CORS preflight requests (OPTIONS) without JWT
    if request.method == 'OPTIONS':
        return '', 204
    
    # Manually verify JWT to work around CORS issues
    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())  # Convert string to int
    except Exception as e:
        print(f"[JWT ERROR] {e}")
        return error_response(f"Auth failed: {str(e)}", 401)

    user = User.query.get(user_id)
    
    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)
    
    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)
    
    # Vérifier le fichier
    if 'cv' not in request.files:
        return error_response("Fichier CV requis", 400)
    
    file = request.files['cv']
    
    if file.filename == '':
        return error_response("Aucun fichier sélectionné", 400)
    
    if not allowed_cv_file(file.filename):
        return error_response(
            "Format non supporté. Formats acceptés: PDF, DOC, DOCX",
            400
        )
    
    # Vérifier la taille
    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)
    
    max_size = current_app.config.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024)
    if file_size > max_size:
        return error_response(
            f"Fichier trop volumineux. Maximum: {max_size // (1024*1024)} MB",
            400
        )
    
    # Sauvegarder le fichier
    try:
        filename = generate_unique_filename(file.filename, prefix=f'cv_{candidate.id}')
        upload_folder = os.path.join(
            current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads'),
            'cv'
        )
        os.makedirs(upload_folder, exist_ok=True)
        
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        # URL relative pour stockage en BDD
        relative_url = f'/uploads/cv/{filename}'
        
        # Mettre à jour le profil candidat
        candidate.cv_url = relative_url
        candidate.cv_filename = file.filename
        candidate.cv_uploaded_at = datetime.utcnow()
        
        db.session.commit()
        
        # Lancer l'analyse si demandé
        analyze = request.form.get('analyze', 'true').lower() == 'true'
        analysis_result = None

        if analyze:
            try:
                # Extraire le texte du CV
                analyzer = CVAnalyzerService()
                cv_text = analyzer.extract_text(filepath)

                # Utiliser l'analyse IA si la clé API est configurée
                if current_app.config.get('OPENAI_API_KEY'):
                    analysis_result = ai_analyzer_service.analyze_cv(cv_text)
                else:
                    # Fallback vers l'analyse basique
                    analysis_result = analyzer.analyze_file(filepath, candidate.id)

                # Marquer les anciennes analyses comme non-latest
                CVAnalysis.query.filter_by(
                    candidate_id=candidate.id,
                    is_latest=True
                ).update({'is_latest': False})

                # Sauvegarder l'analyse en base
                cv_analysis = CVAnalysis(
                    candidate_id=candidate.id,
                    file_url=relative_url,
                    file_name=file.filename,
                    file_type=file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'pdf',
                    file_size=file_size,
                    raw_text=cv_text[:10000],  # Limiter la taille
                    extracted_data=analysis_result.get('extracted_data', {}),
                    overall_score=analysis_result.get('overall_score', 0),
                    scores_breakdown=analysis_result.get('scores_breakdown', {}),
                    recommendations=analysis_result.get('recommendations', []),
                    keywords=analysis_result.get('keywords', []),
                    is_latest=True
                )
                db.session.add(cv_analysis)
                db.session.commit()

                # Ajouter l'ID de l'analyse pour le PDF
                analysis_result['analysis_id'] = cv_analysis.id

                # 🔄 MATCHING AUTOMATIQUE - Rechercher les offres correspondantes
                try:
                    current_app.logger.info(f"🔍 Lancement du matching automatique pour {candidate.full_name}")
                    matches = auto_matcher.find_matches_for_cv(cv_analysis)
                    current_app.logger.info(f"✅ {len(matches)} match(s) trouvé(s) et notifié(s)")

                    # Ajouter le nombre de matchs dans la réponse
                    analysis_result['matches_found'] = len(matches)
                except Exception as match_error:
                    current_app.logger.error(f"Erreur matching automatique: {match_error}")
                    # Ne pas échouer l'upload si le matching échoue
                    analysis_result['matches_found'] = 0

            except Exception as e:
                # Ne pas échouer si l'analyse échoue
                current_app.logger.error(f"Erreur analyse CV: {e}")
                print(f"Erreur analyse CV: {e}")
        
        response_data = {
            'cv': {
                'url': relative_url,
                'filename': file.filename,
                'size': file_size,
                'uploaded_at': candidate.cv_uploaded_at.isoformat()
            }
        }
        
        if analysis_result:
            response_data['analysis'] = analysis_result
        
        return success_response(response_data, "CV uploadé avec succès", 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur lors de l'upload: {str(e)}", 500)


# ================================================================
# UPLOAD AVATAR
# ================================================================

@uploads_bp.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """
    Uploader un avatar utilisateur
    
    Form data:
    - avatar: fichier image (PNG, JPG, JPEG, GIF, WEBP)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return error_response("Utilisateur non trouvé", 404)
    
    if 'avatar' not in request.files:
        return error_response("Fichier avatar requis", 400)
    
    file = request.files['avatar']
    
    if file.filename == '':
        return error_response("Aucun fichier sélectionné", 400)
    
    if not allowed_image_file(file.filename):
        return error_response(
            "Format non supporté. Formats acceptés: PNG, JPG, JPEG, GIF, WEBP",
            400
        )
    
    # Vérifier la taille (max 5MB pour les avatars)
    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > 5 * 1024 * 1024:
        return error_response("Image trop volumineuse. Maximum: 5 MB", 400)
    
    try:
        filename = generate_unique_filename(file.filename, prefix=f'avatar_{user.id}')
        upload_folder = os.path.join(
            current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads'),
            'avatars'
        )
        os.makedirs(upload_folder, exist_ok=True)
        
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        # Supprimer l'ancien avatar si existant
        if user.avatar_url:
            old_path = os.path.join(
                current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads'),
                user.avatar_url.replace('/uploads/', '')
            )
            if os.path.exists(old_path):
                os.remove(old_path)
        
        # Mettre à jour l'utilisateur
        user.avatar_url = f'/uploads/avatars/{filename}'
        db.session.commit()
        
        return success_response({
            'avatar_url': user.avatar_url
        }, "Avatar mis à jour")
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


# ================================================================
# UPLOAD LOGO ENTREPRISE
# ================================================================

@uploads_bp.route('/logo', methods=['POST'])
@jwt_required()
def upload_logo():
    """
    Uploader le logo de l'entreprise
    
    Form data:
    - logo: fichier image (PNG, JPG, JPEG, GIF, WEBP)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)
    
    company = user.company
    if not company:
        return error_response("Profil entreprise non trouvé", 404)
    
    if 'logo' not in request.files:
        return error_response("Fichier logo requis", 400)
    
    file = request.files['logo']
    
    if file.filename == '':
        return error_response("Aucun fichier sélectionné", 400)
    
    if not allowed_image_file(file.filename):
        return error_response(
            "Format non supporté. Formats acceptés: PNG, JPG, JPEG, GIF, WEBP",
            400
        )
    
    try:
        filename = generate_unique_filename(file.filename, prefix=f'logo_{company.id}')
        upload_folder = os.path.join(
            current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads'),
            'logos'
        )
        os.makedirs(upload_folder, exist_ok=True)
        
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        # Supprimer l'ancien logo
        if company.logo_url:
            old_path = os.path.join(
                current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads'),
                company.logo_url.replace('/uploads/', '')
            )
            if os.path.exists(old_path):
                os.remove(old_path)
        
        company.logo_url = f'/uploads/logos/{filename}'
        db.session.commit()
        
        return success_response({
            'logo_url': company.logo_url
        }, "Logo mis à jour")
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


# ================================================================
# SERVIR LES FICHIERS UPLOADÉS
# ================================================================

@uploads_bp.route('/<path:filename>', methods=['GET'])
def serve_upload(filename):
    """Servir un fichier uploadé"""
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
    
    # Sécurité: vérifier que le chemin est dans le dossier uploads
    filepath = os.path.join(upload_folder, filename)
    if not os.path.abspath(filepath).startswith(os.path.abspath(upload_folder)):
        return error_response("Accès non autorisé", 403)
    
    if not os.path.exists(filepath):
        return error_response("Fichier non trouvé", 404)
    
    directory = os.path.dirname(filepath)
    file_name = os.path.basename(filepath)
    
    return send_from_directory(directory, file_name)


# ================================================================
# SUPPRIMER UN FICHIER
# ================================================================

@uploads_bp.route('/cv', methods=['DELETE'])
@jwt_required()
def delete_cv():
    """Supprimer le CV du candidat"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)
    
    candidate = user.candidate
    if not candidate or not candidate.cv_url:
        return error_response("Aucun CV à supprimer", 404)
    
    try:
        # Supprimer le fichier physique
        filepath = os.path.join(
            current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads'),
            candidate.cv_url.replace('/uploads/', '')
        )
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Mettre à jour la BDD
        candidate.cv_url = None
        candidate.cv_filename = None
        candidate.cv_uploaded_at = None
        
        db.session.commit()

        return success_response(message="CV supprimé")

    except Exception as e:
        db.session.rollback()
        return error_response(f"Erreur: {str(e)}", 500)


# ================================================================
# TÉLÉCHARGER LE RAPPORT PDF
# ================================================================

@uploads_bp.route('/cv/report/pdf', methods=['GET'])
@jwt_required()
def download_cv_report():
    """
    Télécharger le rapport d'analyse CV en PDF

    Query params:
    - analysis_id: ID de l'analyse (optionnel, utilise la dernière si non fourni)
    """
    import io as io_module

    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)

    # Récupérer l'analyse
    analysis_id = request.args.get('analysis_id')
    if analysis_id:
        cv_analysis = CVAnalysis.query.filter_by(
            id=analysis_id,
            candidate_id=candidate.id
        ).first()
    else:
        # Récupérer la dernière analyse
        cv_analysis = CVAnalysis.query.filter_by(
            candidate_id=candidate.id
        ).order_by(CVAnalysis.created_at.desc()).first()

    if not cv_analysis:
        return error_response("Aucune analyse trouvée", 404)

    try:
        # Préparer les données d'analyse
        analysis_data = {
            'overall_score': cv_analysis.overall_score,
            'scores_breakdown': cv_analysis.scores_breakdown or {},
            'extracted_data': cv_analysis.extracted_data or {},
            'recommendations': cv_analysis.recommendations or [],
            'keywords': cv_analysis.keywords or [],
            'strengths': cv_analysis.extracted_data.get('strengths', []) if cv_analysis.extracted_data else [],
            'summary': cv_analysis.extracted_data.get('summary', '') if cv_analysis.extracted_data else '',
            'ideal_positions': cv_analysis.extracted_data.get('ideal_positions', []) if cv_analysis.extracted_data else [],
            'ai_powered': cv_analysis.extracted_data.get('ai_powered', False) if cv_analysis.extracted_data else False
        }

        # Préparer les données utilisateur
        user_data = {
            'full_name': user.full_name,
            'email': user.email
        }

        # Générer le PDF
        pdf_content = pdf_generator.generate_cv_analysis_report(analysis_data, user_data)

        # Nom du fichier
        filename = f"rapport_cv_{user.full_name or 'candidat'}_{datetime.now().strftime('%Y%m%d')}.pdf"
        filename = filename.replace(' ', '_')

        # Retourner le PDF
        return send_file(
            io_module.BytesIO(pdf_content),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        current_app.logger.error(f"Erreur génération PDF: {str(e)}")
        return error_response(f"Erreur lors de la génération du PDF: {str(e)}", 500)
