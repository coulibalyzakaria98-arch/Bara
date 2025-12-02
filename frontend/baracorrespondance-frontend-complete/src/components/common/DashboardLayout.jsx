import React from 'react';
import { LogOut, User, Settings, Bell, Briefcase, Users, PieChart, Star } from 'lucide-react';
import logo from '../../assets/logo.png';

const SidebarLink = ({ isActive, icon, children, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const DashboardLayout = ({ user, onLogout, onNavigate, currentView, children }) => {
  const isCandidate = user?.role === 'candidate';

  return (
    <div className="flex h-screen bg-light-bg">
      {/* Barre Latérale */}
      <aside className="w-64 bg-white border-r border-border flex-shrink-0">
        <div className="p-6">
          <img src={logo} alt="BaraMatch" className="h-20 w-auto" />
        </div>
        <nav className="p-4 space-y-2">
          {isCandidate ? (
            <>
              <SidebarLink onClick={() => onNavigate('dashboard')} isActive={currentView === 'dashboard'} icon={<PieChart size={20} />}>Tableau de bord</SidebarLink>
              <SidebarLink onClick={() => onNavigate('jobs')} isActive={currentView === 'jobs'} icon={<Briefcase size={20} />}>Offres d'emploi</SidebarLink>
              <SidebarLink onClick={() => onNavigate('matches')} isActive={currentView === 'matches'} icon={<Users size={20} />}>Mes Matchs</SidebarLink>
              <SidebarLink onClick={() => onNavigate('favorites')} isActive={currentView === 'favorites'} icon={<Star size={20} />}>Favoris</SidebarLink>
            </>
          ) : (
            <>
              <SidebarLink onClick={() => onNavigate('dashboard')} isActive={currentView === 'dashboard'} icon={<PieChart size={20} />}>Tableau de bord</SidebarLink>
              <SidebarLink onClick={() => onNavigate('jobs')} isActive={currentView === 'jobs'} icon={<Briefcase size={20} />}>Gestion des offres</SidebarLink>
              <SidebarLink onClick={() => onNavigate('candidates')} isActive={currentView === 'candidates'} icon={<Users size={20} />}>Candidats</SidebarLink>
            </>
          )}
        </nav>
      </aside>

      {/* Contenu Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête du Contenu */}
        <header className="bg-white border-b border-border p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold">Bonjour, {user?.full_name || user?.email} !</h1>
                <p className="text-sm text-gray-500">Bienvenue sur votre espace.</p>
              </div>
              <div className="ml-4">
                {(user?.avatar_url || user?.avatar) ? (
                  <img src={user.avatar_url || user.avatar} alt={user?.full_name || 'Avatar'} className="w-12 h-12 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">{(user?.full_name || user?.email || '').charAt(0).toUpperCase()}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => window.location.href = '/notifications'} className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <button onClick={() => window.location.href = '/settings'} className="p-2 rounded-full hover:bg-gray-100">
                <Settings size={20} />
              </button>
              <button onClick={onLogout} className="btn btn-secondary">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
        </header>
        
        {/* Contenu de la Page */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
