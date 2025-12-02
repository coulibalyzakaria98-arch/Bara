"""
================================================================
Service de Génération d'Affiches IA - BaraCorrespondance AI
================================================================
Utilise l'IA pour générer du contenu attractif pour les affiches d'emploi
"""

import json
import time
import os
from flask import current_app
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime

# Try to import Gemini analyzer module (optional - requires google-generativeai)
try:
    import app.services.gemini_analyzer as gemini_module
    gemini_analyzer_service = getattr(gemini_module, 'gemini_analyzer_service', None)
    GEMINI_AVAILABLE = getattr(gemini_module, 'GENAI_AVAILABLE', False)
except (ImportError, ModuleNotFoundError):
    gemini_analyzer_service = None
    GEMINI_AVAILABLE = False


class PosterGeneratorService:
    """Service de génération d'affiches d'emploi avec IA"""

    def __init__(self):
        pass

    def generate_poster_content(self, job_data):
        """
        Génère du contenu attractif pour une affiche d'emploi avec Gemini

        Args:
            job_data: Dictionnaire contenant les infos du job

        Returns:
            dict: Contenu généré pour l'affiche
        """
        try:
            # Vérifier que Gemini est disponible ET configuré
            api_key = current_app.config.get('GEMINI_API_KEY') or None
            if GEMINI_AVAILABLE and gemini_analyzer_service and api_key:
                return gemini_analyzer_service.generate_poster_content(job_data)
            else:
                # Fallback si Gemini non disponible
                return self._generate_fallback_content(job_data)

        except Exception as e:
            current_app.logger.error(f"Erreur génération contenu affiche: {str(e)}")
            return self._generate_fallback_content(job_data)

    def _generate_fallback_content(self, job_data):
        """Génère du contenu par défaut si l'IA échoue"""
        return {
            'headline': f"Rejoignez {job_data.get('company_name', 'notre équipe')}!",
            'tagline': f"Nous recrutons: {job_data.get('title', 'Nouveau Poste')}",
            'description': f"Opportunité exceptionnelle à {job_data.get('location', 'découvrir')}",
            'keywords': job_data.get('required_skills', [])[:5],
            'call_to_action': 'Postulez maintenant!',
            'emoji_suggestions': ['💼', '🚀', '✨']
        }

    def create_poster_image(self, poster_data, output_path):
        """
        Crée une image d'affiche à partir des données

        Args:
            poster_data: dict avec title, headline, tagline, company_name, etc.
            output_path: Chemin où sauvegarder l'image

        Returns:
            dict: Informations sur l'image créée
        """
        start_time = time.time()

        try:
            # Dimensions de l'affiche (format portrait pour réseaux sociaux)
            width = poster_data.get('width', 1080)
            height = poster_data.get('height', 1920)

            # Créer l'image
            img = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(img)

            # Couleurs selon le schéma choisi
            color_scheme = poster_data.get('color_scheme', 'blue')
            colors = self._get_color_palette(color_scheme)

            # Dessiner l'arrière-plan avec gradient (simplifié)
            self._draw_background(img, draw, colors, poster_data.get('template_type', 'gradient'))

            # Charger les polices (fallback sur police système si non disponible)
            try:
                font_title = ImageFont.truetype("arial.ttf", 80)
                font_headline = ImageFont.truetype("arial.ttf", 60)
                font_tagline = ImageFont.truetype("arial.ttf", 40)
                font_text = ImageFont.truetype("arial.ttf", 35)
            except (OSError, IOError) as e:
                # Font file not found, use default system font
                from flask import current_app
                current_app.logger.debug(f"Arial font not found, using default font: {e}")
                font_title = ImageFont.load_default()
                font_headline = ImageFont.load_default()
                font_tagline = ImageFont.load_default()
                font_text = ImageFont.load_default()

            # Dessiner le contenu
            y_pos = 200

            # Titre du poste
            title = poster_data.get('title', 'Offre d\'emploi')
            self._draw_text_wrapped(draw, title, (width//2, y_pos), font_title, colors['text'], width-200, 'center')
            y_pos += 150

            # Headline
            headline = poster_data.get('ai_headline', '')
            if headline:
                self._draw_text_wrapped(draw, headline, (width//2, y_pos), font_headline, colors['primary'], width-200, 'center')
                y_pos += 120

            # Tagline
            tagline = poster_data.get('ai_tagline', '')
            if tagline:
                self._draw_text_wrapped(draw, tagline, (width//2, y_pos), font_tagline, colors['secondary'], width-200, 'center')
                y_pos += 100

            # Description
            description = poster_data.get('ai_description', '')
            if description:
                y_pos += 80
                self._draw_text_wrapped(draw, description, (width//2, y_pos), font_text, colors['text'], width-300, 'center')

            # Entreprise en bas
            y_pos = height - 300
            company_name = poster_data.get('company_name', '')
            if company_name:
                self._draw_text_wrapped(draw, company_name, (width//2, y_pos), font_headline, colors['primary'], width-200, 'center')

            # Call to action
            cta = poster_data.get('call_to_action', 'Postulez maintenant!')
            y_pos += 120
            # Dessiner un rectangle pour le CTA
            cta_width = 500
            cta_height = 80
            cta_x = (width - cta_width) // 2
            cta_y = y_pos - cta_height // 2
            draw.rounded_rectangle(
                [(cta_x, cta_y), (cta_x + cta_width, cta_y + cta_height)],
                radius=40,
                fill=colors['accent']
            )
            self._draw_text_wrapped(draw, cta, (width//2, y_pos), font_text, 'white', cta_width, 'center')

            # Sauvegarder l'image
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            img.save(output_path, 'PNG', quality=95)

            generation_time = time.time() - start_time

            return {
                'success': True,
                'file_path': output_path,
                'file_size': os.path.getsize(output_path),
                'width': width,
                'height': height,
                'generation_time': round(generation_time, 2)
            }

        except Exception as e:
            current_app.logger.error(f"Erreur création image: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def _get_color_palette(self, scheme):
        """Retourne une palette de couleurs selon le schéma"""
        palettes = {
            'blue': {
                'primary': '#06b6d4',
                'secondary': '#3b82f6',
                'accent': '#8b5cf6',
                'text': '#1e293b',
                'background': '#f0f9ff'
            },
            'purple': {
                'primary': '#8b5cf6',
                'secondary': '#a855f7',
                'accent': '#ec4899',
                'text': '#1e293b',
                'background': '#faf5ff'
            },
            'green': {
                'primary': '#10b981',
                'secondary': '#059669',
                'accent': '#14b8a6',
                'text': '#1e293b',
                'background': '#f0fdf4'
            },
            'orange': {
                'primary': '#f59e0b',
                'secondary': '#f97316',
                'accent': '#ef4444',
                'text': '#1e293b',
                'background': '#fffbeb'
            }
        }
        return palettes.get(scheme, palettes['blue'])

    def _draw_background(self, img, draw, colors, template_type):
        """Dessine l'arrière-plan de l'affiche"""
        width, height = img.size

        if template_type == 'gradient':
            # Gradient simplifié (du haut vers le bas)
            for i in range(height):
                ratio = i / height
                # Interpoler entre background et primary
                draw.line([(0, i), (width, i)], fill=colors['background'])
        else:
            # Fond uni
            draw.rectangle([(0, 0), (width, height)], fill=colors['background'])

    def _draw_text_wrapped(self, draw, text, position, font, color, max_width, align='left'):
        """Dessine du texte avec retour à la ligne automatique"""
        words = text.split(' ')
        lines = []
        current_line = []

        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            if bbox[2] - bbox[0] <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]

        if current_line:
            lines.append(' '.join(current_line))

        # Dessiner les lignes
        x, y = position
        line_height = 50
        total_height = len(lines) * line_height
        start_y = y - total_height // 2

        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]

            if align == 'center':
                text_x = x - text_width // 2
            elif align == 'right':
                text_x = x - text_width
            else:
                text_x = x

            draw.text((text_x, start_y + i * line_height), line, font=font, fill=color)


# Instance globale
poster_generator = PosterGeneratorService()
