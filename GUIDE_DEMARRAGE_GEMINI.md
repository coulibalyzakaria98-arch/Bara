# 🚀 Guide de Démarrage avec Google Gemini

## ✅ Configuration Terminée !

Votre clé API Gemini a été configurée avec succès dans le fichier `.env`.

---

## 📋 Prochaines Étapes

### Étape 1 : Installer Google Gemini (2 minutes)

Ouvrez un terminal dans le dossier `backend` et exécutez :

#### Windows :
```bash
install_gemini.bat
```

#### Mac/Linux :
```bash
pip install google-generativeai==0.3.2
pip install -r requirements.txt
python test_gemini.py
```

---

### Étape 2 : Démarrer l'Application

#### Backend :
```bash
cd backend
python run.py
```

Vous devriez voir :
```
 * Running on http://127.0.0.1:5000
```

#### Frontend :
```bash
cd frontend/baracorrespondance-frontend-complete
npm install    # Si première fois
npm run dev
```

Vous devriez voir :
```
Local: http://localhost:5173
```

---

## 🧪 Tester Gemini

### Test 1 : Analyse de CV

1. Ouvrez http://localhost:5173
2. Connectez-vous en tant que candidat
3. Uploadez un CV (PDF ou DOCX)
4. Vérifiez dans les logs du backend :

```
🔍 Analyse CV avec Gemini...
✅ Analyse terminée - Score: 85/100
```

### Test 2 : Génération d'Affiche

1. Connectez-vous en tant qu'entreprise
2. Allez dans "Affiches IA"
3. Créez une nouvelle affiche
4. Vérifiez dans les logs :

```
🎨 Génération contenu affiche avec Gemini: Développeur Full Stack
✅ Contenu généré: Rejoignez notre équipe innovante!
```

---

## 📊 Fonctionnalités avec Gemini

### ✅ Analyse de CV
- Extraction automatique de compétences
- Calcul de scores détaillés (technique, expérience, formation)
- Recommandations personnalisées d'amélioration
- Extraction d'informations (langues, certifications, etc.)

### ✅ Génération d'Affiches
- Titres accrocheurs
- Slogans percutants
- Descriptions attractives
- Mots-clés optimisés
- Appels à l'action

### ✅ Matching Intelligent
- Score de compatibilité CV-Job
- Raisons du match
- Suggestions de postes idéaux

---

## 🔧 Vérification de la Configuration

Votre fichier `.env` doit contenir :

```bash
# ===== CONFIGURATION IA =====
# Google Gemini API (GRATUIT - Activé)
GEMINI_API_KEY=AIzaSyABLmlImDCwuswXpN-0tlyVUFowzLFhv5E
```

✅ **Configuration correcte !**

---

## 🆘 Dépannage

### Erreur : "GEMINI_API_KEY non configurée"

**Solution :** Vérifiez que le fichier `.env` existe dans le dossier `backend` et contient la clé.

### Erreur : "No module named 'google.generativeai'"

**Solution :** Installez la dépendance :
```bash
pip install google-generativeai
```

### Erreur : "Invalid API key"

**Solution :** Vérifiez que la clé dans `.env` est correcte (commence par `AIza`).

### Limite de requêtes dépassée

**Solution :** Gemini gratuit limite à 15 requêtes/minute. Attendez 1 minute.

---

## 📈 Limites Gratuites de Gemini

- ✅ **15 requêtes/minute** (largement suffisant)
- ✅ **Illimité par jour**
- ✅ **Pas de carte bancaire requise**
- ✅ **Pas d'expiration**

---

## 🎯 Prochaines Fonctionnalités

1. ✅ **Système de candidatures** (Terminé)
2. ⏳ **Dashboard Analytics**
3. ⏳ **Recherche Avancée**
4. ⏳ **Système de Favoris**
5. ⏳ **Messagerie Interne**

---

## 🔒 Sécurité

**⚠️ IMPORTANT :** Ne partagez JAMAIS votre clé API publiquement !

- ❌ Ne commitez pas le fichier `.env` sur Git
- ✅ Le fichier `.gitignore` est déjà configuré
- ✅ Gardez votre clé privée

---

## 📞 Support

Besoin d'aide ?
1. Consultez `backend/SETUP_GEMINI.md` pour plus de détails
2. Exécutez `python test_gemini.py` pour diagnostiquer
3. Vérifiez les logs du backend pour les erreurs

---

## 🎉 Félicitations !

Votre application BaraCorrespondance AI est maintenant configurée avec Google Gemini !

**Prochaine étape :** Démarrez l'application et testez l'analyse de CV ! 🚀

---

*Généré pour BaraCorrespondance AI - Système de matching CV-Entreprise avec IA*
