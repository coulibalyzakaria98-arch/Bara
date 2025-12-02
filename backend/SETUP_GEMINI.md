# Configuration de Google Gemini pour BaraCorrespondance AI

## 🎉 Pourquoi Gemini ?

**Google Gemini** est une alternative **GRATUITE** et performante à OpenAI pour l'analyse de CV et la génération de contenu. Aucune carte bancaire requise !

### Avantages :
- ✅ **100% Gratuit** jusqu'à 15 requêtes/minute
- ✅ Performant et rapide
- ✅ Multilingue (Français, Anglais, Arabe, etc.)
- ✅ API simple et stable
- ✅ Pas de limite mensuelle

---

## 📋 Étapes de configuration

### 1. Obtenir une clé API Gemini (2 minutes)

1. **Visitez Google AI Studio** : [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Connectez-vous** avec votre compte Google

3. **Cliquez sur "Create API Key"**

4. **Copiez la clé** qui commence par `AIza...`

---

### 2. Configurer l'application

1. **Créez le fichier `.env`** (s'il n'existe pas déjà) :
   ```bash
   cp .env.example .env
   ```

2. **Ajoutez votre clé Gemini** dans `.env` :
   ```bash
   # Google Gemini API (GRATUIT)
   GEMINI_API_KEY=AIzaSyDvotre_cle_ici
   ```

3. **Installez les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

---

### 3. Démarrer l'application

```bash
python run.py
```

L'analyse de CV et la génération d'affiches fonctionneront automatiquement avec Gemini ! 🚀

---

## 🔧 Vérification

Pour tester que Gemini fonctionne :

1. Démarrez le backend
2. Uploadez un CV via le frontend
3. Vérifiez dans les logs :
   ```
   🔍 Analyse CV avec Gemini...
   ✅ Analyse terminée - Score: 85/100
   ```

---

## 🆚 Gemini vs OpenAI

| Fonctionnalité | Gemini | OpenAI |
|----------------|--------|--------|
| **Prix** | Gratuit | Payant |
| **Qualité** | Excellente | Excellente |
| **Vitesse** | Rapide | Rapide |
| **Limite** | 15 req/min | Selon plan |
| **Setup** | Simple | Simple |

---

## 🐛 Dépannage

### Erreur : "GEMINI_API_KEY non configurée"
**Solution** : Vérifiez que la clé est bien dans le fichier `.env`

### Erreur : "Invalid API key"
**Solution** : Vérifiez que la clé commence par `AIza` et qu'elle est correcte

### Erreur : "Rate limit exceeded"
**Solution** : Attendez 1 minute (limite de 15 requêtes/minute)

---

## 📚 Ressources

- [Documentation Gemini](https://ai.google.dev/docs)
- [Exemples de code](https://github.com/google/generative-ai-python)
- [Limites gratuites](https://ai.google.dev/pricing)

---

## 🔄 Revenir à OpenAI

Si vous préférez utiliser OpenAI :

1. Ajoutez votre clé OpenAI dans `.env` :
   ```bash
   OPENAI_API_KEY=sk-votre_cle_openai
   ```

2. Modifiez `cv_analyzer.py` ligne 83 pour utiliser `ai_analyzer_service` au lieu de `gemini_analyzer_service`

3. Modifiez `poster_generator.py` de la même façon

---

Besoin d'aide ? Créez une issue sur GitHub ! 🙋‍♂️
