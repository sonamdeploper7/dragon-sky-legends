/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import FirstLaunch from './components/FirstLaunch';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import WorldMap from './components/WorldMap';
import GameCanvas from './components/GameCanvas';
import DragonsMenu from './components/DragonsMenu';
import DailyRewardMenu from './components/DailyRewardMenu';
import ShopMenu from './components/ShopMenu';
import AchievementsMenu from './components/AchievementsMenu';
import ProfileMenu from './components/ProfileMenu';
import SettingsMenu from './components/SettingsMenu';
import DragonVillage from './components/DragonVillage';

import { DRAGONS_DATA } from './data/dragons';
import { WORLDS_DATA } from './data/worlds';
import { DEFAULT_ACHIEVEMENTS, DEFAULT_FRIENDS, DEFAULT_CHAT, DEFAULT_CLAN } from './data/missions';
import { PlayerStats, Dragon, GameWorld, GameAchievement, Friend, ChatMessage, Clan } from './types';
import { audio } from './audio';

export default function App() {
  // Navigation Routing States
  // 'intro' | 'loading' | 'menu' | 'worldmap' | 'game' | 'dragons' | 'rewards' | 'shop' | 'community' | 'profile' | 'settings'
  const [currentView, setCurrentView] = useState<string>('intro');
  const [gameSessionId, setGameSessionId] = useState<number>(0);

  // Core App states
  const [stats, setStats] = useState<PlayerStats>({
    playerName: 'Tamer-0821',
    coins: 500,
    crystals: 20,
    highScore: 0,
    maxDistance: 0,
    dailyStreak: 0,
    lastClaimDate: '',
    selectedSkin: 'Standard',
    selectedTitle: 'Baby Dragon Tamer',
    selectedBorder: 'None',
    activeDragonId: 'sky-dragon',
    activeWorldId: 'sky-kingdom'
  });

  const [dragons, setDragons] = useState<Dragon[]>(DRAGONS_DATA);
  const [worlds, setWorlds] = useState<GameWorld[]>(WORLDS_DATA);
  const [achievements, setAchievements] = useState<GameAchievement[]>(DEFAULT_ACHIEVEMENTS);
  const [friends, setFriends] = useState<Friend[]>(DEFAULT_FRIENDS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(DEFAULT_CHAT);
  const [clan, setClan] = useState<Clan>(DEFAULT_CLAN);

  // Interstitial Ad states
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingView, setPendingView] = useState<'menu' | 'game' | null>(null);
  const [adCountdown, setAdCountdown] = useState(5);

  // Score summary modal after canvas flight crash
  const [summaryData, setSummaryData] = useState<{
    score: number;
    distance: number;
    crystals: number;
    coins: number;
    combo: number;
    checkpointReached: boolean;
  } | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('dragon_legends_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    const savedDragons = localStorage.getItem('dragon_legends_dragons');
    if (savedDragons) {
      setDragons(JSON.parse(savedDragons));
    }
    const savedWorlds = localStorage.getItem('dragon_legends_worlds');
    if (savedWorlds) {
      setWorlds(JSON.parse(savedWorlds));
    }
    const savedAchievements = localStorage.getItem('dragon_legends_achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  // Interstitial Ad countdown tick effect
  useEffect(() => {
    let timer: any;
    if (showAdModal && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAdModal, adCountdown]);

  // Save states helper helper
  const saveAll = (newStats: PlayerStats, newDragons?: Dragon[], newWorlds?: GameWorld[], newAch?: GameAchievement[]) => {
    setStats(newStats);
    localStorage.setItem('dragon_legends_stats', JSON.stringify(newStats));
    if (newDragons) {
      setDragons(newDragons);
      localStorage.setItem('dragon_legends_dragons', JSON.stringify(newDragons));
    }
    if (newWorlds) {
      setWorlds(newWorlds);
      localStorage.setItem('dragon_legends_worlds', JSON.stringify(newWorlds));
    }
    if (newAch) {
      setAchievements(newAch);
      localStorage.setItem('dragon_legends_achievements', JSON.stringify(newAch));
    }
  };

  // Helper to manage round count
  const incrementRoundsCount = () => {
    const current = parseInt(localStorage.getItem('dragon_legends_completed_rounds') || '0', 10);
    const next = current + 1;
    localStorage.setItem('dragon_legends_completed_rounds', next.toString());
    return next;
  };

  const resetRoundsCount = () => {
    localStorage.setItem('dragon_legends_completed_rounds', '0');
  };

  // State Upgrade hooks
  const handleSelectDragon = (id: string) => {
    // If not unlocked yet, try unlocking with coins
    const dragonIndex = dragons.findIndex(d => d.id === id);
    if (dragonIndex !== -1) {
      const dragon = dragons[dragonIndex];
      if (!dragon.unlocked) {
        if (stats.coins >= dragon.priceCoins) {
          const updatedDragons = [...dragons];
          updatedDragons[dragonIndex] = { ...dragon, unlocked: true };
          const updatedStats = { ...stats, coins: stats.coins - dragon.priceCoins, activeDragonId: id };
          
          // Achievement Progress "Hatch 3 Dragons"
          const updatedAchievements = achievements.map(ach => {
            if (ach.id === 'hatch-dragons') {
              return { ...ach, current: Math.min(ach.target, ach.current + 1) };
            }
            return ach;
          });

          saveAll(updatedStats, updatedDragons, worlds, updatedAchievements);
        }
      } else {
        saveAll({ ...stats, activeDragonId: id }, dragons);
      }
    }
  };

  const handleUpgradeSkill = (dragonId: string, skillName: string) => {
    const dragonIndex = dragons.findIndex(d => d.id === dragonId);
    if (dragonIndex !== -1) {
      const dragon = dragons[dragonIndex];
      const updatedSkills = dragon.skills.map(s => {
        if (s.name === skillName) {
          const cost = s.level * 100;
          return { ...s, level: Math.min(s.maxLevel, s.level + 1) };
        }
        return s;
      });
      const cost = dragon.skills.find(s => s.name === skillName)!.level * 100;
      const updatedDragons = [...dragons];
      updatedDragons[dragonIndex] = { ...dragon, skills: updatedSkills };
      saveAll({ ...stats, coins: stats.coins - cost }, updatedDragons);
    }
  };

  const handleUpgradeLevel = (dragonId: string) => {
    const dragonIndex = dragons.findIndex(d => d.id === dragonId);
    if (dragonIndex !== -1) {
      const dragon = dragons[dragonIndex];
      const cost = dragon.level * 150;
      const updatedDragons = [...dragons];
      updatedDragons[dragonIndex] = { ...dragon, level: dragon.level + 1 };
      saveAll({ ...stats, coins: stats.coins - cost }, updatedDragons);
    }
  };

  const handleHatchEgg = (eggType: string) => {
    // Generate a random dragon unlock
    const lockedDragons = dragons.filter(d => !d.unlocked);
    let selectedDragonToUnlock = dragons[Math.floor(Math.random() * dragons.length)];
    if (lockedDragons.length > 0) {
      selectedDragonToUnlock = lockedDragons[Math.floor(Math.random() * lockedDragons.length)];
    }

    const updatedDragons = dragons.map(d => {
      if (d.id === selectedDragonToUnlock.id) {
        return { ...d, unlocked: true };
      }
      return d;
    });

    const cost = eggType === 'Common' ? 300 : eggType === 'Rare' ? 800 : eggType === 'Epic' ? 1500 : 3000;
    saveAll({ ...stats, coins: Math.max(0, stats.coins - cost), activeDragonId: selectedDragonToUnlock.id }, updatedDragons);
  };

  const handleUnlockSkin = (dragonId: string, skinName: string, price: number) => {
    const dragonIndex = dragons.findIndex(d => d.id === dragonId);
    if (dragonIndex !== -1) {
      const dragon = dragons[dragonIndex];
      const updatedSkins = dragon.skins.map(s => {
        if (s.name === skinName) {
          return { ...s, unlocked: true };
        }
        return s;
      });
      const updatedDragons = [...dragons];
      updatedDragons[dragonIndex] = { ...dragon, skins: updatedSkins };
      saveAll({ ...stats, crystals: stats.crystals - price, selectedSkin: skinName }, updatedDragons);
    }
  };

  const handleSelectSkin = (skinName: string) => {
    saveAll({ ...stats, selectedSkin: skinName }, dragons);
  };

  const handleClaimDaily = (day: number, prize: any) => {
    const bonusCoins = prize.type === 'Coins' ? prize.amount : 0;
    const bonusCrystals = prize.type === 'Crystals' ? prize.amount : 0;
    
    saveAll({
      ...stats,
      dailyStreak: day,
      coins: stats.coins + bonusCoins,
      crystals: stats.crystals + bonusCrystals
    });
  };

  const handleClaimSpin = (prize: any) => {
    const bonusCoins = prize.type === 'Coins' ? prize.amount : 0;
    const bonusCrystals = prize.type === 'Crystals' ? prize.amount : 0;
    saveAll({
      ...stats,
      coins: Math.max(0, stats.coins - 100 + bonusCoins), // Deduct 100 spinning cost
      crystals: stats.crystals + bonusCrystals
    });
  };

  const handleBuyCoins = (coins: number, priceCrystals: number) => {
    saveAll({
      ...stats,
      crystals: stats.crystals - priceCrystals,
      coins: stats.coins + coins
    });
  };

  const handleBuyCrystals = (crystals: number, priceUSD: number) => {
    saveAll({
      ...stats,
      crystals: stats.crystals + crystals
    });
  };

  const handleBuyBundle = (name: string, coins: number, crystals: number, priceUSD: number) => {
    saveAll({
      ...stats,
      coins: stats.coins + coins,
      crystals: stats.crystals + crystals
    });
  };

  const handleClaimAchievement = (id: string, reward: number) => {
    const updatedAchievements = achievements.map(ach => {
      if (ach.id === id) {
        return { ...ach, claimed: true };
      }
      return ach;
    });
    saveAll({ ...stats, crystals: stats.crystals + reward }, dragons, worlds, updatedAchievements);
  };

  const handleSendGift = (id: string) => {
    const updatedFriends = friends.map(f => {
      if (f.id === id) {
        return { ...f, giftSent: true };
      }
      return f;
    });
    setFriends(updatedFriends);
  };

  const handleSendChatMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'You (Tamer)',
      text,
      time: 'Just Now',
      avatar: '🐉',
      badge: 'PRO'
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const handleSelectWorld = (id: string) => {
    saveAll({ ...stats, activeWorldId: id }, dragons);
  };

  const handleStartFlight = () => {
    setGameSessionId((prev) => prev + 1);
    setCurrentView('game');
  };

  const handleGameEnd = (score: number, distance: number, crystalsEarned: number, coinsEarned: number, comboLevel: number, checkReached: boolean) => {
    // Flight metrics calculation
    const totalGoldEarned = coinsEarned + Math.floor(distance * 0.1) + (crystalsEarned * 5);
    const updatedStats = {
      ...stats,
      coins: stats.coins + totalGoldEarned,
      crystals: stats.crystals + crystalsEarned,
      highScore: Math.max(stats.highScore, score),
      maxDistance: Math.max(stats.maxDistance, distance)
    };

    // Unlock next worlds based on high distance threshold limits
    const updatedWorlds = worlds.map(w => {
      if (w.id === 'cloud-city' && distance >= 300) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'crystal-canyon' && distance >= 600) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'frozen-peak' && distance >= 1000) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'volcano-island' && distance >= 1500) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'storm-valley' && distance >= 2000) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'moon-realm' && distance >= 2500) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'sun-temple' && distance >= 3000) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'galaxy-sky' && distance >= 3500) {
        return { ...w, unlocked: true };
      }
      if (w.id === 'ancient-ruins' && distance >= 4000) {
        return { ...w, unlocked: true };
      }
      return w;
    });

    // Handle Achievements milestones progress tracking
    const updatedAchievements = achievements.map(ach => {
      if (ach.id === 'first-flight') {
        return { ...ach, current: 1 };
      }
      if (ach.id === 'dist-500' && distance >= 500) {
        return { ...ach, current: 500 };
      }
      return ach;
    });

    setSummaryData({
      score,
      distance,
      crystals: crystalsEarned,
      coins: totalGoldEarned,
      combo: comboLevel,
      checkpointReached: checkReached
    });

    saveAll(updatedStats, dragons, updatedWorlds, updatedAchievements);
  };

  const handleResetData = () => {
    localStorage.removeItem('dragon_legends_stats');
    localStorage.removeItem('dragon_legends_dragons');
    localStorage.removeItem('dragon_legends_worlds');
    localStorage.removeItem('dragon_legends_achievements');
    
    setStats({
      playerName: 'Tamer-0821',
      coins: 500,
      crystals: 20,
      highScore: 0,
      maxDistance: 0,
      dailyStreak: 0,
      lastClaimDate: '',
      selectedSkin: 'Standard',
      selectedTitle: 'Baby Dragon Tamer',
      selectedBorder: 'None',
      activeDragonId: 'sky-dragon',
      activeWorldId: 'sky-kingdom'
    });
    setDragons(DRAGONS_DATA);
    setWorlds(WORLDS_DATA);
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setFriends(DEFAULT_FRIENDS);
  };

  const handleNavigate = (view: 'game' | 'dragons' | 'achievements' | 'daily_reward' | 'shop' | 'profile' | 'settings' | 'world_map' | 'village') => {
    if (view === 'world_map') {
      setCurrentView('worldmap');
    } else if (view === 'daily_reward') {
      setCurrentView('rewards');
    } else if (view === 'achievements') {
      setCurrentView('community');
    } else if (view === 'village') {
      setCurrentView('village');
    } else {
      setCurrentView(view);
    }
  };

  const [syncing, setSyncing] = useState(false);
  const handleCloudSync = () => {
    setSyncing(true);
    audio.playMagicExplosion();
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 flex justify-center items-center overflow-hidden">
      {/* Dynamic Main Applet Frame Body - Vibrant Palette Theme */}
      <div className="w-full max-w-md h-full min-h-screen bg-gradient-to-b from-[#1a4a8d] via-[#4facfe] to-[#a8dadc] shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Ambient background decor stars/glows */}
        <div className="absolute top-10 left-10 w-32 h-16 bg-white/40 blur-xl rounded-full pointer-events-none"></div>
        <div className="absolute top-32 right-20 w-48 h-20 bg-white/30 blur-2xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-40 left-[-20px] w-64 h-32 bg-[#4fb657]/30 blur-3xl rounded-full rotate-12 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-[#60a5fa]/20 to-transparent pointer-events-none"></div>
        
        <AnimatePresence mode="wait">
          {currentView === 'intro' && (
            <motion.div
              key="intro"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FirstLaunch onComplete={() => setCurrentView('loading')} />
            </motion.div>
          )}

          {currentView === 'loading' && (
            <motion.div
              key="loading"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingScreen onComplete={() => setCurrentView('menu')} />
            </motion.div>
          )}

          {currentView === 'menu' && (
            <motion.div
              key="menu"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MainMenu
                stats={stats}
                dragons={dragons}
                onNavigate={handleNavigate}
                onCloudSync={handleCloudSync}
              />
            </motion.div>
          )}

          {currentView === 'worldmap' && (
            <motion.div
              key="worldmap"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WorldMap
                stats={stats}
                worlds={worlds}
                onBack={() => setCurrentView('menu')}
                onSelectWorld={handleSelectWorld}
                onStartFlight={handleStartFlight}
              />
            </motion.div>
          )}

          {currentView === 'game' && (
            <motion.div
              key="game"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameCanvas
                key={`game-canvas-${gameSessionId}`}
                stats={stats}
                dragons={dragons}
                worlds={worlds}
                onGameEnd={handleGameEnd}
                onBackToMenu={() => setCurrentView('menu')}
              />
            </motion.div>
          )}

          {currentView === 'dragons' && (
            <motion.div
              key="dragons"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DragonsMenu
                stats={stats}
                dragons={dragons}
                onBack={() => setCurrentView('menu')}
                onSelectDragon={handleSelectDragon}
                onUpgradeSkill={handleUpgradeSkill}
                onUpgradeLevel={handleUpgradeLevel}
                onHatchEgg={handleHatchEgg}
                onUnlockSkin={handleUnlockSkin}
                onSelectSkin={handleSelectSkin}
              />
            </motion.div>
          )}

          {currentView === 'rewards' && (
            <motion.div
              key="rewards"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DailyRewardMenu
                stats={stats}
                onBack={() => setCurrentView('menu')}
                onClaimDaily={handleClaimDaily}
                onClaimSpin={handleClaimSpin}
              />
            </motion.div>
          )}

          {currentView === 'shop' && (
            <motion.div
              key="shop"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShopMenu
                stats={stats}
                onBack={() => setCurrentView('menu')}
                onBuyCoins={handleBuyCoins}
                onBuyCrystals={handleBuyCrystals}
                onBuyBundle={handleBuyBundle}
              />
            </motion.div>
          )}

          {currentView === 'community' && (
            <motion.div
              key="community"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AchievementsMenu
                achievements={achievements}
                friends={friends}
                chatMessages={chatMessages}
                clan={clan}
                onBack={() => setCurrentView('menu')}
                onClaimAchievement={handleClaimAchievement}
                onSendGift={handleSendGift}
                onSendChatMessage={handleSendChatMessage}
              />
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfileMenu
                stats={stats}
                onBack={() => setCurrentView('menu')}
                onUpdateName={(name) => saveAll({ ...stats, playerName: name }, dragons)}
                onSelectTitle={(title) => saveAll({ ...stats, selectedTitle: title }, dragons)}
                onSelectBorder={(border) => saveAll({ ...stats, selectedBorder: border }, dragons)}
              />
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SettingsMenu
                onBack={() => setCurrentView('menu')}
                onResetData={handleResetData}
              />
            </motion.div>
          )}

          {currentView === 'village' && (
            <motion.div
              key="village"
              className="w-full h-full min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DragonVillage
                stats={stats}
                dragons={dragons}
                onBack={() => setCurrentView('menu')}
                onUpdateStats={(updatedStats) => {
                  saveAll({ ...stats, ...updatedStats }, dragons);
                }}
                onUpdateDragons={(updatedDragons) => {
                  saveAll(stats, updatedDragons);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLIGHT REWARDS GAME OVER SUMMARY OVERLAY */}
        <AnimatePresence>
          {summaryData && (
            <motion.div
              className="absolute inset-0 bg-slate-950/95 flex flex-col justify-center items-center text-center p-6 z-50 select-none text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-xs flex flex-col items-center bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <div className="absolute -top-10 w-20 h-20 rounded-full bg-indigo-500/10 border border-white/10 flex items-center justify-center text-4xl shadow-inner">
                  {summaryData.checkpointReached ? '🏆' : '💥'}
                </div>

                <h3 className="text-xl font-black text-white mt-12 uppercase tracking-wider">
                  {summaryData.checkpointReached ? 'Flight Completed!' : 'Dragon Crashed!'}
                </h3>
                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">Flight Path Summary metrics</p>

                {/* Score and Distance listings */}
                <div className="grid grid-cols-2 gap-2 w-full mt-5 bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                  <div className="text-left">
                    <p className="text-[8px] font-mono text-slate-500 uppercase">SCORE</p>
                    <p className="text-base font-black text-cyan-300 font-mono leading-none mt-1">
                      {summaryData.score}
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-[8px] font-mono text-slate-500 uppercase">DISTANCE</p>
                    <p className="text-base font-black text-cyan-300 font-mono leading-none mt-1">
                      {summaryData.distance}m
                    </p>
                  </div>
                </div>

                {/* Items Unlocked list */}
                <div className="w-full mt-3 space-y-1 bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-left text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">🪙 Gold Earned:</span>
                    <span className="font-bold text-amber-400">+{summaryData.coins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">💎 Crystals:</span>
                    <span className="font-bold text-cyan-400">+{summaryData.crystals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">🔥 Max Combo:</span>
                    <span className="font-bold text-pink-400">x{summaryData.combo}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 w-full mt-6">
                  <button
                    id="btn-summary-retry"
                    onClick={() => {
                      audio.playTap();
                      const rounds = incrementRoundsCount();
                      if (rounds >= 4) {
                        setPendingView('game');
                        setSummaryData(null);
                        setShowAdModal(true);
                        setAdCountdown(5);
                        resetRoundsCount();
                      } else {
                        setSummaryData(null);
                        handleStartFlight();
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-indigo-500 font-bold text-xs uppercase rounded-xl text-white shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Fly Again
                  </button>

                  <button
                    id="btn-summary-menu"
                    onClick={() => {
                      audio.playTap();
                      const rounds = incrementRoundsCount();
                      if (rounds >= 4) {
                        setPendingView('menu');
                        setSummaryData(null);
                        setShowAdModal(true);
                        setAdCountdown(5);
                        resetRoundsCount();
                      } else {
                        setSummaryData(null);
                        setCurrentView('menu');
                      }
                    }}
                    className="w-full py-2.5 bg-slate-800 border border-white/5 hover:border-white/10 rounded-xl text-xs font-bold uppercase text-slate-300 active:scale-95 transition-all cursor-pointer"
                  >
                    Main Stable Menu
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INTERSTITIAL AD OVERLAY */}
        <AnimatePresence>
          {showAdModal && (
            <motion.div
              className="absolute inset-0 bg-slate-950/98 flex flex-col justify-center items-center text-center p-6 z-50 select-none text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute top-4 inset-x-4 flex justify-between items-center px-2">
                <span className="bg-slate-900/80 border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono uppercase text-slate-400">
                  Sponsor Advertisement
                </span>
                <button
                  onClick={() => {
                    audio.playTap();
                    setShowAdModal(false);
                    if (pendingView) {
                      if (pendingView === 'game') {
                        handleStartFlight();
                      } else {
                        setCurrentView(pendingView);
                      }
                      setPendingView(null);
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white/80 border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer uppercase font-black"
                  title="Close Ad"
                >
                  Skip Ad ✕
                </button>
              </div>

              <motion.div
                className="w-full max-w-sm bg-slate-900 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl mb-4 shadow-lg border border-white/10">
                  🐉
                </div>

                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 uppercase tracking-wide">
                  Dragon Tycoon Mobile
                </h3>
                <p className="text-[10px] font-mono text-cyan-300 mt-1 uppercase tracking-widest">Available Now on SkyPlay</p>

                <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-white/5 shadow-inner">
                  Build the ultimate dragon sanctuaries, breed hundreds of rare celestial species, and battle with players worldwide! Play for free today.
                </p>

                {/* Rating / Downloads */}
                <div className="flex justify-center items-center space-x-4 mt-4 text-[10px] font-mono text-slate-400">
                  <span>⭐️ 4.9 Rating</span>
                  <span>•</span>
                  <span>🔥 10M+ Tamers</span>
                </div>

                <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden mt-6 border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500" 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                  />
                </div>

                <div className="flex flex-col space-y-2 w-full mt-6">
                  {adCountdown > 0 ? (
                    <button
                      disabled
                      className="w-full py-3 bg-slate-800 border border-white/10 rounded-xl text-xs font-mono text-slate-500 uppercase cursor-not-allowed"
                    >
                      Skip Ad in {adCountdown}s...
                    </button>
                  ) : (
                    <button
                      id="btn-ad-skip"
                      onClick={() => {
                        audio.playTap();
                        setShowAdModal(false);
                        if (pendingView) {
                          if (pendingView === 'game') {
                            handleStartFlight();
                          } else {
                            setCurrentView(pendingView);
                          }
                          setPendingView(null);
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 font-black text-xs uppercase rounded-xl text-white shadow-lg cursor-pointer active:scale-95 transition-all"
                    >
                      Skip Ad & Continue ⏩
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
