/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap, Sparkles, Star, Plus, Shield, ShieldCheck } from 'lucide-react';
import { audio } from '../audio';
import { Dragon, PlayerStats } from '../types';

interface DragonsMenuProps {
  stats: PlayerStats;
  dragons: Dragon[];
  onBack: () => void;
  onSelectDragon: (id: string) => void;
  onUpgradeSkill: (dragonId: string, skillName: string) => void;
  onUpgradeLevel: (dragonId: string) => void;
  onHatchEgg: (eggType: string) => void;
  onUnlockSkin: (dragonId: string, skinName: string, price: number) => void;
  onSelectSkin: (skinName: string) => void;
}

const EGG_TYPES = [
  { type: 'Common', cost: 300, icon: '🥚', desc: 'Hatch Common to Rare dragons', color: 'from-slate-400 to-zinc-500 shadow-slate-400' },
  { type: 'Rare', cost: 800, icon: '🥚', desc: 'Hatch Rare to Epic dragons', color: 'from-sky-400 to-blue-500 shadow-sky-400' },
  { type: 'Epic', cost: 1500, icon: '🥚', desc: 'Guaranteed Epic or higher dragon', color: 'from-purple-400 to-fuchsia-600 shadow-purple-400' },
  { type: 'Legendary', cost: 3000, icon: '🥚', desc: 'Guaranteed Legendary/Mythic dragon', color: 'from-yellow-300 via-amber-500 to-yellow-600 shadow-amber-400' }
];

export const getDragonColors = (type: string) => {
  const typeColors: Record<string, { body: string; wing: string; belly: string }> = {
    'Sky': { body: '#38bdf8', wing: '#1d4ed8', belly: '#facc15' },
    'Fire': { body: '#ef4444', wing: '#991b1b', belly: '#fbbf24' },
    'Ice': { body: '#a5f3fc', wing: '#0284c7', belly: '#e0f2fe' },
    'Storm': { body: '#c084fc', wing: '#581c87', belly: '#fb7185' },
    'Forest': { body: '#34d399', wing: '#064e3b', belly: '#fef08a' },
    'Ocean': { body: '#60a5fa', wing: '#1d4ed8', belly: '#93c5fd' },
    'Crystal': { body: '#f472b6', wing: '#9d174d', belly: '#fbcfe8' },
    'Shadow': { body: '#4b5563', wing: '#111827', belly: '#a78bfa' },
    'Light': { body: '#fde047', wing: '#ca8a04', belly: '#fef9c3' },
    'Galaxy': { body: '#8b5cf6', wing: '#311042', belly: '#f472b6' },
    'Golden': { body: '#eab308', wing: '#78350f', belly: '#fef3c7' },
    'Rainbow': { body: '#ec4899', wing: '#4f46e5', belly: '#fef08a' },
    'Celestial': { body: '#a78bfa', wing: '#1e1b4b', belly: '#e879f9' }
  };
  return typeColors[type] || { body: '#38bdf8', wing: '#1d4ed8', belly: '#facc15' };
};

