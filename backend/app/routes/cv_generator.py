"""
================================================================
Routes CV Generator - BaraCorrespondance AI
================================================================
API pour la génération de CV et lettres de motivation avec IA
"""

from flask import Blueprint, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from io import BytesIO

from app import db
from app.models import User, Candidate, Job, Company
from app.utils.helpers import success_response, error_response, safe_int
from app.services.cv_letter_generator import CVLetterGeneratorService
from app.models.cv_analysis import CVAnalysis
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.utils import ImageReader
import urllib.request

cv_generator_bp = Blueprint('cv_generator', __name__)


@cv_generator_bp.route('/generate-cv', methods=['POST'])
@jwt_required()
def generate_cv():
    """
    Générer un CV en HTML

    Body:
        - style: Style du CV ('modern', 'classic', 'creative')
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent générer un CV", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    data = request.get_json() or {}
    style = data.get('style', 'modern')

    if style not in ['modern', 'classic', 'creative']:
        return error_response("Style invalide", 400)

    candidate = user.candidate

    # Préparer les données du candidat
    candidate_data = {
        'full_name': candidate.full_name or 'Votre Nom',
        'email': user.email,
        'phone': candidate.phone,
        'location': candidate.location,
        'professional_title': candidate.desired_position or 'Professionnel',
        'experience_years': candidate.experience_years or 0,
        'education_level': candidate.education_level,
        'skills': candidate.skills or [],
        'bio': candidate.bio
    }

    try:
        generator = CVLetterGeneratorService()
        cv_html = generator.generate_cv_html(candidate_data, style)

        return success_response({
            'html': cv_html,
            'style': style
        }, "CV généré avec succès")

    except Exception as e:
        return error_response(f"Erreur lors de la génération du CV: {str(e)}", 500)


@cv_generator_bp.route('/generate-cover-letter', methods=['POST'])
@jwt_required()
def generate_cover_letter():
    """
    Générer une lettre de motivation

    Body:
        - job_id: ID du poste visé
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent générer une lettre", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    data = request.get_json()

    if not data.get('job_id'):
        return error_response("job_id est requis", 400)

    job_id = safe_int(data['job_id'])
    job = Job.query.get(job_id)

    if not job:
        return error_response("Poste non trouvé", 404)

    candidate = user.candidate
    company = job.company

    # Préparer les données
    candidate_data = {
        'full_name': candidate.full_name or 'Votre Nom',
        'email': user.email,
        'phone': candidate.phone,
        'experience_years': candidate.experience_years or 0,
        'skills': candidate.skills or [],
        'bio': candidate.bio
    }

    job_data = {
        'title': job.title,
        'description': job.description,
        'required_skills': job.required_skills or [],
        'contract_type': job.contract_type,
        'location': job.location
    }

    company_data = {
        'name': company.name if company else 'L\'entreprise',
        'industry': company.industry if company else 'N/A',
        'description': company.description if company else 'N/A'
    }

    try:
        generator = CVLetterGeneratorService()
        letter_html = generator.generate_cover_letter(candidate_data, job_data, company_data)

        return success_response({
            'html': letter_html,
            'job': {
                'id': job.id,
                'title': job.title,
                'company': company.name if company else 'N/A'
            }
        }, "Lettre de motivation générée avec succès")

    except Exception as e:
        return error_response(f"Erreur lors de la génération de la lettre: {str(e)}", 500)


@cv_generator_bp.route('/improve-section', methods=['POST'])
@jwt_required()
def improve_section():
    """
    Améliorer une section du CV

    Body:
        - section_name: Nom de la section
        - current_content: Contenu actuel
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent utiliser cette fonctionnalité", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    data = request.get_json()

    if not data.get('section_name') or not data.get('current_content'):
        return error_response("section_name et current_content sont requis", 400)

    candidate = user.candidate

    try:
        generator = CVLetterGeneratorService()
        improved_content = generator.improve_cv_section(
            section_name=data['section_name'],
            current_content=data['current_content'],
            candidate_skills=candidate.skills or []
        )

        return success_response({
            'improved_content': improved_content,
            'section_name': data['section_name']
        }, "Section améliorée avec succès")

    except Exception as e:
        return error_response(f"Erreur lors de l'amélioration: {str(e)}", 500)


@cv_generator_bp.route('/generate-summary', methods=['POST'])
@jwt_required()
def generate_summary():
    """Générer un résumé professionnel"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent générer un résumé", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    candidate = user.candidate

    candidate_data = {
        'experience_years': candidate.experience_years or 0,
        'education_level': candidate.education_level,
        'skills': candidate.skills or [],
        'bio': candidate.bio,
        'professional_title': candidate.desired_position or 'Professionnel'
    }

    try:
        generator = CVLetterGeneratorService()
        summary = generator.generate_professional_summary(candidate_data)

        return success_response({
            'summary': summary
        }, "Résumé généré avec succès")

    except Exception as e:
        return error_response(f"Erreur lors de la génération du résumé: {str(e)}", 500)


