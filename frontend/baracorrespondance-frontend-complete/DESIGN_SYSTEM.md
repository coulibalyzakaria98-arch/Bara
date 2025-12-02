# 🎨 BaraCorrespondance - Design System

## Palette de Couleurs Moderne Bleu & Blanc

Ce projet utilise une palette de couleurs professionnelle et moderne basée sur les bleus et le blanc.

### Couleurs Primaires

- **Primary Blue**: `#0090ff` - Couleur principale, utilisée pour les boutons, les liens et les accents
- **Primary Dark**: `#0055b8` - Pour les états hover et sélectionnés
- **Primary Light**: `#36b3ff` - Pour les backgrounds et les surfaces secondaires

### Palette Complète

```
Primary (Bleu Principal)
├─ 50:  #f0f7ff   (Très clair)
├─ 100: #e0efff   (Clair)
├─ 200: #bae0ff   (Clair moyen)
├─ 300: #7ac8ff   (Moyen clair)
├─ 400: #36b3ff   (Moyen)
├─ 500: #0090ff   (Principal) ⭐
├─ 600: #0070d8   (Sombre)
├─ 700: #0055b8   (Sombre moyen) ⭐
├─ 800: #003d8a   (Très sombre)
└─ 900: #002b5c   (Extrêmement sombre)

Secondary (Bleu Secondaire)
├─ 500: #0066ff
└─ 700: #003d99

Accent (Bleu Ciel)
├─ 500: #4fa3c2
└─ 700: #25658e
```

## Composants

### 1. **Header** (`Header.jsx`)
- Navigation principale responsive
- Menu mobile avec hamburger
- Notifications et profil utilisateur

```jsx
import { Header } from './components/common';

<Header 
  user={user}
  onLogout={handleLogout}
  onNavigateToProfile={handleProfile}
  currentView={currentView}
  setCurrentView={setCurrentView}
/>
```

### 2. **HeroSection** (`HeroSection.jsx`)
- Section d'accueil avec gradient
- Animations framer-motion
- Boutons CTA

```jsx
import { HeroSection } from './components/common';

<HeroSection 
  title="Trouvez votre emploi idéal"
  subtitle="Avec la puissance de l'IA"
  features={['Analyse CV IA', 'Matching intelligent', 'Offres personnalisées']}
  cta={{
    primaryLabel: 'Commencer',
    onPrimary: () => {},
    secondaryLabel: 'En savoir plus',
    onSecondary: () => {}
  }}
/>
```

### 3. **JobCard** (`JobCard.jsx`)
- Affichage des offres d'emploi
- Système de favoris
- Score de correspondance

```jsx
import { JobCard } from './components/common';

<JobCard 
  job={jobData}
  onApply={handleApply}
  isFavorite={isFavorite}
  onToggleFavorite={handleToggleFavorite}
/>
```

### 4. **StatisticsCard** (`StatisticsCard.jsx`)
- Cartes de statistiques avec graphiques
- Indicateurs de tendance
- Support de multiples couleurs

```jsx
import { StatisticsCard } from './components/common';

<StatisticsCard 
  title="Candidatures reçues"
  value="248"
  change="+12%"
  icon={Users}
  trend="up"
  color="primary"
  chart={[30, 45, 60, 50, 75, 85, 90]}
  details={[
    { label: 'Ce mois', value: '84' },
    { label: 'Acceptées', value: '12' }
  ]}
/>
```

### 5. **Formulaires** (`Form.jsx`)
- `FormField` - Champs de formulaire
- `FormGroup` - Groupement de champs
- `Form` - Wrapper de formulaire

```jsx
import { Form, FormField, FormGroup } from './components/common';

<Form onSubmit={handleSubmit} isLoading={isLoading} submitText="Envoyer">
  <FormGroup title="Informations personnelles">
    <FormField 
      label="Nom complet"
      placeholder="Entrez votre nom"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
  </FormGroup>
</Form>
```

### 6. **Footer** (`Footer.jsx`)
- Pied de page professionnel
- Liens de navigation
- Réseaux sociaux

### 7. **OnboardingTour** (`OnboardingTour.jsx`)
- Tutoriel interactif
- Navigation entre étapes
- Barre de progression

## Styles Globaux

Tous les styles sont centralisés dans:

- `src/styles/index.css` - Styles de base et animations
- `src/styles/modern-design.css` - Design system complet

### Classes Disponibles

#### Boutons
```jsx
<button className="btn btn-primary">Primaire</button>
<button className="btn btn-secondary">Secondaire</button>
<button className="btn btn-outline">Outline</button>
<button className="btn btn-lg">Large</button>
<button className="btn btn-sm">Petit</button>
```

#### Cartes
```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Titre</h3>
  </div>
  <!-- contenu -->
</div>
```

#### Badges
```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Succès</span>
<span className="badge badge-warning">Attention</span>
<span className="badge badge-error">Erreur</span>
```

#### Tags
```jsx
<span className="tag">Tag</span>
<span className="tag active">Tag Actif</span>
```

#### Alertes
```jsx
<div className="alert alert-info">Message info</div>
<div className="alert alert-success">Message succès</div>
<div className="alert alert-warning">Message attention</div>
<div className="alert alert-error">Message erreur</div>
```

## Thème (`theme.js`)

Accédez aux couleurs et gradients via le fichier thème centralisé:

```javascript
import { theme, getColor, getGradient } from './theme';

const primaryColor = getColor('colors.primary.500');
const gradient = getGradient('primary');
```

## Animations

Toutes les animations sont gérées par **Framer Motion**:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Contenu animé
</motion.div>
```

## Responsive Design

Le design est pleinement responsive:

- **Mobile**: max-width 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px et plus

```jsx
<div className="hidden md:flex lg:flex-row">
  Visible à partir de tablet
</div>
```

## Typographie

- **Font**: Inter + Plus Jakarta Sans (Google Fonts)
- **Sizes**: 0.75rem (xs), 0.875rem (sm), 1rem (base), 1.25rem (lg), etc.
- **Weights**: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black)

## Espacements

Basé sur une échelle de 4px:
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

## Best Practices

1. **Cohérence**: Utilisez toujours les classes du design system
2. **Accessibility**: Testez avec les lecteurs d'écran
3. **Performance**: Optimisez les animations avec Framer Motion
4. **Mobile First**: Concevez d'abord pour mobile
5. **Contrastes**: Assurez-vous des ratios de contraste WCAG AA

## Support des Navigateurs

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers récents

---

**Créé avec ❤️ pour BaraCorrespondance**
