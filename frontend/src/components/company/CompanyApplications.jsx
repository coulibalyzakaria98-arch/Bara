import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit3,
  Search,
  Filter,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, applicationsAPI, handleAPIError } from '../../services/api';

const CompanyApplications = ({ onBack }) => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', notes: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les jobs de l'entreprise
      const jobsResponse = await jobsAPI.getCompanyJobs();
      setJobs(jobsResponse.data || []);

      // Charger toutes les candidatures via les jobs
      const allApplications = [];
      for (const job of (jobsResponse.data || [])) {
        try {
          const appResponse = await jobsAPI.get(job.id);
          if (appResponse.data && appResponse.data.applications) {
            allApplications.push(...appResponse.data.applications.map(app => ({
              ...app,
              job: { id: job.id, title: job.title, location: job.location }
            })));
          }
        } catch (error) {
          console.error(`Error loading applications for job ${job.id}:`, error);
        }
      }

      setApplications(allApplications);

      // Charger les statistiques
      const statsResponse = await applicationsAPI.getStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedApplication) return;

    if (!statusUpdateData.status) {
      toast.error('Veuillez sélectionner un statut');
      return;
    }

    try {
      await applicationsAPI.updateStatus(
        selectedApplication.id,
        statusUpdateData.status,
        statusUpdateData.notes || null
      );

      toast.success('Statut mis à jour avec succès');
      setShowStatusModal(false);
      setSelectedApplication(null);
      setStatusUpdateData({ status: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const openStatusModal = (application) => {
    setSelectedApplication(application);
    setStatusUpdateData({
      status: application.status,
      notes: application.company_notes || ''
    });
    setShowStatusModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        label: 'En attente',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        icon: <Clock size={14} />
      },
      reviewed: {
        label: 'Examinée',
        color: '#06b6d4',
        bgColor: 'rgba(6, 182, 212, 0.1)',
        borderColor: 'rgba(6, 182, 212, 0.3)',
        icon: <Eye size={14} />
      },
      accepted: {
        label: 'Acceptée',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        icon: <CheckCircle size={14} />
      },
      rejected: {
        label: 'Refusée',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        icon: <XCircle size={14} />
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: badge.bgColor,
          border: `1px solid ${badge.borderColor}`,
          borderRadius: '8px',
          color: badge.color,
          fontSize: '0.875rem',
          fontWeight: 600,
          width: 'fit-content'
        }}
      >
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#06b6d4';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Filtrer les candidatures
  const filteredApplications = applications.filter(app => {
    // Filtre par job
    if (selectedJobId !== 'all' && app.job_id !== parseInt(selectedJobId)) {
      return false;
    }

    // Filtre par statut
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const candidateName = (app.candidate?.full_name || '').toLowerCase();
      const candidateEmail = (app.candidate?.email || '').toLowerCase();
      return candidateName.includes(query) || candidateEmail.includes(query);
    }

    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8' }}>Chargement des candidatures...</p>
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
            Gestion des Candidatures
          </h1>
        </div>

        <div style={{ width: '150px' }} />
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total', value: stats.total, color: '#06b6d4', icon: Briefcase },
              { label: 'En attente', value: stats.pending, color: '#f59e0b', icon: Clock },
              { label: 'Examinées', value: stats.reviewed, color: '#06b6d4', icon: Eye },
              { label: 'Acceptées', value: stats.accepted, color: '#10b981', icon: CheckCircle },
              { label: 'Refusées', value: stats.rejected, color: '#ef4444', icon: XCircle }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -3 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <stat.icon size={24} color={stat.color} style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Filter size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', margin: 0 }}>Filtres</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Rechercher un candidat
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom ou email..."
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

            {/* Job Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Offre d'emploi
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Toutes les offres</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Statut
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: statusFilter === status ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${statusFilter === status ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '8px',
                      color: statusFilter === status ? '#06b6d4' : '#94a3b8',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'reviewed' ? 'Examinées' : status === 'accepted' ? 'Acceptées' : 'Refusées'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>
            {filteredApplications.length} candidature{filteredApplications.length !== 1 ? 's' : ''}
          </h3>
        </div>

        {filteredApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
            <Briefcase size={64} color="#475569" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Aucune candidature trouvée
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {searchQuery || statusFilter !== 'all' || selectedJobId !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Les candidatures reçues apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredApplications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.25rem',
                        fontWeight: 700
                      }}>
                        {(application.candidate?.full_name || application.candidate?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', margin: '0 0 0.25rem 0' }}>
                          {application.candidate?.full_name || application.candidate?.email}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                          {application.job?.title}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                      {application.candidate?.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={16} color="#64748b" />
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{application.candidate.email}</span>
                        </div>
                      )}
                      {application.candidate?.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={16} color="#64748b" />
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{application.candidate.phone}</span>
                        </div>
                      )}
                      {application.job?.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={16} color="#64748b" />
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{application.job.location}</span>
                        </div>
                      )}
                      {application.created_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} color="#64748b" />
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                            {new Date(application.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {application.match_score && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TrendingUp size={16} color={getMatchScoreColor(application.match_score)} />
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Score de match:</span>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: getMatchScoreColor(application.match_score)
                        }}>
                          {Math.round(application.match_score)}%
                        </span>
                      </div>
                    )}

                    {application.cover_letter && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <FileText size={16} color="#06b6d4" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1' }}>
                            Lettre de motivation:
                          </span>
                        </div>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#94a3b8',
                          margin: 0,
                          lineHeight: 1.6,
                          maxHeight: '4.8em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {application.cover_letter}
                        </p>
                      </div>
                    )}

                    {application.company_notes && application.status !== 'pending' && (
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(6, 182, 212, 0.05)',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <FileText size={16} color="#06b6d4" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1' }}>
                            Vos notes:
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                          {application.company_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    {getStatusBadge(application.status)}
                    <button
                      onClick={() => openStatusModal(application)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Edit3 size={16} />
                      <span>Modifier</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedApplication && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowStatusModal(false);
                setSelectedApplication(null);
                setStatusUpdateData({ status: '', notes: '' });
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
                Modifier le statut
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Candidat</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                    {selectedApplication.candidate?.full_name || selectedApplication.candidate?.email}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                    {selectedApplication.job?.title}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                    Nouveau statut
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {[
                      { value: 'pending', label: 'En attente', icon: Clock, color: '#f59e0b' },
                      { value: 'reviewed', label: 'Examinée', icon: Eye, color: '#06b6d4' },
                      { value: 'accepted', label: 'Acceptée', icon: CheckCircle, color: '#10b981' },
                      { value: 'rejected', label: 'Refusée', icon: XCircle, color: '#ef4444' }
                    ].map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setStatusUpdateData({ ...statusUpdateData, status: value })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '1rem',
                          background: statusUpdateData.status === value ? `${color}20` : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${statusUpdateData.status === value ? color : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          color: statusUpdateData.status === value ? color : '#94a3b8',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Icon size={18} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                    Notes internes (optionnel)
                  </label>
                  <textarea
                    value={statusUpdateData.notes}
                    onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                    placeholder="Ajoutez des notes sur cette candidature..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedApplication(null);
                    setStatusUpdateData({ status: '', notes: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateStatus}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Enregistrer
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

export default CompanyApplications;
