import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom'; // Utiliser NavLink pour les styles actifs, useLocation pour le chemin actuel
import { motion } from 'framer-motion';
import { LogOut, User, Settings, Bell, Menu, X, Briefcase, Users } from 'lucide-react';
import logo from '../../assets/logo.png'; // Importer le nouveau logo

// Un composant de lien de navigation réutilisable
const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-100 text-[var(--color-primary)]'
          : 'text-[var(--color-text-muted)] hover:bg-gray-100 hover:text-[var(--color-text)]'
      }`
    }
  >
    {children}
  </NavLink>
);

const Header = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation(); // Obtenir le chemin d'accès actuel

  // Définir les liens en fonction du rôle de l'utilisateur
  const navLinks = user?.role === 'candidate' ? (
    <>
      <NavItem to="/candidate/dashboard"><Briefcase size={16} /> Tableau de Bord</NavItem>
      <NavItem to="/candidate/jobs"><Briefcase size={16} /> Emplois</NavItem>
      <NavItem to="/candidate/matches"><Users size={16} /> Correspondances</NavItem>
    </>
  ) : user?.role === 'company' ? (
    <>
      <NavItem to="/company/dashboard"><Briefcase size={16} /> Tableau de Bord</NavItem>
      <NavItem to="/company/jobs"><Briefcase size={16} /> Offres</NavItem>
      <NavItem to="/company/candidates"><Users size={16} /> Candidats</NavItem>
    </>
  ) : null;

  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="header-brand">
          <img src={logo} alt="BaraMatch Logo" className="h-24 w-auto" />
        </Link>

        {/* Navigation pour ordinateur */}
        {user && <nav className="hidden md:flex items-center gap-2">{navLinks}</nav>}

        {/* Actions utilisateur */}
        {user ? (
          <div className="hidden md:flex items-center gap-2">
            <Link to="/notifications" title="Notifications" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
            </Link>
            <Link to={user.role === 'candidate' ? '/candidate/profile' : '/company/profile'} className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center">
              { (user.avatar_url || user.avatar) ? (
                <img src={user.avatar_url || user.avatar} alt={user.full_name || 'Avatar'} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User size={20} className="text-gray-600" />
              )}
            </Link>
            <Link to="/settings" title="Paramètres" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Settings size={20} className="text-gray-600" />
            </Link>
            <button onClick={onLogout} className="btn btn-secondary">
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        ) : (
          // Afficher les boutons de connexion/inscription UNIQUEMENT si PAS sur la page d'accueil
          location.pathname !== '/' && (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary">Connexion</Link>
              <Link to="/register" className="btn btn-primary">Inscription</Link>
            </div>
          )
        )}

        {/* Bouton du menu mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 pt-4 border-t border-gray-200"
        >
          <nav className="flex flex-col gap-2 px-2">
            {user ? (
              <>
                {navLinks}
                <hr className="my-2" />
                <NavItem to={user.role === 'candidate' ? '/candidate/profile' : '/company/profile'}><User size={16} /> Profil</NavItem>
                <button onClick={onLogout} className="w-full btn btn-secondary mt-2">
                  <LogOut size={16} /> Déconnexion
                </button>
              </>
            ) : (
              // Afficher les liens de connexion/inscription UNIQUEMENT si PAS sur la page d'accueil
              location.pathname !== '/' && (
                <>
                  <Link to="/login" className="btn btn-secondary w-full">Connexion</Link>
                  <Link to="/register" className="btn btn-primary w-full mt-2">Inscription</Link>
                </>
              )
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
