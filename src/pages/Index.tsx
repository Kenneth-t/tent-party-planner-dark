
import React, { useState, useEffect } from 'react';
import TentGallery from '@/components/TentGallery';
import BookingForm from '@/components/BookingForm';

const Index = () => {
  const [tentType, setTentType] = useState<'basic' | 'full'>('basic');
  
  // Create subtle floating particles for party ambiance
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random particle size between 5px and 15px
      const size = Math.floor(Math.random() * 10) + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position within the viewport
      const posX = Math.floor(Math.random() * window.innerWidth);
      const posY = Math.floor(Math.random() * window.innerHeight);
      particle.style.left = `${posX}px`;
      particle.style.top = `${posY}px`;
      
      // Random animation duration between 10 and 20 seconds
      const duration = Math.floor(Math.random() * 10) + 10;
      particle.style.animationDuration = `${duration}s`;
      
      // Random delay before animation starts
      const delay = Math.floor(Math.random() * 5);
      particle.style.animationDelay = `${delay}s`;
      
      document.body.appendChild(particle);
      
      // Remove particle after animation completes
      setTimeout(() => {
        if (document.body.contains(particle)) {
          document.body.removeChild(particle);
        }
      }, (duration + delay) * 1000);
    };
    
    // Create initial particles
    for (let i = 0; i < 15; i++) {
      createParticle();
    }
    
    // Create new particles periodically
    const particleInterval = setInterval(() => {
      createParticle();
    }, 3000);
    
    // Clean up
    return () => {
      clearInterval(particleInterval);
      document.querySelectorAll('.particle').forEach(p => {
        if (document.body.contains(p)) {
          document.body.removeChild(p);
        }
      });
    };
  }, []);
  
  return (
    <div className="min-h-screen party-bg">
      <header className="container mx-auto pt-10 pb-6">
        <h1 className="text-4xl font-bold text-center mb-1">Feest in de Tent</h1>
        <p className="text-center text-muted-foreground">
          Huur je perfecte feesttent en maak je evenement onvergetelijk
        </p>
      </header>
      
      <main className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <TentGallery tentType={tentType} />
            
            <div className="bg-secondary/30 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Waarom Feest in de Tent?</h2>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-party-light mr-3"></span>
                  <span>Professionele levering en opbouw</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-party-light mr-3"></span>
                  <span>24-uurs huur met flexibele tijden</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-party-light mr-3"></span>
                  <span>Verschillende configuratieopties</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-party-light mr-3"></span>
                  <span>Volledig uitgerust met discobar en verlichting</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-secondary/30 backdrop-blur-md rounded-lg p-6 lg:p-8 shadow-lg">
            <BookingForm onTentSelect={setTentType} />
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Feest in de Tent • Alle rechten voorbehouden</p>
        <p className="mt-1">
          <a href="mailto:feestindetentverhuur@gmail.com" className="hover:text-party-light transition-colors">
            feestindetentverhuur@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
