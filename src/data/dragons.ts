/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dragon } from '../types';

export const INITIAL_DRAGONS: Dragon[] = [
  {
    id: 'sky-dragon',
    name: 'Baby Sky Dragon',
    type: 'Sky',
    description: 'A cute young dragon born in the high clouds. Naturally light and quick.',
    rarity: 'Common',
    level: 1,
    xp: 0,
    xpNeeded: 100,
    unlocked: true,
    priceCoins: 0,
    priceCrystals: 0,
    skills: [
      { name: 'Cloud Glide', description: 'Improves glide duration by 5%', level: 1, maxLevel: 5, multiplier: 1.05 },
      { name: 'Wind Dash', description: 'Gives a 2% speed boost during taps', level: 1, maxLevel: 5, multiplier: 1.02 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-sky-400 to-blue-500' },
      { name: 'Golden Glow', unlocked: false, price: 100, gradient: 'from-yellow-400 to-amber-500' },
      { name: 'Neon Bolt', unlocked: false, price: 200, gradient: 'from-purple-500 to-pink-500' }
    ]
  },
  {
    id: 'fire-dragon',
    name: 'Spitfire Hatchling',
    type: 'Fire',
    description: 'Enthusiastic and warm-hearted. Sneezes tiny blue magical embers.',
    rarity: 'Common',
    level: 1,
    xp: 0,
    xpNeeded: 120,
    unlocked: false,
    priceCoins: 500,
    priceCrystals: 10,
    skills: [
      { name: 'Fire Shield', description: 'Magnet range increased by 10%', level: 1, maxLevel: 5, multiplier: 1.10 },
      { name: 'Ember Jump', description: 'Reduces gravity effect by 3%', level: 1, maxLevel: 5, multiplier: 1.03 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-orange-500 to-red-600' },
      { name: 'Volcano Core', unlocked: false, price: 150, gradient: 'from-red-600 to-amber-900' }
    ]
  },
  {
    id: 'ice-dragon',
    name: 'Frostwing',
    type: 'Ice',
    description: 'Born on the highest snowy peak. Moves with freezing elegance.',
    rarity: 'Rare',
    level: 1,
    xp: 0,
    xpNeeded: 150,
    unlocked: false,
    priceCoins: 1200,
    priceCrystals: 25,
    skills: [
      { name: 'Snow Glide', description: 'Increases glide duration by 8%', level: 1, maxLevel: 5, multiplier: 1.08 },
      { name: 'Frozen Aura', description: 'Slow-motion powerups last 10% longer', level: 1, maxLevel: 5, multiplier: 1.10 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-cyan-300 to-teal-500' },
      { name: 'Glacial Prism', unlocked: false, price: 250, gradient: 'from-blue-200 to-indigo-600' }
    ]
  },
  {
    id: 'storm-dragon',
    name: 'Volt Sparrow',
    type: 'Storm',
    description: 'Charged with lightning power. Sparkles during flight.',
    rarity: 'Rare',
    level: 1,
    xp: 0,
    xpNeeded: 180,
    unlocked: false,
    priceCoins: 2000,
    priceCrystals: 40,
    skills: [
      { name: 'Static Pull', description: 'Magnet pull speed +15%', level: 1, maxLevel: 5, multiplier: 1.15 },
      { name: 'Thunder Dash', description: 'Speed boost powerups last 12% longer', level: 1, maxLevel: 5, multiplier: 1.12 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-purple-600 to-blue-700' },
      { name: 'Stellar Blitz', unlocked: false, price: 300, gradient: 'from-indigo-900 to-fuchsia-600' }
    ]
  },
  {
    id: 'forest-dragon',
    name: 'Leaf Whisperer',
    type: 'Forest',
    description: 'A gentle protector of the floating green woodlands.',
    rarity: 'Rare',
    level: 1,
    xp: 0,
    xpNeeded: 150,
    unlocked: false,
    priceCoins: 1500,
    priceCrystals: 30,
    skills: [
      { name: 'Spore Shield', description: 'Shield durability lasts 5s longer', level: 1, maxLevel: 5, multiplier: 1.05 },
      { name: 'Natural Recovery', description: 'Increases XP gained by 10%', level: 1, maxLevel: 5, multiplier: 1.10 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-emerald-400 to-green-700' },
      { name: 'Autumn Leaf', unlocked: false, price: 200, gradient: 'from-amber-500 to-orange-800' }
    ]
  },
  {
    id: 'ocean-dragon',
    name: 'Aqua Fin',
    type: 'Ocean',
    description: 'Graceful dragon who floats as if swimming through waves.',
    rarity: 'Rare',
    level: 1,
    xp: 0,
    xpNeeded: 160,
    unlocked: false,
    priceCoins: 1800,
    priceCrystals: 35,
    skills: [
      { name: 'Hydro Glide', description: 'Reduces descent speed by 6%', level: 1, maxLevel: 5, multiplier: 1.06 },
      { name: 'Water Crest', description: 'Crystals give 5% more coins', level: 1, maxLevel: 5, multiplier: 1.05 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-blue-400 to-teal-600' },
      { name: 'Abyssal Deep', unlocked: false, price: 220, gradient: 'from-slate-800 to-cyan-900' }
    ]
  },
  {
    id: 'crystal-dragon',
    name: 'Gem Spark',
    type: 'Crystal',
    description: 'Adorned with glittering shards that catch the light beautifully.',
    rarity: 'Epic',
    level: 1,
    xp: 0,
    xpNeeded: 250,
    unlocked: false,
    priceCoins: 3500,
    priceCrystals: 75,
    skills: [
      { name: 'Crystal Attraction', description: 'Attracts crystals from 25% further', level: 1, maxLevel: 5, multiplier: 1.25 },
      { name: 'Lucky Gem', description: '10% chance to double crystal rewards', level: 1, maxLevel: 5, multiplier: 1.10 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-pink-300 to-indigo-400' },
      { name: 'Amethyst Shard', unlocked: false, price: 400, gradient: 'from-purple-400 to-fuchsia-800' }
    ]
  },
  {
    id: 'shadow-dragon',
    name: 'Umbra Specter',
    type: 'Shadow',
    description: 'A mysterious dragon that glides through the night whispers.',
    rarity: 'Epic',
    level: 1,
    xp: 0,
    xpNeeded: 280,
    unlocked: false,
    priceCoins: 4500,
    priceCrystals: 90,
    skills: [
      { name: 'Void Glide', description: 'Reduces wing flap energy costs by 10%', level: 1, maxLevel: 5, multiplier: 1.10 },
      { name: 'Phantom Wings', description: 'Collision hitbox size reduced by 8%', level: 1, maxLevel: 5, multiplier: 1.08 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-slate-900 to-purple-950' },
      { name: 'Neon Shadow', unlocked: false, price: 500, gradient: 'from-violet-900 to-pink-600' }
    ]
  },
  {
    id: 'light-dragon',
    name: 'Sol Flare',
    type: 'Light',
    description: 'Radiates with sunbeam energy. Dispels all cloud darkness.',
    rarity: 'Epic',
    level: 1,
    xp: 0,
    xpNeeded: 300,
    unlocked: false,
    priceCoins: 5000,
    priceCrystals: 100,
    skills: [
      { name: 'Solar Boost', description: 'Speed boosts speed increased by 15%', level: 1, maxLevel: 5, multiplier: 1.15 },
      { name: 'Radiant Shield', description: 'Shield starts with a 15% shockwave', level: 1, maxLevel: 5, multiplier: 1.15 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-yellow-200 to-orange-400' },
      { name: 'Corona Flash', unlocked: false, price: 450, gradient: 'from-amber-300 to-rose-500' }
    ]
  },
  {
    id: 'rainbow-dragon',
    name: 'Iris Prism',
    type: 'Rainbow',
    description: 'Leaves a magnificent multicolor streak in the sky.',
    rarity: 'Legendary',
    level: 1,
    xp: 0,
    xpNeeded: 500,
    unlocked: false,
    priceCoins: 8000,
    priceCrystals: 150,
    skills: [
      { name: 'Prismatic Trail', description: 'Crystals collected give +1 score directly', level: 1, maxLevel: 5, multiplier: 1.20 },
      { name: 'Rainbow Rush', description: 'All powerups last 15% longer', level: 1, maxLevel: 5, multiplier: 1.15 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-pink-400 via-yellow-400 to-cyan-400' },
      { name: 'Aurora Borealis', unlocked: false, price: 600, gradient: 'from-teal-400 via-indigo-600 to-pink-500' }
    ]
  },
  {
    id: 'galaxy-dragon',
    name: 'Nebula Hatchling',
    type: 'Galaxy',
    description: 'Composed of stardust and orbital cosmic energy.',
    rarity: 'Legendary',
    level: 1,
    xp: 0,
    xpNeeded: 600,
    unlocked: false,
    priceCoins: 10000,
    priceCrystals: 200,
    skills: [
      { name: 'Gravity Warp', description: 'Reduces descent speed by 12%', level: 1, maxLevel: 5, multiplier: 1.12 },
      { name: 'Supernova Burst', description: 'Gives 50% larger Magnet pull field', level: 1, maxLevel: 5, multiplier: 1.50 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-purple-800 via-violet-900 to-fuchsia-700' },
      { name: 'Cosmic Event', unlocked: false, price: 800, gradient: 'from-cyan-900 via-purple-900 to-blue-500' }
    ]
  },
  {
    id: 'golden-dragon',
    name: 'Aureum King',
    type: 'Golden',
    description: 'Crafted from pure gold leaf. The absolute crown jewel of the clouds.',
    rarity: 'Mythic',
    level: 1,
    xp: 0,
    xpNeeded: 800,
    unlocked: false,
    priceCoins: 15000,
    priceCrystals: 350,
    skills: [
      { name: 'Midas Flap', description: 'Coins gained are boosted by 25%', level: 1, maxLevel: 5, multiplier: 1.25 },
      { name: 'Royal Grace', description: 'Shield triggers gold wave upon breaking', level: 1, maxLevel: 5, multiplier: 1.20 }
    ],
    activeSkin: 'Standard',
    skins: [
      { name: 'Standard', unlocked: true, price: 0, gradient: 'from-yellow-300 via-yellow-500 to-amber-600' },
      { name: 'Platinum Sovereign', unlocked: false, price: 1000, gradient: 'from-slate-200 via-zinc-400 to-slate-500' }
    ]
  }
];

// Helper to programmatically generate over 100 original dragons
const generateMoreDragons = (): Dragon[] => {
  const result: Dragon[] = [...INITIAL_DRAGONS];
  const prefixes = [
    'Inferno', 'Glacial', 'Nimbus', 'Storm', 'Shadow', 'Solar', 'Lunar', 'Cosmic', 'Verdant', 'Abyssal',
    'Amethyst', 'Obsidian', 'Volcanic', 'Celestial', 'Prismatic', 'Aero', 'Pyro', 'Cryo', 'Electro', 'Sylvan',
    'Hydro', 'Geotic', 'Chronos', 'Aureo', 'Zephyr', 'Nova', 'Void', 'Nebula', 'Eclipse', 'Sovereign'
  ];
  const types = ['Fire', 'Ice', 'Sky', 'Storm', 'Shadow', 'Light', 'Galaxy', 'Forest', 'Ocean', 'Crystal', 'Golden', 'Rainbow'];
  const suffixes = ['Drake', 'Wyrm', 'Stalker', 'Sovereign', 'Guardian', 'Titan', 'Seer', 'Breaker', 'Glow', 'Fury', 'Stardust', 'Specter', 'Warden', 'Weaver', 'Rider', 'Hatchling', 'Monarch', 'Ember', 'Blizzard', 'Crest'];
  const rarities: ('Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Celestial')[] = [
    'Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Celestial'
  ];

  const gradients: Record<string, string> = {
    'Fire': 'from-orange-500 to-red-600',
    'Ice': 'from-cyan-200 to-blue-500',
    'Sky': 'from-sky-400 to-indigo-400',
    'Storm': 'from-indigo-600 to-purple-800',
    'Shadow': 'from-slate-900 to-violet-950',
    'Light': 'from-amber-200 to-yellow-500',
    'Galaxy': 'from-purple-800 via-fuchsia-900 to-slate-950',
    'Forest': 'from-emerald-400 to-green-700',
    'Ocean': 'from-blue-400 to-teal-600',
    'Crystal': 'from-pink-300 to-indigo-400',
    'Golden': 'from-yellow-300 via-yellow-500 to-amber-600',
    'Rainbow': 'from-pink-400 via-yellow-400 to-cyan-400',
    'Celestial': 'from-violet-400 via-fuchsia-400 to-cyan-300'
  };

  let count = result.length;
  // Generate until we reach 105 dragons to ensure we are comfortably over 100!
  while (count < 105) {
    const pref = prefixes[count % prefixes.length];
    const suff = suffixes[(count + 3) % suffixes.length];
    const type = types[(count + 7) % types.length];
    const name = `${pref} ${suff}`;
    
    // Determine rarity based on index
    let rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Celestial' = 'Common';
    if (count % 15 === 0) rarity = 'Celestial';
    else if (count % 10 === 0) rarity = 'Mythic';
    else if (count % 6 === 0) rarity = 'Legendary';
    else if (count % 4 === 0) rarity = 'Epic';
    else if (count % 2 === 0) rarity = 'Rare';

    const priceCoins = rarity === 'Common' ? 400 + (count * 10) : rarity === 'Rare' ? 1200 + (count * 15) : rarity === 'Epic' ? 3000 + (count * 20) : rarity === 'Legendary' ? 6000 + (count * 30) : 10000;
    const priceCrystals = rarity === 'Common' ? 5 : rarity === 'Rare' ? 15 : rarity === 'Epic' ? 40 : rarity === 'Legendary' ? 100 : rarity === 'Mythic' ? 250 : 500;

    const grad = gradients[type] || 'from-sky-400 to-indigo-400';

    result.push({
      id: `generated-dragon-${count}`,
      name,
      type,
      description: `A powerful and unique ${rarity} dragon of the ${type} element. Unlocks legendary abilities.`,
      rarity,
      level: 1,
      xp: 0,
      xpNeeded: 100 + count * 5,
      unlocked: false,
      priceCoins,
      priceCrystals,
      skills: [
        { name: `${pref} Glide`, description: 'Increases active glide capability.', level: 1, maxLevel: 5, multiplier: 1.05 },
        { name: `${suff} Spark`, description: 'Increases coin/crystal drop multipliers.', level: 1, maxLevel: 5, multiplier: 1.05 }
      ],
      activeSkin: 'Standard',
      skins: [
        { name: 'Standard', unlocked: true, price: 0, gradient: grad },
        { name: 'Cosmic Shine', unlocked: false, price: 100 + count, gradient: 'from-purple-500 via-pink-500 to-indigo-500' }
      ]
    });

    count++;
  }

  return result;
};

export const DRAGONS_DATA = generateMoreDragons();
