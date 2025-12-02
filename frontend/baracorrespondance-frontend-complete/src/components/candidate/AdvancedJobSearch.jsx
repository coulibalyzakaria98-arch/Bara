import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, X, MapPin, Briefcase, DollarSign, GraduationCap, Clock, Home, Star, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, handleAPIError } from '../../services/api';

const AdvancedJobSearch = ({ onBack }) => {
  const [showFilters, setShowFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    contract_type: '',
    experience_level: '',
    education_level: '',
    is_remote: '',
    min_salary: '',
    max_salary: '',
    skills: '',
    sort_by: 'recent'
  });

  useEffect(() => {
    searchJobs();
  }, [currentPage]);

  const searchJobs = async () => {
    setIsLoading(true);
    try {
      // Construire les paramètres de recherche
      const params = {
        page: currentPage,
        per_page: 10,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      const response = await jobsAPI.list(params);
      setJobs(response.data.items || []);
      setTotalJobs(response.data.total || 0);
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    searchJobs();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      city: '',
      contract_type: '',
      experience_level: '',
      education_level: '',
      is_remote: '',
      min_salary: '',
      max_salary: '',
      skills: '',
      sort_by: 'recent'
    });
    setCurrentPage(1);
  };

  const formatSalary = (job) => {
    if (!job.show_salary || !job.salary_min) return 'Non spécifié';

    const min = job.salary_min.toLocaleString();
    const max = job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : '';
    const currency = job.salary_currency || 'GNF';

    return `${min}${max} ${currency}/${job.salary_period === 'year' ? 'an' : 'mois'}`;
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== 'recent').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={24} color="#06b6d4" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>Recherche Avancée</h1>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: showFilters ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer', position: 'relative' }}
        >
          <Filter size={20} />
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ec4899', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: showFilters ? '350px 1fr' : '1fr', gap: '2rem' }}>
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', margin: 0 }}>Filtres</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    <X size={14} />
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Search Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Search size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Mots-clés
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Ex: Développeur, Marketing..."
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* City */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Ville
                </label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Ex: Conakry, Kindia..."
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                />
              </div>

              {/* Contract Type */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Type de contrat
                </label>
                <select
                  value={filters.contract_type}
                  onChange={(e) => handleFilterChange('contract_type', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                >
                  <option value="">Tous</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Alternance">Alternance</option>
                </select>
              </div>

              {/* Experience Level */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Niveau d'expérience
                </label>
                <select
                  value={filters.experience_level}
                  onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                >
                  <option value="">Tous</option>
                  <option value="junior">Junior (0-2 ans)</option>
                  <option value="intermediate">Intermédiaire (3-5 ans)</option>
                  <option value="senior">Senior (5+ ans)</option>
                </select>
              </div>

              {/* Education Level */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <GraduationCap size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Niveau d'études
                </label>
                <select
                  value={filters.education_level}
                  onChange={(e) => handleFilterChange('education_level', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                >
                  <option value="">Tous</option>
                  <option value="bac">Bac</option>
                  <option value="bac+2">Bac+2</option>
                  <option value="bac+3">Bac+3 (Licence)</option>
                  <option value="bac+5">Bac+5 (Master)</option>
                  <option value="bac+8">Bac+8 (Doctorat)</option>
                </select>
              </div>

              {/* Remote Work */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Home size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Télétravail
                </label>
                <select
                  value={filters.is_remote}
                  onChange={(e) => handleFilterChange('is_remote', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                >
                  <option value="">Tous</option>
                  <option value="true">Télétravail possible</option>
                  <option value="false">Présentiel uniquement</option>
                </select>
              </div>

              {/* Salary Range */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <DollarSign size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Fourchette salariale (GNF)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={filters.min_salary}
                    onChange={(e) => handleFilterChange('min_salary', e.target.value)}
                    placeholder="Min"
                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                  />
                  <input
                    type="number"
                    value={filters.max_salary}
                    onChange={(e) => handleFilterChange('max_salary', e.target.value)}
                    placeholder="Max"
                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Star size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Compétences (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                  placeholder="Ex: Python, React, SQL"
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Search size={18} />
                Rechercher
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {isLoading ? 'Recherche en cours...' : `${totalJobs} résultat${totalJobs > 1 ? 's' : ''} trouvé${totalJobs > 1 ? 's' : ''}`}
            </p>

            {/* Sort */}
            <select
              value={filters.sort_by}
              onChange={(e) => { handleFilterChange('sort_by', e.target.value); handleSearch(); }}
              style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.875rem' }}
            >
              <option value="recent">Plus récent</option>
              <option value="salary_desc">Salaire décroissant</option>
              <option value="salary_asc">Salaire croissant</option>
              <option value="experience_asc">Expérience min croissante</option>
              <option value="experience_desc">Expérience min décroissante</option>
            </select>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' }}>
              <Search size={64} color="#475569" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Aucune offre trouvée</h3>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem' }}
                >
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {/* Company Logo */}
                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
                      {job.company?.logo_url ? (
                        <img src={job.company.logo_url} alt={job.company.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                      ) : (
                        job.company?.name?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{job.title}</h3>
                          <p style={{ color: '#06b6d4', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{job.company?.name || 'Entreprise'}</p>
                        </div>
                        {(job.is_urgent || job.is_featured) && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {job.is_urgent && (
                              <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                                URGENT
                              </span>
                            )}
                            {job.is_featured && (
                              <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>
                                FEATURED
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                          <MapPin size={14} />
                          <span>{job.location || 'Non spécifié'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                          <Briefcase size={14} />
                          <span>{job.contract_type || 'Non spécifié'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                          <DollarSign size={14} />
                          <span>{formatSalary(job)}</span>
                        </div>
                        {job.is_remote && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.75rem' }}>
                            <Home size={14} />
                            <span>Télétravail</span>
                          </div>
                        )}
                      </div>

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

                      <button style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ExternalLink size={14} />
                        Voir l'offre
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalJobs > 10 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem 1rem', background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: currentPage === 1 ? '#64748b' : '#e2e8f0', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Précédent
              </button>
              <span style={{ padding: '0.5rem 1rem', color: '#cbd5e1' }}>
                Page {currentPage} sur {Math.ceil(totalJobs / 10)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalJobs / 10)}
                style={{ padding: '0.5rem 1rem', background: currentPage >= Math.ceil(totalJobs / 10) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: currentPage >= Math.ceil(totalJobs / 10) ? '#64748b' : '#e2e8f0', cursor: currentPage >= Math.ceil(totalJobs / 10) ? 'not-allowed' : 'pointer' }}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdvancedJobSearch;
