"""
================================================================
Email Service - BaraCorrespondance AI
================================================================
Service d'envoi d'emails avec templates HTML
"""

from flask import current_app, render_template_string
from flask_mail import Message
from threading import Thread
from app import mail


def send_async_email(app, msg):
    """Envoi asynchrone d'email"""
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            current_app.logger.error(f"Erreur envoi email: {e}")


def send_email(to, subject, html_body, text_body=None):
    """
    Envoyer un email

    Args:
        to: email destinataire
        subject: sujet
        html_body: corps HTML
        text_body: corps texte (optionnel)
    """
    msg = Message(
        subject=f"[BaraCorrespondance] {subject}",
        sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@baracorrespondance.com'),
        recipients=[to] if isinstance(to, str) else to
    )

    msg.html = html_body
    msg.body = text_body or html_body

    # Envoi asynchrone
    Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()


# ================================================================
# TEMPLATES EMAIL
# ================================================================

def get_email_template(title, content, cta_text=None, cta_link=None):
    """Template de base pour les emails"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; }}
            .footer {{ background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
            .logo {{ font-size: 32px; margin-bottom: 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚀</div>
                <h1 style="margin: 0;">BaraCorrespondance AI</h1>
            </div>
            <div class="content">
                <h2>{title}</h2>
                {content}
                {f'<a href="{cta_link}" class="button">{cta_text}</a>' if cta_text and cta_link else ''}
            </div>
            <div class="footer">
                <p>&copy; 2024 BaraCorrespondance AI. Tous droits réservés.</p>
                <p>Plateforme de matching CV-Entreprise avec IA</p>
            </div>
        </div>
    </body>
    </html>
    """


# ================================================================
# EMAILS SPÉCIFIQUES
# ================================================================

def send_welcome_email(user_email, user_name, user_role):
    """Email de bienvenue"""
    content = f"""
        <p>Bonjour <strong>{user_name}</strong>,</p>
        <p>Bienvenue sur <strong>BaraCorrespondance AI</strong> ! 🎉</p>
        <p>Votre compte <strong>{user_role}</strong> a été créé avec succès.</p>
        <p>Notre intelligence artificielle est prête à vous aider à {'trouver les meilleurs talents' if user_role == 'company' else 'trouver votre emploi idéal'}.</p>
        <p><strong>Prochaines étapes :</strong></p>
        <ul>
            <li>{'Complétez votre profil entreprise' if user_role == 'company' else 'Uploadez votre CV pour analyse IA'}</li>
            <li>{'Créez votre première offre d\'emploi' if user_role == 'company' else 'Explorez les offres d\'emploi correspondantes'}</li>
            <li>{'Découvrez les candidats matchés' if user_role == 'company' else 'Postulez aux offres qui vous intéressent'}</li>
        </ul>
    """

    html = get_email_template(
        "Bienvenue sur BaraCorrespondance AI !",
        content,
        "Accéder à mon compte",
        "http://localhost:5173/login"
    )

    send_email(user_email, "Bienvenue !", html)


def send_new_match_email(user_email, user_name, match_info):
    """Email pour nouveau match"""
    content = f"""
        <p>Bonjour <strong>{user_name}</strong>,</p>
        <p>🎯 <strong>Nouveau match trouvé !</strong></p>
        <p>Notre IA a détecté une correspondance parfaite pour vous :</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">{match_info['title']}</h3>
            <p><strong>Score de matching :</strong> {match_info['score']}%</p>
            <p>{match_info['description']}</p>
        </div>
        <p>Ne laissez pas passer cette opportunité !</p>
    """

    html = get_email_template(
        "Nouveau Match Trouvé !",
        content,
        "Voir le match",
        f"http://localhost:5173/matches/{match_info['id']}"
    )

    send_email(user_email, "Nouveau match trouvé !", html)


def send_application_status_email(user_email, user_name, job_title, status):
    """Email pour changement de statut de candidature"""
    status_messages = {
        'reviewed': '👀 Votre candidature a été consultée',
        'accepted': '🎉 Votre candidature a été acceptée !',
        'rejected': '😔 Votre candidature n\'a pas été retenue',
        'interview': '📅 Vous êtes invité à un entretien !'
    }

    status_colors = {
        'reviewed': '#06b6d4',
        'accepted': '#10b981',
        'rejected': '#ef4444',
        'interview': '#f59e0b'
    }

    content = f"""
        <p>Bonjour <strong>{user_name}</strong>,</p>
        <div style="background: {status_colors.get(status, '#06b6d4')}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0;">{status_messages.get(status, 'Mise à jour de candidature')}</h2>
        </div>
        <p>Concernant votre candidature pour le poste de <strong>{job_title}</strong>.</p>
        {'<p>Félicitations ! L\'entreprise souhaite vous rencontrer.</p>' if status == 'accepted' or status == 'interview' else ''}
        {'<p>Continuez vos recherches, d\'autres opportunités vous attendent !</p>' if status == 'rejected' else ''}
    """

    html = get_email_template(
        "Mise à jour de votre candidature",
        content,
        "Voir ma candidature",
        "http://localhost:5173/applications"
    )

    send_email(user_email, f"Candidature {job_title}", html)


def send_new_message_email(user_email, user_name, sender_name, message_preview):
    """Email pour nouveau message"""
    content = f"""
        <p>Bonjour <strong>{user_name}</strong>,</p>
        <p>💬 Vous avez reçu un nouveau message de <strong>{sender_name}</strong> :</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <p style="font-style: italic; margin: 0;">"{message_preview}"</p>
        </div>
        <p>Répondez rapidement pour maintenir la conversation !</p>
    """

    html = get_email_template(
        "Nouveau Message Reçu",
        content,
        "Répondre maintenant",
        "http://localhost:5173/messages"
    )

    send_email(user_email, f"Nouveau message de {sender_name}", html)


def send_weekly_digest_email(user_email, user_name, stats):
    """Email récapitulatif hebdomadaire"""
    content = f"""
        <p>Bonjour <strong>{user_name}</strong>,</p>
        <p>📊 Voici votre récapitulatif de la semaine :</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cette semaine</h3>
            <ul>
                <li><strong>{stats.get('new_matches', 0)}</strong> nouveaux matchs</li>
                <li><strong>{stats.get('profile_views', 0)}</strong> vues de profil</li>
                <li><strong>{stats.get('applications', 0)}</strong> candidatures</li>
                <li><strong>{stats.get('messages', 0)}</strong> messages échangés</li>
            </ul>
        </div>
        <p>Continuez sur cette lancée ! 💪</p>
    """

    html = get_email_template(
        "Votre Récapitulatif Hebdomadaire",
        content,
        "Voir mon tableau de bord",
        "http://localhost:5173/dashboard"
    )

    send_email(user_email, "Votre récapitulatif hebdomadaire", html)


def send_cv_analysis_complete_email(user_email, user_name, score):
    """Email après analyse de CV"""
    content = f"""
        <p>Bonjour <strong>{user_name}</strong>,</p>
        <p>✅ L'analyse IA de votre CV est terminée !</p>
        <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #06b6d4; font-size: 48px; margin: 0;">{score}/100</h2>
            <p style="margin: 10px 0 0 0; color: #64748b;">Score de votre CV</p>
        </div>
        <p>Consultez votre analyse détaillée et nos recommandations pour améliorer votre CV.</p>
    """

    html = get_email_template(
        "Analyse de CV Terminée",
        content,
        "Voir l'analyse complète",
        "http://localhost:5173/dashboard"
    )

    send_email(user_email, "Votre CV a été analysé", html)
