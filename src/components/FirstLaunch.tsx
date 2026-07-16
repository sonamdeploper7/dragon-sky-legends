/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { audio } from '../audio';

interface FirstLaunchProps {
  onComplete: () => void;
}

export default function FirstLaunch({ onComplete }: FirstLaunchProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate some random ambient particles
    const arr = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 4
    }));
    setParticles(arr);

    // Auto trigger soft ambient chime after 1.5 seconds
    const audioTimeout = setTimeout(() => {
      audio.playMagicExplosion();
    }, 1500);

    // Complete intro and transition after 5.5s
    const endTimeout = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(audioTimeout);
      clearTimeout(endTimeout);
    };
  }, [onComplete]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-transparent flex flex-col justify-center items-center text-center px-6 select-none">
      {/* Background Starry Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Floating Sparkles Layer */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-300/60 blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: [0, -120],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Golden Light Beam effect */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-amber-400/10 blur-[100px] pointer-events-none"
        animate={{
          scale: [0.8, 1.3, 1],
          opacity: [0.2, 0.6, 0.4]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Slow Moving Clouds */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute -left-1/4 top-1/4 w-[150%] h-40 bg-radial-gradient from-slate-700/40 via-transparent to-transparent blur-xl"
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-1/3 w-[150%] h-40 bg-radial-gradient from-slate-700/40 via-transparent to-transparent blur-xl"
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main Logo Card */}
      <motion.div
        className="z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      >
        <motion.div 
          className="text-7xl mb-4 filter drop-shadow-lg"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐉
        </motion.div>
        
        {/* Animated Brand Header */}
        <h1 className="relative font-sans font-extrabold tracking-widest text-4xl sm:text-5xl uppercase leading-none select-none">
          {/* Golden Gradient Text */}
          <span className="bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)]">
            Dragon Sky
          </span>
          <br />
          {/* Blue Crystal Neon Glow Subheader */}
          <span className="text-2xl sm:text-3xl font-medium tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
            Legends
          </span>
        </h1>

        <motion.p
          className="mt-6 text-xs font-mono text-slate-500 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 2, duration: 1.5 }}
        >
          © 2026 SKYSTUDIOS • LOADING ADVENTURE
        </motion.p>
      </motion.div>

      {/* Skip Button */}
      <button
        id="btn-skip-intro"
        onClick={() => {
          audio.playTap();
          onComplete();
        }}
        className="absolute bottom-10 px-4 py-1.5 rounded-full border border-slate-800 text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer bg-slate-900/40 backdrop-blur-md transition-all active:scale-95"
      >
        SKIP INTRO
      </button>
    </div>
  );
}
