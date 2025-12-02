"""
================================================================
Service d'Analyse de CV - BaraCorrespondance AI
================================================================
Analyse les CV uploadés et extrait les informations pertinentes
"""

import os
import re
import time
from datetime import datetime

from flask import current_app
from app import db
from app.models import CVAnalysis, Candidate

# Try to import Gemini analyzer module (optional - requires google-generativeai)
# Import the module so we can inspect a GENAI_AVAILABLE flag exposed by it.
try:
    import app.services.gemini_analyzer as gemini_module
    gemini_analyzer_service = getattr(gemini_module, 'gemini_analyzer_service', None)
    GEMINI_AVAILABLE = getattr(gemini_module, 'GENAI_AVAILABLE', False)
except (ImportError, ModuleNotFoundError):
    # Module not present - disable Gemini features
    gemini_analyzer_service = None
    GEMINI_AVAILABLE = False


class CVAnalyzerService:
    """Service d'analyse de CV par IA"""
    
    # Liste des compétences techniques connues
    TECHNICAL_SKILLS = [
        # Programmation
        'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'swift', 'kotlin', 'typescript', 'scala', 'r', 'matlab',
        # Web
        'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django',
        'flask', 'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap',
        'tailwind', 'sass', 'less', 'webpack', 'nextjs', 'nuxt',
        # Base de données
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite',
        'elasticsearch', 'cassandra', 'dynamodb', 'firebase',
        # Cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab',
        'ci/cd', 'terraform', 'ansible', 'linux', 'nginx', 'apache',
        # Data & IA
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas',
        'numpy', 'scikit-learn', 'nlp', 'computer vision', 'data science',
        'big data', 'hadoop', 'spark', 'tableau', 'power bi',
        # Mobile
        'android', 'ios', 'react native', 'flutter', 'xamarin',
        # Autres
        'git', 'agile', 'scrum', 'jira', 'api', 'rest', 'graphql', 'microservices'
    ]
    
    # Soft skills
    SOFT_SKILLS = [
        'communication', 'leadership', 'travail d\'équipe', 'team work',
        'gestion de projet', 'problem solving', 'résolution de problèmes',
        'créativité', 'adaptabilité', 'autonomie', 'organisation',
        'gestion du temps', 'négociation', 'présentation', 'analyse'
    ]
    
    def analyze_file(self, filepath, candidate_id):
        """
        Analyser un fichier CV complet
        
        Args:
            filepath: Chemin vers le fichier CV
            candidate_id: ID du candidat
            
        Returns:
            dict: Résultats de l'analyse
        """
        start_time = time.time()
        
        # Extraire le texte du fichier
        raw_text = self._extract_text(filepath)
        
        if not raw_text or len(raw_text.strip()) < 50:
            raise ValueError("Impossible d'extraire le texte du CV ou CV trop court")
        
        # Analyser le contenu
        extracted_data = self._extract_data(raw_text)
        # Par défaut, effectuer l'analyse locale
        scores = self._calculate_scores(raw_text, extracted_data)
        recommendations = self._generate_recommendations(extracted_data, scores)
        keywords = self._extract_keywords(raw_text, extracted_data)

        # Si la clé Gemini est configurée ET Gemini disponible, tenter d'obtenir une analyse IA et fusionner
        try:
            api_key = current_app.config.get('GEMINI_API_KEY') or None
            if api_key and GEMINI_AVAILABLE and gemini_analyzer_service:
                ai_result = gemini_analyzer_service.analyze_cv(raw_text)
                # Fusionner les données extraites par l'IA si présentes
                if isinstance(ai_result, dict):
                    ai_extracted = ai_result.get('extracted_data')
                    if ai_extracted:
                        extracted_data = ai_extracted

                    # Remplacer/compléter les scores si fournis
                    ai_scores = ai_result.get('scores_breakdown')
                    if ai_scores:
                        # Map attendu: technical_skills, experience, education, presentation, completeness
                        scores = {
                            'technical_skills': ai_scores.get('technical_skills', scores.get('technical_skills')),
                            'experience': ai_scores.get('experience', scores.get('experience')),
                            'education': ai_scores.get('education', scores.get('education')),
                            'presentation': ai_scores.get('presentation', scores.get('presentation')),
                            'completeness': ai_scores.get('completeness', scores.get('completeness')),
                            'overall': ai_result.get('overall_score', scores.get('overall'))
                        }

                    # Recommandations et mots-clés fournis par l'IA
                    if ai_result.get('recommendations'):
                        recommendations = ai_result.get('recommendations')
                    if ai_result.get('keywords'):
                        keywords = ai_result.get('keywords')

                    # Indiquer que l'analyse a été enrichie par l'IA
                    ai_meta = {
                        'ai_powered': ai_result.get('ai_powered', True),
                        'ai_model': ai_result.get('ai_model')
                    }
                else:
                    ai_meta = {'ai_powered': False}
            else:
                ai_meta = {'ai_powered': False}
        except Exception as e:
            # Ne pas faire planter l'analyse si l'IA échoue; log et fallback
            current_app.logger.error(f"Erreur IA lors de l'analyse CV: {str(e)}")
            ai_meta = {'ai_powered': False}
        
        processing_time = time.time() - start_time
        
        # Marquer les anciennes analyses comme non-latest
        CVAnalysis.query.filter_by(
            candidate_id=candidate_id,
            is_latest=True
        ).update({'is_latest': False})
        
        # Créer la nouvelle analyse
        file_ext = filepath.rsplit('.', 1)[-1].lower() if '.' in filepath else 'unknown'
        file_size = os.path.getsize(filepath) if os.path.exists(filepath) else 0
        
        analysis = CVAnalysis(
            candidate_id=candidate_id,
            file_url=filepath,
            file_name=os.path.basename(filepath),
            file_type=file_ext,
            file_size=file_size,
            raw_text=raw_text,
            extracted_data=extracted_data,
            overall_score=scores['overall'],
            scores_breakdown=scores,
            recommendations=recommendations,
            keywords=keywords,
            processing_time=processing_time,
            is_latest=True
        )
        
        db.session.add(analysis)
        
        # Mettre à jour le profil candidat avec les données extraites
        self._update_candidate_profile(candidate_id, extracted_data)
        
        db.session.commit()
        
        result = analysis.to_dict()
        # Ajouter les métadonnées IA si disponibles
        if 'ai_meta' in locals():
            result['ai'] = ai_meta

        return result
    
    def _extract_text(self, filepath):
        """Extraire le texte d'un fichier PDF ou DOCX"""
        ext = filepath.rsplit('.', 1)[-1].lower() if '.' in filepath else ''
        
        if ext == 'pdf':
            return self._extract_from_pdf(filepath)
        elif ext in ['doc', 'docx']:
            return self._extract_from_docx(filepath)
        else:
            raise ValueError(f"Format non supporté: {ext}")
    
    def _extract_from_pdf(self, filepath):
        """Extraire le texte d'un PDF"""
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except ImportError:
            # Fallback avec PyPDF2
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(filepath)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
            except Exception as e:
                raise ValueError(f"Erreur extraction PDF: {e}")
    
    def _extract_from_docx(self, filepath):
        """Extraire le texte d'un DOCX"""
        try:
            from docx import Document
            doc = Document(filepath)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            raise ValueError(f"Erreur extraction DOCX: {e}")
    
    def _extract_data(self, text):
        """Extraire les données structurées du texte"""
        text_lower = text.lower()
        
        return {
            'personal_info': self._extract_personal_info(text),
            'skills': {
                'technical': self._extract_technical_skills(text_lower),
                'soft': self._extract_soft_skills(text_lower),
                'languages': self._extract_languages(text)
            },
            'experience': self._extract_experience(text),
            'education': self._extract_education(text),
            'certifications': self._extract_certifications(text),
            'total_experience_years': self._calculate_total_experience(text)
        }
    
    def _extract_personal_info(self, text):
        """Extraire les informations personnelles"""
        info = {}
        
        # Email
        email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
        emails = re.findall(email_pattern, text)
        if emails:
            info['email'] = emails[0]
        
        # Téléphone
        phone_pattern = r'(?:\+\d{1,3}[\s-]?)?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}'
        phones = re.findall(phone_pattern, text)
        if phones:
            info['phone'] = phones[0].strip()
        
        # LinkedIn
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin = re.findall(linkedin_pattern, text.lower())
        if linkedin:
            info['linkedin'] = linkedin[0]
        
        # Nom (première ligne significative)
        lines = text.strip().split('\n')
        for line in lines[:5]:
            line = line.strip()
            if line and len(line) > 3 and len(line) < 50:
                # Vérifier que ce n'est pas un email ou téléphone
                if '@' not in line and not re.match(r'^[\d\s\+\-]+$', line):
                    info['name'] = line
                    break
        
        return info
    
    def _extract_technical_skills(self, text_lower):
        """Extraire les compétences techniques"""
        found_skills = []
        
        for skill in self.TECHNICAL_SKILLS:
            # Chercher le mot exact (avec boundaries)
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Capitaliser correctement
                found_skills.append(skill.title() if len(skill) > 3 else skill.upper())
        
        return list(set(found_skills))
    
    def _extract_soft_skills(self, text_lower):
        """Extraire les soft skills"""
        found_skills = []
        
        for skill in self.SOFT_SKILLS:
            if skill.lower() in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))
    
    def _extract_languages(self, text):
        """Extraire les langues parlées"""
        languages = []
        text_lower = text.lower()
        
        language_patterns = {
            'Français': ['français', 'french', 'francais'],
            'Anglais': ['anglais', 'english'],
            'Arabe': ['arabe', 'arabic'],
            'Espagnol': ['espagnol', 'spanish', 'español'],
            'Allemand': ['allemand', 'german', 'deutsch'],
            'Portugais': ['portugais', 'portuguese'],
            'Chinois': ['chinois', 'chinese', 'mandarin'],
            'Soussou': ['soussou', 'susu'],
            'Peul': ['peul', 'pular', 'fulani'],
            'Malinké': ['malinké', 'malinke', 'mandinka']
        }
        
        level_patterns = {
            'Natif': ['natif', 'native', 'maternelle', 'langue maternelle'],
            'Courant': ['courant', 'fluent', 'bilingue', 'bilingual'],
            'Avancé': ['avancé', 'advanced', 'professionnel'],
            'Intermédiaire': ['intermédiaire', 'intermediate', 'moyen'],
            'Débutant': ['débutant', 'beginner', 'notions', 'basic']
        }
        
        for lang_name, patterns in language_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    # Chercher le niveau
                    level = 'Non précisé'
                    # Chercher dans un rayon de 50 caractères
                    idx = text_lower.find(pattern)
                    context = text_lower[max(0, idx-50):idx+50+len(pattern)]
                    
                    for level_name, level_patterns_list in level_patterns.items():
                        if any(lp in context for lp in level_patterns_list):
                            level = level_name
                            break
                    
                    languages.append({
                        'name': lang_name,
                        'level': level
                    })
                    break
        
        return languages
    
    def _extract_experience(self, text):
        """Extraire les expériences professionnelles"""
        experiences = []
        
        # Patterns pour détecter les dates
        date_pattern = r'((?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\s,]*\d{4}|\d{1,2}/\d{4}|\d{4})'
        
        # Chercher des sections d'expérience
        exp_keywords = ['expérience', 'experience', 'emploi', 'poste', 'fonction']
        
        lines = text.split('\n')
        current_exp = None
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            # Détecter le début d'une nouvelle expérience
            dates = re.findall(date_pattern, line_lower)
            if dates and len(line) < 200:
                if current_exp:
                    experiences.append(current_exp)
                
                current_exp = {
                    'title': '',
                    'company': '',
                    'period': ' - '.join(dates[:2]) if len(dates) >= 2 else dates[0] if dates else '',
                    'description': ''
                }
                
                # Le titre est souvent sur la même ligne ou la ligne précédente
                if i > 0:
                    prev_line = lines[i-1].strip()
                    if prev_line and len(prev_line) < 100:
                        current_exp['title'] = prev_line
            
            elif current_exp and line.strip():
                # Ajouter à la description
                current_exp['description'] += line.strip() + ' '
        
        if current_exp:
            experiences.append(current_exp)
        
        return experiences[:5]  # Limiter à 5 expériences
    
    def _extract_education(self, text):
        """Extraire les formations"""
        education = []
        text_lower = text.lower()
        
        # Mots-clés de diplômes
        degree_patterns = [
            (r'doctorat|phd|ph\.d', 'Doctorat'),
            (r'master|mastère|mba', 'Master'),
            (r'licence|bachelor', 'Licence'),
            (r'bts|dut|deug', 'Bac+2'),
            (r'baccalauréat|bac\b', 'Baccalauréat'),
            (r'ingénieur', 'Ingénieur')
        ]
        
        for pattern, degree_name in degree_patterns:
            if re.search(pattern, text_lower):
                education.append({
                    'degree': degree_name,
                    'field': '',
                    'institution': ''
                })
        
        return education
    
    def _extract_certifications(self, text):
        """Extraire les certifications"""
        certifications = []
        text_lower = text.lower()
        
        cert_keywords = [
            'aws certified', 'azure certified', 'google certified',
            'pmp', 'scrum master', 'cissp', 'cisa',
            'comptia', 'cisco', 'oracle certified',
            'certified', 'certification'
        ]
        
        for keyword in cert_keywords:
            if keyword in text_lower:
                # Trouver le contexte autour
                idx = text_lower.find(keyword)
                context = text[max(0, idx-10):idx+50]
                certifications.append(context.strip())
        
        return certifications[:10]
    
    def _calculate_total_experience(self, text):
        """Calculer les années d'expérience totales"""
        # Chercher des patterns comme "5 ans d'expérience"
        patterns = [
            r'(\d+)\s*(?:ans?|années?)\s*d\'?expérience',
            r'(\d+)\s*(?:years?)\s*(?:of\s*)?experience',
            r'expérience\s*:\s*(\d+)\s*ans?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return int(match.group(1))
        
        # Estimer à partir des dates d'expérience
        years = re.findall(r'\b(19\d{2}|20\d{2})\b', text)
        if len(years) >= 2:
            years = [int(y) for y in years]
            return max(years) - min(years)
        
        return 0
    
    def _calculate_scores(self, text, extracted_data):
        """Calculer les scores du CV"""
        scores = {}
        
        # Score compétences techniques (40%)
        tech_skills = extracted_data.get('skills', {}).get('technical', [])
        scores['technical_skills'] = min(100, len(tech_skills) * 10)
        
        # Score expérience (30%)
        years = extracted_data.get('total_experience_years', 0)
        scores['experience'] = min(100, years * 15)
        
        # Score formation (15%)
        education = extracted_data.get('education', [])
        scores['education'] = min(100, len(education) * 30)
        
        # Score présentation/format (10%)
        word_count = len(text.split())
        if 300 <= word_count <= 1000:
            scores['presentation'] = 100
        elif 200 <= word_count < 300 or 1000 < word_count <= 1500:
            scores['presentation'] = 75
        else:
            scores['presentation'] = 50
        
        # Score complétude (5%)
        personal_info = extracted_data.get('personal_info', {})
        completeness_items = [
            personal_info.get('email'),
            personal_info.get('phone'),
            tech_skills,
            education,
            extracted_data.get('experience')
        ]
        scores['completeness'] = (sum(1 for item in completeness_items if item) / len(completeness_items)) * 100
        
        # Score global pondéré
        scores['overall'] = round(
            scores['technical_skills'] * 0.40 +
            scores['experience'] * 0.30 +
            scores['education'] * 0.15 +
            scores['presentation'] * 0.10 +
            scores['completeness'] * 0.05,
            1
        )
        
        return scores
    
    def _generate_recommendations(self, extracted_data, scores):
        """Générer des recommandations d'amélioration"""
        recommendations = []
        
        # Compétences techniques
        tech_skills = extracted_data.get('skills', {}).get('technical', [])
        if len(tech_skills) < 5:
            recommendations.append({
                'type': 'improvement',
                'priority': 'high',
                'category': 'skills',
                'title': 'Ajoutez plus de compétences techniques',
                'message': f"Votre CV contient seulement {len(tech_skills)} compétences techniques identifiées.",
                'suggestion': "Listez explicitement vos compétences techniques (langages, frameworks, outils) dans une section dédiée."
            })
        
        # Expérience
        if scores.get('experience', 0) < 50:
            recommendations.append({
                'type': 'improvement',
                'priority': 'medium',
                'category': 'experience',
                'title': 'Détaillez vos expériences',
                'message': "Les expériences professionnelles ne sont pas clairement identifiables.",
                'suggestion': "Utilisez un format clair: Titre du poste - Entreprise - Dates - Description des responsabilités."
            })
        
        # Formation
        if not extracted_data.get('education'):
            recommendations.append({
                'type': 'warning',
                'priority': 'medium',
                'category': 'education',
                'title': 'Section formation manquante',
                'message': "Aucune formation ou diplôme n'a été détecté.",
                'suggestion': "Ajoutez une section Formation avec vos diplômes et l'année d'obtention."
            })
        
        # Contact
        personal_info = extracted_data.get('personal_info', {})
        if not personal_info.get('email'):
            recommendations.append({
                'type': 'warning',
                'priority': 'high',
                'category': 'contact',
                'title': 'Email manquant',
                'message': "Aucune adresse email n'a été détectée dans votre CV.",
                'suggestion': "Ajoutez votre adresse email professionnelle en haut du CV."
            })
        
        if not personal_info.get('phone'):
            recommendations.append({
                'type': 'tip',
                'priority': 'low',
                'category': 'contact',
                'title': 'Numéro de téléphone',
                'message': "Le numéro de téléphone n'a pas été détecté.",
                'suggestion': "Ajoutez votre numéro de téléphone pour faciliter le contact."
            })
        
        # Langues
        languages = extracted_data.get('skills', {}).get('languages', [])
        if not languages:
            recommendations.append({
                'type': 'tip',
                'priority': 'low',
                'category': 'skills',
                'title': 'Langues parlées',
                'message': "Les langues parlées ne sont pas clairement indiquées.",
                'suggestion': "Ajoutez une section Langues avec votre niveau (Natif, Courant, Intermédiaire, etc.)."
            })
        
        return recommendations
    
    def _extract_keywords(self, text, extracted_data):
        """Extraire les mots-clés pour le matching"""
        keywords = []
        
        # Ajouter les compétences techniques
        keywords.extend(extracted_data.get('skills', {}).get('technical', []))
        
        # Ajouter les soft skills
        keywords.extend(extracted_data.get('skills', {}).get('soft', []))
        
        # Ajouter les diplômes
        for edu in extracted_data.get('education', []):
            if edu.get('degree'):
                keywords.append(edu['degree'])
        
        return list(set(keywords))
    
    def _update_candidate_profile(self, candidate_id, extracted_data):
        """Mettre à jour le profil candidat avec les données extraites"""
        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return
        
        # Mettre à jour les compétences si le profil est vide
        if not candidate.skills:
            candidate.skills = extracted_data.get('skills', {}).get('technical', [])
        
        # Mettre à jour les années d'expérience
        years = extracted_data.get('total_experience_years', 0)
        if years > 0 and not candidate.experience_years:
            candidate.experience_years = years
            
            # Déterminer le niveau d'expérience
            if years < 2:
                candidate.experience_level = 'junior'
            elif years < 5:
                candidate.experience_level = 'intermediate'
            elif years < 10:
                candidate.experience_level = 'senior'
            else:
                candidate.experience_level = 'expert'
        
        # Mettre à jour les langues
        if not candidate.languages:
            candidate.languages = extracted_data.get('skills', {}).get('languages', [])
