'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  
  // 1. Add a state to check if we are running in the browser
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 2. Tell React we are safely in the browser
    setIsMounted(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-gradient-to-b from-background to-slate-50 dark:to-slate-900 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Shooting stars in splash */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 3. ONLY render the random stars if we are mounted in the browser */}
        {isMounted && [...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute shooting-star"
            style={{
              width: '2px',
              height: '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `shootingStar ${2 + Math.random() * 2}s ease-in-out`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        <div className="w-24 h-24 relative animate-in fade-in duration-1000">
          <Image
            src="/logo.jpg"
            alt="VehicleFlow Logo"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>
        
        <div className="text-center animate-in fade-in duration-1000 delay-500">
          <h1 className="text-3xl font-bold text-foreground mb-2">VehicleFlow</h1>
          <p className="text-muted-foreground text-sm">Intelligent Vehicle Management</p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-1 animate-in fade-in duration-1000 delay-700">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Neon glow background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
    </div>
  );
}