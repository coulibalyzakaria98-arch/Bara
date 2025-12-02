import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Briefcase,
  UserCheck,
  Eye,
  Star,
  UploadCloud,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useApp } from '../../contexts/AppContext';
import { uploadAPI, analysisAPI, handleAPIError } from '../../services/api';

import DashboardLayout from '../common/DashboardLayout';
import MatchesList from '../shared/MatchesList';
import MyApplications from './MyApplications';
import JobBrowser from './JobBrowser';
import CandidateAnalytics from './CandidateAnalytics';
import CandidateFavorites from './CandidateFavorites';
import { Modal } from '../common/ModalsAndNotifications';
import { openReportWindow } from '../common/ReportTemplate';

// --- Sous-composants pour le Dashboard ---

const StatCard = ({ icon, value, label, color }) => (
    <div className="card p-6 flex flex-col items-center text-center">
        <div className={`mb-4 p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            {icon}
        </div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
    </div>
);

const UploadZone = ({ onFileSelect }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };
    
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div 
            className={`card p-8 text-center cursor-pointer border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-blue-50' : 'border-border hover:border-primary'}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
            <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="font-bold text-lg">Glissez-déposez votre CV</h3>
            <p className="text-gray-500">ou cliquez pour choisir un fichier (PDF, DOC, DOCX)</p>
        </div>
    );
};


// --- Composant Principal du Dashboard ---

const CandidateDashboard = ({ user }) => {
  const { logout } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [cvFile, setCvFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // --- Logique d'analyse de CV (restaurée) ---

  const handleFileSelect = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Maximum 10MB.');
      return;
    }
    setCvFile(file);
    toast.success(`${file.name} sélectionné.`);
  };
  
  const handleAnalyze = async () => {
    if (!cvFile) return toast.error('Veuillez sélectionner un CV.');

    setIsAnalyzing(true);
    setApiError(null);
    const toastId = toast.loading('Analyse de votre CV en cours...');

    try {
      const response = await uploadAPI.uploadCV(cvFile, true);
      if (response.success && response.data.analysis) {
        setAnalysisResult(response.data.analysis);
        toast.success('Analyse terminée !', { id: toastId });
      } else {
        throw new Error(response.message || "L'analyse a échoué.");
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      setApiError(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Rendu des différentes vues ---

  const renderContent = () => {
    switch (currentView) {
      case 'matches':
        return <MatchesList userRole="candidate" onBack={() => setCurrentView('dashboard')} />;
      case 'applications':
        return <MyApplications onBack={() => setCurrentView('dashboard')} />;
      case 'jobs':
        return <JobBrowser onBack={() => setCurrentView('dashboard')} />;
      case 'analytics':
        return <CandidateAnalytics onBack={() => setCurrentView('dashboard')} />;
      case 'favorites':
        return <CandidateFavorites onBack={() => setCurrentView('dashboard')} />;
      default:
        // La VUE PRINCIPALE du tableau de bord
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <StatCard icon={<Briefcase size={24} />} value="12" label="Candidatures" color="blue" />
                <StatCard icon={<UserCheck size={24} />} value="8" label="Matchs reçus" color="green" />
                <StatCard icon={<Eye size={24} />} value="48" label="Vues du profil" color="purple" />
                <StatCard icon={<PieChart size={24} />} value="85%" label="Profil complété" color="yellow" />
            </div>

            <div className="card">
                <h2 className="card-title mb-4">Analyse IA de votre CV</h2>
                {apiError && <div className="alert alert-danger mb-4">{apiError}</div>}

                {!analysisResult ? (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <UploadZone onFileSelect={handleFileSelect} />
                        <div>
                            {cvFile && (
                                <div className="text-center">
                                    <FileText size={48} className="mx-auto text-gray-500" />
                                    <p className="font-bold mt-2">{cvFile.name}</p>
                                    <button onClick={handleAnalyze} className="btn btn-primary mt-4 w-full" disabled={isAnalyzing}>
                                        <Sparkles size={18} /> {isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'analyse'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="font-bold text-lg">Résultats de l'analyse :</h3>
                        <p>Score global : <span className="font-bold text-primary">{analysisResult.overall_score}%</span></p>
                    {/* Affichez plus de détails de l'analyse ici */}
                    <div className="mt-4 flex gap-3">
                      <button
                        className="btn btn-primary"
                        onClick={async () => {
                          if (!analysisResult || !analysisResult.id) return toast.error('Identifiant d\'analyse introuvable');
                          setDownloadingReport(true);
                          try {
                            // analysisAPI.downloadPDF returns blob response
                            // Try backend PDF first if available
                            try {
                              await analysisAPI.downloadPDF(analysisResult.id);
                              toast.success('Rapport téléchargé (backend)');
                            } catch (be) {
                              // Fallback to client-side report window
                              openReportWindow(analysisResult);
                              toast.success('Rapport ouvert en fenêtre (imprimez pour sauvegarder en PDF)');
                            }
                          } catch (err) {
                            const { message } = handleAPIError(err);
                            toast.error(message || 'Erreur lors du téléchargement');
                          } finally {
                            setDownloadingReport(false);
                          }
                        }}
                        disabled={downloadingReport}
                      >
                        {downloadingReport ? 'Téléchargement...' : 'Télécharger le rapport PDF'}
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => setIsDetailsOpen(true)}
                      >
                        Voir les détails
                      </button>
                      <Modal
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                        title="Détails de l'analyse"
                        size="xl"
                      >
                        {analysisResult ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold">Score global</h4>
                              <p className="text-2xl font-bold">{analysisResult.overall_score ?? 'N/A'}%</p>
                            </div>

                            {analysisResult.summary && (
                              <div>
                                <h4 className="font-semibold">Résumé</h4>
                                <p className="text-sm text-gray-600">{analysisResult.summary}</p>
                              </div>
                            )}

                            {analysisResult.strengths && (
                              <div>
                                <h4 className="font-semibold">Forces</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-700">
                                  {analysisResult.strengths.map((s, i) => (<li key={i}>{s}</li>))}
                                </ul>
                              </div>
                            )}

                            {analysisResult.weaknesses && (
                              <div>
                                <h4 className="font-semibold">Points à améliorer</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-700">
                                  {analysisResult.weaknesses.map((w, i) => (<li key={i}>{w}</li>))}
                                </ul>
                              </div>
                            )}

                            {analysisResult.recommendations && (
                              <div>
                                <h4 className="font-semibold">Recommandations</h4>
                                <ol className="list-decimal pl-5 text-sm text-gray-700">
                                  {analysisResult.recommendations.map((r, i) => (<li key={i}>{r}</li>))}
                                </ol>
                              </div>
                            )}

                            {/* Fallback: pretty JSON for any other details */}
                            <div>
                              <h4 className="font-semibold">Détails bruts</h4>
                              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">{JSON.stringify(analysisResult, null, 2)}</pre>
                            </div>
                          </div>
                        ) : (
                          <p>Aucun détail d'analyse disponible.</p>
                        )}
                      </Modal>
                    </div>
                    </div>
                )}
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout user={user} onLogout={logout} onNavigate={(view) => setCurrentView(view)}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default  CandidateDashboard;
