/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Gift, Star, Sparkles, HelpCircle } from 'lucide-react';
import { audio } from '../audio';
import { DAILY_REWARDS, SPIN_ITEMS } from '../data/missions';
import { PlayerStats } from '../types';

interface DailyRewardMenuProps {
  stats: PlayerStats;
  onBack: () => void;
  onClaimDaily: (day: number, prize: any) => void;
  onClaimSpin: (prize: any) => void;
}

export default function DailyRewardMenu({ stats, onBack, onClaimDaily, onClaimSpin }: DailyRewardMenuProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'wheel'>('login');
  
  // Login claims state
  const [claimingDay, setClaimingDay] = useState<number | null>(null);

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [wonPrize, setWonPrize] = useState<any>(null);

  const handleClaimLogin = (item: any) => {
    if (stats.dailyStreak < item.day) {
      audio.playTap();
      return;
    }
    // Prevent double claim by assuming they can claim for the current streak day
    audio.playMagicExplosion();
    setClaimingDay(item.day);

    setTimeout(() => {
      onClaimDaily(item.day, item);
      setClaimingDay(null);
    }, 1200);
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    if (stats.coins < 100) {
      audio.playTap();
      return;
    }

    audio.playPowerup();
    setIsSpinning(true);
    setWonPrize(null);

    // Generate random rot rotation degrees
    const randomWedgeIdx = Math.floor(Math.random() * SPIN_ITEMS.length);
    const degreesPerWedge = 360 / SPIN_ITEMS.length;
    
    // Rotate 5 full times plus wedge offset
    const additionalDeg = 360 * 5 + (360 - randomWedgeIdx * degreesPerWedge);
    const finalRot = rotationDegrees + additionalDeg;
    
    setRotationDegrees(finalRot);

    // Simulate wheel spin rotation ending
    setTimeout(() => {
      setIsSpinning(false);
      const prize = SPIN_ITEMS[randomWedgeIdx];
      setWonPrize(prize);
      audio.playMagicExplosion();
      onClaimSpin(prize);
    }, 3500);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col justify-between p-6 select-none text-white">
      {/* HEADER BAR - Vibrant Palette Style */}
      <div className="flex justify-between items-center z-10">
        <button
          id="btn-rewards-back"
          onClick={() => { audio.playTap(); onBack(); }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-slate-400 to-slate-600 border-b-4 border-slate-800 text-white text-[10px] font-black tracking-wider transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md uppercase"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> <span>BACK</span>
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_0_rgba(15,23,42,1)] font-display">
          REWARDS
        </h2>
        <div className="bg-black/30 backdrop-blur-md border-2 border-yellow-400 rounded-full py-0.5 px-3 flex items-center shadow-lg">
          <span className="text-sm mr-1">🪙</span>
          <span className="text-xs font-black font-mono text-white">{stats.coins}</span>
        </div>
      </div>

      {/* REWARDS SWITCHER TABS - Glassmorphic and Tactile */}
      <div className="grid grid-cols-2 gap-1.5 z-10 mt-4 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border-2 border-white/20 shadow-xl">
        <button
          id="tab-rewards-login"
          onClick={() => { audio.playTap(); setActiveTab('login'); }}
          className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
            activeTab === 'login'
              ? 'bg-gradient-to-b from-pink-400 to-rose-600 border-b-4 border-rose-800 text-white shadow-md'
              : 'text-slate-300 hover:text-white font-bold hover:bg-white/5'
          }`}
        >
          📅 Daily Streak
        </button>
        <button
          id="tab-rewards-wheel"
          onClick={() => { audio.playTap(); setActiveTab('wheel'); }}
          className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
            activeTab === 'wheel'
              ? 'bg-gradient-to-b from-pink-400 to-rose-600 border-b-4 border-rose-800 text-white shadow-md'
              : 'text-slate-300 hover:text-white font-bold hover:bg-white/5'
          }`}
        >
          🎡 Lucky Spin
        </button>
      </div>

      {/* TAB CONTAINER WORKSPACE */}
      <div className="my-auto flex flex-col justify-center items-center min-h-[360px] z-10">
        {activeTab === 'login' ? (
          /* CALENDAR LOGINS SCREEN */
          <div className="w-full max-w-sm flex flex-col space-y-3.5">
            <div className="bg-black/30 backdrop-blur-md border-2 border-white/20 p-3 rounded-2xl flex justify-between items-center text-left shadow-xl">
              <div>
                <p className="text-[9px] font-mono font-black text-pink-300 uppercase tracking-widest">Tamer Streak</p>
                <p className="text-sm font-black text-white uppercase tracking-wide">{stats.dailyStreak} Days Claimed</p>
              </div>
              <div className="text-2xl animate-pulse">🔥</div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {DAILY_REWARDS.map((item) => {
                const canClaim = stats.dailyStreak + 1 === item.day;
                const isClaimed = stats.dailyStreak >= item.day;
                
                return (
                  <div
                    key={item.day}
                    onClick={() => canClaim && handleClaimLogin(item)}
                    className={`p-2.5 rounded-2xl border-2 flex flex-col justify-between items-center text-center transition-all h-[115px] select-none ${
                      item.day === 7 ? 'col-span-2' : ''
                    } ${
                      isClaimed
                        ? 'bg-black/15 border-emerald-500/20 opacity-60'
                        : canClaim
                        ? 'bg-black/35 border-pink-400 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.45)] animate-pulse'
                        : 'bg-black/45 border-white/5 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <p className="text-[9px] font-mono text-slate-300 uppercase font-black">DAY {item.day}</p>
                    <span className="text-3xl my-1">{item.icon}</span>
                    <p className="text-[9px] font-black text-white truncate w-full">{item.amount} {item.type}</p>
                    
                    {isClaimed ? (
                      <span className="text-[8px] font-black text-emerald-400 uppercase">CLAIMED</span>
                    ) : canClaim ? (
                      <span className="text-[8px] font-black text-pink-400 uppercase animate-bounce">CLAIM</span>
                    ) : (
                      <span className="text-[8px] font-black text-slate-400 uppercase">LOCKED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LUCKY SPIN WHEEL */
          <div className="w-full max-w-sm flex flex-col justify-center items-center text-center space-y-4">
            <p className="text-[10px] font-mono text-pink-200 uppercase tracking-widest font-black bg-black/30 px-3 py-1 rounded-full border border-pink-400/20">
              1 Spin = 🪙100 Coins
            </p>

            {/* Simulated Spin Wheel canvas */}
            <div className="relative w-56 h-56 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center overflow-hidden">
              {/* Spinning Wedges container */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: rotationDegrees }}
                transition={{
                  duration: isSpinning ? 3.5 : 0,
                  ease: 'easeOut'
                }}
                style={{
                  backgroundImage: 'conic-gradient(#ec4899 0deg, #f43f5e 45deg, #a855f7 45deg, #8b5cf6 90deg, #3b82f6 90deg, #2563eb 135deg, #10b981 135deg, #059669 180deg, #fbbf24 180deg, #d97706 225deg, #f97316 225deg, #ea580c 270deg, #64748b 270deg, #475569 315deg, #ec4899 315deg, #ec4899 360deg)'
                }}
              >
                {/* Visual center wedge markings */}
                {SPIN_ITEMS.map((item, idx) => {
                  const angle = idx * (360 / SPIN_ITEMS.length);
                  return (
                    <div
                      key={item.id}
                      className="absolute left-1/2 top-0 h-1/2 w-4 origin-bottom -translate-x-1/2 text-[10px] font-mono font-black text-white flex flex-col justify-start items-center pt-2 select-none"
                      style={{ transform: `rotate(${angle + 22.5}deg)` }}
                    >
                      <span className="rotate-180 mb-1">🎁</span>
                    </div>
                  );
                })}
              </motion.div>

              {/* Pin indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-yellow-300 z-20 filter drop-shadow" />

              {/* Inner golden ring hub */}
              <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 border-2 border-yellow-200 z-10 shadow flex items-center justify-center font-black text-sm text-yellow-950">
                ⭐
              </div>
            </div>

            <button
              id="btn-spin-wheel"
              disabled={isSpinning || stats.coins < 100}
              onClick={handleSpinWheel}
              className={`w-full max-w-xs py-3.5 rounded-2xl font-display font-black text-xs cursor-pointer transition-all active:translate-y-0.5 active:border-b-2 shadow-lg uppercase ${
                isSpinning || stats.coins < 100
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                  : 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-4 border-yellow-800 text-white'
              }`}
            >
              {isSpinning ? 'SPINNING...' : 'SPIN WHEEL (🪙100)'}
            </button>
          </div>
        )}
      </div>

      {/* 8. REWARDS CLAIM CELEBRATION MODAL */}
      <AnimatePresence>
        {claimingDay && (
          <motion.div
            className="absolute inset-0 bg-slate-950/95 flex flex-col justify-center items-center text-center p-6 z-50 select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center max-w-xs"
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.15, 1] }}
            >
              <div className="absolute top-1/4 w-52 h-52 bg-pink-400/15 blur-[50px] animate-pulse rounded-full" />
              <span className="text-7xl mb-4 animate-bounce">🎁</span>
              <div className="bg-pink-500/20 px-3.5 py-1 rounded-full border border-pink-400/35 font-black text-xs text-pink-300 tracking-widest uppercase">
                STREAK CLAIMED!
              </div>
              <h3 className="text-xl font-black text-white mt-4 uppercase">
                Day {claimingDay} Prize Received
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1 uppercase">Saved securely inside Stable</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WHEEL WON CELEBRATION MODAL */}
      <AnimatePresence>
        {wonPrize && !isSpinning && (
          <motion.div
            className="absolute inset-0 bg-slate-950/95 flex flex-col justify-center items-center text-center p-6 z-50 select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center max-w-xs"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="absolute top-1/4 w-52 h-52 bg-yellow-400/10 blur-[50px] animate-pulse rounded-full" />
              <span className="text-7xl mb-4 animate-bounce">✨</span>
              <div className="bg-yellow-500/20 px-3.5 py-1 rounded-full border border-yellow-400/35 font-black text-xs text-yellow-300 tracking-widest uppercase">
                SPIN RESULTS!
              </div>
              <h3 className="text-xl font-black text-white mt-4 uppercase">
                You won: {wonPrize.name}!
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1 uppercase">Added to currency inventories</p>

              <button
                id="btn-spin-celebrate-ok"
                onClick={() => setWonPrize(null)}
                className="mt-8 px-8 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 font-bold text-xs text-white shadow-lg cursor-pointer active:scale-95 uppercase"
              >
                AWESOME!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM FOOTER */}
      <div className="text-center text-[10px] font-mono text-slate-500 z-10 mt-4">
        REWARDS REFRESH AT MIDNIGHT GMT • OFFLINE SECURED
      </div>
    </div>
  );
}
