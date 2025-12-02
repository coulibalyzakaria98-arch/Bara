import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Building2,
  Search,
  Filter,
  CheckCircle,
  Send,
  FileText,
  Star,
  Calendar,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, applicationsAPI, matchingAPI, handleAPIError } from '../../services/api';

const JobBrowser = ({ onBack }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => {
    loadJobs();
    loadMatchScores();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.list({ is_active: true });
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchScores = async () => {
    try {
      const response = await matchingAPI.getMatchedJobs(100, 0);
      if (response.success && response.data?.jobs) {
        const scores = {};
        response.data.jobs.forEach(match => {
          scores[match.job_id] = match.match_score;
        });
        setMatchScores(scores);
      }
    } catch (error) {
      console.error('Error loading match scores:', error);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    setApplying(true);
    try {
      await applicationsAPI.applyToJob(selectedJob.id, coverLetter || null);
      toast.success('Candidature envoyée avec succès !');
      setShowApplyModal(false);
      setSelectedJob(null);
      setCoverLetter('');
      loadJobs(); // Reload to update application status
    } catch (error) {
      console.error('Error applying:', error);
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  const getContractTypeLabel = (type) => {
    const labels = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'Stage': 'Stage',
      'Alternance': 'Alternance',
      'Freelance': 'Freelance'
    };
    return labels[type] || type;
  };

  const getContractTypeColor = (type) => {
    const colors = {
      'CDI': '#10b981',
      'CDD': '#06b6d4',
      'Stage': '#f59e0b',
      'Alternance': '#8b5cf6',
      'Freelance': '#ec4899'
    };
    return colors[type] || '#64748b';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#06b6d4';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = (job.title || '').toLowerCase();
      const company = (job.company?.name || '').toLowerCase();
      const description = (job.description || '').toLowerCase();
      if (!title.includes(query) && !company.includes(query) && !description.includes(query)) {
        return false;
      }
    }

    // Location filter
    if (locationFilter && job.location) {
      if (!job.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    // Contract type filter
    if (contractFilter !== 'all' && job.contract_type !== contractFilter) {
      return false;
    }

    return true;
  });

  // Sort by match score if available
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const scoreA = matchScores[a.id] || 0;
    const scoreB = matchScores[b.id] || 0;
    return scoreB - scoreA;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8' }}>Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Briefcase size={24} color="#06b6d4" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Offres d'emploi
          </h1>
        </div>

        <div style={{ width: '150px' }} />
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Filters */}
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Filter size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', margin: 0 }}>Rechercher</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Mots-clés
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titre, entreprise..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Localisation
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Ville, région..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Contract Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Type de contrat
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', 'CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'].map(type => (
                  <button
                    key={type}
                    onClick={() => setContractFilter(type)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: contractFilter === type ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${contractFilter === type ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '8px',
                      color: contractFilter === type ? '#06b6d4' : '#94a3b8',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type === 'all' ? 'Tous' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>
            {sortedJobs.length} offre{sortedJobs.length !== 1 ? 's' : ''} disponible{sortedJobs.length !== 1 ? 's' : ''}
          </h3>
        </div>

        {/* Jobs List */}
        {sortedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
            <Briefcase size={64} color="#475569" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Aucune offre trouvée
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {searchQuery || locationFilter || contractFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Les offres d\'emploi apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {sortedJobs.map((job) => {
              const matchScore = matchScores[job.id];
              const hasApplied = job.has_applied || false;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '2rem',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                >
                  {/* Match Score Badge */}
                  {matchScore && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: `${getMatchScoreColor(matchScore)}20`,
                      border: `1px solid ${getMatchScoreColor(matchScore)}50`,
                      borderRadius: '8px'
                    }}>
                      <TrendingUp size={16} color={getMatchScoreColor(matchScore)} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: getMatchScoreColor(matchScore) }}>
                        {Math.round(matchScore)}% match
                      </span>
                    </div>
                  )}

                  {/* Company Logo */}
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {(job.company?.name || 'C').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                        {job.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {job.company?.name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building2 size={16} color="#64748b" />
                            <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{job.company.name}</span>
                          </div>
                        )}
                        {job.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} color="#64748b" />
                            <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{job.location}</span>
                          </div>
                        )}
                        {job.contract_type && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: `${getContractTypeColor(job.contract_type)}20`,
                            border: `1px solid ${getContractTypeColor(job.contract_type)}50`,
                            borderRadius: '6px',
                            color: getContractTypeColor(job.contract_type),
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {getContractTypeLabel(job.contract_type)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      margin: 0,
                      maxHeight: '4.8em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {job.description}
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {job.salary_range && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={16} color="#10b981" />
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{job.salary_range}</span>
                      </div>
                    )}
                    {job.experience_level && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={16} color="#f59e0b" />
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{job.experience_level}</span>
                      </div>
                    )}
                    {job.created_at && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="#64748b" />
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                          Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    {job.applications_count !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} color="#64748b" />
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                          {job.applications_count} candidature{job.applications_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {job.required_skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'rgba(6, 182, 212, 0.1)',
                              border: '1px solid rgba(6, 182, 212, 0.2)',
                              borderRadius: '8px',
                              color: '#06b6d4',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 6 && (
                          <span style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#94a3b8',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}>
                            +{job.required_skills.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Apply Button */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {hasApplied ? (
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        color: '#10b981',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        <CheckCircle size={18} />
                        <span>Candidature envoyée</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowApplyModal(true);
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '1rem',
                          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                      >
                        <Send size={18} />
                        <span>Postuler</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && selectedJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowApplyModal(false);
                setSelectedJob(null);
                setCoverLetter('');
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto',
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '2rem',
                zIndex: 1001
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
                Postuler à cette offre
              </h3>

              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Offre</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                  {selectedJob.title}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  {selectedJob.company?.name} • {selectedJob.location}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                  Lettre de motivation (optionnel)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.6
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                  Une lettre de motivation personnalisée augmente vos chances d'être retenu
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedJob(null);
                    setCoverLetter('');
                  }}
                  disabled={applying}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: applying ? 'not-allowed' : 'pointer',
                    opacity: applying ? 0.5 : 1
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: applying ? 'rgba(6, 182, 212, 0.5)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: applying ? 'not-allowed' : 'pointer',
                    opacity: applying ? 0.7 : 1
                  }}
                >
                  {applying ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Envoyer ma candidature</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JobBrowser;
