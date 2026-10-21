'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtmosphere } from './AtmosphereContext';

interface AtmosphereBackgroundProps {
  overrideScene?: string;
  overrideAct?: 1 | 2 | 3;
}

export default function AtmosphereBackground({
  overrideScene,
  overrideAct,
}: AtmosphereBackgroundProps) {
  const { scene: contextScene, act: contextAct, isDilemmaActive } = useAtmosphere();
  const activeScene = overrideScene || contextScene;
  const activeAct = overrideAct || contextAct;

  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(activeScene);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(media.matches);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync image source when scene changes
  useEffect(() => {
    setImgSrc(activeScene);
    setHasError(false);
  }, [activeScene]);

  const handleImageError = () => {
    if (imgSrc.endsWith('.svg')) {
      setImgSrc(imgSrc.replace('.svg', '.webp'));
    } else if (imgSrc.endsWith('.webp')) {
      setImgSrc(imgSrc.replace('.webp', '.svg'));
    } else {
      setHasError(true);
    }
  };

  // Dynamic filter based on Act
  let actFilter = 'contrast(1.15) sepia(20%)';
  if (activeAct === 1) {
    actFilter = 'contrast(1.15) sepia(35%)'; // Act I: Warm WWII sepia
  } else if (activeAct === 2) {
    actFilter = 'contrast(1.15) sepia(10%) hue-rotate(95deg)'; // Act II: Steel / Iron Curtain phosphor
  } else if (activeAct === 3) {
    actFilter = 'contrast(1.2) hue-rotate(345deg) saturate(130%)'; // Act III: Red-alert DEFCON
  }

  // Opacity: 0.65 standard, 0.80 when dilemma timer is active for strong atmospheric presence
  const baseOpacity = isDilemmaActive ? 0.8 : 0.65;

  // Glass blur: subtle 1px blur (2px on dilemma) so archival war line-art and radar remain crisp and visible
  const blurAmount = isDilemmaActive ? '2px' : isMobile ? '0.5px' : '1px';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ backgroundColor: '#090c0a' }}
      aria-hidden="true"
    >
      {/* Layer A: Archival Imagery with AnimatePresence Smooth Crossfade (800ms) */}
      <AnimatePresence mode="popLayout">
        {!hasError && imgSrc && (
          <motion.div
            key={imgSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: baseOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <motion.img
              src={imgSrc}
              alt=""
              loading="eager"
              decoding="async"
              onError={handleImageError}
              className="w-full h-full object-cover"
              style={{
                filter: actFilter,
              }}
              animate={
                !isMobile && !reducedMotion
                  ? {
                      scale: [1.0, 1.04, 1.0],
                    }
                  : undefined
              }
              transition={
                !isMobile && !reducedMotion
                  ? {
                      duration: 40,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer B: Frosted Glass Sheet */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          backdropFilter: `blur(${blurAmount}) saturate(95%)`,
          WebkitBackdropFilter: `blur(${blurAmount}) saturate(95%)`,
          backgroundColor: 'rgba(9, 12, 10, 0.22)',
          boxShadow: isDilemmaActive
            ? 'inset 0 0 90px rgba(239, 68, 68, 0.4), inset 0 0 2px rgba(239, 68, 68, 0.6)'
            : 'inset 0 0 120px rgba(255, 255, 255, 0.02), inset 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      />

      {/* Layer C: Film Grain & Radial Edge Vignette */}
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5, 7, 6, 0.7) 100%)',
        }}
      />

      {/* Subtle glass edge highlight */}
      <div className="absolute inset-0 border border-white/[0.05] pointer-events-none" />
    </div>
  );
}
