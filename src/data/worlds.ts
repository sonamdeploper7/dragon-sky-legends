/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameWorld } from '../types';

export const INITIAL_WORLDS: GameWorld[] = [
  {
    id: 'sky-kingdom',
    name: 'Sky Kingdom',
    description: 'The peaceful high sanctuary where all young dragons learn to glide.',
    stagesCount: 20,
    currentStage: 1,
    unlocked: true,
    bgGradient: 'from-sky-300 via-sky-400 to-indigo-300',
    weather: 'sunny',
    bossName: 'Ancient Stone Guardian',
    themeColor: '#38bdf8'
  },
  {
    id: 'cloud-city',
    name: 'Cloud City',
    description: 'A beautiful bustling city made entirely of fluffy, thick clouds.',
    stagesCount: 25,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-teal-100 via-sky-200 to-indigo-200',
    weather: 'cloudy',
    bossName: 'Nimbus Stratus',
    themeColor: '#2dd4bf'
  },
  {
    id: 'crystal-canyon',
    name: 'Crystal Canyon',
    description: 'Glittering rocky structures embedded with radiant crystal clusters.',
    stagesCount: 30,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-violet-300 via-indigo-400 to-slate-400',
    weather: 'magic-fog',
    bossName: 'Gargantuan Obsidian Golem',
    themeColor: '#8b5cf6'
  },
  {
    id: 'frozen-peak',
    name: 'Frozen Peak',
    description: 'An icy majestic wonderland with snow-laden paths and frost caverns.',
    stagesCount: 35,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-cyan-100 via-blue-200 to-slate-200',
    weather: 'snow',
    bossName: 'Frostbite Monarch',
    themeColor: '#06b6d4'
  },
  {
    id: 'volcano-island',
    name: 'Volcano Island',
    description: 'Daring pathways surrounding safe paths over warm golden magma streams.',
    stagesCount: 40,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-red-600 via-orange-500 to-slate-900',
    weather: 'sunny',
    bossName: 'Infernus the Wyrm',
    themeColor: '#ef4444'
  },
  {
    id: 'storm-valley',
    name: 'Storm Valley',
    description: 'Stormy clouds crackling with raw spark and energetic high friction.',
    stagesCount: 45,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-slate-800 via-indigo-950 to-purple-900',
    weather: 'thunderstorm',
    bossName: 'The Storm Sovereign',
    themeColor: '#6366f1'
  },
  {
    id: 'moon-realm',
    name: 'Moon Realm',
    description: 'A serene celestial realm under the gentle glow of the lunar phase.',
    stagesCount: 40,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    weather: 'northern-lights',
    bossName: 'Lunar Umbra Spirit',
    themeColor: '#a855f7'
  },
  {
    id: 'sun-temple',
    name: 'Sun Temple',
    description: 'A radiant golden sanctuary basking in infinite light.',
    stagesCount: 50,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-amber-500 via-orange-400 to-yellow-600',
    weather: 'sunny',
    bossName: 'Solar Helios Sentinel',
    themeColor: '#f59e0b'
  },
  {
    id: 'galaxy-sky',
    name: 'Galaxy Sky',
    description: 'The deep starry cosmos, flying past floating cosmic meteorites.',
    stagesCount: 50,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-purple-950 via-slate-950 to-indigo-950',
    weather: 'northern-lights',
    bossName: 'Alpha Cosmic Nebula Dragon',
    themeColor: '#ec4899'
  },
  {
    id: 'ancient-ruins',
    name: 'Ancient Ruins',
    description: 'A mysterious valley of crumbling pillars and forgotten magical runes.',
    stagesCount: 60,
    currentStage: 1,
    unlocked: false,
    bgGradient: 'from-emerald-950 via-teal-900 to-slate-950',
    weather: 'rain',
    bossName: 'Runic Relic Colossus',
    themeColor: '#10b981'
  }
];

export const WORLDS_DATA = INITIAL_WORLDS;
