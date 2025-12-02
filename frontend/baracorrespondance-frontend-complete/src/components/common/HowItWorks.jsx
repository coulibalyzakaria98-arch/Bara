import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, FileText, Briefcase } from 'lucide-react';

const steps = [
  {
    icon: <UserCheck size={32} className="text-primary" />,
    title: 'Créez votre profil',
    description: 'Inscrivez-vous en quelques minutes et complétez votre profil pour mettre en avant vos compétences.',
  },
  {
    icon: <FileText size={32} className="text-primary" />,
    title: 'Analyse par IA',
    description: 'Notre intelligence artificielle analyse votre profil et votre CV pour identifier vos points forts.',
  },
  {
    icon: <Briefcase size={32} className="text-primary" />,
    title: 'Recevez des offres',
    description: 'Recevez des propositions d\'emplois qui correspondent parfaitement à vos compétences et aspirations.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-light-bg">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Comment ça marche ?</h2>
          <p className="text-lg text-gray-600 mt-2">Un processus simple pour vous propulser vers le succès.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="card text-center"
            >
              <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
