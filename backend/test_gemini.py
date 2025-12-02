"""
Script de test pour vérifier que Gemini fonctionne correctement
"""

import os
import sys
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

print("=" * 60)
print("TEST DE CONFIGURATION GEMINI")
print("=" * 60)

# Vérifier que la clé est chargée
gemini_key = os.getenv('GEMINI_API_KEY')
if not gemini_key:
    print("❌ ERREUR : GEMINI_API_KEY non trouvée dans .env")
    sys.exit(1)

print(f"✅ Clé Gemini trouvée : {gemini_key[:20]}...")

# Tester l'import de google-generativeai
print("\n📦 Vérification des dépendances...")
try:
    import google.generativeai as genai
    print("✅ google-generativeai installé")
except ImportError:
    print("❌ google-generativeai NON installé")
    print("\n💡 Installez avec: pip install google-generativeai")
    sys.exit(1)

# Tester la connexion à Gemini
print("\n🔗 Test de connexion à Gemini...")
try:
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    # Test simple
    response = model.generate_content("Réponds simplement: OK")
    result = response.text.strip()

    print(f"✅ Connexion réussie ! Réponse: {result}")

except Exception as e:
    print(f"❌ Erreur de connexion : {str(e)}")
    sys.exit(1)

# Tester l'analyse de CV
print("\n🔍 Test d'analyse de CV...")
try:
    test_cv = """
    Jean Dupont
    jean.dupont@email.com
    +33 6 12 34 56 78

    Développeur Full Stack avec 5 ans d'expérience

    Compétences:
    - Python, JavaScript, React, Node.js
    - Docker, Kubernetes, AWS
    - PostgreSQL, MongoDB

    Expérience:
    Développeur Senior - TechCorp (2020-2024)
    - Développement d'applications web
    - Architecture microservices

    Formation:
    Master Informatique - Université Paris (2019)
    """

    prompt = f"""Analyse ce CV et retourne un JSON avec:
    {{"overall_score": <number 0-100>, "summary": "résumé court"}}

    CV:
    {test_cv}"""

    response = model.generate_content(prompt)
    result = response.text.strip()

    # Nettoyer le markdown
    if result.startswith('```json'):
        result = result[7:-3].strip()
    elif result.startswith('```'):
        result = result[3:-3].strip()

    import json
    data = json.loads(result)

    print(f"✅ Analyse réussie !")
    print(f"   Score: {data.get('overall_score', 'N/A')}/100")
    print(f"   Résumé: {data.get('summary', 'N/A')[:60]}...")

except Exception as e:
    print(f"❌ Erreur d'analyse : {str(e)}")
    sys.exit(1)

# Tester la génération de contenu d'affiche
print("\n🎨 Test de génération d'affiche...")
try:
    job_data = {
        'title': 'Développeur Python',
        'company_name': 'TechStart',
        'location': 'Paris',
        'description': 'Rejoignez notre équipe pour développer des solutions innovantes'
    }

    prompt = f"""Génère du contenu pour une affiche de recrutement:
    Poste: {job_data['title']}
    Entreprise: {job_data['company_name']}
    Lieu: {job_data['location']}

    Retourne un JSON avec:
    {{"headline": "titre accrocheur", "tagline": "slogan"}}"""

    response = model.generate_content(prompt)
    result = response.text.strip()

    if result.startswith('```json'):
        result = result[7:-3].strip()
    elif result.startswith('```'):
        result = result[3:-3].strip()

    data = json.loads(result)

    print(f"✅ Génération réussie !")
    print(f"   Headline: {data.get('headline', 'N/A')}")
    print(f"   Tagline: {data.get('tagline', 'N/A')}")

except Exception as e:
    print(f"❌ Erreur de génération : {str(e)}")
    sys.exit(1)

print("\n" + "=" * 60)
print("🎉 TOUS LES TESTS SONT PASSÉS !")
print("=" * 60)
print("\n✨ Gemini est prêt à être utilisé avec votre application !")
print("   Démarrez le backend avec: python run.py")
print("=" * 60)
