import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  FileText,
  BarChart3,
  Target,
  Zap,
  Award,
  TrendingUp,
  Download,
  Share2,
  Sparkles,
  AlertCircle,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadAPI, analysisAPI, handleAPIError } from '../../services/api';
import NotificationBell from '../shared/NotificationBell';
import MatchesList from '../shared/MatchesList';
import MatchesBadge from '../shared/MatchesBadge';

const CandidateDashboard = ({ user, onLogout, onNavigateToProfile }) => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, matches
  const [cvFile, setCvFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef(null);

  // Si on est dans la vue matches
  if (currentView === 'matches') {
    return <MatchesList userRole="candidate" onBack={() => setCurrentView('dashboard')} />;
  }

  // Télécharger le rapport PDF
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const analysisId = analysisResult?.rawData?.analysis_id;
      await analysisAPI.downloadPDF(analysisId);
      toast.success('Rapport PDF téléchargé !');
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      const { message } = handleAPIError(error);
      toast.error(message || 'Erreur lors du téléchargement');
    } finally {
      setIsDownloading(false);
    }
  };

  // Transform API response to display format
  const transformAnalysisResult = (apiResponse) => {
    const { analysis } = apiResponse;

    // Extract strengths from scores
    const strengths = [];
    const scores = analysis.scores_breakdown || {};
    if (scores.technical_skills >= 70) strengths.push("Bonnes compétences techniques détectées");
    if (scores.experience >= 70) strengths.push("Expérience professionnelle solide");
    if (scores.education >= 70) strengths.push("Formation pertinente pour le poste");
    if (scores.presentation >= 70) strengths.push("Bonne présentation du CV");
    if (scores.completeness >= 70) strengths.push("CV complet avec toutes les sections");

    // Extract keywords
    const keywords = analysis.keywords || [];

    // Transform recommendations to suggestions
    const suggestions = (analysis.recommendations || []).map(rec => rec.message || rec.suggestion || rec.title);

    return {
      score: Math.round(analysis.overall_score || 0),
      strengths: strengths.length > 0 ? strengths : ["CV analysé avec succès"],
      keywords: keywords.slice(0, 12),
      suggestions: suggestions.slice(0, 5),
      details: {
        relevantKeywords: keywords.length,
        structure: scores.presentation || 0,
        experience: scores.experience || 0,
        education: scores.education || 0
      },
      rawData: analysis
    };
  };

  const handleFileSelect = (file) => {
    if (file.type === 'application/pdf' || 
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      if (file.size <= 10 * 1024 * 1024) {
        setCvFile(file);
        toast.success(`${file.name} sélectionné`);
      } else {
        toast.error('Fichier trop volumineux. Maximum 10MB.');
      }
    } else {
      toast.error('Format de fichier non supporté. Utilisez PDF, DOC ou DOCX.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!cvFile) {
      toast.error('Veuillez sélectionner un CV d\'abord');
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);
    toast.loading('Upload et analyse en cours...', { id: 'analyzing' });

    try {
      // Upload CV with auto-analyze enabled
      const response = await uploadAPI.uploadCV(cvFile, true);

      if (response.success && response.data.analysis) {
        const result = transformAnalysisResult(response.data);
        setAnalysisResult(result);
        toast.success('Analyse terminée !', { id: 'analyzing' });
      } else if (response.success) {
        // Upload successful but no analysis
        toast.success('CV uploadé avec succès', { id: 'analyzing' });
        setApiError('L\'analyse n\'a pas pu être effectuée. Réessayez plus tard.');
      } else {
        throw new Error(response.message || 'Erreur lors de l\'analyse');
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      const { message, status } = handleAPIError(error);

      if (status === 401) {
        setApiError('Session expirée. Veuillez vous reconnecter.');
      } else if (status === 0) {
        setApiError('Impossible de contacter le serveur. Vérifiez que le backend est en cours d\'exécution.');
      } else {
        setApiError(message);
      }

      toast.error(message, { id: 'analyzing' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const StatCard = ({ icon: Icon, value, label, color }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="stat-card"
    >
      <div className={`stat-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );

  const FeatureCard = ({ icon: Icon, title, description, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="feature-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="feature-icon">
        <Icon size={32} />
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
    </motion.div>
  );

  return (
    <div className="dashboard-page">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <button className="logout-btn" onClick={onLogout}>
          <ArrowLeft size={20} />
          <span>Déconnexion</span>
        </button>
        
        <div className="nav-brand">
          <div className="nav-logo">
            <div className="logo-glow small">
              <div className="logo">🚀</div>
            </div>
          </div>
          <div className="nav-titles">
            <h1>BaraCorrespondance</h1>
            <p>Espace Talent - {user?.full_name || user?.email}</p>
          </div>
        </div>

        <div className="user-menu">
          <button
            className="profile-btn"
            onClick={onNavigateToProfile}
            title="Mon profil"
          >
            <User size={20} />
          </button>
          <MatchesBadge onClick={() => setCurrentView('matches')} />
          <NotificationBell />
          <div className="user-avatar" onClick={onNavigateToProfile} style={{ cursor: 'pointer' }}>
            {(user?.full_name || user?.email)?.charAt(0)?.toUpperCase()}
          </div>
          <span className="user-name">{user?.full_name || user?.email}</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-hero"
        >
          <h2>Bienvenue, <span className="highlight">{user?.full_name || user?.email}</span></h2>
          <p>
            Notre intelligence artificielle analyse votre profil et vous connecte aux 
            opportunités qui correspondent vraiment à vos ambitions.
          </p>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Upload Section */}
          <div className="main-content">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="upload-section"
            >
              <div className="section-header">
                <Upload size={24} />
                <h3>Analyse IA de votre CV</h3>
              </div>
              
              <div 
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${cvFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {cvFile ? (
                  <div className="file-info">
                    <FileText size={48} />
                    <p className="file-name">{cvFile.name}</p>
                    <p className="file-size">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📤</div>
                    <p className="upload-text">Glissez votre CV ici ou cliquez pour parcourir</p>
                    <p className="upload-info">PDF, DOC, DOCX - Max 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
              </div>

              <div className="upload-features">
                <div className="upload-feature">
                  <Zap size={20} />
                  <span>Analyse en 30s</span>
                </div>
                <div className="upload-feature">
                  <Target size={20} />
                  <span>Score détaillé</span>
                </div>
                <div className="upload-feature">
                  <Sparkles size={20} />
                  <span>Conseils perso</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
                onClick={handleAnalyze}
                disabled={!cvFile || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="spinner" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Lancer l'analyse IA
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* API Error Display */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="api-error"
              >
                <AlertCircle size={20} />
                <span>{apiError}</span>
              </motion.div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="analysis-results"
              >
                <div className="results-header">
                  <h3>Résultats de l'analyse IA</h3>
                  <div className="score-badge">
                    Score: <span>{analysisResult.score}/100</span>
                  </div>
                </div>

                <div className="results-grid">
                  <div className="result-category">
                    <h4>📊 Points forts</h4>
                    <ul>
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index}>✓ {strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="result-category">
                    <h4>🎯 Mots-clés détectés</h4>
                    <div className="keywords-container">
                      {analysisResult.keywords.map((keyword, index) => (
                        <span key={index} className="keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>

                  <div className="result-category">
                    <h4>💡 Suggestions d'amélioration</h4>
                    <ul>
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li key={index}>✨ {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="results-actions">
                  <button
                    className="action-btn primary"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                  >
                    <Download size={18} />
                    {isDownloading ? 'Téléchargement...' : 'Télécharger le rapport PDF'}
                  </button>
                  <button className="action-btn secondary">
                    <Share2 size={18} />
                    Partager
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="stats-sidebar"
          >
            <StatCard 
              icon={Award} 
              value={analysisResult ? `${analysisResult.score}/100` : "0/100"} 
              label="Score CV" 
              color="yellow" 
            />
            <StatCard 
              icon={TrendingUp} 
              value="0%" 
              label="Taux de match" 
              color="green" 
            />
            <StatCard 
              icon={Zap} 
              value="--" 
              label="Temps moyen" 
              color="purple" 
            />
            <StatCard 
              icon={BarChart3} 
              value="0" 
              label="Offres/jour" 
              color="blue" 
            />
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="features-grid"
        >
          <FeatureCard
            icon={Target}
            title="Mes Matchs"
            description="Opportunités qui correspondent à votre profil"
            onClick={() => setCurrentView('matches')}
          />
          <FeatureCard 
            icon={Sparkles} 
            title="Recommandations" 
            description="Conseils personnalisés en temps réel"
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="Opportunités" 
            description="Accès aux entreprises premium"
          />
          <FeatureCard 
            icon={Award} 
            title="Croissance" 
            description="Suivi de votre évolution"
          />
        </motion.div>
      </div>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: #0f172a;
        }

        .dashboard-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-5px);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-logo .logo-glow.small {
          padding: 0.5rem;
        }

        .nav-logo .logo {
          font-size: 1.5rem;
        }

        .nav-titles h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .nav-titles p {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .profile-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .user-name {
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-hero {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-hero h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1rem;
        }

        .dashboard-hero .highlight {
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-hero p {
          color: #94a3b8;
          font-size: 1.125rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .upload-section, .analysis-results {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .api-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 0.875rem;
        }

        .api-error svg {
          color: #ef4444;
          flex-shrink: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: #06b6d4;
        }

        .section-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .upload-zone {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .upload-zone:hover, .upload-zone.dragging {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
        }

        .upload-zone.has-file {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-text {
          font-size: 1.125rem;
          color: #e2e8f0;
          margin-bottom: 0.5rem;
        }

        .upload-info {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .file-info svg {
          color: #10b981;
        }

        .file-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
        }

        .file-size {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0;
        }

        .upload-features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 1.5rem 0;
        }

        .upload-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e1;
          font-size: 0.875rem;
        }

        .upload-feature svg {
          color: #06b6d4;
        }

        .analyze-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .analyze-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .analyze-btn:not(:disabled):hover {
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
        }

        .analyze-btn.analyzing {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .results-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .score-badge {
          padding: 0.75rem 1.5rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          font-size: 0.875rem;
          color: #cbd5e1;
        }

        .score-badge span {
          font-size: 1.5rem;
          font-weight: 800;
          color: #06b6d4;
          margin-left: 0.5rem;
        }

        .results-grid {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .result-category {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .result-category h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 1rem 0;
        }

        .result-category ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .result-category li {
          color: #cbd5e1;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .keywords-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .keyword-tag {
          padding: 0.5rem 1rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 8px;
          color: #06b6d4;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .results-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: #fff;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .stats-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
        }

        .stat-icon {
          margin-bottom: 1rem;
        }

        .stat-icon.yellow svg { color: #f59e0b; }
        .stat-icon.green svg { color: #10b981; }
        .stat-icon.purple svg { color: #8b5cf6; }
        .stat-icon.blue svg { color: #06b6d4; }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .feature-card:hover {
          border-color: rgba(6, 182, 212, 0.3);
          transform: translateY(-5px);
        }

        .feature-icon {
          margin-bottom: 1rem;
          color: #06b6d4;
        }

        .feature-card h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .feature-card p {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .stats-sidebar {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .dashboard-hero h2 {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CandidateDashboard;
