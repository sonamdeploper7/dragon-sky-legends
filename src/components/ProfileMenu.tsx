/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Edit2, Shield, Calendar, User, Settings } from 'lucide-react';
import { audio } from '../audio';
import { PlayerStats } from '../types';

interface ProfileMenuProps {
  stats: PlayerStats;
  onBack: () => void;
  onUpdateName: (name: string) => void;
  onSelectTitle: (title: string) => void;
  onSelectBorder: (border: string) => void;
}

const AVAILABLE_TITLES = [
  'Baby Dragon Tamer',
  'Sky Highway Racer',
  'Legendary Wyrm Whisperer',
  'Grandmaster Stormbringer',
  'Prismatic Glider Pro'
];

const AVAILABLE_BORDERS = [
  { name: 'None', class: 'border-transparent' },
  { name: 'Golden Sunburst', class: 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-[0_0_10px_#facc15]' },
  { name: 'Cosmic Prismatic', class: 'border-purple-500 ring-2 ring-pink-500/50 shadow-[0_0_10px_#ec4899]' },
  { name: 'Volcanic Ember', class: 'border-orange-500 ring-2 ring-red-500/50 shadow-[0_0_10px_#f97316]' }
];

const AVAILABLE_AVATARS = ['👶', '🐉', '🔥', '⚡', '🌌', '❄️', '🌿'];

export default function ProfileMenu({ stats, onBack, onUpdateName, onSelectTitle, onSelectBorder }: ProfileMenuProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(stats.playerName);

  const handleSaveName = () => {
    if (!newName.trim()) return;
    audio.playPowerup();
    onUpdateName(newName.trim());
    setIsEditingName(false);
  };

  const handleTitleSelect = (title: string) => {
    audio.playTap();
    onSelectTitle(title);
  };

  const handleBorderSelect = (border: string) => {
    audio.playTap();
    onSelectBorder(border);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-6 select-none text-white">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center z-10">
        <button
          id="btn-profile-back"
          onClick={() => { audio.playTap(); onBack(); }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> <span>BACK</span>
        </button>
        <h2 className="text-xl font-black bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent uppercase tracking-wider">
          Tamer Profile
        </h2>
        <div className="text-xs font-mono bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/35 text-emerald-300">
          RANK: GOLD IV
        </div>
      </div>

      {/* CENTER WORKSPACE WORK */}
      <div className="my-auto flex flex-col justify-start items-center min-h-[380px] z-10 w-full overflow-y-auto max-h-[440px] py-2 space-y-4">
        {/* Profile Card customized */}
        <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950/80 border border-white/5 rounded-2xl p-4 shadow-xl text-center relative flex flex-col items-center">
          
          {/* Avatar with customized Border Frame */}
          <div className={`w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center text-3xl border-2 mb-2 transition-all ${
            AVAILABLE_BORDERS.find(b => b.name === stats.selectedBorder)?.class || 'border-transparent'
          }`}>
            🐉
          </div>

          {/* Name & Title */}
          <div className="flex flex-col items-center">
            {isEditingName ? (
              <div className="flex items-center space-x-2 bg-slate-950 px-2 py-1 rounded-xl border border-white/10">
                <input
                  type="text"
                  maxLength={16}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-transparent text-sm font-black text-white focus:outline-none w-28 text-center"
                />
                <button
                  id="btn-profile-save-name"
                  onClick={handleSaveName}
                  className="text-xs font-bold bg-cyan-500 px-2 py-1 rounded text-white"
                >
                  SAVE
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 pl-5">
                <h3 className="text-sm font-black text-white uppercase tracking-wide">
                  {stats.playerName}
                </h3>
                <button
                  id="btn-profile-edit-name"
                  onClick={() => { audio.playTap(); setIsEditingName(true); }}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-[10px] bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-0.5 rounded-full text-yellow-950 font-black uppercase mt-1">
              {stats.selectedTitle}
            </p>
          </div>

          {/* Basic Metrics List */}
          <div className="grid grid-cols-2 gap-2 w-full mt-4 border-t border-white/5 pt-4">
            <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 text-left">
              <p className="text-[9px] font-mono text-slate-500 uppercase font-bold">HIGH SCORE</p>
              <p className="text-sm font-black text-white font-mono leading-none mt-1">{stats.highScore}</p>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 text-left">
              <p className="text-[9px] font-mono text-slate-500 uppercase font-bold">MAX DISTANCE</p>
              <p className="text-sm font-black text-white font-mono leading-none mt-1">{stats.bestDistance}m</p>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 text-left">
              <p className="text-[9px] font-mono text-slate-500 uppercase font-bold">TOTAL COINS</p>
              <p className="text-sm font-black text-amber-400 font-mono leading-none mt-1">{stats.coins}</p>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 text-left">
              <p className="text-[9px] font-mono text-slate-500 uppercase font-bold">TOTAL CRYSTALS</p>
              <p className="text-sm font-black text-cyan-400 font-mono leading-none mt-1">{stats.crystals}</p>
            </div>
          </div>
        </div>

        {/* CUSTOMIZATION OPTIONS SELECTORS */}
        <div className="w-full max-w-sm bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-4">
          {/* Borders selector */}
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest pl-1">
              CUSTOM TAMER PROFILE BORDER
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_BORDERS.map((b) => {
                const isSelected = stats.selectedBorder === b.name;
                return (
                  <button
                    key={b.name}
                    id={`btn-border-${b.name}`}
                    onClick={() => handleBorderSelect(b.name)}
                    className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all text-center flex flex-col items-center justify-between h-[65px] ${
                      isSelected
                        ? 'bg-slate-950 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[9px] opacity-60 uppercase">{isSelected ? 'ACTIVE' : 'SELECT'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Titles Selector */}
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest pl-1">
              EARNED TITLES
            </p>
            <div className="flex flex-col space-y-1.5">
              {AVAILABLE_TITLES.map((t) => {
                const isSelected = stats.selectedTitle === t;
                return (
                  <button
                    key={t}
                    id={`btn-title-${t}`}
                    onClick={() => handleTitleSelect(t)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="text-center text-[10px] font-mono text-slate-500 z-10 mt-4">
        STABLE METADATA STORED LOCALSTORAGE • ENCRYPTED SHA256
      </div>
    </div>
  );
}
