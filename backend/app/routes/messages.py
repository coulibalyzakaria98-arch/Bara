"""
================================================================
Routes Messages - BaraCorrespondance AI
================================================================
Gestion de la messagerie entre candidats et entreprises
"""

from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_

from app import db
from app.models import User, Candidate, Company, Match, Message
from app.utils.helpers import success_response, error_response, safe_int
from app.models.notification import create_notification

messages_bp = Blueprint('messages', __name__)


@messages_bp.route('/<int:match_id>', methods=['GET'])
@jwt_required()
def get_messages(match_id):
    """
    Récupérer tous les messages d'un match

    Permissions:
    - Candidat ou entreprise du match
    - Match doit être mutual_interest
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    # Récupérer le match
    match = Match.query.get(match_id)
    if not match:
        return error_response("Match non trouvé", 404)

    # Vérifier les permissions
    if user.role == 'candidate':
        candidate = user.candidate
        if not candidate or match.candidate_id != candidate.id:
            return error_response("Accès non autorisé", 403)
    elif user.role == 'company':
        company = user.company
        if not company or match.job.company_id != company.id:
            return error_response("Accès non autorisé", 403)
    else:
        return error_response("Accès non autorisé", 403)

    # Vérifier que le match est mutuel
    if not match.is_mutual_interest:
        return error_response("La messagerie n'est disponible que pour les matchs mutuels", 403)

    # Récupérer les messages
    messages = Message.query.filter_by(match_id=match_id).order_by(Message.created_at.asc()).all()

    # Marquer les messages de l'autre partie comme lus
    for message in messages:
        if user.role == 'candidate' and message.sender_type == 'company':
            message.mark_as_read()
        elif user.role == 'company' and message.sender_type == 'candidate':
            message.mark_as_read()

    return success_response({
        'messages': [msg.to_dict() for msg in messages],
        'match': match.to_dict()
    })


@messages_bp.route('/<int:match_id>', methods=['POST'])
@jwt_required()
def send_message(match_id):
    """
    Envoyer un message

    Body:
    {
        "content": "Message text"
    }
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    # Validation
    data = request.get_json()
    content = data.get('content', '').strip()

    if not content:
        return error_response("Le message ne peut pas être vide", 400)

    if len(content) > 2000:
        return error_response("Le message est trop long (max 2000 caractères)", 400)

    # Récupérer le match
    match = Match.query.get(match_id)
    if not match:
        return error_response("Match non trouvé", 404)

    # Vérifier les permissions et déterminer le type d'expéditeur
    sender_type = None
    sender_id = None
    recipient_user_id = None

    if user.role == 'candidate':
        candidate = user.candidate
        if not candidate or match.candidate_id != candidate.id:
            return error_response("Accès non autorisé", 403)
        sender_type = 'candidate'
        sender_id = candidate.id
        # Récupérer l'user_id de l'entreprise
        recipient_user_id = match.job.company.user.id if match.job.company.user else None
    elif user.role == 'company':
        company = user.company
        if not company or match.job.company_id != company.id:
            return error_response("Accès non autorisé", 403)
        sender_type = 'company'
        sender_id = company.id
        # Récupérer l'user_id du candidat
        recipient_user_id = match.candidate.user.id if match.candidate.user else None
    else:
        return error_response("Accès non autorisé", 403)

    # Vérifier que le match est mutuel
    if not match.is_mutual_interest:
        return error_response("La messagerie n'est disponible que pour les matchs mutuels", 403)

    try:
        # Créer le message
        message = Message(
            match_id=match_id,
            sender_type=sender_type,
            sender_id=sender_id,
            content=content
        )
        db.session.add(message)
        db.session.commit()

        # Envoyer une notification au destinataire
        if recipient_user_id:
            try:
                sender_name = user.full_name or user.email
                notification_message = f"Nouveau message de {sender_name}"

                create_notification(
                    user_id=recipient_user_id,
                    notification_type='message',
                    title='Nouveau message',
                    message=notification_message,
                    data={
                        'match_id': match_id,
                        'message_id': message.id,
                        'sender_type': sender_type
                    }
                )
            except Exception as e:
                current_app.logger.error(f"Erreur création notification: {e}")

        return success_response(
            message.to_dict(),
            "Message envoyé",
            201
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur envoi message: {e}")
        return error_response(f"Erreur lors de l'envoi: {str(e)}", 500)


@messages_bp.route('/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_read(message_id):
    """Marquer un message comme lu"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    message = Message.query.get(message_id)
    if not message:
        return error_response("Message non trouvé", 404)

    # Vérifier que c'est le destinataire
    match = message.match
    can_read = False

    if user.role == 'candidate' and message.sender_type == 'company':
        can_read = match.candidate_id == user.candidate.id
    elif user.role == 'company' and message.sender_type == 'candidate':
        can_read = match.job.company_id == user.company.id

    if not can_read:
        return error_response("Accès non autorisé", 403)

    message.mark_as_read()

    return success_response(message.to_dict(), "Message marqué comme lu")


@messages_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Récupérer le nombre de messages non lus"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    # Compter les messages non lus
    unread_count = 0

    if user.role == 'candidate':
        candidate = user.candidate
        if candidate:
            # Messages des entreprises non lus
            unread_count = Message.query.join(Match).filter(
                Match.candidate_id == candidate.id,
                Message.sender_type == 'company',
                Message.is_read == False
            ).count()
    elif user.role == 'company':
        company = user.company
        if company:
            # Messages des candidats non lus
            from app.models import Job
            unread_count = Message.query.join(Match).join(Job).filter(
                Job.company_id == company.id,
                Message.sender_type == 'candidate',
                Message.is_read == False
            ).count()

    return success_response({
        'unread_count': unread_count
    })