@cv_generator_bp.route('/suggest-skills', methods=['POST'])
@jwt_required()
def suggest_skills():
    """
    Suggérer des compétences pour un poste

    Body:
        - job_title: Titre du poste (optionnel)
        - industry: Secteur (optionnel)
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent utiliser cette fonctionnalité", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    data = request.get_json() or {}

    job_title = data.get('job_title') or user.candidate.desired_position or 'Professionnel'
    industry = data.get('industry', 'Technologie')

    try:
        generator = CVLetterGeneratorService()
        skills = generator.suggest_skills(job_title, industry)

        return success_response({
            'skills': skills,
            'job_title': job_title,
            'industry': industry
        }, "Compétences suggérées avec succès")

    except Exception as e:
        return error_response(f"Erreur lors de la suggestion: {str(e)}", 500)


@cv_generator_bp.route('/cv-tips', methods=['GET'])
@jwt_required()
def get_cv_tips():
    """Obtenir des conseils personnalisés pour améliorer son CV"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent obtenir des conseils", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    candidate = user.candidate

    candidate_data = {
        'experience_years': candidate.experience_years or 0,
        'education_level': candidate.education_level,
        'skills': candidate.skills or [],
        'bio': candidate.bio,
        'cv_file': candidate.cv_file
    }

    try:
        generator = CVLetterGeneratorService()
        tips = generator.generate_cv_tips(candidate_data)

        return success_response({
            'tips': tips,
            'total': len(tips)
        }, "Conseils générés avec succès")

    except Exception as e:
        return error_response(f"Erreur lors de la génération des conseils: {str(e)}", 500)


@cv_generator_bp.route('/templates', methods=['GET'])
def get_templates():
    """Obtenir la liste des templates de CV disponibles"""
    templates = [
        {
            'id': 'modern',
            'name': 'Moderne',
            'description': 'Design moderne avec gradients et icônes',
            'preview_url': '/static/templates/modern-preview.png',
            'recommended_for': ['Tech', 'Startup', 'Marketing Digital']
        },
        {
            'id': 'classic',
            'name': 'Classique',
            'description': 'Design professionnel et traditionnel',
            'preview_url': '/static/templates/classic-preview.png',
            'recommended_for': ['Finance', 'Juridique', 'Administration']
        },
        {
            'id': 'creative',
            'name': 'Créatif',
            'description': 'Design original et coloré',
            'preview_url': '/static/templates/creative-preview.png',
            'recommended_for': ['Design', 'Arts', 'Communication']
        }
    ]

    return success_response({
        'templates': templates,
        'total': len(templates)
    })


