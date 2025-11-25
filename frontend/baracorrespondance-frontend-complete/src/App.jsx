import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  Zap,
  Award,
  ArrowLeft
} from 'lucide-react';

// Import des composants
import CandidateAuth from './components/candidate/CandidateAuth';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import CandidateProfile from './components/candidate/CandidateProfile';
import CompanyAuth from './components/company/CompanyAuth';
import CompanyDashboard from './components/company/CompanyDashboard';
import CompanyProfile from './components/company/CompanyProfile';

// Composant principal qui utilise useApp
const AppContent = () => {
  const { user, login, register, logout, updateUser } = useApp();
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, profile

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // === COMPOSANTS RÉUTILISABLES ===
  const StatCard = ({ icon: Icon, value, label, color }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="stat-card"
    >
      <div className={`stat-icon ${color}`}>
        {typeof Icon === 'string' ? Icon : <Icon size={32} />}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );

  const SelectionCard = ({ type, icon, title, subtitle, features, activeHover, onHover, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`selection-card ${type} ${activeHover === type ? 'active' : ''}`}
      onMouseEnter={() => onHover(type)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      <div className="card-shine"></div>
      <div className="card-content">
        <div className="card-header">
          <div className={`icon-container ${activeHover === type ? 'active' : ''}`}>
            {icon}
          </div>
          <div className="card-titles">
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        
        <ul className="card-features">
          {features.map((feature, index) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="feature-bullet">✦</span>
              {feature}
            </motion.li>
          ))}
        </ul>
        
        <div className={`card-cta ${activeHover === type ? 'active' : ''}`}>
          Commencer l'aventure →
        </div>
      </div>
    </motion.div>
  );

  // === PAGE DE SÉLECTION (LOGIN/ACCUEIL) ===
  const WelcomePage = () => (
    <div className="welcome-page">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className={`welcome-container ${isVisible ? 'visible' : ''}`}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="welcome-header"
        >
          <div className="logo-container">
            <div className="logo-glow">
              <div className="logo">⚡</div>
            </div> 
            <h1 className="brand-title">BaraCorrespondance</h1>
          </div>
          <p className="brand-subtitle">
            L'<span className="highlight">intelligence artificielle</span> au service de votre réussite professionnelle
          </p>
        </motion.div>

        {/* Selection Cards */}
        <div className="selection-grid">
          <SelectionCard
            type="candidate"
            icon="🚀"
            title="Je suis Talent"
            subtitle="Candidat"
            features={[
              "CV optimisé par l'IA",
              "Offres matching en temps réel",
              "Coaching personnalisé"
            ]}
            activeHover={activeHover}
            onHover={setActiveHover}
            onClick={() => setSelectedUserType('candidate')}
          />
          
          <SelectionCard
            type="company"
            icon="💼"
            title="Je recrute"
            subtitle="Entreprise"
            features={[
              "Matching IA avancé",
              "Réduction temps de recrutement",
              "Accès aux meilleurs talents"
            ]}
            activeHover={activeHover}
            onHover={setActiveHover}
            onClick={() => setSelectedUserType('company')}
          />
        </div>

        {/* Statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stats-section"
        >
          <div className="stats-grid">
            <StatCard icon={Users} value="5000+" label="Talents" color="cyan" />
            <StatCard icon={TrendingUp} value="98%" label="Satisfaction" color="purple" />
            <StatCard icon={Zap} value="2.1x" label="Plus rapide" color="pink" />
            <StatCard icon={Award} value="1000+" label="Entreprises" color="yellow" />
          </div>
        </motion.div>
      </div>
    </div>
  );

  // === LOGIQUE DE ROUTAGE PRINCIPALE ===
  const renderCurrentPage = () => {
    // Si candidat sélectionné mais pas encore connecté
    if (!user && selectedUserType === 'candidate') {
      return (
        <CandidateAuth 
          onBack={() => setSelectedUserType(null)}
          onLogin={login}
          onRegister={register}
        />
      );
    }

    // Si entreprise sélectionnée mais pas encore connectée
    if (!user && selectedUserType === 'company') {
      return (
        <CompanyAuth
          onBack={() => setSelectedUserType(null)}
          onLogin={login}
          onRegister={register}
        />
      );
    }

    // Si utilisateur connecté
    if (user) {
      if (user.role === 'company') {
        // Entreprise - gérer les différentes vues
        if (currentView === 'profile') {
          return (
            <CompanyProfile
              user={user}
              onBack={() => setCurrentView('dashboard')}
              onUpdateUser={updateUser}
              onLogout={() => {
                logout();
                setSelectedUserType(null);
                setCurrentView('dashboard');
              }}
            />
          );
        }

        return (
          <CompanyDashboard
            user={user}
            onLogout={() => {
              logout();
              setSelectedUserType(null);
              setCurrentView('dashboard');
            }}
            onNavigateToProfile={() => setCurrentView('profile')}
          />
        );
      } else {
        // Candidat - gérer les différentes vues
        if (currentView === 'profile') {
          return (
            <CandidateProfile
              user={user}
              onBack={() => setCurrentView('dashboard')}
              onUpdateUser={updateUser}
              onLogout={() => {
                logout();
                setSelectedUserType(null);
                setCurrentView('dashboard');
              }}
            />
          );
        }

        return (
          <CandidateDashboard
            user={user}
            onLogout={() => {
              logout();
              setSelectedUserType(null);
              setCurrentView('dashboard');
            }}
            onNavigateToProfile={() => setCurrentView('profile')}
          />
        );
      }
    }

    // Page de bienvenue par défaut
    return <WelcomePage />;
  };

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {renderCurrentPage()}
      </AnimatePresence>
    </div>
  );
};

// Composant App principal avec AppProvider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
