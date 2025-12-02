"""
================================================================
Routes Analyse CV - BaraCorrespondance AI
================================================================
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Candidate, CVAnalysis
from app.utils.helpers import success_response, error_response, safe_int
from app.services.cv_analyzer import CVAnalyzerService

analysis_bp = Blueprint('analysis', __name__)


# ================================================================
# HELPER
# ================================================================

def get_current_candidate():
    """Obtenir le profil candidat de l'utilisateur connecté"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role != 'candidate':
        return None, error_response("Accès réservé aux candidats", 403)
    
    if not user.candidate:
        return None, error_response("Profil candidat non trouvé", 404)
    
    return user.candidate, None


# ================================================================
# ANALYSE CV
# ================================================================

@analysis_bp.route('/cv/<int:analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis_detail(analysis_id):
    """Obtenir les détails d'une analyse CV"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    analysis = CVAnalysis.query.filter_by(
        id=analysis_id,
        candidate_id=candidate.id
    ).first()
    
    if not analysis:
        return error_response("Analyse non trouvée", 404)
    
    return success_response({
        'analysis': analysis.to_dict(include_raw_text=False)
    })


@analysis_bp.route('/cv/<int:analysis_id>/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations(analysis_id):
    """Obtenir les recommandations d'amélioration"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    analysis = CVAnalysis.query.filter_by(
        id=analysis_id,
        candidate_id=candidate.id
    ).first()
    
    if not analysis:
        return error_response("Analyse non trouvée", 404)
    
    # Grouper les recommandations par priorité
    recommendations = analysis.recommendations or []
    grouped = {
        'high': [],
        'medium': [],
        'low': []
    }
    
    for rec in recommendations:
        priority = rec.get('priority', 'medium')
        if priority in grouped:
            grouped[priority].append(rec)
    
    return success_response({
        'recommendations': grouped,
        'total_count': len(recommendations),
        'by_category': _group_by_category(recommendations)
    })


@analysis_bp.route('/cv/<int:analysis_id>/extracted-data', methods=['GET'])
@jwt_required()
def get_extracted_data(analysis_id):
    """Obtenir les données extraites du CV"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    analysis = CVAnalysis.query.filter_by(
        id=analysis_id,
        candidate_id=candidate.id
    ).first()
    
    if not analysis:
        return error_response("Analyse non trouvée", 404)
    
    return success_response({
        'extracted_data': analysis.extracted_data,
        'keywords': analysis.keywords
    })


@analysis_bp.route('/cv/<int:analysis_id>/apply-to-profile', methods=['POST'])
@jwt_required()
def apply_analysis_to_profile(analysis_id):
    """
    Appliquer les données extraites de l'analyse au profil candidat
    
    Body JSON (optionnel):
    {
        "fields": ["skills", "experience", "education"]  # Champs à appliquer
    }
    """
    candidate, error = get_current_candidate()
    if error:
        return error
    
    analysis = CVAnalysis.query.filter_by(
        id=analysis_id,
        candidate_id=candidate.id
    ).first()
    
    if not analysis:
        return error_response("Analyse non trouvée", 404)
    
    data = request.get_json() or {}
    fields_to_apply = data.get('fields', ['skills', 'experience', 'education', 'languages'])
    
    extracted = analysis.extracted_data or {}
    updated_fields = []
    
    # Appliquer les compétences
    if 'skills' in fields_to_apply and extracted.get('skills'):
        skills_data = extracted['skills']
        if skills_data.get('technical'):
            candidate.skills = skills_data['technical']
            updated_fields.append('skills')
        if skills_data.get('languages'):
            candidate.languages = skills_data['languages']
            updated_fields.append('languages')
    
    # Appliquer l'expérience
    if 'experience' in fields_to_apply and extracted.get('experience'):
        candidate.work_experience = extracted['experience']
        # Calculer les années d'expérience
        total_years = extracted.get('total_experience_years', 0)
        candidate.experience_years = total_years
        updated_fields.append('experience')
    
    # Appliquer la formation
    if 'education' in fields_to_apply and extracted.get('education'):
        candidate.education = extracted['education']
        updated_fields.append('education')
    
    # Appliquer les certifications
    if 'certifications' in fields_to_apply and extracted.get('certifications'):
        candidate.certifications = extracted['certifications']
        updated_fields.append('certifications')
    
    db.session.commit()
    
    return success_response({
        'profile': candidate.to_dict(),
        'updated_fields': updated_fields
    }, f"Profil mis à jour avec {len(updated_fields)} champs")


@analysis_bp.route('/cv/reanalyze', methods=['POST'])
@jwt_required()
def reanalyze_cv():
    """Relancer l'analyse du CV actuel"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    if not candidate.cv_url:
        return error_response("Aucun CV uploadé. Veuillez d'abord uploader votre CV.", 400)
    
    from datetime import datetime
    current_month = datetime.utcnow().strftime('%Y-%m')
    
    monthly_analyses = CVAnalysis.query.filter(
        CVAnalysis.candidate_id == candidate.id,
        CVAnalysis.created_at >= f'{current_month}-01'
    ).count()
    
    from flask import current_app
    limit = current_app.config.get('CV_ANALYSIS_LIMIT_FREE', 3)
    
    # NOTE: Premium subscription check not yet implemented
    # Currently all users have the free tier limit
    # TODO: Implement premium subscription model in User table (is_premium field)
    # TODO: Check User.is_premium before enforcing limit
    is_premium = getattr(candidate.user, 'is_premium', False) if candidate.user else False
    
    if not is_premium and monthly_analyses >= limit:
        return error_response(
            f"Limite d'analyses atteinte ({limit}/mois). Passez à Premium pour des analyses illimitées.",
            429
        )
    
    # Lancer l'analyse
    try:
        analyzer = CVAnalyzerService()
        result = analyzer.analyze_file(candidate.cv_url, candidate.id)
        
        return success_response({
            'analysis': result
        }, "CV réanalysé avec succès")
        
    except Exception as e:
        return error_response(f"Erreur lors de l'analyse: {str(e)}", 500)


