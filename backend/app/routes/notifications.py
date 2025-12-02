"""
================================================================
Routes Notifications - BaraCorrespondance AI
================================================================
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app import db
from app.models import User, Notification
from app.utils.helpers import success_response, error_response, safe_int

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    Récupérer les notifications de l'utilisateur

    Query params:
    - limit: Nombre max (default: 20)
    - unread_only: true/false (default: false)
    """
    user_id = safe_int(get_jwt_identity())

    limit = request.args.get('limit', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'

    query = Notification.query.filter_by(user_id=user_id)

    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(
        Notification.created_at.desc()
    ).limit(limit).all()

    return success_response({
        'notifications': [n.to_dict() for n in notifications],
        'total': len(notifications),
        'unread_count': Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).count()
    })


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Récupérer le nombre de notifications non lues"""
    user_id = safe_int(get_jwt_identity())

    count = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).count()

    return success_response({
        'unread_count': count
    })


@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    """Marquer une notification comme lue"""
    user_id = safe_int(get_jwt_identity())

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first()

    if not notification:
        return error_response("Notification non trouvée", 404)

    notification.mark_as_read()
    db.session.commit()

    return success_response({
        'notification': notification.to_dict()
    })


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    """Marquer toutes les notifications comme lues"""
    user_id = safe_int(get_jwt_identity())

    notifications = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).all()

    for notification in notifications:
        notification.mark_as_read()

    db.session.commit()

    return success_response({
        'marked_count': len(notifications)
    })


@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Supprimer une notification"""
    user_id = safe_int(get_jwt_identity())

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first()

    if not notification:
        return error_response("Notification non trouvée", 404)

    db.session.delete(notification)
    db.session.commit()

    return success_response(message="Notification supprimée")


@notifications_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_all_notifications():
    """Supprimer toutes les notifications lues"""
    user_id = safe_int(get_jwt_identity())

    deleted = Notification.query.filter_by(
        user_id=user_id,
        is_read=True
    ).delete()

    db.session.commit()

    return success_response({
        'deleted_count': deleted
    }, message=f"{deleted} notification(s) supprimée(s)")
