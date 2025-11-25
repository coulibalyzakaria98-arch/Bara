"""
================================================================
Validateurs - BaraCorrespondance AI
================================================================
Fonctions de validation des données d'entrée
"""

import re
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename


# Extensions autorisées
ALLOWED_CV_EXTENSIONS = {'pdf', 'doc', 'docx'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def validate_email(email):
    """
    Valider le format d'une adresse email
    
    Args:
        email: Adresse email à valider
        
    Returns:
        bool: True si valide
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password):
    """
    Valider la force d'un mot de passe
    
    Critères:
    - Minimum 8 caractères
    - Au moins une majuscule
    - Au moins une minuscule
    - Au moins un chiffre
    
    Args:
        password: Mot de passe à valider
        
    Returns:
        tuple: (is_valid, message)
    """
    if not password:
        return False, "Le mot de passe est requis"
    
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    
    if not re.search(r'[A-Z]', password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    
    if not re.search(r'[a-z]', password):
        return False, "Le mot de passe doit contenir au moins une minuscule"
    
    if not re.search(r'\d', password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    
    return True, "OK"


def validate_phone(phone):
    """
    Valider le format d'un numéro de téléphone
    
    Args:
        phone: Numéro de téléphone
        
    Returns:
        bool: True si valide
    """
    if not phone:
        return False
    
    # Nettoyer le numéro
    cleaned = re.sub(r'[\s\-\.\(\)]', '', phone)
    
    # Pattern: optionnel + suivi de 8-15 chiffres
    pattern = r'^\+?[0-9]{8,15}$'
    return bool(re.match(pattern, cleaned))


def allowed_cv_file(filename):
    """
    Vérifier si le fichier est un CV autorisé
    
    Args:
        filename: Nom du fichier
        
    Returns:
        bool: True si autorisé
    """
    if not filename or '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_CV_EXTENSIONS


def allowed_image_file(filename):
    """
    Vérifier si le fichier est une image autorisée
    
    Args:
        filename: Nom du fichier
        
    Returns:
        bool: True si autorisé
    """
    if not filename or '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_IMAGE_EXTENSIONS


def generate_unique_filename(original_filename, prefix=''):
    """
    Générer un nom de fichier unique
    
    Args:
        original_filename: Nom original du fichier
        prefix: Préfixe optionnel
        
    Returns:
        str: Nom de fichier unique et sécurisé
    """
    # Obtenir l'extension
    ext = ''
    if '.' in original_filename:
        ext = original_filename.rsplit('.', 1)[1].lower()
    
    # Générer un identifiant unique
    unique_id = uuid.uuid4().hex[:12]
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    
    # Construire le nom
    if prefix:
        filename = f"{prefix}_{timestamp}_{unique_id}"
    else:
        filename = f"{timestamp}_{unique_id}"
    
    if ext:
        filename = f"{filename}.{ext}"
    
    return secure_filename(filename)


def validate_hex_color(color):
    """
    Valider un code couleur hexadécimal
    
    Args:
        color: Code couleur (#RRGGBB)
        
    Returns:
        bool: True si valide
    """
    if not color:
        return False
    
    pattern = r'^#[0-9A-Fa-f]{6}$'
    return bool(re.match(pattern, color))


def validate_url(url):
    """
    Valider le format d'une URL
    
    Args:
        url: URL à valider
        
    Returns:
        bool: True si valide
    """
    if not url:
        return False
    
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url))


def sanitize_string(text, max_length=None):
    """
    Nettoyer une chaîne de caractères
    
    Args:
        text: Texte à nettoyer
        max_length: Longueur maximale
        
    Returns:
        str: Texte nettoyé
    """
    if not text:
        return text
    
    # Supprimer les espaces multiples
    text = ' '.join(text.split())
    text = text.strip()
    
    # Tronquer si nécessaire
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_date_string(date_str, format='%Y-%m-%d'):
    """
    Valider et parser une date
    
    Args:
        date_str: Date en string
        format: Format attendu
        
    Returns:
        tuple: (is_valid, datetime_obj or error_message)
    """
    if not date_str:
        return False, "Date requise"
    
    try:
        dt = datetime.strptime(date_str, format)
        return True, dt
    except ValueError:
        return False, f"Format de date invalide. Utilisez {format}"


def validate_required_fields(data, required_fields):
    """
    Vérifier que tous les champs requis sont présents
    
    Args:
        data: Dictionnaire de données
        required_fields: Liste des champs requis
        
    Returns:
        tuple: (is_valid, list of missing fields)
    """
    if not data:
        return False, required_fields
    
    missing = []
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            missing.append(field)
    
    return len(missing) == 0, missing
