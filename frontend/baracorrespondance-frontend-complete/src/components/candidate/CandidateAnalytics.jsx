import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI, handleAPIError } from '../../services/api';

const CandidateAnalytics = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        analyticsAPI.getCandidateStats(),
        analyticsAPI.getCandidateActivity()
      ]);

      setStats(statsResponse.data);
      setActivity(activityResponse.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await analyticsAPI.exportPDF();

      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_candidat_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Rapport PDF téléchargé avec succès!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#06b6d4';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={16} color="#f59e0b" />,
      reviewed: <FileText size={16} color="#06b6d4" />,
      accepted: <CheckCircle size={16} color="#10b981" />,
      rejected: <XCircle size={16} color="#ef4444" />
    };
    return icons[status] || <Clock size={16} />;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8' }}>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ color: '#94a3b8' }}>Aucune donnée disponible</p>
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
          <BarChart3 size={24} color="#06b6d4" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Dashboard Analytics
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportPDF}
          disabled={exporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: exporting ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: exporting ? 0.6 : 1
          }}
        >
          <Download size={18} />
          <span>{exporting ? 'Export en cours...' : 'Exporter PDF'}</span>
        </motion.button>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Profile Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <motion.div
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
            <PieChart size={24} color="#06b6d4" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {stats.profile.completion}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Profil Complété
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: `${stats.profile.completion}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', borderRadius: '2px', transition: 'width 0.5s' }} />
            </div>
          </motion.div>

          <motion.div
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
            <Award size={24} color={getScoreColor(stats.profile.cv_score)} style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(stats.profile.cv_score), marginBottom: '0.25rem' }}>
              {stats.profile.cv_score}/100
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Score CV
            </div>
          </motion.div>

          <motion.div
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
            <Briefcase size={24} color="#8b5cf6" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {stats.profile.experience_years}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Années d'Expérience
            </div>
          </motion.div>

          <motion.div
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
            <Target size={24} color="#10b981" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {stats.profile.skills_count}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Compétences
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Applications Stats */}
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="#06b6d4" />
              Candidatures
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#06b6d4' }}>
                  {stats.applications.total}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Total</div>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>
                  {stats.applications.pending}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>En attente</div>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                  {stats.applications.accepted}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Acceptées</div>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>
                  {stats.applications.rejected}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Refusées</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Taux de réponse</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#06b6d4' }}>
                  {stats.applications.response_rate}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Taux de succès</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                  {stats.applications.success_rate}%
                </div>
              </div>
            </div>
          </div>

          {/* Matches Stats */}
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} color="#10b981" />
              Matchs
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                  {stats.matches.total}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Total matchs</div>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#8b5cf6' }}>
                  {stats.matches.high_quality}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Haute qualité (80%+)</div>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Score moyen de compatibilité</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(stats.matches.average_score) }}>
                {stats.matches.average_score}%
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{ width: `${stats.matches.average_score}%`, height: '100%', background: `linear-gradient(90deg, ${getScoreColor(stats.matches.average_score)}, ${getScoreColor(stats.matches.average_score)}aa)`, borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Matches */}
        {stats.matches.top_matches && stats.matches.top_matches.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#f59e0b" />
              Meilleurs Matchs
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.matches.top_matches.map((match, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>
                      {match.job_title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {match.company_name}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: `${getScoreColor(match.match_score)}20`,
                    border: `1px solid ${getScoreColor(match.match_score)}50`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: getScoreColor(match.match_score)
                  }}>
                    {match.match_score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#ec4899" />
            Activité Récente
          </h3>

          {activity.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Aucune activité récente</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {activity.slice(0, 10).map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {item.type === 'application' ? (
                    <>
                      {getStatusIcon(item.status)}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
                          Candidature : <span style={{ fontWeight: 600 }}>{item.job_title}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          {item.company} • {new Date(item.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                        {item.status}
                      </div>
                    </>
                  ) : (
                    <>
                      <Target size={16} color="#10b981" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
                          Match : <span style={{ fontWeight: 600 }}>{item.job_title}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          {item.company} • {new Date(item.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: `${getScoreColor(item.score)}20`,
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: getScoreColor(item.score)
                      }}>
                        {item.score}%
                      </div>
                    </>
                  )}
                </div>
              ))}
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

export default CandidateAnalytics;
