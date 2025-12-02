import React from 'react';

import HeroSection from '../components/common/HeroSection';
import HowItWorks from '../components/common/HowItWorks';
import FeaturedJobs from '../components/common/FeaturedJobs';
import Testimonials from '../components/common/Testimonials';
// Nous ajouterons d'autres sections ici plus tard, comme les témoignages.

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <FeaturedJobs />
      <Testimonials />
      {/* L'emplacement pour de futures sections */}
    </div>
  );
};

export default HomePage;
