"""
================================================================
Helpers - BaraCorrespondance AI
================================================================
Fonctions utilitaires pour les réponses API et autres
"""

from flask import jsonify


def success_response(data=None, message="Succès", status_code=200):
    """
    Créer une réponse de succès standardisée
    
    Args:
        data: Données à retourner (dict ou list)
        message: Message de succès
        status_code: Code HTTP (défaut: 200)
        
    Returns:
        tuple: (Response, status_code)
    """
    response = {
        'success': True,
        'message': message
    }
    
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code


def error_response(message="Une erreur est survenue", status_code=400, errors=None):
    """
    Créer une réponse d'erreur standardisée
    
    Args:
        message: Message d'erreur
        status_code: Code HTTP (défaut: 400)
        errors: Détails des erreurs (dict ou list)
        
    Returns:
        tuple: (Response, status_code)
    """
    response = {
        'success': False,
        'message': message
    }
    
    if errors:
        response['errors'] = errors
    
    return jsonify(response), status_code


def paginated_response(items, total, page, per_page, message="Succès"):
    """
    Créer une réponse paginée standardisée
    
    Args:
        items: Liste des éléments de la page courante
        total: Nombre total d'éléments
        page: Numéro de page actuel
        per_page: Nombre d'éléments par page
        message: Message de succès
        
    Returns:
        tuple: (Response, 200)
    """
    total_pages = (total + per_page - 1) // per_page if per_page > 0 else 0
    
    response = {
        'success': True,
        'message': message,
        'data': {
            'items': items,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        }
    }
    
    return jsonify(response), 200


def format_datetime(dt, format='%d/%m/%Y %H:%M'):
    """
    Formater une date pour l'affichage
    
    Args:
        dt: Objet datetime
        format: Format de sortie
        
    Returns:
        str: Date formatée ou None
    """
    if dt is None:
        return None
    return dt.strftime(format)


def format_currency(amount, currency='GNF'):
    """
    Formater un montant monétaire
    
    Args:
        amount: Montant
        currency: Code devise
        
    Returns:
        str: Montant formaté
    """
    if amount is None:
        return None
    
    # Formater avec séparateurs de milliers
    formatted = "{:,.0f}".format(amount).replace(',', ' ')
    return f"{formatted} {currency}"


def calculate_percentage(value, total):
    """
    Calculer un pourcentage
    
    Args:
        value: Valeur
        total: Total
        
    Returns:
        float: Pourcentage arrondi
    """
    if total == 0:
        return 0
    return round((value / total) * 100, 1)


def truncate_text(text, max_length=100, suffix='...'):
    """
    Tronquer un texte avec suffixe
    
    Args:
        text: Texte à tronquer
        max_length: Longueur max
        suffix: Suffixe à ajouter
        
    Returns:
        str: Texte tronqué
    """
    if not text:
        return text
    
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def slugify(text):
    """
    Convertir un texte en slug URL-friendly
    
    Args:
        text: Texte à convertir
        
    Returns:
        str: Slug
    """
    import re
    import unicodedata
    
    if not text:
        return ''
    
    # Normaliser les caractères Unicode
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # Convertir en minuscules
    text = text.lower()
    
    # Remplacer les espaces et caractères spéciaux par des tirets
    text = re.sub(r'[^a-z0-9]+', '-', text)
    
    # Supprimer les tirets en début/fin
    text = text.strip('-')
    
    return text


def get_file_size_display(size_bytes):
    """
    Convertir une taille de fichier en format lisible
    
    Args:
        size_bytes: Taille en bytes
        
    Returns:
        str: Taille formatée (ex: "2.5 MB")
    """
    if size_bytes is None:
        return None
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    
    return f"{size_bytes:.1f} TB"


def safe_int(value, default=0):
    """
    Convertir une valeur en entier de manière sécurisée
    
    Utilisé pour JWT identity (type string) vers user_id (type int)
    
    Args:
        value: Valeur à convertir (None, str, int)
        default: Valeur par défaut si conversion échoue (défaut: 0)
        
    Returns:
        int: Valeur convertie ou défaut
        
    Example:
        >>> safe_int("42")
        42
        >>> safe_int(None)
        0
        >>> safe_int("invalid", default=-1)
        -1
    """
    if value is None:
        return default
    
    try:
        result = int(value)
        if result < 0:
            # Log negative IDs as suspicious (user_id should be positive)
            from flask import current_app
            current_app.logger.warning(f"safe_int() received negative value: {value}")
            return default
        return result
    except (TypeError, ValueError):
        # Log conversion failures for debugging
        from flask import current_app
        current_app.logger.debug(f"safe_int() failed to convert {type(value).__name__}: {repr(value)}")
        return default


def safe_float(value, default=0.0):
    """
    Convertir une valeur en float de manière sécurisée
    
    Args:
        value: Valeur à convertir
        default: Valeur par défaut si conversion échoue
        
    Returns:
        float: Valeur convertie ou défaut
    """
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def merge_dicts(*dicts):
    """
    Fusionner plusieurs dictionnaires
    
    Args:
        *dicts: Dictionnaires à fusionner
        
    Returns:
        dict: Dictionnaire fusionné
    """
    result = {}
    for d in dicts:
        if d:
            result.update(d)
    return result
