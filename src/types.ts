/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Dragon {
  id: string;
  name: string;
  type: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Celestial';
  level: number;
  xp: number;
  xpNeeded: number;
  unlocked: boolean;
  priceCoins: number;
  priceCrystals: number;
  skills: {
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    multiplier: number;
  }[];
  activeSkin: string;
  skins: {
    name: string;
    unlocked: boolean;
    price: number;
    gradient: string;
  }[];
}

export interface GameWorld {
  id: string;
  name: string;
  description: string;
  stagesCount: number;
  currentStage: number;
  unlocked: boolean;
  bgGradient: string;
  weather: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'magic-fog' | 'northern-lights' | 'thunderstorm';
  bossName: string;
  themeColor: string;
}

export interface GameMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardCrystals: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'weekly' | 'monthly';
}

export interface GameAchievement {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  rewardCrystals: number;
}

export interface PlayerStats {
  playerName: string;
  level: number;
  xp: number;
  coins: number;
  crystals: number;
  highScore: number;
  bestDistance: number;
  crystalsCollectedTotal: number;
  highestCombo: number;
  activeDragonId: string;
  activeWorldId: string;
  activeStage: number;
  selectedSkin: string;
  selectedTitle: string;
  selectedBorder: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  dailyStreak: number;
  lastLoginDate: string;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  avatar: string;
  online: boolean;
  giftSent: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  avatar: string;
  badge?: string;
}

export interface Clan {
  name: string;
  tag: string;
  membersCount: number;
  totalXp: number;
  level: number;
  description: string;
}
