import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Colonne de Gauche: Texte et CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Trouvez le <span className="text-primary">talent parfait</span> ou le <span className="text-primary">job de vos rêves</span>.
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Notre plateforme intelligente connecte les entreprises innovantes avec les professionnels les plus qualifiés de Guinée.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" state={{ userType: 'candidate' }} className="btn btn-primary">
                Je cherche un emploi <ArrowRight size={20} />
              </Link>
              <Link to="/login" state={{ userType: 'company' }} className="btn btn-secondary">
                Je recrute un talent
              </Link>
            </div>
          </motion.div>

          {/* Colonne de Droite: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
              alt="Professionals collaborating"
              className="rounded-lg shadow-lg"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
