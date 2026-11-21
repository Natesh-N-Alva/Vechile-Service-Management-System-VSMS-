'use client';

import React from 'react';

interface NeonGlowProps {
  children: React.ReactNode;
  color?: 'teal' | 'cyan' | 'purple' | 'pink';
  intensity?: 'low' | 'medium' | 'high';
  pulse?: boolean;
}

export function NeonGlow({
  children,
  color = 'teal',
  intensity = 'medium',
  pulse = true,
}: NeonGlowProps) {
  const colorMap = {
    teal: 'from-teal-400 to-teal-600',
    cyan: 'from-cyan-400 to-cyan-600',
    purple: 'from-purple-400 to-purple-600',
    pink: 'from-pink-400 to-pink-600',
  };

  const intensityMap = {
    low: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]',
    medium: 'shadow-[0_0_25px_rgba(20,184,166,0.5)]',
    high: 'shadow-[0_0_35px_rgba(20,184,166,0.7)]',
  };

  return (
    <div
      className={`relative ${pulse ? 'neon-pulse' : ''}`}
      style={{
        '--neon-color': color === 'teal' ? 'rgba(20, 184, 166, 0.6)' : 
                       color === 'cyan' ? 'rgba(6, 182, 212, 0.6)' :
                       color === 'purple' ? 'rgba(168, 85, 247, 0.6)' :
                       'rgba(236, 72, 153, 0.6)',
      } as React.CSSProperties}
    >
      <div className={`${intensityMap[intensity]} rounded-lg transition-all duration-300`}>
        {children}
      </div>
    </div>
  );
}

// Glow border variant
export function NeonGlowBorder({
  children,
  color = 'teal',
}: {
  children: React.ReactNode;
  color?: 'teal' | 'cyan' | 'purple' | 'pink';
}) {
  return (
    <div
      className="relative p-px rounded-lg overflow-hidden group"
      style={{
        '--neon-color': color === 'teal' ? 'rgba(20, 184, 166, 0.5)' : 
                       color === 'cyan' ? 'rgba(6, 182, 212, 0.5)' :
                       color === 'purple' ? 'rgba(168, 85, 247, 0.5)' :
                       'rgba(236, 72, 153, 0.5)',
      } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 opacity-75 group-hover:opacity-100 transition-opacity duration-300 neon-glow-border"
        style={{
          background: `linear-gradient(90deg, transparent, var(--neon-color), transparent)`,
        }}
      />
      <div className="relative bg-background rounded-lg">
        {children}
      </div>
    </div>
  );
}
