import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function ConfettiCelebration() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    delay: number;
    rotate: number;
  }>>([]);

  useEffect(() => {
    const colors = ['#00F2FE', '#4FACFE', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#A855F7'];
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Percentage of screen width
      y: Math.random() * -20 - 10, // Start above the screen
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6, // 6px to 14px
      delay: Math.random() * 1.5,
      rotate: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: `${p.y}vh`, 
            rotate: p.rotate,
            opacity: 1 
          }}
          animate={{ 
            y: '110vh', 
            rotate: p.rotate + 360 + Math.random() * 360,
            opacity: [1, 1, 0.8, 0]
          }}
          transition={{ 
            duration: Math.random() * 2 + 2, 
            delay: p.delay,
            ease: 'linear'
          }}
          className="absolute rounded-xs"
          style={{
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}
