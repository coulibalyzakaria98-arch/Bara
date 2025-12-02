"""
================================================================
Service d'Analyse IA de CV - BaraCorrespondance AI
================================================================
Utilise OpenAI GPT pour analyser les CVs et fournir des recommandations
"""

import json
from flask import current_app
from openai import OpenAI
import os


class AIAnalyzerService:
    """Service d'analyse de CV utilisant OpenAI"""

    def __init__(self):
        self.client = None

    def _get_client(self):
        """Initialise le client OpenAI avec la clé API"""
        if self.client is None:
            # Lire la clé depuis la config, puis fallback sur la variable d'environnement
            api_key = current_app.config.get('OPENAI_API_KEY') or os.getenv('OPENAI_API_KEY')

            if not api_key:
                raise ValueError("OPENAI_API_KEY non configurée. Ajoutez-la dans .env ou définissez la variable d'environnement OPENAI_API_KEY")

            # Vérification basique du format pour éviter les saisies évidentes
            if not isinstance(api_key, str) or not api_key.startswith('sk-'):
                # Ne pas afficher la clé en clair dans les logs
                current_app.logger.warning('OPENAI_API_KEY semble invalide. Veuillez vérifier la clé.')

            # Initialiser le client sans exposer la clé dans les logs (OpenAI v1+ compatible)
            self.client = OpenAI(api_key=api_key)
        return self.client

    def analyze_cv(self, cv_text, job_context=None):
        """
        Analyse un CV avec l'IA et retourne des scores et recommandations

        Args:
            cv_text: Texte extrait du CV
            job_context: Contexte optionnel du poste visé

        Returns:
            dict: Résultats de l'analyse avec scores et recommandations
        """
        try:
            client = self._get_client()
            model = current_app.config.get('OPENAI_MODEL', 'gpt-4o-mini')

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

            user_prompt = f"Analyse ce CV:\n\n{cv_text}"

            if job_context:
                user_prompt += f"\n\nContexte du poste visé: {job_context}"

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)

            # Ajouter des métadonnées
            result['ai_model'] = model
            result['ai_powered'] = True

            return result

        except Exception as e:
            current_app.logger.error(f"Erreur analyse IA: {str(e)}")
            # Fallback vers l'analyse basique si l'IA échoue
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
                    "message": "L'analyse IA n'a pas pu être effectuée. Vérifiez la configuration de l'API OpenAI."
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
            client = self._get_client()
            model = current_app.config.get('OPENAI_MODEL', 'gpt-4o-mini')

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

            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )

            return json.loads(response.choices[0].message.content)

        except Exception as e:
            current_app.logger.error(f"Erreur recommandations IA: {str(e)}")
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
            client = self._get_client()
            model = current_app.config.get('OPENAI_MODEL', 'gpt-4o-mini')

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

            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=800
            )

            return response.choices[0].message.content

        except Exception as e:
            current_app.logger.error(f"Erreur génération lettre: {str(e)}")
            return None


# Instance globale du service
ai_analyzer_service = AIAnalyzerService()
