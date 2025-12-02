import React from 'react';
import JobCard from './JobCard';
import { motion } from 'framer-motion';

// Données fictives pour la maquette
const featuredJobs = [
  {
    id: 1,
    title: 'Développeur Full-Stack Senior',
    company: { name: 'Tech Solutions SA' },
    location: 'Conakry, Guinée',
    employment_type: 'CDI',
    salary_range: '15M - 25M GNF',
    required_skills: ['React', 'Node.js', 'Python', 'Docker'],
    match_score: 92,
  },
  {
    id: 2,
    title: 'Responsable Marketing Digital',
    company: { name: 'Innovate Guinea' },
    location: 'Télétravail',
    employment_type: 'CDD',
    salary_range: '10M - 18M GNF',
    required_skills: ['SEO', 'Google Ads', 'Réseaux Sociaux'],
  },
  {
    id: 3,
    title: 'Comptable Expérimenté',
    company: { name: 'Finance Pro' },
    location: 'Kamsar, Guinée',
    employment_type: 'CDI',
    salary_range: '12M - 20M GNF',
    required_skills: ['Sage', 'OHADA', 'Excel Avancé'],
  },
];

const FeaturedJobs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Offres à la une</h2>
          <p className="text-lg text-gray-600 mt-2">Découvrez les dernières opportunités publiées par nos partenaires.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
