/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Users, MessageSquare, Shield, Send, Gift } from 'lucide-react';
import { audio } from '../audio';
import { GameAchievement, Friend, ChatMessage, Clan } from '../types';

interface AchievementsMenuProps {
  achievements: GameAchievement[];
  friends: Friend[];
  chatMessages: ChatMessage[];
  clan: Clan;
  onBack: () => void;
  onClaimAchievement: (id: string, reward: number) => void;
  onSendGift: (id: string) => void;
  onSendChatMessage: (text: string) => void;
}

const CHAT_TEMPLATES = [
  { sender: 'VoltRider', text: 'Just hatched a Legendary Galaxy Dragon! Oh my god, the particle trail is unreal! 🌌', avatar: '🐉' },
  { sender: 'SkyGlider', text: 'Can anyone recommend skill priority for Frostwing? Cloud Glide or Frozen Aura first?', avatar: '❄️' },
  { sender: 'EmperorEmber', text: 'Finally beat the Ancient Stone Guardian! Score combo reached x6, feeling like a boss! 😎', avatar: '🔥' },
  { sender: 'AquaGamer', text: 'Clan missions reset! Everybody please make sure to collect crystals today for double clan XP!', avatar: '🌊' },
  { sender: 'GoldTamer', text: 'Hatched a Wood Chest and got 500 coins, sweet luck today!', avatar: '📦' }
];

