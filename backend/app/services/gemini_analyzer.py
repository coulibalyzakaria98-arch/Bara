"""
================================================================
Service d'Analyse IA de CV avec Google Gemini - BaraCorrespondance AI
================================================================
Utilise Google Gemini (gratuit) pour analyser les CVs
"""

import json
import os
from flask import current_app
# Import google.generativeai optionally - may not be installed in all environments
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except Exception:
    genai = None
    GENAI_AVAILABLE = False


class GeminiAnalyzerService:
    """Service d'analyse de CV utilisant Google Gemini (gratuit)"""

    def __init__(self):
        self.model = None

    def _get_model(self):
        """Initialise le modèle Gemini avec la clé API"""
        if self.model is None:
            if not GENAI_AVAILABLE:
                raise ImportError("google.generativeai is not installed. Install 'google-generativeai' to use Gemini features.")
            # Lire la clé depuis la config ou variable d'environnement
            api_key = current_app.config.get('GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY')

            if not api_key:
                raise ValueError("GEMINI_API_KEY non configurée. Obtenez une clé gratuite sur https://makersuite.google.com/app/apikey")

            # Configurer Gemini
            genai.configure(api_key=api_key)

            # Utiliser gemini-1.5-flash (gratuit et rapide)
            self.model = genai.GenerativeModel('gemini-1.5-flash')

        return self.model

    def analyze_cv(self, cv_text, job_context=None):
        """
        Analyse un CV avec Gemini et retourne des scores et recommandations

        Args:
            cv_text: Texte extrait du CV
            job_context: Contexte optionnel du poste visé

        Returns:
            dict: Résultats de l'analyse avec scores et recommandations
        """
        try:
            model = self._get_model()

            system_prompt = """Tu es un expert en recrutement et analyse de CV.
Analyse le CV fourni et retourne une évaluation détaillée au format JSON.

Tu dois évaluer:
1. Les compétences techniques (liste et niveau)
2. Les soft skills détectées
3. L'expérience professionnelle (années, pertinence)
4. La formation (niveau, pertinence)
5. La présentation du CV (clarté, structure)
6. Les points forts
7. Les axes d'amélioration avec recommandations concrètes

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
    "overall_score": <number 0-100>,
    "scores_breakdown": {
        "technical_skills": <number 0-100>,
        "experience": <number 0-100>,
        "education": <number 0-100>,
        "presentation": <number 0-100>,
        "completeness": <number 0-100>
    },
    "extracted_data": {
        "skills": {
            "technical": ["skill1", "skill2"],
            "soft": ["skill1", "skill2"],
            "languages": [{"name": "Français", "level": "Natif"}]
        },
        "total_experience_years": <number>,
        "education_level": "string",
        "certifications": ["cert1", "cert2"]
    },
    "strengths": ["point fort 1", "point fort 2"],
    "keywords": ["keyword1", "keyword2"],
    "recommendations": [
        {
            "type": "improvement",
            "priority": "high|medium|low",
            "category": "skills|experience|education|format",
            "title": "Titre court",
            "message": "Description détaillée de la recommandation"
        }
    ],
    "summary": "Résumé en 2-3 phrases du profil du candidat",
    "ideal_positions": ["poste1", "poste2", "poste3"]
}"""

            user_prompt = f"{system_prompt}\n\nAnalyse ce CV:\n\n{cv_text}"

            if job_context:
                user_prompt += f"\n\nContexte du poste visé: {job_context}"

            current_app.logger.info("🔍 Analyse CV avec Gemini...")

            # Générer la réponse
            response = model.generate_content(
                user_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=2000,
                )
            )

            # Extraire le texte et parser le JSON
            result_text = response.text.strip()

            # Nettoyer le markdown si présent
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            result_text = result_text.strip()

            result = json.loads(result_text)

            # Ajouter des métadonnées
            result['ai_model'] = 'gemini-1.5-flash'
            result['ai_powered'] = True

            current_app.logger.info(f"✅ Analyse terminée - Score: {result.get('overall_score')}/100")

            return result

        except json.JSONDecodeError as e:
            current_app.logger.error(f"Erreur parsing JSON Gemini: {str(e)}")
            current_app.logger.debug(f"Réponse brute: {result_text if 'result_text' in locals() else 'N/A'}")
            return self._fallback_analysis(cv_text)
        except Exception as e:
            current_app.logger.error(f"Erreur analyse Gemini: {str(e)}")
            return self._fallback_analysis(cv_text)

    def _fallback_analysis(self, cv_text):
        """Analyse basique sans IA en cas d'erreur"""
        return {
            "overall_score": 50,
            "scores_breakdown": {
                "technical_skills": 50,
                "experience": 50,
                "education": 50,
                "presentation": 50,
                "completeness": 50
            },
            "extracted_data": {
                "skills": {"technical": [], "soft": [], "languages": []},
                "total_experience_years": 0,
                "education_level": "Non déterminé",
                "certifications": []
            },
            "strengths": ["CV reçu et traité"],
            "keywords": [],
            "recommendations": [
                {
                    "type": "improvement",
                    "priority": "high",
                    "category": "format",
                    "title": "Analyse IA indisponible",
                    "message": "L'analyse IA n'a pas pu être effectuée. Vérifiez la configuration de l'API Gemini."
                }
            ],
            "summary": "Analyse basique effectuée sans IA.",
            "ideal_positions": [],
            "ai_powered": False
        }

    def get_job_recommendations(self, cv_analysis, available_jobs=None):
        """
        Génère des recommandations de postes basées sur l'analyse du CV

        Args:
            cv_analysis: Résultat de l'analyse du CV
            available_jobs: Liste optionnelle des postes disponibles

        Returns:
            list: Recommandations de postes avec scores de matching
        """
        try:
            model = self._get_model()

            prompt = f"""Basé sur cette analyse de CV:
{json.dumps(cv_analysis, ensure_ascii=False, indent=2)}

Recommande les 5 types de postes les plus adaptés à ce profil.
Pour chaque poste, explique pourquoi il correspond au profil.

Retourne un JSON avec cette structure:
{{
    "recommendations": [
        {{
            "title": "Titre du poste",
            "match_score": <number 0-100>,
            "reasons": ["raison1", "raison2"],
            "skills_to_develop": ["skill1", "skill2"]
        }}
    ]
}}"""

            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=1000,
                )
            )

            result_text = response.text.strip()
            if result_text.startswith('```json'):
                result_text = result_text[7:-3].strip()
            elif result_text.startswith('```'):
                result_text = result_text[3:-3].strip()

            return json.loads(result_text)

        except Exception as e:
            current_app.logger.error(f"Erreur recommandations Gemini: {str(e)}")
            return {"recommendations": []}

    def generate_cover_letter(self, cv_analysis, job_description):
        """
        Génère une lettre de motivation personnalisée

        Args:
            cv_analysis: Analyse du CV du candidat
            job_description: Description du poste

        Returns:
            str: Lettre de motivation générée
        """
        try:
            model = self._get_model()

            prompt = f"""Génère une lettre de motivation professionnelle en français basée sur:

Profil du candidat:
{json.dumps(cv_analysis.get('extracted_data', {}), ensure_ascii=False)}

Description du poste:
{job_description}

La lettre doit:
- Être professionnelle et personnalisée
- Mettre en avant les compétences pertinentes
- Montrer la motivation pour le poste
- Faire environ 300 mots"""

            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=800,
                )
            )

            return response.text

        except Exception as e:
            current_app.logger.error(f"Erreur génération lettre Gemini: {str(e)}")
            return None

    def generate_poster_content(self, job_data):
        """
        Génère du contenu attractif pour une affiche d'emploi

        Args:
            job_data: Dictionnaire contenant les infos du job

        Returns:
            dict: Contenu généré pour l'affiche
        """
        try:
            model = self._get_model()

            prompt = f"""Tu es un expert en marketing de recrutement.
Génère du contenu attractif pour une affiche d'emploi (poster de recrutement).

Poste: {job_data.get('title')}
Entreprise: {job_data.get('company_name')}
Lieu: {job_data.get('location')}
Type de contrat: {job_data.get('contract_type')}
Compétences: {', '.join(job_data.get('required_skills', [])[:5])}

Description: {job_data.get('description', '')[:300]}

Retourne UNIQUEMENT un JSON valide avec:
{{
    "headline": "Titre court et accrocheur (max 60 caractères)",
    "tagline": "Slogan percutant (max 80 caractères)",
    "description": "Description courte et attrayante (max 200 caractères)",
    "keywords": ["mot-clé1", "mot-clé2", "mot-clé3"],
    "call_to_action": "Phrase d'appel à l'action (max 40 caractères)",
    "emoji_suggestions": ["😎", "🚀", "💼"]
}}"""

            current_app.logger.info(f"🎨 Génération contenu affiche avec Gemini: {job_data.get('title')}")

            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.8,
                    max_output_tokens=500,
                )
            )

            result_text = response.text.strip()

            # Nettoyer markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:-3].strip()
            elif result_text.startswith('```'):
                result_text = result_text[3:-3].strip()

            result = json.loads(result_text)

            current_app.logger.info(f"✅ Contenu généré: {result.get('headline')}")
            return result

        except json.JSONDecodeError as e:
            current_app.logger.error(f"Erreur parsing JSON affiche: {str(e)}")
            return self._generate_fallback_poster_content(job_data)
        except Exception as e:
            current_app.logger.error(f"Erreur génération contenu affiche: {str(e)}")
            return self._generate_fallback_poster_content(job_data)

    def _generate_fallback_poster_content(self, job_data):
        """Contenu par défaut si l'IA échoue"""
        return {
            'headline': f"Rejoignez {job_data.get('company_name', 'notre équipe')}!",
            'tagline': f"Nous recrutons: {job_data.get('title', 'Nouveau Poste')}",
            'description': f"Opportunité exceptionnelle à {job_data.get('location', 'découvrir')}",
            'keywords': job_data.get('required_skills', [])[:5],
            'call_to_action': 'Postulez maintenant!',
            'emoji_suggestions': ['💼', '🚀', '✨']
        }


# Instance globale du service
gemini_analyzer_service = GeminiAnalyzerService()
