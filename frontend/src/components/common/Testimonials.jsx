import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Grâce à BaraMatch, j'ai trouvé un poste de développeur senior en moins de deux semaines. Le matching par IA est incroyablement précis !",
    name: 'Mamadou Diallo',
    title: 'Développeur Full-Stack',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  },
  {
    quote: "Nous avons recruté trois ingénieurs qualifiés via la plateforme. Le processus était rapide et les candidats proposés étaient tous de très haut niveau.",
    name: 'Aïssatou Camara',
    title: 'DRH chez Tech Solutions SA',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
  },
  {
    quote: "La meilleure plateforme pour les talents guinéens. J'ai enfin pu mettre en valeur mes compétences et trouver une entreprise qui correspond à mes ambitions.",
    name: 'Ibrahima Sory',
    title: 'Data Scientist',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-light-bg">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ils nous font confiance</h2>
          <p className="text-lg text-gray-600 mt-2">Découvrez ce que nos utilisateurs disent de nous.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="card"
            >
              <div className="flex items-center mb-4">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
