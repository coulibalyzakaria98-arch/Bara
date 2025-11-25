"""
================================================================
Générateur de Rapports PDF - BaraCorrespondance AI
================================================================
Génère des rapports PDF pour l'analyse de CV
"""

import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY


class PDFReportGenerator:
    """Génère des rapports PDF pour l'analyse de CV"""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Configure les styles personnalisés"""
        # Titre principal
        self.styles.add(ParagraphStyle(
            name='MainTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))

        # Sous-titre
        self.styles.add(ParagraphStyle(
            name='SubTitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=20,
            alignment=TA_CENTER
        ))

        # Titre de section
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceBefore=20,
            spaceAfter=10
        ))

        # Texte normal
        self.styles.add(ParagraphStyle(
            name='NormalText',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY
        ))

        # Points forts
        self.styles.add(ParagraphStyle(
            name='Strength',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#059669'),
            leftIndent=20
        ))

        # Recommandations
        self.styles.add(ParagraphStyle(
            name='Recommendation',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#dc2626'),
            leftIndent=20
        ))

    def generate_cv_analysis_report(self, analysis_data, user_data):
        """
        Génère un rapport PDF d'analyse de CV

        Args:
            analysis_data: Données de l'analyse du CV
            user_data: Données de l'utilisateur

        Returns:
            bytes: Contenu du fichier PDF
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )

        story = []

        # En-tête
        story.append(Paragraph("BaraCorrespondance AI", self.styles['MainTitle']))
        story.append(Paragraph("Rapport d'Analyse de CV", self.styles['SubTitle']))
        story.append(Spacer(1, 10))

        # Informations utilisateur
        user_name = user_data.get('full_name', user_data.get('email', 'Candidat'))
        date_str = datetime.now().strftime("%d/%m/%Y à %H:%M")
        story.append(Paragraph(f"<b>Candidat:</b> {user_name}", self.styles['NormalText']))
        story.append(Paragraph(f"<b>Date d'analyse:</b> {date_str}", self.styles['NormalText']))

        if analysis_data.get('ai_powered'):
            story.append(Paragraph("<b>Type d'analyse:</b> Intelligence Artificielle (GPT)", self.styles['NormalText']))

        story.append(Spacer(1, 20))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))

        # Score global
        overall_score = analysis_data.get('overall_score', 0)
        story.append(Paragraph("Score Global", self.styles['SectionTitle']))

        score_color = self._get_score_color(overall_score)
        story.append(Paragraph(
            f"<font size='36' color='{score_color}'><b>{overall_score}/100</b></font>",
            ParagraphStyle(name='Score', alignment=TA_CENTER, spaceAfter=20)
        ))

        # Résumé
        if analysis_data.get('summary'):
            story.append(Paragraph("Résumé du Profil", self.styles['SectionTitle']))
            story.append(Paragraph(analysis_data['summary'], self.styles['NormalText']))
            story.append(Spacer(1, 15))

        # Scores détaillés
        story.append(Paragraph("Scores Détaillés", self.styles['SectionTitle']))
        scores = analysis_data.get('scores_breakdown', {})
        score_data = [
            ['Critère', 'Score', 'Évaluation'],
            ['Compétences techniques', f"{scores.get('technical_skills', 0)}/100",
             self._get_score_label(scores.get('technical_skills', 0))],
            ['Expérience', f"{scores.get('experience', 0)}/100",
             self._get_score_label(scores.get('experience', 0))],
            ['Formation', f"{scores.get('education', 0)}/100",
             self._get_score_label(scores.get('education', 0))],
            ['Présentation', f"{scores.get('presentation', 0)}/100",
             self._get_score_label(scores.get('presentation', 0))],
            ['Complétude', f"{scores.get('completeness', 0)}/100",
             self._get_score_label(scores.get('completeness', 0))],
        ]

        score_table = Table(score_data, colWidths=[7*cm, 3*cm, 4*cm])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f3f4f6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 20))

        # Compétences détectées
        extracted = analysis_data.get('extracted_data', {})
        skills = extracted.get('skills', {})

        if skills.get('technical'):
            story.append(Paragraph("Compétences Techniques", self.styles['SectionTitle']))
            tech_skills = ", ".join(skills['technical'][:15])
            story.append(Paragraph(tech_skills, self.styles['NormalText']))
            story.append(Spacer(1, 10))

        if skills.get('soft'):
            story.append(Paragraph("Soft Skills", self.styles['SectionTitle']))
            soft_skills = ", ".join(skills['soft'][:10])
            story.append(Paragraph(soft_skills, self.styles['NormalText']))
            story.append(Spacer(1, 10))

        # Points forts
        strengths = analysis_data.get('strengths', [])
        if strengths:
            story.append(Paragraph("Points Forts", self.styles['SectionTitle']))
            for strength in strengths[:5]:
                story.append(Paragraph(f"✓ {strength}", self.styles['Strength']))
            story.append(Spacer(1, 15))

        # Recommandations
        recommendations = analysis_data.get('recommendations', [])
        if recommendations:
            story.append(Paragraph("Recommandations d'Amélioration", self.styles['SectionTitle']))
            for i, rec in enumerate(recommendations[:5], 1):
                title = rec.get('title', rec.get('message', ''))
                message = rec.get('message', '')
                priority = rec.get('priority', 'medium')

                priority_icon = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(priority, '🟡')
                story.append(Paragraph(
                    f"{priority_icon} <b>{title}</b>",
                    self.styles['NormalText']
                ))
                if message and message != title:
                    story.append(Paragraph(message, self.styles['Recommendation']))
                story.append(Spacer(1, 8))

        # Postes recommandés
        ideal_positions = analysis_data.get('ideal_positions', [])
        if ideal_positions:
            story.append(Paragraph("Postes Recommandés", self.styles['SectionTitle']))
            for pos in ideal_positions[:5]:
                story.append(Paragraph(f"• {pos}", self.styles['NormalText']))
            story.append(Spacer(1, 15))

        # Mots-clés
        keywords = analysis_data.get('keywords', [])
        if keywords:
            story.append(Paragraph("Mots-clés du Profil", self.styles['SectionTitle']))
            keywords_text = ", ".join(keywords[:20])
            story.append(Paragraph(keywords_text, self.styles['NormalText']))

        # Pied de page
        story.append(Spacer(1, 30))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
        story.append(Spacer(1, 10))
        story.append(Paragraph(
            "Rapport généré par BaraCorrespondance AI - L'intelligence artificielle au service de votre carrière",
            ParagraphStyle(name='Footer', fontSize=8, textColor=colors.gray, alignment=TA_CENTER)
        ))

        # Générer le PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_match_report(self, match_data, user_role):
        """
        Génère un rapport PDF de match

        Args:
            match_data: Données du match
            user_role: Role de l'utilisateur ('candidate' ou 'company')

        Returns:
            bytes: Contenu du fichier PDF
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )

        story = []

        # Titre
        story.append(Paragraph(
            "Rapport de Correspondance",
            self.styles['MainTitle']
        ))
        story.append(Paragraph(
            f"BaraCorrespondance AI - Match #{match_data.get('id', 'N/A')}",
            self.styles['SubTitle']
        ))
        story.append(Spacer(1, 20))

        # Score global
        match_score = match_data.get('match_score', 0)
        score_color = self._get_match_score_color(match_score)
        score_label = self._get_match_score_label(match_score)

        story.append(Paragraph("Score de Correspondance", self.styles['SectionTitle']))

        score_table_data = [
            [Paragraph(f"<b>{match_score:.0f}%</b>",
                      ParagraphStyle(name='ScoreBig', fontSize=36, textColor=colors.HexColor(score_color), alignment=TA_CENTER)),
             Paragraph(f"<b>{score_label}</b><br/><br/>Ce score indique le niveau de correspondance entre le candidat et l'offre d'emploi selon 5 critères clés.",
                      self.styles['NormalText'])]
        ]

        score_table = Table(score_table_data, colWidths=[4*cm, 12*cm])
        score_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#f3f4f6')),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 20))

        # Détail de la correspondance (entité)
        if user_role == 'candidate':
            # Afficher les infos du job
            job = match_data.get('job', {})
            story.append(Paragraph("💼 Offre d'Emploi", self.styles['SectionTitle']))

            job_info = [
                ['Poste:', job.get('title', 'N/A')],
                ['Entreprise:', job.get('company', {}).get('name', 'N/A')],
                ['Localisation:', job.get('location', 'N/A')],
                ['Type de contrat:', job.get('contract_type', 'N/A')],
            ]

            if job.get('salary_range'):
                job_info.append(['Salaire:', job['salary_range']])

            info_table = Table(job_info, colWidths=[4*cm, 12*cm])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(info_table)
            story.append(Spacer(1, 15))

            # Description du poste
            if job.get('description'):
                story.append(Paragraph("Description du Poste", self.styles['SectionTitle']))
                story.append(Paragraph(job['description'][:500] + ('...' if len(job['description']) > 500 else ''),
                                     self.styles['NormalText']))
                story.append(Spacer(1, 15))

        else:
            # Afficher les infos du candidat
            candidate = match_data.get('candidate', {})
            story.append(Paragraph("👤 Candidat", self.styles['SectionTitle']))

            candidate_info = [
                ['Nom:', candidate.get('full_name', 'N/A')],
                ['Poste:', candidate.get('title', 'N/A')],
                ['Localisation:', candidate.get('location', 'N/A')],
            ]

            if candidate.get('experience_years'):
                candidate_info.append(['Expérience:', f"{candidate['experience_years']} ans"])

            if candidate.get('education_level'):
                candidate_info.append(['Formation:', candidate['education_level']])

            info_table = Table(candidate_info, colWidths=[4*cm, 12*cm])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(info_table)
            story.append(Spacer(1, 15))

        # Analyse détaillée par critères
        score_breakdown = match_data.get('match_details', {}).get('score_breakdown', {})

        if score_breakdown:
            story.append(Paragraph("📊 Analyse Détaillée", self.styles['SectionTitle']))

            criteria_labels = {
                'skills': ('Compétences', 40),
                'experience': ('Expérience', 25),
                'education': ('Formation', 15),
                'location': ('Localisation', 10),
                'keywords': ('Mots-clés', 10)
            }

            criteria_data = [['Critère', 'Poids', 'Score', 'Évaluation']]

            for key, (label, weight) in criteria_labels.items():
                if key in score_breakdown:
                    score = score_breakdown[key]
                    evaluation = self._get_criteria_evaluation(score)
                    criteria_data.append([
                        label,
                        f"{weight}%",
                        f"{score:.0f}%",
                        evaluation
                    ])

            criteria_table = Table(criteria_data, colWidths=[5*cm, 2*cm, 2*cm, 7*cm])
            criteria_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(criteria_table)
            story.append(Spacer(1, 20))

        # Raisons du match
        match_reasons = match_data.get('match_reasons', [])
        if match_reasons:
            story.append(Paragraph("✨ Pourquoi ce Match ?", self.styles['SectionTitle']))
            for reason in match_reasons[:5]:
                story.append(Paragraph(f"✓ {reason}", self.styles['Strength']))
                story.append(Spacer(1, 5))
            story.append(Spacer(1, 15))

        # Compétences correspondantes
        matched_skills = match_data.get('match_details', {}).get('skills_match', {}).get('matched_skills', [])
        if matched_skills:
            story.append(Paragraph("🎯 Compétences Correspondantes", self.styles['SectionTitle']))
            skills_text = ", ".join(matched_skills[:15])
            story.append(Paragraph(skills_text, self.styles['NormalText']))
            story.append(Spacer(1, 15))

        # Statut du match
        if match_data.get('is_mutual_interest'):
            story.append(Paragraph("💜 Intérêt Mutuel", self.styles['SectionTitle']))
            story.append(Paragraph(
                "Les deux parties ont manifesté un intérêt pour ce match ! Vous pouvez échanger via la messagerie.",
                self.styles['NormalText']
            ))
            story.append(Spacer(1, 15))

        # Pied de page
        story.append(Spacer(1, 30))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
        story.append(Spacer(1, 10))
        story.append(Paragraph(
            f"Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} par BaraCorrespondance AI",
            ParagraphStyle(name='Footer', fontSize=8, textColor=colors.gray, alignment=TA_CENTER)
        ))
        story.append(Paragraph(
            "L'intelligence artificielle au service du recrutement",
            ParagraphStyle(name='Footer2', fontSize=8, textColor=colors.gray, alignment=TA_CENTER)
        ))

        # Générer le PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def _get_match_score_color(self, score):
        """Retourne la couleur en fonction du score de match"""
        if score >= 90:
            return '#059669'  # Vert foncé
        elif score >= 80:
            return '#10b981'  # Vert
        elif score >= 70:
            return '#f59e0b'  # Orange
        else:
            return '#94a3b8'  # Gris

    def _get_match_score_label(self, score):
        """Retourne le label en fonction du score de match"""
        if score >= 90:
            return '🌟 Excellent Match'
        elif score >= 80:
            return '⭐ Très Bon Match'
        elif score >= 70:
            return '✨ Bon Match'
        elif score >= 60:
            return '👍 Match Correct'
        else:
            return '💡 Match Faible'

    def _get_criteria_evaluation(self, score):
        """Retourne l'évaluation en fonction du score d'un critère"""
        if score >= 80:
            return '✓ Excellent'
        elif score >= 60:
            return '~ Bon'
        elif score >= 40:
            return '○ Moyen'
        else:
            return '✗ Faible'

    def _get_score_color(self, score):
        """Retourne la couleur en fonction du score"""
        if score >= 80:
            return '#059669'  # Vert
        elif score >= 60:
            return '#d97706'  # Orange
        else:
            return '#dc2626'  # Rouge

    def _get_score_label(self, score):
        """Retourne le label en fonction du score"""
        if score >= 80:
            return 'Excellent'
        elif score >= 60:
            return 'Bon'
        elif score >= 40:
            return 'À améliorer'
        else:
            return 'Insuffisant'


# Instance globale
pdf_generator = PDFReportGenerator()