@analysis_bp.route('/usage', methods=['GET'])
@jwt_required()
def get_analysis_usage():
    """Obtenir l'utilisation des analyses pour le mois en cours"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    from datetime import datetime
    from flask import current_app
    
    current_month = datetime.utcnow().strftime('%Y-%m')
    
    monthly_analyses = CVAnalysis.query.filter(
        CVAnalysis.candidate_id == candidate.id,
        CVAnalysis.created_at >= f'{current_month}-01'
    ).count()
    
    limit = current_app.config.get('CV_ANALYSIS_LIMIT_FREE', 3)
    
    return success_response({
        'usage': {
            'used': monthly_analyses,
            'limit': limit,
            'remaining': max(0, limit - monthly_analyses),
            'month': current_month,
            'is_premium': False  # TODO: Vérifier abonnement
        }
    })


@analysis_bp.route('/compare/<int:analysis_id_1>/<int:analysis_id_2>', methods=['GET'])
@jwt_required()
def compare_analyses(analysis_id_1, analysis_id_2):
    """Comparer deux analyses de CV"""
    candidate, error = get_current_candidate()
    if error:
        return error
    
    analysis_1 = CVAnalysis.query.filter_by(
        id=analysis_id_1,
        candidate_id=candidate.id
    ).first()
    
    analysis_2 = CVAnalysis.query.filter_by(
        id=analysis_id_2,
        candidate_id=candidate.id
    ).first()
    
    if not analysis_1 or not analysis_2:
        return error_response("Une ou plusieurs analyses non trouvées", 404)
    
    # Calculer les différences
    comparison = {
        'overall_score': {
            'before': analysis_1.overall_score,
            'after': analysis_2.overall_score,
            'change': analysis_2.overall_score - analysis_1.overall_score
        },
        'scores_breakdown': {},
        'skills_added': [],
        'skills_removed': [],
        'improvement_summary': ''
    }
    
    # Comparer les scores détaillés
    scores_1 = analysis_1.scores_breakdown or {}
    scores_2 = analysis_2.scores_breakdown or {}
    
    all_keys = set(scores_1.keys()) | set(scores_2.keys())
    for key in all_keys:
        before = scores_1.get(key, 0)
        after = scores_2.get(key, 0)
        comparison['scores_breakdown'][key] = {
            'before': before,
            'after': after,
            'change': after - before
        }
    
    # Comparer les compétences
    skills_1 = set(analysis_1.extracted_data.get('skills', {}).get('technical', []))
    skills_2 = set(analysis_2.extracted_data.get('skills', {}).get('technical', []))
    
    comparison['skills_added'] = list(skills_2 - skills_1)
    comparison['skills_removed'] = list(skills_1 - skills_2)
    
    # Résumé
    score_change = comparison['overall_score']['change']
    if score_change > 0:
        comparison['improvement_summary'] = f"Amélioration de {score_change:.1f} points"
    elif score_change < 0:
        comparison['improvement_summary'] = f"Régression de {abs(score_change):.1f} points"
    else:
        comparison['improvement_summary'] = "Score stable"
    
    return success_response({
        'comparison': comparison,
        'analysis_1': {
            'id': analysis_1.id,
            'created_at': analysis_1.created_at.isoformat()
        },
        'analysis_2': {
            'id': analysis_2.id,
            'created_at': analysis_2.created_at.isoformat()
        }
    })


# ================================================================
# HELPERS
# ================================================================

def _group_by_category(recommendations):
    """Grouper les recommandations par catégorie"""
    categories = {}
    for rec in recommendations:
        cat = rec.get('category', 'other')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(rec)
    return categories
