import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';

// Import des composants de page
import HomePage from './pages/HomePage';
import CandidateAuth from './components/candidate/CandidateAuth';
import CompanyAuth from './components/company/CompanyAuth';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import CandidateProfile from './components/candidate/CandidateProfile';
import CompanyDashboard from './components/company/CompanyDashboard';
import CompanyProfile from './components/company/CompanyProfile';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

const AppContent = () => {
  const { user, login, register, logout, updateUser, isLoading } = useApp();
  const location = useLocation();

  // Gérer la redirection après connexion/inscription
  if (user && (location.pathname.includes('login') || location.pathname.includes('register'))) {
    const targetDashboard = user.role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard';
    window.location.href = targetDashboard;
    return null;
  }
  
  const userType = location.state?.userType;
  const isDashboardRoute = location.pathname.includes('/dashboard');

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Chargement de l'application...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
        {!isDashboardRoute && <Header user={user} onLogout={logout} />}
        <main className="flex-grow">
            <Routes>
                {/* Routes Publiques */}
                <Route path="/" element={<HomePage />} />
                
                <Route 
                    path="/login"
                    element={userType === 'company' 
                        ? <CompanyAuth onLogin={login} /> 
                        : <CandidateAuth onLogin={login} />
                    }
                />
                <Route 
                    path="/register"
                    element={userType === 'company' 
                        ? <CompanyAuth onRegister={register} /> 
                        : <CandidateAuth onRegister={register} />
                    }
                />

                {/* Routes Protégées (utilisation de user prop pour les dashboards) */}
                {user?.role === 'candidate' && (
                    <Route path="/candidate/dashboard" element={<CandidateDashboard user={user} />} />
                )}
                {user?.role === 'company' && (
                    <Route path="/company/dashboard" element={<CompanyDashboard user={user} />} />
                )}

                {/* Profile / Settings / Notifications routes */}
                {user?.role === 'candidate' && (
                  <Route path="/candidate/profile" element={<CandidateProfile user={user} onBack={() => window.location.href = '/candidate/dashboard'} onUpdateUser={updateUser} onLogout={logout} />} />
                )}
                {user?.role === 'company' && (
                  <Route path="/company/profile" element={<CompanyProfile user={user} onBack={() => window.location.href = '/company/dashboard'} onUpdateUser={updateUser} onLogout={logout} />} />
                )}
                <Route path="/notifications" element={<div style={{padding: '2rem'}}><h2>Notifications</h2><p>Ouvrir le panneau de notifications (développé)</p></div>} />
                <Route path="/settings" element={<div style={{padding: '2rem'}}><h2>Paramètres</h2><p>Page de paramètres (à implémenter)</p></div>} />

                {/* Fallback route pour les chemins non définis */}
                <Route path="*" element={<HomePage />} />
            </Routes>
        </main>
        {!isDashboardRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;