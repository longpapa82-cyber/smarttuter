'use client';

import { VideoPlayer } from './VideoPlayerV2';
import { HeroContent } from './HeroContent';

export function HeroVideoSection() {
  return (
    <section
      className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden"
      style={{ contentVisibility: 'auto' }}
    >
      {/* Video Background */}
      <VideoPlayer
        src="/videos/demo_s.mp4"
        autoPlay={true}
        muted={true}
        loop={true}
      />

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 pointer-events-none" />

      {/* Hero Content Overlay */}
      <HeroContent />

      {/* Subtle animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-fade-in) {
          animation: fade-in 0.6s ease-out forwards;
        }

        :global(.animate-fade-in-up) {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
