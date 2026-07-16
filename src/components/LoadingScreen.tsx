/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../audio';

interface LoadingScreenProps {
  onStartGame?: () => void;
  onComplete?: () => void;
}

const LOADING_MESSAGES = [
  'Preparing Dragon...',
  'Growing Tiny Wings...',
  'Building Sky Kingdom...',
  'Collecting Magic Crystals...',
  'Charging Dragon Power...',
  'Creating Fantasy World...',
  'Summoning Adventure...',
  'Almost Ready...'
];

export default function LoadingScreen({ onStartGame, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  const [dragonFlame, setDragonFlame] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; color: string; x: number; y: number; rotate: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: any;
    timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const step = Math.floor(Math.random() * 4) + 2;
        return Math.min(100, prev + step);
      });
    }, 45);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) return;
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 700);
    return () => clearInterval(msgTimer);
  }, [progress]);

  useEffect(() => {
    const flameTimer = setInterval(() => {
      setDragonFlame(true);
      setTimeout(() => setDragonFlame(false), 700);
    }, 2800);
    return () => clearInterval(flameTimer);
  }, []);

  useEffect(() => {
    if (progress === 100 && !isDone) {
      setIsDone(true);
      audio.playMagicExplosion();
      audio.playRoar();

      const colors = ['#38bdf8', '#facc15', '#f472b6', '#34d399', '#a78bfa', '#fb923c'];
      const conf = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 100,
        y: Math.random() * 50 + 20,
        rotate: Math.random() * 360
      }));
      setConfetti(conf);
      setTimeout(() => {
        setShowTapPrompt(true);
      }, 500);
    }
  }, [progress, isDone]);

  const handleTapToStart = () => {
    if (!showTapPrompt) return;
    audio.playTap();
    if (onStartGame) onStartGame();
    if (onComplete) onComplete();
  };

  return (
    <div
      ref={containerRef}
      id="loading-screen"
      onClick={handleTapToStart}
      className={`relative w-full h-full min-h-screen overflow-hidden bg-transparent flex flex-col justify-between items-center text-center p-6 select-none ${
        showTapPrompt ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-100/30 via-sky-300/10 to-transparent blur-xl pointer-events-none" />

      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[160%] max-w-xl aspect-square rounded-full border-[12px] border-cyan-400/5 border-t-pink-400/10 border-r-yellow-400/10 border-l-purple-400/10 blur-[1px] opacity-60 pointer-events-none" />

      {/* Floating Islands Left & Right */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-[-20px] top-[20%] w-28 h-16 bg-gradient-to-b from-emerald-600 to-amber-800 rounded-[50%_50%_40%_40%] shadow-md"
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute -top-5 left-1/3 text-sm">🌳</div>
          <div className="w-full h-1.5 bg-emerald-400 rounded-t-full" />
          <div className="absolute left-1/2 top-8 w-1 h-12 bg-gradient-to-b from-cyan-200/80 to-transparent" />
        </motion.div>

        <motion.div
          className="absolute right-[-20px] top-[32%] w-32 h-18 bg-gradient-to-b from-emerald-600 to-amber-900 rounded-[50%_50%_40%_40%] shadow-md"
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <div className="absolute -top-5 right-1/4 text-sm">🏰</div>
          <div className="w-full h-1.5 bg-emerald-400 rounded-t-full" />
          <div className="absolute left-1/3 top-8 w-1 h-10 bg-gradient-to-b from-cyan-200/80 to-transparent" />
        </motion.div>
      </div>

      {/* Clouds */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-40">
        <div className="absolute -bottom-6 left-[-10%] w-[120%] h-24 bg-gradient-to-t from-white to-transparent blur-md" />
        <div className="absolute bottom-4 right-[-10%] w-[120%] h-20 bg-gradient-to-t from-white/95 to-transparent blur-lg" />
      </div>

      {/* Confetti */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute w-1.5 h-3 z-30"
          style={{
            backgroundColor: c.color,
            left: `${c.x}%`,
            top: '40%',
          }}
          initial={{ scale: 0, opacity: 1, y: 0, rotate: c.rotate }}
          animate={{
            scale: [0.5, 1, 0.5],
            opacity: [1, 1, 0],
            y: c.y * 4,
            rotate: c.rotate + 360,
          }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      ))}

      {/* Logo */}
      <div className="z-10 mt-10 flex flex-col items-center">
        <motion.div
          className="text-6xl select-none"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐉
        </motion.div>

        <div className="mt-2 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold tracking-widest uppercase filter drop-shadow-[0_2px_6px_rgba(234,179,8,0.4)]">
            <span className="bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
              Dragon Sky
            </span>
          </h2>
          <h3 className="text-lg font-bold tracking-widest text-cyan-50 border-y border-cyan-300/30 px-3 py-0.5 mt-0.5 uppercase bg-cyan-900/10 backdrop-blur-sm rounded-full shadow-inner">
            Legends
          </h3>
        </div>
      </div>

      {/* Interactive Dragon SVG */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        <div className="absolute w-36 h-36 rounded-full border border-cyan-200/15 border-dashed animate-spin [animation-duration:20s] pointer-events-none" />
        
        <motion.div
          className="w-40 h-40 relative"
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <ellipse cx="100" cy="180" rx="35" ry="6" fill="rgba(0,0,0,0.12)" />
            {/* Left Wing */}
            <motion.path
              d="M 50 100 C 10 90, 5 50, 40 70 C 50 75, 55 90, 50 100 Z"
              fill="#2563eb"
              stroke="#1e3a8a"
              strokeWidth="2"
              animate={{ rotate: [-15, 15, -15] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '50px', originY: '100px' }}
            />
            {/* Tail */}
            <motion.path
              d="M 140 140 C 180 150, 190 120, 180 105 C 170 95, 155 125, 140 135"
              fill="#60a5fa"
              stroke="#1e3a8a"
              strokeWidth="2"
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '140px', originY: '145px' }}
            />
            <path d="M 180 105 L 186 102 L 183 96 L 176 101 Z" fill="#fbbf24" stroke="#d97706" />
            <rect x="70" y="95" width="70" height="60" rx="25" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2.5" />
            <ellipse cx="100" cy="130" rx="18" ry="22" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <rect x="65" y="45" width="70" height="55" rx="22" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2.5" />
            <path d="M 80 48 L 73 32 L 85 41 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <path d="M 120 48 L 127 32 L 115 41 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            {/* Eyes */}
            <circle cx="85" cy="70" r="10" fill="#1e293b" />
            <circle cx="83" cy="67" r="3.5" fill="white" />
            <circle cx="115" cy="70" r="10" fill="#1e293b" />
            <circle cx="113" cy="67" r="3.5" fill="white" />
            {/* Cheek blush */}
            <ellipse cx="76" cy="78" rx="3.5" ry="2" fill="#f472b6" opacity="0.6" />
            <ellipse cx="124" cy="78" rx="3.5" ry="2" fill="#f472b6" opacity="0.6" />
            <path d="M 94 84 Q 100 90, 106 84" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
            {/* Left Hand Waving */}
            <motion.path
              d="M 68 112 C 45 112, 38 98, 52 93 C 60 90, 65 102, 68 112 Z"
              fill="#60a5fa"
              stroke="#1e3a8a"
              strokeWidth="2"
              animate={{ rotate: [-25, 25, -25] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '68px', originY: '112px' }}
            />
            {/* Right Hand */}
            <path d="M 132 112 C 145 112, 150 107, 142 98 Z" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2" />
            {/* Feet */}
            <rect x="75" y="152" width="14" height="12" rx="6" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2" />
            <rect x="111" y="152" width="14" height="12" rx="6" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2" />
            {/* Front Wing */}
            <motion.path
              d="M 138 100 C 180 90, 185 55, 145 72 C 135 77, 130 90, 138 100 Z"
              fill="#3b82f6"
              stroke="#1e3a8a"
              strokeWidth="2"
              animate={{ rotate: [18, -18, 18] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '138px', originY: '100px' }}
            />
          </svg>

          {/* Flame breathe */}
          <AnimatePresence>
            {dragonFlame && (
              <motion.div
                className="absolute left-[35%] top-[38%] pointer-events-none"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{
                  opacity: [0, 0.9, 0.8, 0],
                  scale: [1, 2, 2.4, 0.5],
                  x: [-20, -55, -85, -100],
                  y: [8, 25, 35, 40],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <div className="relative w-7 h-7 rounded-full bg-cyan-400 blur-[1px] flex justify-center items-center shadow-[0_0_12px_#22d3ee]">
                  <div className="w-3.5 h-3.5 rounded-full bg-white blur-[0.5px]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <p className="text-[10px] font-mono text-cyan-800 tracking-widest mt-1 animate-pulse">
          CUTE COMPANION STAYS NEAR
        </p>
      </div>

      {/* Loading bar & Tap to start prompt */}
      <div className="z-10 w-full max-w-sm mb-10 flex flex-col items-center">
        {!showTapPrompt ? (
          <>
            <div className="h-6 overflow-hidden mb-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  className="text-cyan-950 font-bold text-xs tracking-wide"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.8 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {LOADING_MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="relative w-full h-7 rounded-2xl bg-sky-950/15 p-1 backdrop-blur-md border border-cyan-100/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] flex items-center overflow-hidden">
              <motion.div
                className="h-full rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 relative flex items-center justify-end shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                style={{ width: `${progress}%` }}
              >
                {progress > 5 && (
                  <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping mr-1" />
                )}
              </motion.div>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-black text-cyan-950">
                {progress}%
              </span>
            </div>
          </>
        ) : (
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 border-2 border-amber-300 font-sans font-black text-base text-amber-950 shadow-[0_8px_20px_rgba(217,119,6,0.35)] tracking-wider"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 5px 12px rgba(217,119,6,0.3)',
                  '0 10px 25px rgba(217,119,6,0.55)',
                  '0 5px 12px rgba(217,119,6,0.3)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              ✨ TAP TO START ✨
            </motion.div>
            <p className="text-[9px] font-mono text-indigo-950 mt-2 tracking-widest opacity-60">
              OFFLINE FANTASY WORLD READY • PORTRAIT ONLY
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
