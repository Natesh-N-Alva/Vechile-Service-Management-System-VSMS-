'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

export function ShootingStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 5; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 50,
          delay: Math.random() * 5,
          duration: 2 + Math.random() * 1,
        });
      }
      setStars(newStars);
    };

    generateStars();

    const interval = setInterval(generateStars, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="shooting-star absolute w-1 h-1"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animation: `shootingStar ${star.duration}s ease-in forwards`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
