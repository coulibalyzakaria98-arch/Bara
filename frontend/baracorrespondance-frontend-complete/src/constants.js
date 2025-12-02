// Application Constants
// Centralized strings, messages, and configuration values

export const APP_NAME = 'BaraCorrespondance';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Plateforme IA de matching CV-Entreprise nouvelle génération';

// Roles
export const USER_ROLES = {
  CANDIDATE: 'candidate',
  COMPANY: 'company',
  ADMIN: 'admin',
};

// Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const JOB_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
};

export const EMPLOYMENT_TYPE = {
  CDI: 'CDI',
  CDD: 'CDD',
  STAGE: 'Stage',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporaire',
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Connexion réussie ! Bienvenue.',
    REGISTER: 'Inscription réussie ! Vérifiez votre email.',
    PROFILE_UPDATED: 'Profil mis à jour avec succès.',
    CV_UPLOADED: 'CV téléchargé et analysé avec succès.',
    APPLICATION_SENT: 'Candidature envoyée avec succès.',
    FAVORITE_ADDED: 'Ajouté aux favoris.',
    FAVORITE_REMOVED: 'Retiré des favoris.',
    PASSWORD_CHANGED: 'Mot de passe changé avec succès.',
  },
  ERROR: {
    LOGIN_FAILED: 'Email ou mot de passe incorrect.',
    REGISTER_FAILED: 'Erreur lors de l\'inscription.',
    EMAIL_EXISTS: 'Cet email est déjà utilisé.',
    FILE_TOO_LARGE: 'Le fichier est trop volumineux (max 10MB).',
    INVALID_FILE: 'Format de fichier non valide.',
    NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion.',
    SERVER_ERROR: 'Erreur serveur. Veuillez réessayer.',
  },
  WARNING: {
    UNSAVED_CHANGES: 'Vous avez des modifications non sauvegardées.',
    DELETE_CONFIRMATION: 'Êtes-vous sûr de vouloir supprimer ?',
    SESSION_EXPIRING: 'Votre session expire bientôt.',
  },
  INFO: {
    NO_RESULTS: 'Aucun résultat trouvé.',
    LOADING: 'Chargement...',
    PROCESSING: 'Traitement en cours...',
    EMPTY_STATE: 'Rien à afficher pour le moment.',
  },
};

// Validation Messages
export const VALIDATION = {
  REQUIRED: 'Ce champ est requis.',
  EMAIL_INVALID: 'Veuillez entrer une adresse email valide.',
  PASSWORD_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas.',
  PHONE_INVALID: 'Veuillez entrer un numéro de téléphone valide.',
  URL_INVALID: 'Veuillez entrer une URL valide.',
  MIN_LENGTH: (min) => `Minimum ${min} caractères requis.`,
  MAX_LENGTH: (max) => `Maximum ${max} caractères autorisés.`,
};

// Features
export const FEATURES = {
  CV_ANALYSIS: 'Analyse CV par IA',
  JOB_MATCHING: 'Matching intelligent des offres',
  SMART_RECOMMENDATIONS: 'Recommandations personnalisées',
  INSTANT_NOTIFICATIONS: 'Notifications instantanées',
  PROFILE_ANALYTICS: 'Analytics du profil',
  SKILL_TESTS: 'Tests de compétences',
};

// Navigation Items
export const CANDIDATE_NAV = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'jobs', label: 'Offres d\'emploi', icon: '💼' },
  { id: 'matches', label: 'Correspondances', icon: '🎯' },
  { id: 'applications', label: 'Candidatures', icon: '📋' },
  { id: 'favorites', label: 'Favoris', icon: '❤️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'profile', label: 'Profil', icon: '👤' },
];

export const COMPANY_NAV = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'jobs', label: 'Offres d\'emploi', icon: '💼' },
  { id: 'candidates', label: 'Candidats', icon: '👥' },
  { id: 'applications', label: 'Candidatures reçues', icon: '📥' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'profile', label: 'Profil entreprise', icon: '🏢' },
];

// Skills Categories
export const SKILL_CATEGORIES = [
  'Développement',
  'Design',
  'Marketing',
  'Ventes',
  'Ressources Humaines',
  'Finance',
  'Opérations',
  'Support Client',
  'Gestion de Projet',
  'Données',
];

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { value: 0, label: 'Débutant' },
  { value: 1, label: 'Junior (1-2 ans)' },
  { value: 3, label: 'Confirmé (3-5 ans)' },
  { value: 8, label: 'Senior (5-8 ans)' },
  { value: 10, label: 'Expert (10+ ans)' },
];

// Education Levels
export const EDUCATION_LEVELS = [
  'Sans diplôme',
  'BEP/CAP',
  'Bac',
  'Bac+2',
  'Bac+3',
  'Bac+4',
  'Bac+5',
  'Master',
  'Doctorat',
];

// Language Levels
export const LANGUAGE_LEVELS = [
  { value: 'native', label: 'Langue maternelle' },
  { value: 'fluent', label: 'Courant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'beginner', label: 'Débutant' },
];

// Salary Ranges
export const SALARY_RANGES = [
  '< 20k€',
  '20k€ - 30k€',
  '30k€ - 40k€',
  '40k€ - 50k€',
  '50k€ - 60k€',
  '60k€ - 75k€',
  '75k€ - 100k€',
  '> 100k€',
];

// API Endpoints (relative to backend)
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // User
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  
  // Candidates
  CANDIDATES: '/candidates',
  CANDIDATE: '/candidates/:id',
  
  // Companies
  COMPANIES: '/companies',
  COMPANY: '/companies/:id',
  
  // Jobs
  JOBS: '/jobs',
  JOB: '/jobs/:id',
  
  // Analysis
  UPLOAD_CV: '/uploads/cv',
  ANALYZE_CV: '/analysis',
  GET_ANALYSIS: '/analysis/:id',
  
  // Matches
  MATCHES: '/matches',
  MATCH: '/matches/:id',
  
  // Applications
  APPLICATIONS: '/applications',
  APPLICATION: '/applications/:id',
  
  // Analytics
  ANALYTICS: '/analytics',
  STATS: '/analytics/stats',
};

// File Upload Config
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx'],
};

// Image Config
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: { value: '-created_at', label: 'Plus récent' },
  OLDEST: { value: 'created_at', label: 'Plus ancien' },
  RELEVANCE: { value: '-match_score', label: 'Pertinence' },
  SALARY_HIGH: { value: '-salary', label: 'Salaire (élevé au bas)' },
  SALARY_LOW: { value: 'salary', label: 'Salaire (bas au élevé)' },
};

// Time Constants
export const TIME = {
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 60000,
  MS_PER_HOUR: 3600000,
  MS_PER_DAY: 86400000,
  MS_PER_WEEK: 604800000,
  MS_PER_MONTH: 2592000000,
};

export default {
  APP_NAME,
  APP_VERSION,
  USER_ROLES,
  MESSAGES,
  VALIDATION,
  API_ENDPOINTS,
};