@cv_generator_bp.route('/uploads/cv/report/pdf', methods=['GET'])
@jwt_required()
def download_cv_report_pdf():
    """
    Télécharger un rapport PDF d'analyse de CV.

    Query params:
      - analysis_id (optionnel): id de l'analyse à utiliser.
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent télécharger un rapport", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    analysis_id = request.args.get('analysis_id')

    try:
        if analysis_id:
            analysis = CVAnalysis.query.get(safe_int(analysis_id))
            if not analysis:
                return error_response("Analyse introuvable", 404)
            if analysis.candidate_id != user.candidate.id:
                return error_response("Accès refusé à cette analyse", 403)
        else:
            # récupérer la dernière analyse pour ce candidat
            analysis = CVAnalysis.query.filter_by(candidate_id=user.candidate.id).order_by(CVAnalysis.created_at.desc()).first()
            if not analysis:
                return error_response("Aucune analyse trouvée pour ce candidat", 404)

        # Construire un PDF simple et professionnel avec ReportLab
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()
        elements = []

        # Header with optional avatar/logo
        header_cells = []
        avatar_url = None
        # prefer user.avatar_url
        if getattr(user, 'avatar_url', None):
            avatar_url = user.avatar_url
        # fallback to candidate.avatar_url if present
        elif getattr(user, 'candidate', None) and getattr(user.candidate, 'avatar_url', None):
            avatar_url = user.candidate.avatar_url

        avatar_flowable = None
        if avatar_url:
            try:
                resp = urllib.request.urlopen(avatar_url, timeout=5)
                img_data = resp.read()
                img_buf = BytesIO(img_data)
                img_reader = ImageReader(img_buf)
                avatar_flowable = Image(img_buf, width=64, height=64)
            except Exception:
                avatar_flowable = None

        title_para = Paragraph("Rapport d'analyse de CV", styles['Title'])
        meta_para = Paragraph(f"<b>{user.full_name if hasattr(user, 'full_name') else (user.email.split('@')[0])}</b><br/>{user.email}<br/>{analysis.created_at.strftime('%Y-%m-%d %H:%M') if analysis.created_at else 'N/A'}", styles['Normal'])

        if avatar_flowable:
            header_cells = [[avatar_flowable, title_para], ['', meta_para]]
            header_table = Table(header_cells, colWidths=[70, 420])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            elements.append(header_table)
        else:
            elements.append(title_para)
            elements.append(meta_para)

        elements.append(Spacer(1, 12))

        # Score global
        grade, grade_desc = analysis.get_score_grade()
        elements.append(Paragraph(f"Score global: {analysis.overall_score or 0:.1f} / 100 - {grade} ({grade_desc})", styles['Heading2']))
        elements.append(Spacer(1, 8))

        # Breakdown table
        breakdown = analysis.scores_breakdown or {}
        if breakdown:
            data = [["Catégorie", "Score"]]
            for k, v in breakdown.items():
                data.append([k.replace('_', ' ').title(), f"{v}"])

            table = Table(data, colWidths=[300, 100])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold')
            ]))
            elements.append(table)
            elements.append(Spacer(1, 12))

        # Extrait: compétences
        extracted = analysis.extracted_data or {}
        skills = extracted.get('skills') or {}
        tech_skills = skills.get('technical') if isinstance(skills, dict) else None
        if tech_skills:
            elements.append(Paragraph('Compétences techniques principales:', styles['Heading3']))
            elements.append(Paragraph(', '.join(tech_skills), styles['Normal']))
            elements.append(Spacer(1, 8))

        # Experience
        experiences = extracted.get('experience') or []
        if experiences:
            elements.append(Paragraph('Expériences:', styles['Heading3']))
            for exp in experiences[:5]:
                title = exp.get('title', 'N/A')
                company = exp.get('company', '')
                period = f"{exp.get('start_date', '')} - {exp.get('end_date', 'present')}"
                elements.append(Paragraph(f"<b>{title}</b> — {company} ({period})", styles['Normal']))
                desc = exp.get('description')
                if desc:
                    elements.append(Paragraph(desc, styles['Normal']))
                elements.append(Spacer(1, 6))

        # Education
        education = extracted.get('education') or []
        if education:
            elements.append(Paragraph('Formation:', styles['Heading3']))
            for edu in education[:5]:
                degree = edu.get('degree', '')
                institution = edu.get('institution', '')
                year = edu.get('year', '')
                elements.append(Paragraph(f"{degree} — {institution} ({year})", styles['Normal']))
            elements.append(Spacer(1, 8))

        # Recommendations
        recs = analysis.recommendations or []
        if recs:
            elements.append(Paragraph('Recommandations principales:', styles['Heading3']))
            for r in recs[:10]:
                title = r.get('title') or r.get('message') or 'Suggestion'
                msg = r.get('message') or r.get('suggestion') or ''
                elements.append(Paragraph(f"- <b>{title}</b>: {msg}", styles['Normal']))
            elements.append(Spacer(1, 8))

        # Footer / Notes
        elements.append(Spacer(1, 20))
        elements.append(Paragraph('Généré par BaraCorrespondance AI — Rapport automatique', styles['Normal']))

        doc.build(elements)
        buffer.seek(0)

        filename = f"rapport_cv_{analysis.id}_{analysis.created_at.strftime('%Y%m%d') if analysis.created_at else 'report'}.pdf"

        return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name=filename)

    except Exception as e:
        return error_response(f"Erreur lors de la création du PDF: {str(e)}", 500)
