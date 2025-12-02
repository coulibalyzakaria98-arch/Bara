/**
 * Integration Guide - BaraCorrespondance
 * Comment intégrer les nouveaux composants dans les pages existantes
 */

// ============================================
// 1. CandidateDashboard.jsx - INTEGRATION
// ============================================

import React, { useState } from 'react';
import {
  Header,
  Footer,
  StatCard,
  ChartCard,
  ProgressCard,
  ListGroup,
  Timeline,
  ActivityCard,
  Alert,
  useToast,
  ToastContainer,
  SearchableList,
  GridList
} from '@/components/common';
import {
  Users,
  Briefcase,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function CandidateDashboard() {
  const { toasts, addToast, removeToast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock Data
  const stats = [
    {
      title: 'Profil Vues',
      value: 324,
      trend: 12,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Candidatures',
      value: 42,
      trend: 8,
      icon: Briefcase,
      color: 'green'
    },
    {
      title: 'Correspondances',
      value: 15,
      trend: -2,
      icon: Target,
      color: 'purple'
    }
  ];

  const chartData = [
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 19 },
    { label: 'Mar', value: 15 },
    { label: 'Apr', value: 25 },
    { label: 'May', value: 22 }
  ];

  const recentJobs = [
    {
      id: 1,
      title: 'Développeur React',
      company: 'TechCorp',
      matches: 92,
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Lead Developer',
      company: 'StartupXYZ',
      matches: 87,
      date: '2024-01-14'
    }
  ];

  const activities = [
    { title: 'Candidature acceptée', time: 'Il y a 2h', icon: CheckCircle },
    { title: 'Profil mis à jour', time: 'Il y a 5h' },
    { title: 'Nouveau message', time: 'Il y a 1j' }
  ];

  const timeline = [
    {
      id: 1,
      title: 'Profil créé',
      description: 'Votre profil a été créé avec succès',
      date: '2024-01-01'
    },
    {
      id: 2,
      title: 'CV téléchargé',
      description: 'Votre CV a été uploadé',
      date: '2024-01-05'
    },
    {
      id: 3,
      title: 'Première candidature',
      description: 'Vous avez candidaté à votre premier poste',
      date: '2024-01-10'
    }
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Alert */}
          <Alert
            type="info"
            title="Bienvenue sur votre tableau de bord"
            message="Consultez vos statistiques, candidatures et opportunités en un coup d'œil"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 mb-8">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                {...stat}
                onClick={() => addToast(`${stat.title} cliqué`, 'info')}
              />
            ))}
          </div>

          {/* Charts & Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard
              title="Vos vues par mois"
              data={chartData}
              type="bar"
              color="blue"
            />
            <ProgressCard
              title="Profil complété"
              percentage={85}
              target={100}
              current={85}
              color="green"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Jobs - 2 columns */}
            <div className="lg:col-span-2">
              <ListGroup
                title="Postes récemment correspondants"
                items={recentJobs}
                renderItem={(job) => (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="list-item-title">{job.title}</p>
                      <p className="list-item-description">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{job.matches}%</p>
                      <p className="text-xs text-gray-500">{job.date}</p>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Activity - 1 column */}
            <ActivityCard
              title="Activité récente"
              activities={activities}
            />
          </div>

          {/* Timeline */}
          <div className="mt-8">
            <Timeline
              items={timeline}
              renderItem={(event) => (
                <>
                  <p className="timeline-item-title">{event.title}</p>
                  <p className="timeline-item-description">{event.description}</p>
                  <p className="timeline-item-date">{event.date}</p>
                </>
              )}
            />
          </div>
        </div>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

// ============================================
// 2. CompanyDashboard.jsx - INTEGRATION
// ============================================

import React, { useState } from 'react';
import {
  Header,
  Footer,
  StatCard,
  ComparisonCard,
  ChartCard,
  KPICard,
  ListGroup,
  EmptyState,
  useToast,
  ToastContainer,
  Pagination,
  SearchableList
} from '@/components/common';
import {
  Users,
  Briefcase,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function CompanyDashboard() {
  const { toasts, addToast, removeToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const candidateMetrics = [
    {
      title: 'Candidatures reçues',
      value: 342,
      unit: '',
      status: 'good',
      icon: Users
    },
    {
      title: 'Taux de réponse',
      value: 68,
      unit: '%',
      status: 'good',
      icon: Target
    },
    {
      title: 'Temps moyen de réponse',
      value: 2.3,
      unit: 'j',
      status: 'warning',
      icon: TrendingUp
    }
  ];

  const candidatesList = [
    { id: 1, name: 'Alice Martin', role: 'Senior Developer', applied: '2024-01-15' },
    { id: 2, name: 'Bob Chen', role: 'UX Designer', applied: '2024-01-14' },
    { id: 3, name: 'Carol Williams', role: 'Product Manager', applied: '2024-01-13' }
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">
            Tableau de Bord Entreprise
          </h1>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {candidateMetrics.map((metric) => (
              <KPICard
                key={metric.title}
                {...metric}
              />
            ))}
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ComparisonCard
              title="Correspondances par poste"
              value1={{ label: 'Candidates trouvés', value: 245 }}
              value2={{ label: 'Postes ouverts', value: 12 }}
            />
            <ChartCard
              title="Candidatures par semaine"
              data={[
                { label: 'Sem 1', value: 45 },
                { label: 'Sem 2', value: 52 },
                { label: 'Sem 3', value: 38 },
                { label: 'Sem 4', value: 61 }
              ]}
              type="line"
            />
          </div>

          {/* Candidates List with Search */}
          <div className="mb-8">
            <SearchableList
              items={candidatesList}
              placeholder="Chercher un candidat..."
              filterFn={(item, query) =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.role.toLowerCase().includes(query.toLowerCase())
              }
              renderItem={(candidate) => (
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1">
                    <p className="list-item-title">{candidate.name}</p>
                    <p className="list-item-description">{candidate.role}</p>
                  </div>
                  <div className="text-right">
                    <button className="px-3 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition">
                      Voir le profil
                    </button>
                    <p className="text-xs text-gray-500 mt-2">{candidate.applied}</p>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

// ============================================
// 3. JobBrowser.jsx - INTEGRATION
// ============================================

import React, { useState } from 'react';
import {
  Header,
  Footer,
  GridList,
  Breadcrumb,
  SearchableList,
  EmptyState,
  Pagination,
  JobCard,
  Accordion
} from '@/components/common';

export default function JobBrowser() {
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Développeur React', company: 'TechCorp', salary: '2500-3500€', level: 'Senior', matches: 92 },
    { id: 2, title: 'Lead Developer', company: 'StartupXYZ', salary: '3000-4000€', level: 'Senior', matches: 87 }
  ]);

  const filters = [
    {
      id: 'level',
      title: 'Niveau d\'expérience',
      content: (
        <div className="space-y-2">
          <label><input type="checkbox" /> Junior</label>
          <label><input type="checkbox" /> Intermédiaire</label>
          <label><input type="checkbox" /> Senior</label>
        </div>
      )
    },
    {
      id: 'salary',
      title: 'Salaire',
      content: (
        <input type="range" min="0" max="5000" className="w-full" />
      )
    }
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Postes', href: '/jobs' },
              { label: 'Recherche', active: true }
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <div className="lg:col-span-1">
              <Accordion items={filters} allowMultiple={true} />
            </div>

            {/* Jobs Grid */}
            <div className="lg:col-span-3">
              <h1 className="text-3xl font-bold text-blue-900 mb-6">
                Postes disponibles
              </h1>
              <GridList
                items={jobs}
                columns={2}
                renderItem={(job) => (
                  <JobCard
                    title={job.title}
                    company={job.company}
                    salary={job.salary}
                    matchScore={job.matches}
                    onApply={() => console.log('Apply', job.id)}
                  />
                )}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// ============================================
// 4. UserProfile.jsx - INTEGRATION
// ============================================

import React, { useState } from 'react';
import {
  Header,
  Footer,
  ProgressCard,
  StatCard,
  ListGroup,
  Modal,
  useToast,
  ToastContainer,
  FormField,
  FormGroup,
  Alert
} from '@/components/common';
import { Edit, Save } from 'lucide-react';

export default function UserProfile() {
  const { toasts, addToast, removeToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+33 6 12 34 56 78',
    bio: 'Développeur fullstack passionné'
  });

  const skills = [
    { id: 1, name: 'React', level: 'Expert' },
    { id: 2, name: 'Node.js', level: 'Advanced' },
    { id: 3, name: 'Python', level: 'Intermediate' }
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Alert
            type="success"
            title="Profil complet"
            message="Votre profil est complètement rempli"
          />

          {/* Profile Completion */}
          <div className="mt-8 mb-8">
            <ProgressCard
              title="Profil complété"
              percentage={85}
              target={100}
              current={85}
              color="green"
            />
          </div>

          {/* Profile Info */}
          <div className="bg-white border-2 border-blue-100 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">Informations personnelles</h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Edit size={18} />
                Modifier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="text-lg font-semibold text-gray-900">{profileData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{profileData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="text-lg font-semibold text-gray-900">{profileData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bio</p>
                <p className="text-lg font-semibold text-gray-900">{profileData.bio}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <ListGroup
            title="Compétences"
            items={skills}
            renderItem={(skill) => (
              <div className="flex justify-between items-center">
                <div>
                  <p className="list-item-title">{skill.name}</p>
                  <p className="list-item-description">{skill.level}</p>
                </div>
                <button className="text-red-600 hover:text-red-700">Supprimer</button>
              </div>
            )}
          />

          {/* Edit Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Modifier le profil"
            footer={
              <>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border-2 border-blue-200 text-blue-900"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    addToast('Profil mis à jour', 'success');
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
              </>
            }
          >
            <FormGroup>
              <FormField
                label="Nom"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
              <FormField
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
              <FormField
                label="Téléphone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
              <FormField
                label="Bio"
                type="textarea"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              />
            </FormGroup>
          </Modal>
        </div>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

// ============================================
// EXPORT GUIDE
// ============================================

/*
Pour utiliser ces intégrations dans votre application:

1. Importer les composants depuis @/components/common:
   import { StatCard, Header, Footer, ... } from '@/components/common';

2. Adapter les données mock à vos données réelles (API calls):
   const [jobs, setJobs] = useState([]);
   
   useEffect(() => {
     fetchJobs().then(setJobs);
   }, []);

3. Connecter les callbacks aux vrais handlers:
   onClick={() => addToast('Succès!', 'success')}
   onApply={(jobId) => submitApplication(jobId)}

4. Utiliser les hooks fournis:
   const { toasts, addToast, removeToast } = useToast();

5. Tester la responsivité:
   - Ouvrir DevTools (F12)
   - Mode responsive design (Ctrl+Shift+M)
   - Tester mobile/tablet/desktop

6. Optimiser les performances:
   - Lazy load les images
   - Memo les composants lourds
   - Code splitting si nécessaire

7. Ajouter plus de personnalisation:
   - Modifier les couleurs avec props `color`
   - Ajouter des animations personnalisées
   - Étendre les composants avec héritage
*/
