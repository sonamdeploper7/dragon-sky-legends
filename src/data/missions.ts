/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMission, GameAchievement, Friend, ChatMessage, Clan } from '../types';

export const INITIAL_MISSIONS: GameMission[] = [
  {
    id: 'm1',
    title: 'Daily Crystal Rush',
    description: 'Collect 100 Blue Crystals in any single world.',
    target: 100,
    current: 0,
    rewardCoins: 300,
    rewardCrystals: 5,
    completed: false,
    claimed: false,
    type: 'daily'
  },
  {
    id: 'm2',
    title: 'Long Distance Glider',
    description: 'Fly a total distance of 1,500 meters.',
    target: 1500,
    current: 0,
    rewardCoins: 400,
    rewardCrystals: 8,
    completed: false,
    claimed: false,
    type: 'daily'
  },
  {
    id: 'm3',
    title: 'Perfect Wing Flaps',
    description: 'Execute 50 wing flaps perfectly without any collisions.',
    target: 50,
    current: 0,
    rewardCoins: 250,
    rewardCrystals: 3,
    completed: false,
    claimed: false,
    type: 'daily'
  },
  {
    id: 'm4',
    title: 'Weekly Dragon Master',
    description: 'Upgrade any dragon skills a total of 10 times.',
    target: 10,
    current: 0,
    rewardCoins: 1200,
    rewardCrystals: 25,
    completed: false,
    claimed: false,
    type: 'weekly'
  },
  {
    id: 'm5',
    title: 'Weekly Sky Explorer',
    description: 'Complete 15 stages across any world.',
    target: 15,
    current: 0,
    rewardCoins: 1500,
    rewardCrystals: 30,
    completed: false,
    claimed: false,
    type: 'weekly'
  }
];

export const INITIAL_ACHIEVEMENTS: GameAchievement[] = [
  {
    id: 'a1',
    title: 'First Flight',
    description: 'Take to the skies for the very first time.',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardCrystals: 10
  },
  {
    id: 'a2',
    title: 'Crystal Hoarder',
    description: 'Collect a total of 500 Blue Crystals.',
    target: 500,
    current: 0,
    completed: false,
    claimed: false,
    rewardCrystals: 20
  },
  {
    id: 'a3',
    title: 'Dragon Hoarder',
    description: 'Unlock 3 unique dragons in your collection.',
    target: 3,
    current: 0,
    completed: false,
    claimed: false,
    rewardCrystals: 35
  },
  {
    id: 'a4',
    title: 'Boss Hunter',
    description: 'Defeat your first epic World Boss.',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardCrystals: 50
  },
  {
    id: 'a5',
    title: 'Ultimate Combo Master',
    description: 'Reach a multiplier score combo of x5 or higher.',
    target: 5,
    current: 0,
    completed: false,
    claimed: false,
    rewardCrystals: 25
  },
  {
    id: 'a6',
    title: 'Distant Horizon',
    description: 'Fly a total distance of 10,000 meters.',
    target: 10000,
    current: 0,
    completed: false,
    claimed: false,
    rewardCrystals: 40
  }
];

export const DAILY_REWARDS = [
  { day: 1, type: 'Coins', amount: 200, icon: '🪙' },
  { day: 2, type: 'Crystals', amount: 5, icon: '💎' },
  { day: 3, type: 'Wood Chest', amount: 1, icon: '📦' },
  { day: 4, type: 'Coins', amount: 500, icon: '🪙' },
  { day: 5, type: 'Silver Chest', amount: 1, icon: '📦' },
  { day: 6, type: 'Crystals', amount: 15, icon: '💎' },
  { day: 7, type: 'Golden Egg', amount: 1, icon: '🥚' }
];

export const SPIN_ITEMS = [
  { id: '1', name: '100 Coins', type: 'coins', amount: 100, color: 'bg-amber-100 text-amber-800' },
  { id: '2', name: '5 Crystals', type: 'crystals', amount: 5, color: 'bg-cyan-100 text-cyan-800' },
  { id: '3', name: '300 Coins', type: 'coins', amount: 300, color: 'bg-amber-200 text-amber-900' },
  { id: '4', name: 'Lucky Chest', type: 'chest', amount: 1, color: 'bg-emerald-100 text-emerald-800' },
  { id: '5', name: '10 Crystals', type: 'crystals', amount: 10, color: 'bg-cyan-200 text-cyan-900' },
  { id: '6', name: '500 Coins', type: 'coins', amount: 500, color: 'bg-yellow-200 text-yellow-900' },
  { id: '7', name: 'Legendary Egg', type: 'egg', amount: 1, color: 'bg-pink-100 text-pink-800' },
  { id: '8', name: 'XP Boost', type: 'xp_boost', amount: 1, color: 'bg-indigo-100 text-indigo-800' }
];

export const DEFAULT_ACHIEVEMENTS = INITIAL_ACHIEVEMENTS;

export const DEFAULT_FRIENDS: Friend[] = [
  { id: 'f1', name: 'VoltRider', level: 12, avatar: '🐉', online: true, giftSent: false },
  { id: 'f2', name: 'SkyGlider', level: 8, avatar: '❄️', online: true, giftSent: false },
  { id: 'f3', name: 'EmperorEmber', level: 25, avatar: '🔥', online: false, giftSent: true },
  { id: 'f4', name: 'AquaGamer', level: 15, avatar: '🌊', online: true, giftSent: false },
  { id: 'f5', name: 'GoldTamer', level: 19, avatar: '📦', online: false, giftSent: false }
];

export const DEFAULT_CHAT: ChatMessage[] = [
  { id: 'c1', sender: 'VoltRider', text: 'Hey guys! Just beat World 1 Boss! 🐉', time: '10:30 AM', avatar: '🐉' },
  { id: 'c2', sender: 'SkyGlider', text: 'Congrats! What score did you get?', time: '10:32 AM', avatar: '❄️' },
  { id: 'c3', sender: 'VoltRider', text: 'Got over 12,500 points! Epic combo streak!', time: '10:33 AM', avatar: '🐉' }
];

export const DEFAULT_CLAN: Clan = {
  name: 'Sky Tamer Elite',
  tag: 'STE',
  membersCount: 14,
  totalXp: 4500,
  level: 4,
  description: 'The premier league for dragon tamers and sky gliders.'
};

