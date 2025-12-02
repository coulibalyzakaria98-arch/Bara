# 🚀 Quick Start - Guide d'Utilisation Rapide

## Installation des Dépendances

Les packages suivants sont déjà installés dans le projet:

```bash
npm install
```

## Lancement du Frontend

```bash
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173/`

## Structure du Projet

```
src/
├── components/
│   ├── common/              # Composants réutilisables
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── HeroSection.jsx
│   │   ├── JobCard.jsx
│   │   ├── StatisticsCard.jsx
│   │   ├── Form.jsx
│   │   ├── OnboardingTour.jsx
│   │   └── index.js
│   ├── candidate/           # Composants candidat
│   ├── company/             # Composants entreprise
│   └── shared/              # Composants partagés
├── styles/
│   ├── index.css            # Styles globaux (variables, animations)
│   └── modern-design.css    # Design system complet
├── theme.js                 # Configuration des couleurs
└── App.jsx                  # Composant racine
```

## Utilisation des Composants

### Header

```jsx
import { Header } from './components/common';

function Dashboard() {
  return (
    <Header 
      user={currentUser}
      onLogout={handleLogout}
      currentView={view}
      setCurrentView={setView}
    />
  );
}
```

### HeroSection

```jsx
import { HeroSection } from './components/common';

<HeroSection 
  title="Trouvez votre opportunité"
  subtitle="Avec intelligence artificielle"
  features={['IA', 'Rapide', 'Gratuit']}
  cta={{
    primaryLabel: 'Commencer',
    onPrimary: handleStart
  }}
/>
```

### JobCard

```jsx
import { JobCard } from './components/common';

<JobCard 
  job={jobData}
  onApply={handleApply}
  isFavorite={isFav}
  onToggleFavorite={toggleFav}
/>
```

### Formulaires

```jsx
import { Form, FormField, FormGroup } from './components/common';

<Form onSubmit={handleSubmit}>
  <FormGroup title="Contact">
    <FormField 
      label="Email"
      type="email"
      placeholder="votre@email.com"
      value={email}
      onChange={handleChange}
      required
    />
  </FormGroup>
</Form>
```

## Classes CSS Disponibles

### Boutons
```html
<!-- Primaire -->
<button class="btn btn-primary">Clic-moi</button>

<!-- Secondaire -->
<button class="btn btn-secondary">Secondaire</button>

<!-- Outline -->
<button class="btn btn-outline">Outline</button>

<!-- Tailles -->
<button class="btn btn-sm">Petit</button>
<button class="btn btn-lg">Large</button>
```

### Cartes
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Titre de la carte</h3>
  </div>
  <!-- Contenu -->
</div>
```

### Badges
```html
<span class="badge badge-primary">Badge</span>
<span class="badge badge-success">Succès</span>
<span class="badge badge-warning">Attention</span>
<span class="badge badge-error">Erreur</span>
```

### Tags
```html
<span class="tag">Tag</span>
<span class="tag active">Tag Actif</span>
```

### Alertes
```html
<div class="alert alert-info">Information</div>
<div class="alert alert-success">Succès!</div>
<div class="alert alert-warning">Attention</div>
<div class="alert alert-error">Erreur</div>
```

## Couleurs

### Utiliser les Couleurs

```javascript
import { theme, getColor, getGradient } from './theme';

// Accéder à une couleur
const mainBlue = getColor('colors.primary.500');
const gradient = getGradient('primary');
```

### Palette Bleu/Blanc

```css
/* CSS */
color: var(--color-primary);           /* #0090ff */
background: var(--color-white);        /* #ffffff */
border-color: var(--color-border);     /* #e5e7eb */
```

## Animations

Tous les composants utilisent **Framer Motion** pour les animations fluides:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  whileHover={{ scale: 1.05 }}
>
  Contenu
</motion.div>
```

## Tailwind CSS

Vous pouvez aussi utiliser les classes Tailwind directement:

```jsx
<div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
  <span>Contenu</span>
</div>
```

### Classes Courantes

```
Flexbox:
- flex, flex-col, flex-row
- items-center, justify-between
- gap-4

Spacing:
- p-4 (padding)
- m-4 (margin)
- px-4, py-2 (padding horizontal/vertical)

Colors:
- text-primary-600
- bg-blue-50
- border-blue-200

Sizing:
- w-full, h-12
- min-h-screen, max-w-2xl

Responsive:
- hidden md:flex (hidden on mobile, flex on tablet+)
- sm:, md:, lg:, xl:, 2xl:
```

## Configuration

### Tailwind Config

Le fichier `tailwind.config.js` définit:
- Couleurs personnalisées (primaire bleu, secondaire, accent)
- Polices de caractères
- Animations

### Variables CSS

Les variables sont définies dans `src/styles/index.css`:
- Couleurs: `--color-primary`, `--color-secondary`, etc.
- Transitions: `--transition-fast`, `--transition-base`, `--transition-slow`

## Responsive Design

```jsx
// Tailwind Breakpoints
mobile: default (max-width: 640px)
sm:    640px
md:    768px
lg:    1024px
xl:    1280px
2xl:   1536px

// Utilisation
<div className="block md:hidden">Visible sur mobile uniquement</div>
<div className="hidden lg:block">Visible sur desktop uniquement</div>
```

## Performance

- **Animations optimisées**: Framer Motion gère les performances
- **Code splitting**: Importez seulement ce dont vous avez besoin
- **CSS optimisé**: Tailwind purge le CSS inutilisé en production
- **Images optimisées**: Utilisez des formats WebP quand possible

## Debugging

### Console
```javascript
// Vérifier le thème
import { theme } from './theme';
console.log(theme);

// Inspecter les styles appliqués
// Utiliser DevTools du navigateur (F12)
```

## Build Production

```bash
npm run build
```

Cela génère un build optimisé dans le dossier `dist/`

## Déploiement

Le frontend peut être déployé sur:
- **Vercel** (recommandé pour Vite)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

## Support

Pour plus d'informations, consultez:
- `DESIGN_SYSTEM.md` - Documentation complète du design
- Documentation Framer Motion: https://www.framer.com/motion/
- Documentation Tailwind: https://tailwindcss.com/
- Documentation Vite: https://vitejs.dev/

---

**Créé avec ❤️ pour BaraCorrespondance**