export default function DragonsMenu({
  stats,
  dragons,
  onBack,
  onSelectDragon,
  onUpgradeSkill,
  onUpgradeLevel,
  onHatchEgg,
  onUnlockSkin,
  onSelectSkin
}: DragonsMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'skins' | 'hatch'>('info');

  // Hatching visual state
  const [hatchingEgg, setHatchingEgg] = useState<any>(null);
  const [hatchState, setHatchState] = useState<'idle' | 'glowing' | 'hatched'>('idle');
  const [hatchedDragon, setHatchedDragon] = useState<Dragon | null>(null);

  const selectedDragon = dragons[selectedIndex];

  const handleNext = () => {
    audio.playTap();
    setSelectedIndex((prev) => (prev + 1) % dragons.length);
  };

  const handlePrev = () => {
    audio.playTap();
    setSelectedIndex((prev) => (prev - 1 + dragons.length) % dragons.length);
  };

  const handleSkillUpgrade = (skillName: string, cost: number) => {
    if (stats.coins < cost) {
      audio.playTap();
      return;
    }
    audio.playPowerup();
    onUpgradeSkill(selectedDragon.id, skillName);
  };

  const handleLevelUpgrade = (cost: number) => {
    if (stats.coins < cost) {
      audio.playTap();
      return;
    }
    audio.playPowerup();
    onUpgradeLevel(selectedDragon.id);
  };

  const handleSkinBuy = (skinName: string, price: number) => {
    if (stats.crystals < price) {
      audio.playTap();
      return;
    }
    audio.playMagicExplosion();
    onUnlockSkin(selectedDragon.id, skinName, price);
  };

  const handleSkinSelect = (skinName: string) => {
    audio.playTap();
    onSelectSkin(skinName);
  };

  const startHatching = (egg: any) => {
    if (stats.coins < egg.cost) {
      audio.playTap();
      return;
    }
    audio.playTap();
    setHatchingEgg(egg);
    setHatchState('glowing');

    // Simulate epic hatching glow sequence
    setTimeout(() => {
      audio.playRoar();
      audio.playMagicExplosion();
      onHatchEgg(egg.type);

      // Pick a random un-unlocked or matching dragon for hatching overlay display
      const lockedDragons = dragons.filter(d => !d.unlocked);
      const chosen = lockedDragons.length > 0 
        ? lockedDragons[Math.floor(Math.random() * lockedDragons.length)] 
        : dragons[Math.floor(Math.random() * dragons.length)];

      setHatchedDragon(chosen);
      setHatchState('hatched');
    }, 2000);
  };

  const closeHatchOverlay = () => {
    audio.playTap();
    setHatchingEgg(null);
    setHatchState('idle');
    setHatchedDragon(null);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col justify-between p-6 select-none text-white">
      {/* HEADER BAR - Vibrant Palette Style */}
      <div className="flex justify-between items-center z-10">
        <button
          id="btn-dragons-back"
          onClick={() => { audio.playTap(); onBack(); }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-slate-400 to-slate-600 border-b-4 border-slate-800 text-white text-[10px] font-black tracking-wider transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md uppercase"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> <span>BACK</span>
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_0_rgba(15,23,42,1)] font-display">
          stable
        </h2>
        <div className="bg-black/30 backdrop-blur-md border-2 border-yellow-400 rounded-full py-0.5 px-3 flex items-center shadow-lg">
          <span className="text-sm mr-1">🪙</span>
          <span className="text-xs font-black font-mono text-white">{stats.coins}</span>
        </div>
      </div>

      {/* SELECTION TABS - Glassmorphism & 3D styling */}
      <div className="grid grid-cols-4 gap-1.5 z-10 mt-4 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border-2 border-white/20 shadow-xl">
        {(['info', 'skills', 'skins', 'hatch'] as any[]).map((tab) => (
          <button
            key={tab}
            id={`tab-dragons-${tab}`}
            onClick={() => { audio.playTap(); setActiveTab(tab); }}
            className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-b from-cyan-400 to-blue-600 border-b-4 border-blue-800 text-white shadow-md'
                : 'text-slate-300 hover:text-white font-bold hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* STABLE WORKSPACE CONTENT */}
      <div className="my-auto flex flex-col items-center justify-center min-h-[360px] z-10">
        {activeTab !== 'hatch' ? (
          <>
            {/* Dragon slider controls */}
            <div className="relative w-full flex justify-between items-center max-w-sm px-6">
              <button
                id="btn-prev-dragon"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-slate-900/60 border border-white/10 hover:border-cyan-400/30 flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 text-cyan-400" />
              </button>

              <div className="flex flex-col items-center py-4">
                {/* Visual rendering of dragon with respective skin gradient */}
                <motion.div
                  key={selectedDragon.id}
                  className="w-32 h-32 flex justify-center items-center drop-shadow-[0_10px_25px_rgba(34,211,238,0.3)] relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <ellipse cx="100" cy="175" rx="30" ry="5" fill="rgba(0,0,0,0.4)" />
                    {/* Dragon Wings */}
                    <path
                      d="M 50 100 C 10 90, 5 50, 40 70 Z"
                      fill={getDragonColors(selectedDragon.type).wing}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 140 140 C 180 150, 190 120, 180 105 Z"
                      fill={getDragonColors(selectedDragon.type).body}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    {/* Dragon Body */}
                    <rect x="70" y="95" width="66" height="58" rx="26" fill={getDragonColors(selectedDragon.type).body} stroke="#0f172a" strokeWidth="2.5" />
                    <ellipse cx="100" cy="130" rx="16" ry="20" fill={getDragonColors(selectedDragon.type).belly} />

                    {/* Dragon Head */}
                    <rect x="65" y="45" width="68" height="54" rx="20" fill={getDragonColors(selectedDragon.type).body} stroke="#0f172a" strokeWidth="2.5" />
                    <path d="M 80 47 L 73 32 L 84 41 Z" fill={getDragonColors(selectedDragon.type).belly} />
                    <path d="M 118 47 L 125 32 L 114 41 Z" fill={getDragonColors(selectedDragon.type).belly} />

                    {/* Cute Eyes */}
                    <circle cx="84" cy="68" r="9" fill="#1e293b" />
                    <circle cx="82" cy="65" r="3" fill="white" />
                    <circle cx="114" cy="68" r="9" fill="#1e293b" />
                    <circle cx="112" cy="65" r="3" fill="white" />

                    <path d="M 94 82 Q 100 88, 106 82" fill="none" stroke="#0f172a" strokeWidth="2" />
                    {/* Wings */}
                    <path
                      d="M 138 98 C 175 88, 180 55, 142 70 Z"
                      fill={getDragonColors(selectedDragon.type).wing}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Active Indicator */}
                  {stats.activeDragonId === selectedDragon.id && (
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-1 text-white border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>

                {/* Name Cards */}
                <h3 className="text-base font-black tracking-wide flex items-center space-x-1.5 mt-2">
                  <span>{selectedDragon.name}</span>
                  <span className="text-[9px] bg-slate-900 border border-white/10 text-cyan-300 px-2 py-0.5 rounded-full uppercase">
                    {selectedDragon.rarity}
                  </span>
                </h3>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">
                  Type: {selectedDragon.type} • Stage:{' '}
                  {selectedDragon.level >= 15 ? 'Legendary' : selectedDragon.level >= 10 ? 'Adult' : selectedDragon.level >= 5 ? 'Young' : 'Baby'}
                </p>
              </div>

              <button
                id="btn-next-dragon"
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-slate-900/60 border border-white/10 hover:border-cyan-400/30 flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <ChevronRight className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            {/* TAB-DEPENDENT CONTAINER CARD - Vibrant Theme Glassmorphism */}
            <div className="w-full max-w-sm mt-3 flex-1 flex flex-col justify-start">
              {/* TAB 1: INFO VIEW (Stats & Level up) */}
              {activeTab === 'info' && (
                <div className="bg-black/30 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 flex flex-col space-y-3.5 shadow-xl">
                  {/* Stats Progress Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[9px] font-mono font-black text-slate-200 uppercase tracking-wider">
                        <span>STRENGTH SPEED</span>
                        <span>Level {selectedDragon.level}</span>
                      </div>
                      <div className="h-3.5 bg-black/40 rounded-full overflow-hidden mt-1 p-0.5 border border-white/10 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300" style={{ width: `${Math.min(100, (selectedDragon.level / 20) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] font-mono font-black text-slate-200 uppercase tracking-wider">
                        <span>GLIDE CAPACITY</span>
                        <span>{Math.min(100, 40 + selectedDragon.level * 3)}%</span>
                      </div>
                      <div className="h-3.5 bg-black/40 rounded-full overflow-hidden mt-1 p-0.5 border border-white/10 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-all duration-300" style={{ width: `${Math.min(100, 40 + selectedDragon.level * 3)}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-200 leading-relaxed text-left bg-black/25 p-3 rounded-xl border border-white/10">
                    {selectedDragon.description}
                  </p>

                  {/* Buy or Select active button in Tactile 3D design */}
                  {selectedDragon.unlocked ? (
                    stats.activeDragonId !== selectedDragon.id ? (
                      <button
                        id="btn-select-dragon"
                        onClick={() => { audio.playTap(); onSelectDragon(selectedDragon.id); }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-b from-cyan-400 to-cyan-600 border-b-4 border-cyan-800 text-white font-black text-xs cursor-pointer active:translate-y-0.5 active:border-b-2 transition-all shadow-lg uppercase"
                      >
                        Equip Active Dragon
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        {/* Level Up Button */}
                        <button
                          id="btn-level-upgrade"
                          disabled={selectedDragon.level >= 20}
                          onClick={() => handleLevelUpgrade(selectedDragon.level * 150)}
                          className={`flex-1 py-2.5 rounded-xl font-black text-xs cursor-pointer active:translate-y-0.5 active:border-b-2 transition-all uppercase flex justify-center items-center space-x-2 shadow-lg ${
                            selectedDragon.level >= 20
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                              : 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-800 text-white'
                          }`}
                        >
                          <span>LEVEL UP (🪙{selectedDragon.level * 150})</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      id="btn-unlock-dragon"
                      onClick={() => {
                        if (stats.coins >= selectedDragon.priceCoins) {
                          audio.playMagicExplosion();
                          onSelectDragon(selectedDragon.id); // Triggers unlock if they have coins
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-4 border-yellow-800 text-white font-black text-xs cursor-pointer active:translate-y-0.5 active:border-b-2 transition-all shadow-lg uppercase"
                    >
                      Unlock for 🪙{selectedDragon.priceCoins} Coins
                    </button>
                  )}
                </div>
              )}

              {/* TAB 2: SKILLS UPGRADES */}
              {activeTab === 'skills' && (
                <div className="bg-black/30 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
                  <p className="text-[10px] font-mono font-black text-cyan-300 tracking-wider text-left uppercase">
                    Unlocked Active Passives:
                  </p>
                  
                  {selectedDragon.unlocked ? (
                    <div className="space-y-3">
                      {selectedDragon.skills.map((skill) => {
                        const cost = skill.level * 100;
                        return (
                          <div key={skill.name} className="bg-black/25 p-3 rounded-xl border border-white/10 flex justify-between items-center text-left">
                            <div className="flex-1 pr-4">
                              <p className="text-xs font-black text-white flex items-center space-x-1.5">
                                <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                                <span>{skill.name}</span>
                                <span className="text-[9px] bg-black/45 px-1.5 py-0.5 rounded text-yellow-400 font-extrabold">
                                  LV.{skill.level}/{skill.maxLevel}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">{skill.description}</p>
                            </div>

                            <button
                              id={`btn-upgrade-skill-${skill.name}`}
                              disabled={skill.level >= skill.maxLevel}
                              onClick={() => handleSkillUpgrade(skill.name, cost)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer active:translate-y-0.5 active:border-b-2 transition-all shadow-md ${
                                skill.level >= skill.maxLevel
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                                  : 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-800 text-white'
                              }`}
                            >
                              {skill.level >= skill.maxLevel ? 'MAX' : `🪙${cost}`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 font-mono">
                      Unlock this dragon first to upgrade skills.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SKINS SYSTEM */}
              {activeTab === 'skins' && (
                <div className="bg-black/30 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
                  <p className="text-[10px] font-mono font-black text-cyan-300 tracking-wider text-left uppercase">
                    Select dragon scale coat:
                  </p>

                  {selectedDragon.unlocked ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {selectedDragon.skins.map((s) => {
                        const isEquipped = stats.selectedSkin === s.name;
                        return (
                          <div
                            key={s.name}
                            onClick={() => s.unlocked ? handleSkinSelect(s.name) : handleSkinBuy(s.name, s.price)}
                            className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-between transition-all active:scale-95 ${
                              isEquipped
                                ? 'bg-black/40 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.45)]'
                                : 'bg-black/20 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-12 h-6 rounded bg-gradient-to-r ${s.gradient} border border-white/15 mb-2 shadow-inner`} />
                            
                            <p className="text-[11px] font-black text-white mb-1 truncate uppercase tracking-wide">{s.name}</p>
                            
                            {s.unlocked ? (
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isEquipped ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {isEquipped ? 'EQUIPPED' : 'SELECT'}
                              </span>
                            ) : (
                              <span className="text-[8px] font-black text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
                                💎 {s.price}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 font-mono">
                      Unlock this dragon first to buy skins.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* TAB 4: HATCHING SYSTEM EGG SHOP */
          <div className="w-full max-w-sm bg-black/30 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl mt-3 overflow-y-auto max-h-[380px]">
            <p className="text-[10px] font-mono font-black text-cyan-300 tracking-wider text-left uppercase">
              Hatch Eggs for legendary companions:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {EGG_TYPES.map((egg) => (
                <div key={egg.type} className="bg-black/20 p-3 rounded-2xl border border-white/10 flex flex-col justify-between items-center text-center">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-b ${egg.color} shadow-lg border border-white/15 flex items-center justify-center text-2xl mb-2 animate-bounce`}>
                    {egg.icon}
                  </div>
                  <p className="text-xs font-black text-white uppercase tracking-wide">{egg.type} Egg</p>
                  <p className="text-[9px] text-slate-300 leading-tight my-1 truncate w-full">{egg.desc}</p>
                  
                  <button
                    id={`btn-hatch-${egg.type}`}
                    onClick={() => startHatching(egg)}
                    className="mt-1.5 w-full py-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-4 border-yellow-800 rounded-xl text-[10px] font-black text-white uppercase cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md"
                  >
                    🪙 {egg.cost}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. HATCHING SEQUENCE GLOWING OVERLAY */}
      <AnimatePresence>
        {hatchingEgg && (
          <motion.div
            className="absolute inset-0 bg-slate-950/95 flex flex-col justify-center items-center text-center p-6 z-50 select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hatchState === 'glowing' ? (
              <motion.div
                className="flex flex-col items-center"
                animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div className={`w-32 h-32 rounded-full bg-gradient-to-b ${hatchingEgg.color} shadow-[0_0_50px_rgba(251,191,36,0.8)] border border-white/20 flex items-center justify-center text-6xl mb-6`}>
                  🥚
                </div>
                <h3 className="text-xl font-black text-yellow-300 animate-pulse tracking-widest uppercase">
                  HATCHING EGG...
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1 uppercase">Generating Companion Sparks</p>
              </motion.div>
            ) : (
              hatchedDragon && (
                <motion.div
                  className="flex flex-col items-center max-w-xs"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="absolute top-1/4 w-60 h-60 rounded-full bg-cyan-400/10 blur-[50px] animate-pulse" />
                  <span className="text-7xl mb-4 animate-bounce">🐉</span>
                  <div className="bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 rounded-full text-xs font-black text-cyan-300 uppercase tracking-widest">
                    CONGRATULATIONS!
                  </div>
                  <h3 className="text-2xl font-black text-white mt-3 uppercase tracking-wide">
                    {hatchedDragon.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Rarity: <span className="text-yellow-400 font-bold uppercase">{hatchedDragon.rarity}</span>
                  </p>
                  
                  <p className="text-xs text-slate-300 leading-relaxed mt-4 bg-slate-900/60 p-3 rounded-2xl border border-white/5 shadow-inner">
                    {hatchedDragon.description}
                  </p>

                  <button
                    id="btn-hatch-close"
                    onClick={closeHatchOverlay}
                    className="mt-8 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-600 font-bold text-sm text-white shadow-lg cursor-pointer active:scale-95 uppercase tracking-wider"
                  >
                    WELCOME COMPANION!
                  </button>
                </motion.div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM FOOTER */}
      <div className="text-center text-[10px] font-mono text-slate-500 z-10 mt-4">
        STABLE SECURE • SYSTEM AUTOMATIC SAVES
      </div>
    </div>
  );
}
