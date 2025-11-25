import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Briefcase, TrendingUp, Target, User, Wand2 } from 'lucide-react';
import NotificationBell from '../shared/NotificationBell';
import PosterGenerator from './PosterGenerator';
import MatchesList from '../shared/MatchesList';
import MatchesBadge from '../shared/MatchesBadge';

const CompanyDashboard = ({ user, onLogout, onNavigateToProfile }) => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, posters, matches

  // Si on est dans la vue poster generator
  if (currentView === 'posters') {
    return <PosterGenerator user={user} onBack={() => setCurrentView('dashboard')} />;
  }

  // Si on est dans la vue matches
  if (currentView === 'matches') {
    return <MatchesList userRole="company" onBack={() => setCurrentView('dashboard')} />;
  }

  // Vue dashboard normale
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
          <span>Déconnexion</span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>BaraCorrespondance</h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Espace Entreprise - {user?.profile?.name || user?.full_name || user?.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onNavigateToProfile}
            title="Mon profil"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <User size={20} />
          </button>
          <MatchesBadge onClick={() => setCurrentView('matches')} />
          <NotificationBell />
          <div onClick={onNavigateToProfile} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {(user?.profile?.name || user?.full_name || user?.email)?.charAt(0)?.toUpperCase()}
          </div>
          <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{user?.profile?.name || user?.full_name || user?.email}</span>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Bienvenue, <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.profile?.name || user?.full_name || user?.email}</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
            Gérez vos recrutements et trouvez les meilleurs talents grâce à notre IA
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { icon: Users, value: '0', label: 'Candidats', color: '#06b6d4' },
            { icon: Briefcase, value: '0', label: 'Offres actives', color: '#8b5cf6' },
            { icon: TrendingUp, value: '0%', label: 'Taux de match', color: '#10b981' },
            { icon: Target, value: '0', label: 'Entretiens', color: '#f59e0b' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <stat.icon size={32} color={stat.color} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Offres d'emploi</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Créer et gérer vos annonces
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Créer une offre
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setCurrentView('matches')}
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Candidats Matchés</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Talents détectés automatiquement
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <Target size={16} />
              Voir les matchs
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setCurrentView('posters')}
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Affiches IA</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Générer des affiches attrayantes
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <Wand2 size={16} />
              Créer une affiche
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Analytics</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Statistiques détaillées
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Voir les stats
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
