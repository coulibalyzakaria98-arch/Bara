"""
================================================================
PDF Service - BaraCorrespondance AI
================================================================
Service de génération de rapports PDF pour les analytics
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime


def generate_candidate_analytics_pdf(stats):
    """
    Générer un PDF de rapport analytics pour un candidat

    Args:
        stats: dict contenant les statistiques du candidat

    Returns:
        BytesIO: Buffer contenant le PDF généré
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm)

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#06b6d4'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )

    # Story (contenu du PDF)
    story = []

    # En-tête
    story.append(Paragraph("📊 BaraCorrespondance AI", title_style))
    story.append(Paragraph("Rapport Analytics Candidat", heading_style))
    story.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", normal_style))
    story.append(Spacer(1, 0.5*inch))

    # Informations du candidat
    candidate_info = stats.get('candidate_info', {})
    story.append(Paragraph("👤 Informations du Candidat", heading_style))

    candidate_data = [
        ['Nom Complet', candidate_info.get('full_name', 'N/A')],
        ['Email', candidate_info.get('email', 'N/A')],
        ['Téléphone', candidate_info.get('phone', 'N/A')],
        ['Localisation', candidate_info.get('location', 'N/A')],
        ['Expérience', f"{candidate_info.get('experience_years', 0)} ans"],
        ['Niveau d\'Études', candidate_info.get('education_level', 'N/A')],
        ['Disponibilité', candidate_info.get('availability', 'N/A')]
    ]

    candidate_table = Table(candidate_data, colWidths=[5*cm, 12*cm])
    candidate_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb'))
    ]))
    story.append(candidate_table)
    story.append(Spacer(1, 0.3*inch))

    # Statistiques Globales
    story.append(Paragraph("📈 Statistiques Globales", heading_style))

    global_stats = stats.get('global_stats', {})
    stats_data = [
        ['Métrique', 'Valeur'],
        ['Total de Candidatures', str(global_stats.get('total_applications', 0))],
        ['Candidatures Acceptées', str(global_stats.get('accepted_applications', 0))],
        ['Candidatures en Attente', str(global_stats.get('pending_applications', 0))],
        ['Candidatures Rejetées', str(global_stats.get('rejected_applications', 0))],
        ['Total de Matchs', str(global_stats.get('total_matches', 0))],
        ['Matchs Mutuels', str(global_stats.get('mutual_matches', 0))],
        ['Vues de Profil', str(global_stats.get('profile_views', 0))],
        ['Score Moyen de Matching', f"{global_stats.get('avg_match_score', 0):.1f}%"],
        ['Taux d\'Acceptation', f"{global_stats.get('acceptance_rate', 0):.1f}%"]
    ]

    stats_table = Table(stats_data, colWidths=[10*cm, 7*cm])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06b6d4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 0.3*inch))

    # Activité Récente
    recent_activity = stats.get('recent_activity', [])
    if recent_activity:
        story.append(Paragraph("🕒 Activité Récente", heading_style))

        activity_data = [['Date', 'Type', 'Description']]
        for activity in recent_activity[:10]:  # Limiter à 10
            activity_data.append([
                activity.get('date', 'N/A'),
                activity.get('type', 'N/A'),
                activity.get('description', 'N/A')
            ])

        activity_table = Table(activity_data, colWidths=[3.5*cm, 4*cm, 9.5*cm])
        activity_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        story.append(activity_table)
        story.append(Spacer(1, 0.3*inch))

    # Compétences
    skills = candidate_info.get('skills', [])
    if skills:
        story.append(Paragraph("💼 Compétences Principales", heading_style))
        skills_text = ', '.join(skills[:15])  # Limiter à 15
        story.append(Paragraph(skills_text, normal_style))
        story.append(Spacer(1, 0.3*inch))

    # Footer
    story.append(Spacer(1, 0.5*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#9ca3af'),
        alignment=TA_CENTER
    )
    story.append(Paragraph("─────────────────────────────────────────────────", footer_style))
    story.append(Paragraph("© 2024 BaraCorrespondance AI - Plateforme de Matching CV-Entreprise avec IA", footer_style))
    story.append(Paragraph("Ce rapport est confidentiel et destiné uniquement à votre usage personnel", footer_style))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_company_analytics_pdf(stats):
    """
    Générer un PDF de rapport analytics pour une entreprise

    Args:
        stats: dict contenant les statistiques de l'entreprise

    Returns:
        BytesIO: Buffer contenant le PDF généré
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm)

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#06b6d4'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )

    # Story
    story = []

    # En-tête
    story.append(Paragraph("📊 BaraCorrespondance AI", title_style))
    story.append(Paragraph("Rapport Analytics Entreprise", heading_style))
    story.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", normal_style))
    story.append(Spacer(1, 0.5*inch))

    # Informations de l'entreprise
    company_info = stats.get('company_info', {})
    story.append(Paragraph("🏢 Informations de l'Entreprise", heading_style))

    company_data = [
        ['Nom de l\'Entreprise', company_info.get('name', 'N/A')],
        ['Email', company_info.get('email', 'N/A')],
        ['Téléphone', company_info.get('phone', 'N/A')],
        ['Secteur', company_info.get('industry', 'N/A')],
        ['Taille', company_info.get('size', 'N/A')],
        ['Localisation', company_info.get('location', 'N/A')],
        ['Site Web', company_info.get('website', 'N/A')]
    ]

    company_table = Table(company_data, colWidths=[5*cm, 12*cm])
    company_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb'))
    ]))
    story.append(company_table)
    story.append(Spacer(1, 0.3*inch))

    # Statistiques Globales
    story.append(Paragraph("📈 Statistiques Globales", heading_style))

    global_stats = stats.get('global_stats', {})
    stats_data = [
        ['Métrique', 'Valeur'],
        ['Total d\'Offres Actives', str(global_stats.get('active_jobs', 0))],
        ['Total d\'Offres Créées', str(global_stats.get('total_jobs', 0))],
        ['Total de Candidatures', str(global_stats.get('total_applications', 0))],
        ['Candidatures en Attente', str(global_stats.get('pending_applications', 0))],
        ['Candidatures Acceptées', str(global_stats.get('accepted_applications', 0))],
        ['Candidatures Rejetées', str(global_stats.get('rejected_applications', 0))],
        ['Total de Matchs', str(global_stats.get('total_matches', 0))],
        ['Matchs de Haute Qualité (>80%)', str(global_stats.get('high_quality_matches', 0))],
        ['Vues Totales des Offres', str(global_stats.get('total_job_views', 0))],
        ['Taux de Conversion', f"{global_stats.get('conversion_rate', 0):.1f}%"]
    ]

    stats_table = Table(stats_data, colWidths=[10*cm, 7*cm])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06b6d4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 0.3*inch))

    # Top Offres
    top_jobs = stats.get('top_jobs', [])
    if top_jobs:
        story.append(Paragraph("🔥 Top 5 Offres les Plus Performantes", heading_style))

        jobs_data = [['Titre', 'Candidatures', 'Matchs', 'Vues']]
        for job in top_jobs[:5]:
            jobs_data.append([
                job.get('title', 'N/A'),
                str(job.get('applications_count', 0)),
                str(job.get('matches_count', 0)),
                str(job.get('views', 0))
            ])

        jobs_table = Table(jobs_data, colWidths=[8*cm, 3*cm, 3*cm, 3*cm])
        jobs_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        story.append(jobs_table)
        story.append(Spacer(1, 0.3*inch))

    # Activité Récente
    recent_activity = stats.get('recent_activity', [])
    if recent_activity:
        story.append(Paragraph("🕒 Activité Récente", heading_style))

        activity_data = [['Date', 'Type', 'Description']]
        for activity in recent_activity[:10]:
            activity_data.append([
                activity.get('date', 'N/A'),
                activity.get('type', 'N/A'),
                activity.get('description', 'N/A')
            ])

        activity_table = Table(activity_data, colWidths=[3.5*cm, 4*cm, 9.5*cm])
        activity_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        story.append(activity_table)

    # Footer
    story.append(Spacer(1, 0.5*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#9ca3af'),
        alignment=TA_CENTER
    )
    story.append(Paragraph("─────────────────────────────────────────────────", footer_style))
    story.append(Paragraph("© 2024 BaraCorrespondance AI - Plateforme de Matching CV-Entreprise avec IA", footer_style))
    story.append(Paragraph("Ce rapport est confidentiel et destiné uniquement à votre entreprise", footer_style))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