export default function AchievementsMenu({
  achievements,
  friends,
  chatMessages,
  clan,
  onBack,
  onClaimAchievement,
  onSendGift,
  onSendChatMessage
}: AchievementsMenuProps) {
  const [activeTab, setActiveTab] = useState<'achievements' | 'friends' | 'chat' | 'clan'>('achievements');
  const [localChat, setLocalChat] = useState<ChatMessage[]>(chatMessages);
  const [chatInput, setChatInput] = useState('');

  // Periodically add random friendly chats to the chat log
  useEffect(() => {
    if (activeTab !== 'chat') return;

    const interval = setInterval(() => {
      const template = CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];
      const newMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: template.sender,
        text: template.text,
        time: 'Just Now',
        avatar: template.avatar
      };
      setLocalChat((prev) => [...prev.slice(-15), newMsg]);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    audio.playTap();
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'You (Tamer)',
      text: chatInput.trim(),
      time: 'Just Now',
      avatar: '🐉',
      badge: 'PRO'
    };

    setLocalChat((prev) => [...prev, userMsg]);
    onSendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleClaim = (ach: GameAchievement) => {
    if (ach.current < ach.target || ach.claimed) {
      audio.playTap();
      return;
    }
    audio.playMagicExplosion();
    onClaimAchievement(ach.id, ach.rewardCrystals);
  };

  const handleGiftClick = (friend: Friend) => {
    if (friend.giftSent) return;
    audio.playMagicExplosion();
    onSendGift(friend.id);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col justify-between p-6 select-none text-white">
      {/* HEADER BAR - Vibrant Palette Style */}
      <div className="flex justify-between items-center z-10">
        <button
          id="btn-achievements-back"
          onClick={() => { audio.playTap(); onBack(); }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-slate-400 to-slate-600 border-b-4 border-slate-800 text-white text-[10px] font-black tracking-wider transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md uppercase"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> <span>BACK</span>
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_0_rgba(15,23,42,1)] font-display">
          COMMUNITY
        </h2>
        <div className="bg-black/30 backdrop-blur-md border-2 border-purple-400 rounded-full py-1 px-3 flex items-center shadow-lg text-[9px] font-black text-purple-300 uppercase tracking-wider">
          🏆 MULTIPLAYER
        </div>
      </div>

      {/* COMMUNITY CATEGORY TABS - Glassmorphic and Tactile */}
      <div className="grid grid-cols-4 gap-1.5 z-10 mt-4 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border-2 border-white/20 shadow-xl">
        {(['achievements', 'friends', 'chat', 'clan'] as any[]).map((tab) => (
          <button
            key={tab}
            id={`tab-community-${tab}`}
            onClick={() => { audio.playTap(); setActiveTab(tab); }}
            className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-b from-purple-400 to-indigo-600 border-b-4 border-indigo-800 text-white shadow-md'
                : 'text-slate-300 hover:text-white font-bold hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* COMMUNITY CONTEXT WORKSPACE */}
      <div className="my-auto flex flex-col justify-start items-center min-h-[360px] z-10 w-full overflow-y-auto max-h-[420px] py-1">
        {/* VIEW 1: ACHIEVEMENTS TROPHIES LIST */}
        {activeTab === 'achievements' && (
          <div className="w-full max-w-sm space-y-2.5">
            {achievements.map((ach) => {
              const isDone = ach.current >= ach.target;
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border-2 flex justify-between items-center text-left ${
                    ach.claimed
                      ? 'bg-black/15 border-white/5 opacity-55'
                      : 'bg-black/20 border-white/10 hover:border-white/20 shadow-md'
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <p className="text-xs font-black text-white flex items-center space-x-1.5">
                      <Trophy className={`w-3.5 h-3.5 ${isDone ? 'text-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                      <span className="uppercase tracking-wide">{ach.title}</span>
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">{ach.description}</p>
                    {/* Progress indicator */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex-1 h-3.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-500"
                          style={{ width: `${Math.min(100, (ach.current / ach.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 font-black">
                        {ach.current}/{ach.target}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`btn-claim-achievement-${ach.id}`}
                    disabled={ach.claimed || !isDone}
                    onClick={() => handleClaim(ach)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer active:translate-y-0.5 active:border-b-2 transition-all shadow-md ${
                      ach.claimed
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                        : isDone
                        ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-4 border-yellow-800 text-white shadow-[0_0_12px_rgba(245,158,11,0.45)] animate-pulse'
                        : 'bg-slate-700 text-slate-300 border-b-4 border-slate-900 text-slate-100'
                    }`}
                  >
                    {ach.claimed ? 'CLAIMED' : isDone ? `💎 ${ach.rewardCrystals}` : 'LOCKED'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="w-full max-w-sm space-y-2.5">
            <div className="bg-black/30 backdrop-blur-md border-2 border-white/20 p-3 rounded-2xl flex justify-between items-center text-left mb-2 shadow-xl">
              <div>
                <p className="text-[9px] font-mono font-black text-cyan-300 uppercase tracking-widest">My Friend Code</p>
                <p className="text-sm font-black text-amber-300 tracking-wider">DRAGON-7728-SKY</p>
              </div>
              <button
                onClick={() => { audio.playTap(); }}
                className="px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-300"
              >
                COPY CODE
              </button>
            </div>

            {friends.map((friend) => (
              <div key={friend.id} className="bg-black/20 p-3 rounded-2xl border-2 border-white/10 flex justify-between items-center text-left shadow-md">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                    {friend.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-black text-white">{friend.name}</p>
                      <span className={`w-1.5 h-1.5 rounded-full ${friend.online ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-slate-500'}`} />
                    </div>
                    <p className="text-[9px] font-mono text-slate-400 uppercase font-bold">Tamer level {friend.level}</p>
                  </div>
                </div>

                <button
                  id={`btn-gift-${friend.id}`}
                  disabled={friend.giftSent}
                  onClick={() => handleGiftClick(friend)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center space-x-1 cursor-pointer active:translate-y-0.5 active:border-b-2 transition-all ${
                    friend.giftSent
                      ? 'bg-slate-800 text-slate-500 border-none'
                      : 'bg-gradient-to-b from-pink-400 to-pink-600 border-b-4 border-pink-800 text-white shadow-md'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{friend.giftSent ? 'GIFTED' : 'SEND GIFT'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 3: FAMILY-SAFE WORLD CHAT SIMULATOR */}
        {activeTab === 'chat' && (
          <div className="w-full max-w-sm h-[360px] flex flex-col justify-between bg-black/30 backdrop-blur-md rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl">
            {/* Scrollable chat body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col-reverse justify-end">
              {localChat.slice().reverse().map((msg) => (
                <div key={msg.id} className="bg-black/20 p-2.5 rounded-xl border border-white/10 flex items-start space-x-2 text-left">
                  <span className="text-xl">{msg.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-[10px] font-black text-cyan-300">{msg.sender}</p>
                      {msg.badge && (
                        <span className="text-[8px] bg-amber-400 text-amber-950 font-black px-1 rounded uppercase">
                          {msg.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 leading-tight mt-0.5 break-words font-sans">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat submit footer input */}
            <form onSubmit={handleSendChat} className="bg-black/30 p-2 border-t-2 border-white/10 flex space-x-2">
              <input
                type="text"
                maxLength={80}
                placeholder="Type family-friendly message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-black/40 border-2 border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-gradient-to-b from-purple-400 to-indigo-600 border-b-4 border-indigo-800 flex items-center justify-center text-white cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* VIEW 4: CLAN METRICS & LEADERBOARD */}
        {activeTab === 'clan' && (
          <div className="w-full max-w-sm space-y-3.5">
            {/* Clan Summary Shield */}
            <div className="bg-black/30 backdrop-blur-md border-2 border-indigo-400/30 p-4 rounded-2xl text-center flex flex-col items-center shadow-xl animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl mb-2 shadow-inner">
                🛡️
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                [{clan.tag}] {clan.name}
              </h3>
              <p className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider mt-0.5">
                Clan Level {clan.level} • {clan.membersCount}/30 Members
              </p>
              <p className="text-xs text-slate-200 leading-snug mt-3 bg-black/25 p-3 rounded-xl border border-white/10">
                {clan.description}
              </p>
            </div>

            {/* Clan Quest */}
            <div className="bg-black/20 p-3 rounded-2xl border-2 border-white/10 text-left shadow-md">
              <p className="text-[9px] font-mono font-black text-yellow-300 uppercase tracking-widest">ACTIVE CLAN QUEST</p>
              <p className="text-xs font-black text-white mt-0.5 uppercase tracking-wide">Collect 500 crystals together</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1 h-3.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: '64%' }} />
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-black">320/500</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="text-center text-[10px] font-mono text-slate-400 z-10 mt-4 uppercase tracking-wider">
        TAMER SERVERS SYNCED SECURELY • OFFLINE ACTIVE
      </div>
    </div>
  );
}
