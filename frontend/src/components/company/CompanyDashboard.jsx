import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, UserPlus, FileText, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

import DashboardLayout from '../common/DashboardLayout';
import JobManagement from './JobManagement';
import CompanyCandidatesMatching from './CompanyCandidatesMatching';
import CompanyApplications from './CompanyApplications';

const StatCard = ({ icon, value, label, color }) => (
    <div className="card p-6">
        <div className={`mb-4 inline-block p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            {icon}
        </div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
    </div>
);

const CompanyDashboard = ({ user }) => {
  const { logout } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');

  const recentJobs = [
    { id: 1, title: 'Développeur Full-Stack Senior', candidates: 12, status: 'Actif' },
    { id: 2, title: 'Responsable Marketing Digital', candidates: 35, status: 'Actif' },
    { id: 3, title: 'Comptable Expérimenté', candidates: 8, status: 'Fermé' },
  ];

  const renderContent = () => {
    switch(currentView) {
        case 'jobs':
            return <JobManagement onBack={() => setCurrentView('dashboard')} />;
        case 'candidates':
            return <CompanyCandidatesMatching onBack={() => setCurrentView('dashboard')} />;
        case 'applications':
            return <CompanyApplications onBack={() => setCurrentView('dashboard')} />;
        default:
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <StatCard icon={<Briefcase size={24} />} value="5" label="Offres actives" color="blue" />
                    <StatCard icon={<UserPlus size={24} />} value="28" label="Nouvelles candidatures" color="green" />
                    <StatCard icon={<FileText size={24} />} value="15" label="Candidats à examiner" color="yellow" />
                    
                    <div className="card bg-primary text-white flex flex-col items-center justify-center text-center p-6">
                        <h3 className="card-title text-white">Prêt à trouver le talent idéal ?</h3>
                        <p className="opacity-90 mb-4 text-sm">Publiez une nouvelle offre d'emploi.</p>
                        <button onClick={() => setCurrentView('jobs')} className="btn btn-secondary bg-white text-primary w-full mt-auto">
                            <Plus size={18} /> Publier une offre
                        </button>
                    </div>

                    <div className="md:col-span-4">
                        <div className="card">
                            <h3 className="card-title">Vos dernières offres</h3>
                            <ul className="divide-y divide-border">
                                {recentJobs.map(job => (
                                    <li key={job.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{job.title}</p>
                                            <p className="text-sm text-gray-500">{job.candidates} candidats</p>
                                        </div>
                                        <span className={`badge ${job.status === 'Actif' ? 'badge-success' : 'badge-secondary'}`}>{job.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            );
    }
  }

  return (
    <DashboardLayout user={user} onLogout={logout} onNavigate={setCurrentView} currentView={currentView}>
        {renderContent()}
    </DashboardLayout>
  );
};

export default CompanyDashboard;
