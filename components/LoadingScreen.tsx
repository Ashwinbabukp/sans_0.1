'use client';

import Logo from './Logo';

export default function LoadingScreen({ fading = false }: { fading?: boolean }) {
  return (
    <div className={`loading-screen ${fading ? 'fade-out' : ''}`} aria-label="Loading Sans">
      <div className="loading-center">
        {/* Pulsing Bubbly Logo */}
        <div className="loading-logo-wrap">
          <Logo height={64} color="#FAF5EE" />
        </div>

        {/* Minimalist Bouncing Dots */}
        <div className="loading-dots" aria-hidden="true">
          <span className="l-dot ld1" />
          <span className="l-dot ld2" />
          <span className="l-dot ld3" />
        </div>

        <p className="loading-tagline">Quotes Connect People.</p>
      </div>
    </div>
  );
}

