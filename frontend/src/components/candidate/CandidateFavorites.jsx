import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Briefcase, MapPin, Clock, DollarSign, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { favoritesAPI, handleAPIError } from '../../services/api';

const CandidateFavorites = ({ onBack }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await favoritesAPI.getAll('job');
      setFavorites(response.data.favorites || []);
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (jobId) => {
    try {
      await favoritesAPI.removeJob(jobId);
      toast.success('Offre retirée des favoris');
      setFavorites(favorites.filter(fav => fav.job.id !== jobId));
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const formatSalary = (job) => {
    if (!job.show_salary || !job.salary_min) return 'Non spécifié';

    const min = job.salary_min.toLocaleString();
    const max = job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : '';
    const currency = job.salary_currency || 'GNF';

    return `${min}${max} ${currency}/${job.salary_period === 'year' ? 'an' : 'mois'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p>Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Heart size={24} color="#ec4899" fill="#ec4899" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>Mes Favoris</h1>
        </div>

        <div style={{ width: '120px' }} />
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
              {favorites.length === 0 ? "Vous n'avez pas encore de favoris" : `${favorites.length} offre${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' }}
            >
              <Heart size={64} color="#475569" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Aucun favori pour le moment</h3>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                Parcourez les offres d'emploi et ajoutez-les à vos favoris pour les retrouver facilement
              </p>
              <button
                onClick={onBack}
                style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Découvrir les offres
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {favorites.map((favorite, index) => {
                const job = favorite.job;
                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', position: 'relative' }}
                  >
                    {/* Favorite badge */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleRemoveFavorite(job.id)}
                        title="Retirer des favoris"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.5rem', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                      {/* Company Logo */}
                      <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
                        {job.company?.logo_url ? (
                          <img src={job.company.logo_url} alt={job.company.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                        ) : (
                          job.company?.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>

                      {/* Job Info */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{job.title}</h3>
                        <p style={{ color: '#06b6d4', fontSize: '0.875rem', marginBottom: '1rem' }}>{job.company?.name || 'Entreprise'}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                            <MapPin size={16} />
                            <span>{job.location || 'Non spécifié'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                            <Briefcase size={16} />
                            <span>{job.contract_type || 'Non spécifié'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                            <DollarSign size={16} />
                            <span>{formatSalary(job)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                            <Clock size={16} />
                            <span>Ajouté {formatDate(favorite.created_at)}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        {job.required_skills && job.required_skills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {job.required_skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} style={{ padding: '0.25rem 0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '6px', color: '#06b6d4', fontSize: '0.75rem', fontWeight: 500 }}>
                                {skill}
                              </span>
                            ))}
                            {job.required_skills.length > 5 && (
                              <span style={{ padding: '0.25rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                                +{job.required_skills.length - 5} autres
                              </span>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {favorite.notes && (
                          <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                            <p style={{ color: '#c4b5fd', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
                              📝 {favorite.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ExternalLink size={16} />
                            Voir l'offre
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CandidateFavorites;
