/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Volume2, VolumeX, ShieldAlert, Cloud, RotateCcw } from 'lucide-react';
import { audio } from '../audio';

interface SettingsMenuProps {
  onBack: () => void;
  onResetData: () => void;
}

export default function SettingsMenu({ onBack, onResetData }: SettingsMenuProps) {
  const [musicVol, setMusicVol] = useState(70);
  const [sfxVol, setSfxVol] = useState(85);
  const [language, setLanguage] = useState('English');
  const [syncLogs, setSyncLogs] = useState<string[]>([
    'System: Offline database initialized.',
    'Google Play Games: Auth token resolved.',
    'Cloud Save: Local state is fully up to date.'
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSyncCloud = () => {
    if (isSyncing) return;
    audio.playPowerup();
    setIsSyncing(true);
    setSyncLogs((prev) => [...prev, 'Cloud Save: Initiating handshake...']);

    setTimeout(() => {
      setSyncLogs((prev) => [
        ...prev,
        `Cloud Save: Uploaded state snapshot successfully at ${new Date().toLocaleTimeString()}.`,
        'System: Synchronization complete!'
      ]);
      setIsSyncing(false);
    }, 1800);
  };

  const handleResetData = () => {
    audio.playMagicExplosion();
    onResetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-6 select-none text-white">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center z-10">
        <button
          id="btn-settings-back"
          onClick={() => { audio.playTap(); onBack(); }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> <span>BACK</span>
        </button>
        <h2 className="text-xl font-black bg-gradient-to-r from-slate-300 to-zinc-400 bg-clip-text text-transparent uppercase tracking-wider">
          Tamer Settings
        </h2>
        <div className="text-xs font-mono bg-slate-500/20 px-2.5 py-1 rounded-xl border border-slate-500/35 text-slate-300">
          V1.2.8
        </div>
      </div>

      {/* SETTINGS CARD OPTIONS LIST */}
      <div className="my-auto flex flex-col justify-start items-center min-h-[380px] z-10 w-full overflow-y-auto max-h-[440px] py-2 space-y-4">
        {/* AUDIO AND SFX MODULE */}
        <div className="w-full max-w-sm bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-4">
          <p className="text-[10px] font-mono font-bold text-cyan-300 tracking-wider text-left uppercase">
            Audio Synthesizers Configs:
          </p>

          {/* Music slider */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center space-x-1">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span>Background Music</span>
              </span>
              <span className="font-mono text-cyan-300">{musicVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVol}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMusicVol(val);
                audio.setMusicVolume(val);
              }}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer appearance-none"
            />
          </div>

          {/* SFX Slider */}
          <div className="space-y-1.5 text-left pt-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center space-x-1">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span>Audio Sound SFX</span>
              </span>
              <span className="font-mono text-cyan-300">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSfxVol(val);
                audio.setSoundVolume(val);
              }}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer appearance-none"
            />
          </div>
        </div>

        {/* GOOGLE PLAY CLOUD STORAGE MODULE */}
        <div className="w-full max-w-sm bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-3 text-left">
          <p className="text-[10px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
            Google Play Cloud Save Sync:
          </p>

          <button
            id="btn-cloud-sync"
            disabled={isSyncing}
            onClick={handleSyncCloud}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase flex justify-center items-center space-x-2 cursor-pointer active:scale-95 transition-all ${
              isSyncing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-400 text-white shadow-md'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>{isSyncing ? 'SYNCING DATA...' : 'SYNC LOCAL TO CLOUD'}</span>
          </button>

          {/* Console Logs */}
          <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 h-28 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
            {syncLogs.map((log, idx) => (
              <p key={idx}>{log}</p>
            ))}
          </div>
        </div>

        {/* RESET GAME PROGRESS */}
        <div className="w-full max-w-sm bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-left space-y-2">
          <p className="text-[10px] font-mono font-bold text-red-400 tracking-wider uppercase">
            Danger Zone Area:
          </p>

          <button
            id="btn-trigger-reset"
            onClick={() => { audio.playTap(); setShowResetConfirm(true); }}
            className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-200 font-bold text-xs uppercase flex justify-center items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET ALL SAVE DATA</span>
          </button>
        </div>
      </div>

      {/* RESET GAME DATA CONFIRMATION POPUP */}
      <AnimatePresence>
        {showResetConfirm && (
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
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400 mb-4 animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                ARE YOU SURE?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                This action is irreversible. All unlocked dragons, level stages, stats, coins, and crystals will be deleted forever.
              </p>

              <div className="flex space-x-2 w-full mt-6">
                <button
                  id="btn-confirm-reset-yes"
                  onClick={handleResetData}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-black uppercase text-white cursor-pointer active:scale-95"
                >
                  YES, RESET
                </button>
                <button
                  id="btn-confirm-reset-no"
                  onClick={() => { audio.playTap(); setShowResetConfirm(false); }}
                  className="flex-1 py-2.5 bg-slate-800 rounded-xl text-xs font-black uppercase text-slate-300 cursor-pointer active:scale-95 border border-white/5"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM FOOTER */}
      <div className="text-center text-[10px] font-mono text-slate-500 z-10 mt-4">
        TAMER ENCRYPT CODES DEPLOYED • OFFLINE ACTIVE
      </div>
    </div>
  );
}
