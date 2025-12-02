"""
================================================================
CV & Cover Letter Generator Service - BaraCorrespondance AI
================================================================
Service de génération de CV et lettres de motivation avec Gemini AI
"""

from app.services.gemini_analyzer import GeminiAnalyzerService


class CVLetterGeneratorService:
    """Service pour générer des CVs et lettres de motivation avec IA"""

    def __init__(self):
        self.gemini = GeminiAnalyzerService()

    def generate_cv_html(self, candidate_data, style='modern'):
        """
        Générer un CV en HTML à partir des données du candidat

        Args:
            candidate_data: Dictionnaire contenant les infos du candidat
            style: Style du CV ('modern', 'classic', 'creative')

        Returns:
            str: CV en HTML
        """
        prompt = f"""
Génère un CV professionnel en HTML pour le candidat suivant.

**INFORMATIONS DU CANDIDAT:**
- Nom complet: {candidate_data.get('full_name', 'N/A')}
- Email: {candidate_data.get('email', 'N/A')}
- Téléphone: {candidate_data.get('phone', 'N/A')}
- Localisation: {candidate_data.get('location', 'N/A')}
- Titre professionnel: {candidate_data.get('professional_title', 'Professionnel')}
- Années d'expérience: {candidate_data.get('experience_years', 0)} ans
- Niveau d'études: {candidate_data.get('education_level', 'N/A')}
- Compétences: {', '.join(candidate_data.get('skills', [])) if candidate_data.get('skills') else 'N/A'}
- Bio/Résumé: {candidate_data.get('bio', 'N/A')}

**STYLE DEMANDÉ:** {style}

**INSTRUCTIONS:**
1. Génère un CV complet et professionnel en HTML
2. Utilise le style {style} avec des couleurs modernes et élégantes
3. Inclus les sections: En-tête, Résumé, Expérience, Compétences, Formation
4. Le HTML doit être autonome (inline CSS)
5. Design responsive et imprimable
6. Utilise des couleurs professionnelles: bleu (#06b6d4), violet (#8b5cf6)
7. Ajoute des icônes avec des caractères Unicode (✉, ☎, 📍, 💼, 🎓)
8. Maximum 2 pages A4

**FORMAT DE SORTIE:**
Retourne uniquement le code HTML complet (sans ```html ni commentaires), prêt à être utilisé.
"""

        try:
            html_content = self.gemini.generate_content(prompt)

            # Nettoyer le HTML si nécessaire
            if html_content.startswith('```html'):
                html_content = html_content.replace('```html', '').replace('```', '').strip()

            return html_content

        except Exception as e:
            raise Exception(f"Erreur lors de la génération du CV: {str(e)}")

    def generate_cover_letter(self, candidate_data, job_data, company_data):
        """
        Générer une lettre de motivation personnalisée

        Args:
            candidate_data: Infos du candidat
            job_data: Infos du poste
            company_data: Infos de l'entreprise

        Returns:
            str: Lettre de motivation en HTML
        """
        prompt = f"""
Génère une lettre de motivation professionnelle et personnalisée.

**CANDIDAT:**
- Nom: {candidate_data.get('full_name', 'N/A')}
- Email: {candidate_data.get('email', 'N/A')}
- Téléphone: {candidate_data.get('phone', 'N/A')}
- Expérience: {candidate_data.get('experience_years', 0)} ans
- Compétences clés: {', '.join(candidate_data.get('skills', [])[:5]) if candidate_data.get('skills') else 'N/A'}
- Bio: {candidate_data.get('bio', 'N/A')}

**POSTE VISÉ:**
- Titre: {job_data.get('title', 'N/A')}
- Description: {job_data.get('description', 'N/A')}
- Compétences requises: {', '.join(job_data.get('required_skills', [])) if job_data.get('required_skills') else 'N/A'}
- Type de contrat: {job_data.get('contract_type', 'N/A')}
- Localisation: {job_data.get('location', 'N/A')}

**ENTREPRISE:**
- Nom: {company_data.get('name', 'N/A')}
- Secteur: {company_data.get('industry', 'N/A')}
- Description: {company_data.get('description', 'N/A')}

**INSTRUCTIONS:**
1. Génère une lettre de motivation convaincante et personnalisée
2. Structure classique: En-tête, Objet, Introduction, Développement (2-3 paragraphes), Conclusion
3. Mets en valeur les compétences du candidat qui correspondent au poste
4. Montre l'intérêt du candidat pour l'entreprise et le secteur
5. Ton professionnel mais authentique
6. Longueur: 250-350 mots
7. Format HTML avec inline CSS pour un rendu élégant
8. Utilise les couleurs: bleu (#06b6d4) et gris foncé (#1f2937)

**FORMAT DE SORTIE:**
Retourne uniquement le HTML complet de la lettre (sans ```html ni commentaires).
"""

        try:
            html_content = self.gemini.generate_content(prompt)

            # Nettoyer le HTML
            if html_content.startswith('```html'):
                html_content = html_content.replace('```html', '').replace('```', '').strip()

            return html_content

        except Exception as e:
            raise Exception(f"Erreur lors de la génération de la lettre: {str(e)}")

    def improve_cv_section(self, section_name, current_content, candidate_skills):
        """
        Améliorer une section spécifique du CV

        Args:
            section_name: Nom de la section (ex: "Résumé professionnel", "Expérience")
            current_content: Contenu actuel
            candidate_skills: Compétences du candidat

        Returns:
            str: Contenu amélioré
        """
        prompt = f"""
Améliore la section "{section_name}" d'un CV.

**CONTENU ACTUEL:**
{current_content}

**COMPÉTENCES DU CANDIDAT:**
{', '.join(candidate_skills) if candidate_skills else 'N/A'}

**INSTRUCTIONS:**
1. Reformule le contenu pour le rendre plus percutant et professionnel
2. Utilise des verbes d'action forts
3. Quantifie les résultats quand c'est possible
4. Garde un ton professionnel
5. Maximum 150 mots
6. Retourne uniquement le texte amélioré (pas de mise en forme, juste le texte)

**FORMAT DE SORTIE:**
Retourne uniquement le texte amélioré, sans formatage HTML ni Markdown.
"""

        try:
            improved_content = self.gemini.generate_content(prompt)
            return improved_content.strip()

        except Exception as e:
            raise Exception(f"Erreur lors de l'amélioration de la section: {str(e)}")

    def generate_professional_summary(self, candidate_data):
        """
        Générer un résumé professionnel percutant

        Args:
            candidate_data: Données du candidat

        Returns:
            str: Résumé professionnel
        """
        prompt = f"""
Génère un résumé professionnel percutant pour un CV.

**PROFIL:**
- Années d'expérience: {candidate_data.get('experience_years', 0)} ans
- Niveau d'études: {candidate_data.get('education_level', 'N/A')}
- Compétences principales: {', '.join(candidate_data.get('skills', [])[:5]) if candidate_data.get('skills') else 'N/A'}
- Bio actuelle: {candidate_data.get('bio', 'N/A')}
- Domaine: {candidate_data.get('professional_title', 'Professionnel')}

**INSTRUCTIONS:**
1. Génère un résumé professionnel de 3-4 phrases
2. Met en avant l'expertise et les compétences clés
3. Mentionne les années d'expérience
4. Ton dynamique et confiant
5. Utilise des mots-clés pertinents pour le domaine
6. Retourne uniquement le texte du résumé (pas de titre, pas de formatting)

**FORMAT DE SORTIE:**
Retourne uniquement le texte du résumé professionnel.
"""

        try:
            summary = self.gemini.generate_content(prompt)
            return summary.strip()

        except Exception as e:
            raise Exception(f"Erreur lors de la génération du résumé: {str(e)}")

    def suggest_skills(self, job_title, industry):
        """
        Suggérer des compétences pertinentes pour un poste

        Args:
            job_title: Titre du poste
            industry: Secteur d'activité

        Returns:
            list: Liste de compétences suggérées
        """
        prompt = f"""
Suggère 15 compétences pertinentes pour un poste.

**POSTE:** {job_title}
**SECTEUR:** {industry}

**INSTRUCTIONS:**
1. Liste 15 compétences techniques et transversales pertinentes
2. Inclus un mix de compétences techniques, outils, soft skills
3. Adapte au poste et au secteur
4. Format: une compétence par ligne, sans numérotation ni bullets
5. Compétences actuelles et demandées sur le marché

**FORMAT DE SORTIE:**
Retourne uniquement la liste des compétences, une par ligne, sans formatage.
Exemple:
Python
Gestion de projet
Leadership
...
"""

        try:
            skills_text = self.gemini.generate_content(prompt)
            # Convertir en liste
            skills = [skill.strip() for skill in skills_text.strip().split('\n') if skill.strip()]
            return skills[:15]  # Limiter à 15

        except Exception as e:
            raise Exception(f"Erreur lors de la suggestion de compétences: {str(e)}")

    def generate_cv_tips(self, candidate_data):
        """
        Générer des conseils personnalisés pour améliorer le CV

        Args:
            candidate_data: Données du candidat

        Returns:
            list: Liste de conseils
        """
        prompt = f"""
Génère 5 conseils personnalisés pour améliorer un CV.

**PROFIL ACTUEL:**
- Expérience: {candidate_data.get('experience_years', 0)} ans
- Niveau d'études: {candidate_data.get('education_level', 'N/A')}
- Nombre de compétences listées: {len(candidate_data.get('skills', []))}
- A un résumé: {'Oui' if candidate_data.get('bio') else 'Non'}
- A uploadé un CV: {'Oui' if candidate_data.get('cv_file') else 'Non'}

**INSTRUCTIONS:**
1. Analyse le profil et identifie 5 points d'amélioration concrets
2. Donne des conseils actionnables et spécifiques
3. Priorise les améliorations qui auront le plus d'impact
4. Ton encourageant et constructif
5. Format: un conseil par ligne, commençant par un verbe d'action
6. Environ 15-20 mots par conseil

**FORMAT DE SORTIE:**
Retourne uniquement la liste des conseils, un par ligne, sans numérotation.
"""

        try:
            tips_text = self.gemini.generate_content(prompt)
            # Convertir en liste
            tips = [tip.strip() for tip in tips_text.strip().split('\n') if tip.strip()]
            return tips[:5]  # Limiter à 5

        except Exception as e:
            raise Exception(f"Erreur lors de la génération des conseils: {str(e)}")
