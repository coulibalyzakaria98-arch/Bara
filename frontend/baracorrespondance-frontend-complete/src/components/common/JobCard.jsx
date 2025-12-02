import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Briefcase, DollarSign, Percent } from 'lucide-react';

const JobCard = ({ job, onApply, isFavorite, onToggleFavorite }) => {
  // Préparation des données pour éviter les erreurs si `job` est null/undefined
  const companyName = job?.company?.name || 'Entreprise';
  const jobTitle = job?.title || 'Titre du poste non disponible';
  const location = job?.location || 'Lieu non spécifié';
  const contractType = job?.employment_type || 'CDI';
  const salary = job?.salary_range || 'N/A';
  const skills = job?.required_skills || [];
  const matchScore = job?.match_score;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="card flex flex-col h-full" // Utilise notre classe .card et s'assure qu'elle remplit la hauteur
    >
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-lg flex items-center justify-center text-white text-xl font-bold">
            {companyName[0]}
          </div>
          <div>
            <h3 className="card-title text-base font-bold">{jobTitle}</h3>
            <p className="text-sm text-gray-600">{companyName}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite?.(job?.id)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            isFavorite
              ? 'text-red-500 bg-red-100'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          aria-label="Ajouter aux favoris"
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Détails du poste */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge badge-primary flex items-center gap-1">
          <Briefcase size={14} /> {contractType}
        </span>
        <span className="badge badge-primary flex items-center gap-1">
          <MapPin size={14} /> {location}
        </span>
        <span className="badge badge-primary flex items-center gap-1">
          <DollarSign size={14} /> {salary}
        </span>
      </div>

      {/* Compétences requises */}
      <div className="flex-grow mb-4">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Compétences clés</h4>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="badge badge-secondary">
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="badge badge-secondary">
              +{skills.length - 3} de plus
            </span>
          )}
        </div>
      </div>

      {/* Pied de la carte */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {matchScore && (
          <div className="flex items-center gap-1">
            <Percent size={16} className="text-green-600" />
            <span className="text-sm font-bold text-green-600">{Math.round(matchScore)}%</span>
            <span className="text-xs text-gray-500">de correspondance</span>
          </div>
        )}
        <button
          onClick={() => onApply?.(job?.id)}
          className="btn btn-primary"
        >
          Postuler
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;
