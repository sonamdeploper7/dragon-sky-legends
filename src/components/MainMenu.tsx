/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Trophy, Gift, ShoppingBag, User, Settings, Cloud, Flame, Sparkles } from 'lucide-react';
import { audio } from '../audio';
import { PlayerStats, Dragon } from '../types';

interface MainMenuProps {
  stats: PlayerStats;
  dragons: Dragon[];
  onNavigate: (view: 'game' | 'dragons' | 'achievements' | 'daily_reward' | 'shop' | 'profile' | 'settings' | 'world_map') => void;
  onCloudSync: () => void;
}

export default function MainMenu({ stats, dragons, onNavigate, onCloudSync }: MainMenuProps) {
  const [dragonAnim, setDragonAnim] = useState<'idle' | 'wave' | 'sneeze' | 'yawn'>('idle');
  const [showFire, setShowFire] = useState(false);
  const [crystalFloat, setCrystalFloat] = useState<{ id: number; left: number; top: number; delay: number }[]>([]);

  const activeDragon = dragons.find(d => d.id === stats.activeDragonId) || dragons[0];

  // Random dragon idle actions
  useEffect(() => {
    const actionInterval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.3) {
        setDragonAnim('wave');
        setTimeout(() => setDragonAnim('idle'), 1200);
      } else if (roll < 0.5) {
        setDragonAnim('sneeze');
        audio.playRoar();
        setShowFire(true);
        setTimeout(() => {
          setDragonAnim('idle');
          setShowFire(false);
        }, 800);
      } else if (roll < 0.7) {
        setDragonAnim('yawn');
        setTimeout(() => setDragonAnim('idle'), 1500);
      }
    }, 5000);

    return () => clearInterval(actionInterval);
  }, []);

  // Float tiny background crystals
  useEffect(() => {
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      top: Math.random() * 70 + 10,
      delay: Math.random() * 5
    }));
    setCrystalFloat(list);
  }, []);

  const handleBtnClick = (view: any) => {
    audio.playTap();
    onNavigate(view);
  };

  // Maps button details for crystal-glass UI rendering - Vibrant Palette Theme
  const menuButtons = [
    {
      id: 'play',
      label: 'PLAY NOW',
      icon: <Play className="w-6 h-6 mr-3 text-emerald-100 fill-emerald-100" />,
      color: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 border-b-[8px] border-emerald-800 shadow-[0_6px_20px_rgba(16,185,129,0.5)] text-white hover:brightness-110 active:brightness-95',
      view: 'world_map'
    },
    {
      id: 'dragons',
      label: 'DRAGONS',
      icon: <span className="mr-2 text-base">🐉</span>,
      color: 'bg-gradient-to-b from-blue-400 to-blue-600 border-b-4 border-blue-800 shadow-lg text-white hover:brightness-110 active:brightness-95',
      view: 'dragons'
    },
    {
      id: 'village',
      label: 'VILLAGE',
      icon: <span className="mr-2 text-base">🏕️</span>,
      color: 'bg-gradient-to-b from-teal-400 to-teal-600 border-b-4 border-teal-800 shadow-lg text-white hover:brightness-110 active:brightness-95',
      view: 'village'
    },
    {
      id: 'daily',
      label: 'REWARDS',
      icon: <Gift className="w-4 h-4 mr-2 text-rose-100" />,
      color: 'bg-gradient-to-b from-pink-400 to-pink-600 border-b-4 border-pink-800 shadow-lg text-white hover:brightness-110 active:brightness-95',
      view: 'daily_reward'
    },
    {
      id: 'leaderboard',
      label: 'QUESTS',
      icon: <Trophy className="w-4 h-4 mr-2 text-purple-100" />,
      color: 'bg-gradient-to-b from-purple-400 to-purple-600 border-b-4 border-purple-800 shadow-lg text-white hover:brightness-110 active:brightness-95',
      view: 'achievements'
    },
    {
      id: 'profile',
      label: 'PROFILE',
      icon: <User className="w-4 h-4 mr-2 text-cyan-100" />,
      color: 'bg-gradient-to-b from-cyan-400 to-cyan-600 border-b-4 border-cyan-800 shadow-lg text-white hover:brightness-110 active:brightness-95',
      view: 'profile'
    },
    {
      id: 'shop',
      label: 'SHOP',
      icon: <ShoppingBag className="w-4 h-4 mr-2 text-amber-100" />,
      color: 'bg-gradient-to-b from-orange-400 to-orange-600 border-b-4 border-orange-800 shadow-lg text-white hover:brightness-110 active:brightness-95',
      view: 'shop'
    },
    {
      id: 'cloud',
      label: 'SYNC SAVE',
      icon: <Cloud className="w-4 h-4 mr-2 text-emerald-100" />,
      color: 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-b-4 border-emerald-900 shadow-lg text-white hover:brightness-110 active:brightness-95',
      action: () => {
        audio.playTap();
        onCloudSync();
      }
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: <Settings className="w-4 h-4 mr-2 text-slate-100 animate-spin [animation-duration:12s]" />,
      color: 'bg-gradient-to-b from-slate-400 to-slate-600 border-b-4 border-slate-800 shadow-lg text-white hover:brightness-110 active:brightness-95',
      view: 'settings'
    }
  ];

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent overflow-hidden flex flex-col justify-between p-6 select-none">
      {/* 1. PARALLAX SKY BACKGROUND LIFE */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Sunlight rays */}
        <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-yellow-200/20 via-sky-300/5 to-transparent blur-xl" />

        {/* Floating Rainbow */}
        <div className="absolute top-12 left-1/4 w-[120%] h-40 border-8 border-transparent border-t-pink-300/15 border-r-yellow-300/15 rounded-full rotate-12" />

        {/* Floating islands moving slowly */}
        <motion.div
          className="absolute left-[8%] top-[12%] text-5xl"
          animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          🏝️
        </motion.div>
        <motion.div
          className="absolute right-[12%] top-[20%] text-6xl"
          animate={{ y: [5, -5, 5], x: [2, -2, 2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          🏝️
        </motion.div>

        {/* Cascading animated waterfalls from islands */}
        <div className="absolute left-[13%] top-[19%] w-1.5 h-12 bg-gradient-to-b from-cyan-200/60 to-transparent blur-[0.5px] animate-pulse" />
        <div className="absolute right-[8%] top-[29%] w-2 h-16 bg-gradient-to-b from-cyan-200/60 to-transparent blur-[0.5px] animate-pulse" />

        {/* Flying miniature dragons in distance */}
        <motion.div
          className="absolute left-[-10%] top-[15%] text-lg opacity-40"
          animate={{ x: ['110vw', '-20vw'], y: [0, 40, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          🐉
        </motion.div>
        <motion.div
          className="absolute right-[-10%] top-[8%] text-base opacity-30"
          animate={{ x: ['-20vw', '110vw'], y: [0, -30, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear', delay: 5 }}
        >
          🐉
        </motion.div>

        {/* Fluttering butterflies / leaf particles */}
        {crystalFloat.map((c) => (
          <motion.div
            key={c.id}
            className="absolute text-xs"
            style={{ left: `${c.left}%`, top: `${c.top}%` }}
            animate={{
              y: [0, -15, 0],
              x: [0, 8, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: c.delay,
              ease: 'easeInOut'
            }}
          >
            {c.id % 2 === 0 ? '🦋' : '✨'}
          </motion.div>
        ))}

        {/* Slowly moving clouds */}
        <motion.div
          className="absolute bottom-20 left-[-10%] w-[120%] h-32 bg-white/10 blur-xl rounded-full"
          animate={{ x: [-30, 30, -30] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* 2. TOP STATUS BAR (Coins, Crystals, Profile quick link with Glassmorphism overlay) */}
      <div className="relative z-10 flex justify-between items-center bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl">
        {/* Profile preview */}
        <div 
          onClick={() => handleBtnClick('profile')}
          className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-all bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full border border-white/30"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 border border-white/40 flex items-center justify-center text-sm shadow-inner">
            👤
          </div>
          <div className="text-left">
            <p className="text-white font-black text-[10px] leading-tight truncate max-w-[65px] uppercase tracking-wide">{stats.playerName}</p>
            <span className="text-[8px] text-yellow-300 font-extrabold leading-none">LV.{stats.level}</span>
          </div>
        </div>

        {/* Currencies display in Vibrant Palette design theme */}
        <div className="flex space-x-2">
          {/* Coins */}
          <div className="bg-black/30 backdrop-blur-md border-2 border-yellow-400 rounded-full py-1 px-3 flex items-center shadow-lg">
            <span className="text-yellow-400 font-bold mr-1 text-xs">🪙</span>
            <span className="text-white font-black text-xs font-mono">{stats.coins}</span>
          </div>

          {/* Crystals */}
          <div className="bg-black/30 backdrop-blur-md border-2 border-cyan-400 rounded-full py-1 px-3 flex items-center shadow-lg">
            <span className="text-cyan-400 font-bold mr-1 text-xs">💎</span>
            <span className="text-white font-black text-xs font-mono">{stats.crystals}</span>
          </div>
        </div>
      </div>

      {/* 3. CENTER BRAND LOGO / MOTTO - VIBRANT DISPLAY IMPACT */}
      <div className="relative z-10 text-center mt-3">
        <motion.div
          className="inline-block"
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_4px_0_rgba(15,23,42,1)] font-display">
            Dragon Sky
          </h1>
          <h2 className="text-2xl font-black italic uppercase text-center mt-[-4px] text-white drop-shadow-[0_3px_0_#1e40af] tracking-widest font-display">
            Legends
          </h2>
        </motion.div>
      </div>

      {/* 4. ACTIVE DRAGON IDLE STANDING NEAR PLAY BUTTON */}
      <div className="relative z-10 flex flex-col justify-center items-center my-1.5">
        <div className="relative w-36 h-36 flex justify-center items-center">
          {/* Ambient circular magic pad and glow */}
          <div className="absolute w-44 h-44 bg-cyan-400/30 blur-[40px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1 w-32 h-4 bg-black/30 blur-md rounded-full scale-y-50 pointer-events-none" />

          {/* Adorable active dragon rendering */}
          <motion.div
            className="w-28 h-28 cursor-pointer drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
            animate={{
              y: dragonAnim === 'idle' ? [-4, 4, -4] : 0,
              scale: dragonAnim === 'sneeze' ? [1, 1.15, 0.95, 1] : 1
            }}
            transition={{ duration: 2.2, repeat: dragonAnim === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
            onClick={() => {
              audio.playRoar();
              setDragonAnim('wave');
              setTimeout(() => setDragonAnim('idle'), 1000);
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Ellipse shadow */}
              <ellipse cx="100" cy="175" rx="35" ry="6" fill="rgba(0,0,0,0.25)" />

              {/* Wings */}
              <motion.path
                d="M 50 100 C 10 90, 5 50, 40 70 Z"
                fill={activeDragon.id === 'sky-dragon' ? '#2563eb' : '#b91c1c'}
                stroke="#1e3a8a"
                strokeWidth="2.5"
                animate={{
                  rotate: dragonAnim === 'sneeze' ? [-35, 35, -35] : [-12, 12, -12]
                }}
                transition={{ duration: dragonAnim === 'sneeze' ? 0.3 : 1.2, repeat: Infinity }}
                style={{ originX: '50px', originY: '100px' }}
              />

              <motion.path
                d="M 140 140 C 180 150, 190 120, 180 105 Z"
                fill="#60a5fa"
                stroke="#1e3a8a"
                strokeWidth="2"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ originX: '140px', originY: '145px' }}
              />

              {/* Body */}
              <rect x="70" y="95" width="66" height="58" rx="26" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2.5" />
              {/* Golden belly */}
              <ellipse cx="100" cy="130" rx="16" ry="20" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />

              {/* Head */}
              <rect x="65" y="45" width="68" height="54" rx="20" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2.5" />

              {/* Horns */}
              <path d="M 80 47 L 73 32 L 84 41 Z" fill="#fbbf24" stroke="#d97706" />
              <path d="M 118 47 L 125 32 L 114 41 Z" fill="#fbbf24" stroke="#d97706" />

              {/* Large shining eyes */}
              <circle cx="84" cy="68" r="9" fill="#1e293b" />
              <circle cx="82" cy="65" r="3" fill="white" />
              <circle cx="114" cy="68" r="9" fill="#1e293b" />
              <circle cx="112" cy="65" r="3" fill="white" />

              {/* Smile mouth */}
              <path d="M 94 82 Q 100 88, 106 82" fill="none" stroke="#1e3a8a" strokeWidth="2" />

              {/* Cute Waving Hand */}
              <motion.path
                d="M 68 112 C 45 112, 38 98, 52 93 Z"
                fill="#60a5fa"
                stroke="#1e3a8a"
                strokeWidth="2"
                animate={{
                  rotate: dragonAnim === 'wave' ? [-30, 30, -30] : [-5, 5, -5]
                }}
                transition={{ duration: dragonAnim === 'wave' ? 0.4 : 2, repeat: Infinity }}
                style={{ originX: '68px', originY: '112px' }}
              />

              {/* Feet */}
              <rect x="75" y="150" width="13" height="11" rx="5" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2" />
              <rect x="110" y="150" width="13" height="11" rx="5" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2" />

              {/* Front wing */}
              <motion.path
                d="M 138 98 C 175 88, 180 55, 142 70 Z"
                fill="#1d4ed8"
                stroke="#1e3a8a"
                strokeWidth="2"
                animate={{
                  rotate: dragonAnim === 'sneeze' ? [30, -30, 30] : [15, -15, 15]
                }}
                transition={{ duration: dragonAnim === 'sneeze' ? 0.3 : 1.2, repeat: Infinity }}
                style={{ originX: '138px', originY: '98px' }}
              />
            </svg>

            {/* Fire sneeze */}
            <AnimatePresence>
              {showFire && (
                <motion.div
                  className="absolute left-[30%] top-[38%]"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{
                    opacity: [1, 0.9, 0],
                    scale: [1, 2, 0.5],
                    x: -60,
                    y: 20
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-400 blur-[1px] shadow-[0_0_10px_#22d3ee]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dragon Name label card */}
        <div className="bg-black/30 backdrop-blur-md border-2 border-white/20 px-3 py-1 rounded-full text-center shadow-lg">
          <p className="text-xs font-black text-white flex items-center space-x-1 justify-center tracking-wide uppercase">
            <span>{activeDragon.name}</span>
            <span className="text-[8px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-extrabold uppercase">
              {activeDragon.rarity}
            </span>
          </p>
        </div>

        {/* Progress/Status Area - Dragon XP Bar */}
        <div className="w-56 mt-2">
          <div className="flex justify-between mb-0.5 px-1">
            <span className="text-white font-black text-[9px] tracking-widest uppercase">Dragon XP</span>
            <span className="text-white font-black text-[9px] font-mono">{activeDragon.xp}/{activeDragon.xpNeeded}</span>
          </div>
          <div className="w-full h-3.5 bg-black/40 rounded-full border-2 border-white/20 p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_8px_#22d3ee] transition-all duration-500" 
              style={{ width: `${Math.min(100, (activeDragon.xp / activeDragon.xpNeeded) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 5. PLAY & MENU BUTTONS GRID (Rounded crystal glass, tactile bounce) */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col space-y-3.5 mt-1.5">
        {/* Play button spans full width at top of grid */}
        <motion.button
          id="btn-play-legends"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleBtnClick(menuButtons[0].view)}
          className={`w-full py-4.5 rounded-[30px] flex items-center justify-center font-display font-black text-xl tracking-wider cursor-pointer transition-all active:translate-y-1 active:border-b-0 ${menuButtons[0].color}`}
        >
          {menuButtons[0].icon}
          {menuButtons[0].label}
        </motion.button>

        {/* Main interactive grid 2-columns for standard navigation */}
        <div className="grid grid-cols-2 gap-3.5">
          {menuButtons.slice(1).map((btn) => (
            <motion.button
              key={btn.id}
              id={`btn-${btn.id}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={btn.action ? btn.action : () => handleBtnClick(btn.view)}
              className={`py-3.5 px-3.5 rounded-2xl flex items-center justify-start font-display font-black text-[11px] cursor-pointer transition-all text-left shadow-md active:translate-y-1 active:border-b-0 ${btn.color}`}
            >
              {btn.icon}
              <span className="truncate uppercase">{btn.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 6. BOTTOM FOOTER SUBTLE CREDITS */}
      <div className="relative z-10 text-center text-[10px] font-mono text-slate-400 mt-4 tracking-wider bg-slate-950/20 backdrop-blur-md p-1.5 rounded-xl border border-white/5 shadow-inner">
        TAMER SYSTEM SAVES AUTOMATICALLY • OFFLINE ACTIVE
      </div>
    </div>
  );
}
