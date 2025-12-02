# 📚 Guide Complet des Nouveaux Composants

## 📋 Table des matières

1. [Composants de Listes et États](#composants-de-listes-et-états)
2. [Composants de Modales et Notifications](#composants-de-modales-et-notifications)
3. [Composants de Statistiques Avancées](#composants-de-statistiques-avancées)
4. [Exemples d'Utilisation](#exemples-dutilisation)

---

## Composants de Listes et États

### EmptyState
Affiche un état vide attrayant avec icône, titre et description.

```jsx
import { EmptyState } from '@/components/common';

export default function MyComponent() {
  return (
    <EmptyState
      icon="📭"
      title="Aucun résultat"
      description="Aucune donnée disponible pour le moment"
      action={<button className="btn-primary">Créer nouveau</button>}
    />
  );
}
```

**Props:**
- `icon` (string): Emoji ou caractère à afficher
- `title` (string): Titre principal
- `description` (string): Description détaillée
- `action` (ReactNode): Bouton d'action optionnel
- `className` (string): Classes CSS supplémentaires

---

### ListGroup
Affiche une liste groupée avec en-tête et rendus personnalisés.

```jsx
import { ListGroup } from '@/components/common';

const items = [
  { id: 1, name: 'Item 1', description: 'Description 1' },
  { id: 2, name: 'Item 2', description: 'Description 2' }
];

export default function MyList() {
  return (
    <ListGroup
      title="Ma Liste"
      items={items}
      renderItem={(item) => (
        <div>
          <p className="list-item-title">{item.name}</p>
          <p className="list-item-description">{item.description}</p>
        </div>
      )}
    />
  );
}
```

**Props:**
- `title` (string): En-tête de la liste
- `items` (array): Tableau d'éléments
- `renderItem` (function): Fonction de rendu pour chaque élément
- `emptyState` (ReactNode): État vide personnalisé
- `className` (string): Classes CSS supplémentaires

---

### GridList
Affiche une grille responsive d'éléments.

```jsx
import { GridList } from '@/components/common';

const items = [
  { id: 1, title: 'Card 1', description: 'Desc 1' },
  { id: 2, title: 'Card 2', description: 'Desc 2' }
];

export default function MyGrid() {
  return (
    <GridList
      items={items}
      renderItem={(item) => (
        <div>
          <h3 className="grid-list-item-title">{item.title}</h3>
          <p className="grid-list-item-description">{item.description}</p>
        </div>
      )}
      columns={3}
    />
  );
}
```

**Props:**
- `items` (array): Tableau d'éléments
- `renderItem` (function): Fonction de rendu
- `emptyState` (ReactNode): État vide personnalisé
- `columns` (number): Nombre de colonnes (défaut: 3)
- `className` (string): Classes CSS

---

### Timeline
Affiche une chronologie d'événements avec points de repère.

```jsx
import { Timeline } from '@/components/common';

const events = [
  {
    id: 1,
    title: 'Événement 1',
    description: 'Description 1',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Événement 2',
    description: 'Description 2',
    date: '2024-01-20'
  }
];

export default function MyTimeline() {
  return (
    <Timeline
      items={events}
      renderItem={(event) => (
        <>
          <p className="timeline-item-title">{event.title}</p>
          <p className="timeline-item-description">{event.description}</p>
          <p className="timeline-item-date">{event.date}</p>
        </>
      )}
    />
  );
}
```

---

### Accordion
Affiche un accordion d'éléments pliables/dépliables.

```jsx
import { Accordion } from '@/components/common';

const items = [
  {
    id: 1,
    title: 'Section 1',
    content: 'Contenu 1'
  },
  {
    id: 2,
    title: 'Section 2',
    content: 'Contenu 2'
  }
];

export default function MyAccordion() {
  return (
    <Accordion
      items={items}
      allowMultiple={true}
    />
  );
}
```

**Props:**
- `items` (array): Tableau d'éléments (id, title, content)
- `allowMultiple` (boolean): Permet plusieurs sections ouvertes
- `className` (string): Classes CSS

---

### Breadcrumb
Affiche un fil d'Ariane de navigation.

```jsx
import { Breadcrumb } from '@/components/common';

export default function MyBreadcrumb() {
  return (
    <Breadcrumb
      items={[
        { label: 'Accueil', href: '/' },
        { label: 'Candidats', href: '/candidates' },
        { label: 'Profil', active: true }
      ]}
    />
  );
}
```

**Props:**
- `items` (array): Tableau d'éléments (label, href, active)
- `className` (string): Classes CSS

---

### Pagination
Affiche les contrôles de pagination.

```jsx
import { Pagination, useState } from '@/components/common';

export default function MyPagination() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={10}
      onPageChange={setCurrentPage}
    />
  );
}
```

**Props:**
- `currentPage` (number): Page actuelle
- `totalPages` (number): Nombre total de pages
- `onPageChange` (function): Callback au changement de page
- `className` (string): Classes CSS

---

### SearchableList
Liste avec recherche intégrée.

```jsx
import { SearchableList } from '@/components/common';

const items = [
  { id: 1, name: 'Alice', role: 'Designer' },
  { id: 2, name: 'Bob', role: 'Developer' }
];

export default function MySearchableList() {
  return (
    <SearchableList
      items={items}
      placeholder="Chercher un candidat..."
      filterFn={(item, query) => 
        item.name.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(item) => (
        <>
          <p className="list-item-title">{item.name}</p>
          <p className="list-item-description">{item.role}</p>
        </>
      )}
    />
  );
}
```

---

## Composants de Modales et Notifications

### Modal
Affiche une modale avec animation de ressort.

```jsx
import { Modal, useState } from '@/components/common';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Ouvrir Modale</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Ma Modale"
        size="md"
      >
        <p>Contenu de la modale</p>
      </Modal>
    </>
  );
}
```

**Props:**
- `isOpen` (boolean): État de la modale
- `onClose` (function): Callback de fermeture
- `title` (string): Titre
- `size` (string): Taille (sm, md, lg, xl, 2xl)
- `footer` (ReactNode): Contenu du pied de page
- `closeOnBackdrop` (boolean): Fermer au clic externe
- `className` (string): Classes CSS

---

### useToast & ToastContainer
Système de notifications toast.

```jsx
import { useToast, ToastContainer } from '@/components/common';

export default function MyComponent() {
  const { toasts, addToast, removeToast } = useToast();

  const handleClick = () => {
    addToast('Opération réussie!', 'success', 4000);
  };

  return (
    <>
      <button onClick={handleClick}>Afficher Toast</button>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
```

**Types:** 'info', 'success', 'error', 'warning'

---

### ConfirmDialog
Boîte de dialogue de confirmation.

```jsx
import { ConfirmDialog, useState } from '@/components/common';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log('Confirmé!');
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Supprimer</button>
      <ConfirmDialog
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
        title="Confirmation"
        message="Êtes-vous sûr ?"
        isDangerous={true}
      />
    </>
  );
}
```

---

### Alert
Alerte inline.

```jsx
import { Alert } from '@/components/common';

export default function MyComponent() {
  return (
    <Alert
      type="warning"
      title="Attention"
      message="Vérifiez vos données"
      onClose={() => console.log('Fermé')}
    />
  );
}
```

**Types:** 'info', 'success', 'error', 'warning'

---

### Tooltip
Infobulle au survol.

```jsx
import { Tooltip } from '@/components/common';

export default function MyComponent() {
  return (
    <Tooltip
      content="Ceci est une infobulle"
      position="top"
    >
      <button>Survolez-moi</button>
    </Tooltip>
  );
}
```

---

### NotificationBadge
Badge de notification avec compteur.

```jsx
import { NotificationBadge, Bell } from 'lucide-react';

export default function MyComponent() {
  return (
    <NotificationBadge count={5} position="top-right">
      <Bell size={24} />
    </NotificationBadge>
  );
}
```

---

### Drawer
Tiroir de navigation (sidebar).

```jsx
import { Drawer, useState } from '@/components/common';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Ouvrir Menu</button>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Menu"
        position="right"
      >
        <p>Contenu du drawer</p>
      </Drawer>
    </>
  );
}
```

---

## Composants de Statistiques Avancées

### StatCard
Carte de statistique avec tendance.

```jsx
import { StatCard } from '@/components/common';
import { Target } from 'lucide-react';

export default function MyComponent() {
  return (
    <StatCard
      title="Candidatures"
      value={1250}
      trend={12}
      icon={Target}
      color="blue"
    />
  );
}
```

**Props:**
- `title` (string): Titre
- `value` (number): Valeur
- `prefix` (string): Préfixe (ex: "$")
- `suffix` (string): Suffixe (ex: "%")
- `trend` (number): Tendance en pourcentage
- `icon` (Component): Icône Lucide
- `color` (string): Couleur (blue, green, purple, orange, red)
- `onClick` (function): Callback au clic
- `className` (string): Classes CSS

---

### ChartCard
Carte avec graphique simple.

```jsx
import { ChartCard } from '@/components/common';

export default function MyComponent() {
  const data = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 38 }
  ];

  return (
    <ChartCard
      title="Candidatures par mois"
      data={data}
      type="bar"
      color="blue"
    />
  );
}
```

**Types:** 'bar', 'line', 'pie'

---

### ProgressCard
Indicateur de progression.

```jsx
import { ProgressCard } from '@/components/common';

export default function MyComponent() {
  return (
    <ProgressCard
      title="Profil complété"
      percentage={75}
      target={100}
      current={75}
      color="green"
      showLabel={true}
      showPercentage={true}
    />
  );
}
```

---

### KPICard
Indicateur clé de performance.

```jsx
import { KPICard } from '@/components/common';
import { Target } from 'lucide-react';

export default function MyComponent() {
  return (
    <KPICard
      title="Taux de réussite"
      value={92}
      unit="%"
      status="good"
      icon={Target}
    />
  );
}
```

**Status:** 'good', 'warning', 'danger', 'neutral'

---

### ComparisonCard
Comparer deux valeurs.

```jsx
import { ComparisonCard } from '@/components/common';

export default function MyComponent() {
  return (
    <ComparisonCard
      title="Candidats vs Postes"
      value1={{ label: 'Candidats', value: 250 }}
      value2={{ label: 'Postes', value: 45 }}
    />
  );
}
```

---

### ActivityCard
Affiche les activités récentes.

```jsx
import { ActivityCard } from '@/components/common';
import { CheckCircle } from 'lucide-react';

export default function MyComponent() {
  const activities = [
    { title: 'Candidature acceptée', time: 'Il y a 2h', icon: CheckCircle },
    { title: 'Profil mis à jour', time: 'Il y a 5h' }
  ];

  return (
    <ActivityCard
      title="Activité récente"
      activities={activities}
    />
  );
}
```

---

## Exemples d'Utilisation

### Dashboard Complet

```jsx
import {
  Header,
  Footer,
  StatCard,
  ChartCard,
  ProgressCard,
  ListGroup,
  Timeline,
  ActivityCard,
  Modal,
  useToast,
  ToastContainer,
  Alert
} from '@/components/common';
import { Users, Briefcase, Target } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const { toasts, addToast, removeToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    { title: 'Candidats', value: 1250, trend: 12, icon: Users, color: 'blue' },
    { title: 'Postes', value: 45, trend: -5, icon: Briefcase, color: 'green' },
    { title: 'Correspondances', value: 320, trend: 8, icon: Target, color: 'purple' }
  ];

  return (
    <>
      <Header />
      
      <main className="p-8">
        <Alert
          type="info"
          title="Bienvenue"
          message="Voici votre tableau de bord"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mt-6 mb-8">
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              {...stat}
              onClick={() => addToast('Statistique cliquée', 'success')}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Candidatures par mois"
            data={[
              { label: 'Jan', value: 45 },
              { label: 'Feb', value: 52 },
              { label: 'Mar', value: 38 }
            ]}
          />
          <ProgressCard
            title="Profil complété"
            percentage={75}
            target={100}
            current={75}
            color="green"
          />
        </div>

        {/* Activities */}
        <ActivityCard
          title="Activité récente"
          activities={[
            { title: 'Nouvelle candidature', time: 'Il y a 2h' },
            { title: 'Poste publié', time: 'Il y a 5h' }
          ]}
        />
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
```

---

## 🎨 Classes CSS Personnalisées

Vous pouvez personnaliser les styles en utilisant les classes CSS définies dans `lists-and-states.css`:

- `.empty-state` - État vide principal
- `.list-item` - Élément de liste
- `.grid-list-item` - Élément de grille
- `.timeline-item` - Événement de chronologie
- `.accordion-trigger` - Bouton d'accordion
- `.pagination-button` - Bouton de pagination

Exemple:
```jsx
<ListGroup
  className="custom-list"
  items={items}
  renderItem={renderItem}
/>
```

```css
.custom-list .list-item {
  padding: 2rem;
  background: linear-gradient(...);
}
```

---

## 📱 Responsive Design

Tous les composants sont responsive:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

Breakpoints Tailwind utilisés:
- `md:` - 768px et plus
- `lg:` - 1024px et plus

---

## 🚀 Prochaines Étapes

1. **Intégrer dans les pages existantes**
   - Mettre à jour CandidateDashboard
   - Mettre à jour CompanyDashboard
   - Intégrer dans les formulaires

2. **Ajouter l'animation**
   - Framer Motion déjà configuré
   - Utiliser les presets dans `animations.js`

3. **Tester la responsivité**
   - Tester sur mobile/tablet/desktop
   - Ajuster les espacements si nécessaire

4. **Optimiser les performances**
   - Lazy loading des images
   - Code splitting des composants
   - Memoization si besoin
