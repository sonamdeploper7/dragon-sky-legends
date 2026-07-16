/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Compass, Lock, Play, CloudSun, Sparkles } from 'lucide-react';
import { audio } from '../audio';
import { GameWorld, PlayerStats } from '../types';

interface WorldMapProps {
  stats: PlayerStats;
  worlds: GameWorld[];
  onBack: () => void;
  onSelectWorld: (id: string) => void;
  onStartFlight: () => void;
}

export default function WorldMap({ stats, worlds, onBack, onSelectWorld, onStartFlight }: WorldMapProps) {
  const [selectedWorldId, setSelectedWorldId] = useState(stats.activeWorldId);

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId) || worlds[0];

  const handleWorldNodeSelect = (world: GameWorld) => {
    if (!world.unlocked) {
      audio.playTap();
      return;
    }
    audio.playTap();
    setSelectedWorldId(world.id);
    onSelectWorld(world.id);
  };

  const handleLaunch = () => {
    audio.playRoar();
    audio.playMagicExplosion();
    onStartFlight();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col justify-between p-6 select-none text-white">
      {/* HEADER BAR - Vibrant Palette Style */}
      <div className="flex justify-between items-center z-10">
        <button
          id="btn-world-map-back"
          onClick={() => { audio.playTap(); onBack(); }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-slate-400 to-slate-600 border-b-4 border-slate-800 text-white text-[10px] font-black tracking-wider transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md uppercase"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> <span>BACK</span>
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_0_rgba(15,23,42,1)] font-display flex items-center space-x-1">
          <Compass className="w-4 h-4 text-yellow-300 animate-spin [animation-duration:12s]" />
          <span>SKY MAP</span>
        </h2>
        <div className="bg-black/30 backdrop-blur-md border-2 border-cyan-400 rounded-full py-1 px-3 flex items-center shadow-lg text-[9px] font-black text-cyan-300">
          STAGE MAPS
        </div>
      </div>

      {/* MAP NODE GRAPH PROGRESSION */}
      <div className="my-auto flex flex-col items-center justify-center min-h-[350px] z-10 relative">
        
        {/* Draw scenic map curve links */}
        <div className="absolute inset-0 max-w-sm flex items-center justify-center opacity-30 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 300 300">
            <path
              d="M 50 150 Q 150 10, 250 150 T 150 250"
              fill="none"
              stroke="rgba(34, 211, 238, 0.4)"
              strokeWidth="4"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        {/* Nodes map list */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm max-h-[240px] overflow-y-auto p-1.5 bg-black/20 rounded-2xl border border-white/5 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {worlds.map((w, idx) => {
            const isSelected = w.id === selectedWorldId;
            return (
              <div
                key={w.id}
                id={`world-node-${w.id}`}
                onClick={() => handleWorldNodeSelect(w)}
                className={`p-2.5 rounded-xl cursor-pointer relative flex flex-col justify-between transition-all active:scale-95 min-h-[90px] border-2 ${
                  w.unlocked
                    ? isSelected
                      ? 'bg-black/50 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.45)]'
                      : 'bg-black/25 border-white/10 hover:border-white/20'
                    : 'bg-black/45 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono font-black text-slate-400 tracking-wider">
                      MAP 0{idx + 1}
                    </span>
                    {!w.unlocked && <Lock className="w-3 h-3 text-slate-500" />}
                  </div>
                  
                  <p className="text-[10px] font-black text-white uppercase mt-0.5 tracking-wide">
                    {w.name}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[8px] bg-black/40 border border-white/10 text-cyan-300 px-1.5 py-0.5 rounded-full font-black uppercase">
                    {w.weather}
                  </span>
                  {isSelected && w.unlocked && (
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage details box below */}
        {selectedWorld && (
          <div className="w-full max-w-sm mt-4 bg-black/30 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 flex flex-col justify-start text-left shadow-xl">
            <h3 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase">
              <CloudSun className="w-4 h-4 text-cyan-300" />
              <span>{selectedWorld.name} Weather Conditions: {selectedWorld.weather}</span>
            </h3>
            
            <p className="text-[11px] text-slate-200 leading-relaxed mt-2 pl-1">
              {selectedWorld.description}
            </p>

            <button
              id="btn-launch-flight"
              onClick={handleLaunch}
              className="mt-4 w-full py-3.5 bg-gradient-to-b from-emerald-400 to-emerald-600 border-b-4 border-emerald-800 rounded-2xl text-xs font-black text-white shadow-lg cursor-pointer active:translate-y-0.5 active:border-b-2 uppercase tracking-widest flex justify-center items-center space-x-1.5 font-display"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>LAUNCH FLIGHT PATH</span>
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="text-center text-[10px] font-mono text-slate-400 z-10 mt-4 uppercase tracking-wider">
        COSMIC SKY MAP UNLOCKED • OFFLINE ACTIVE
      </div>
    </div>
  );
}
