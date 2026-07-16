/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../audio';
import { PlayerStats, Dragon } from '../types';
import {
  ArrowLeft,
  Home,
  Hammer,
  Sparkles,
  Camera,
  Heart,
  Droplet,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Gift,
  Sun,
  Moon,
  Info
} from 'lucide-react';

interface DragonVillageProps {
  stats: PlayerStats;
  dragons: Dragon[];
  onBack: () => void;
  onUpdateStats: (updatedStats: Partial<PlayerStats>) => void;
  onUpdateDragons: (updatedDragons: Dragon[]) => void;
}

// Food Types definition
interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  costCoins: number;
  costCrystals: number;
  xpValue: number;
  description: string;
}

const FOOD_ITEMS: FoodItem[] = [
  { id: 'magic-fruit', name: 'Magic Fruit', emoji: '🍓', costCoins: 40, costCrystals: 0, xpValue: 15, description: 'Sweet sky-grown berry. Highly nutritious.' },
  { id: 'golden-apple', name: 'Golden Apple', emoji: '🍎', costCoins: 120, costCrystals: 0, xpValue: 50, description: 'Infused with golden tree nectar. Large friendship boost.' },
  { id: 'cosmic-pearl', name: 'Cosmic Pearl', emoji: '🔮', costCoins: 0, costCrystals: 5, xpValue: 150, description: 'Contains stardust nebula energy.' },
  { id: 'star-dust', name: 'Star Dust', emoji: '✨', costCoins: 0, costCrystals: 12, xpValue: 400, description: 'Blessed celestial crystal grains.' }
];

// Decoration Types
interface VillageDecor {
  id: string;
  name: string;
  emoji: string;
  costCoins: number;
  costCrystals: number;
  description: string;
  effect: string;
}

const VILLAGE_DECORS: VillageDecor[] = [
  { id: 'flower-garden', name: 'Flower Garden', emoji: '🌸', costCoins: 300, costCrystals: 0, description: 'A patch of magical blooming tulips with butterflies.', effect: '+5% Friendship Gain' },
  { id: 'aether-fountain', name: 'Aether Fountain', emoji: '⛲', costCoins: 800, costCrystals: 0, description: 'A crystal fountain flowing with glowing blue mineral water.', effect: '+10% Wash Happiness' },
  { id: 'stone-path', name: 'Stone Pathways', emoji: '🛣️', costCoins: 200, costCrystals: 0, description: 'Gravel roads that make the meadow feel structured.', effect: 'Faster dragon walking speed' },
  { id: 'magic-lantern', name: 'Magic Lanterns', emoji: '🏮', costCoins: 450, costCrystals: 0, description: 'Warm-glowing paper lanterns that guide dragons at night.', effect: 'Beautiful evening glow' },
  { id: 'sky-portal', name: 'Sky Portal', emoji: '🌌', costCoins: 0, costCrystals: 20, description: 'A stellar portal directly connected to the cosmos.', effect: '+15% Friendship on all activities' }
];

// Houses Types
interface DragonHouse {
  id: string;
  name: string;
  emoji: string;
  costCoins: number;
  costCrystals: number;
  description: string;
  visualName: string;
}

const DRAGON_HOUSES: DragonHouse[] = [
  { id: 'wood-cabin', name: 'Stump Wood Cabin', emoji: '🏡', costCoins: 0, costCrystals: 0, description: 'A cozy hollowed-out tree trunk shelter.', visualName: 'Wood Cabin' },
  { id: 'stone-fortress', name: 'Stone Fortress', emoji: '🏰', costCoins: 1000, costCrystals: 0, description: 'A solid castle tower built with ancient magic runes.', visualName: 'Stone Fortress' },
  { id: 'magic-crystal', name: 'Magic Crystal Geode', emoji: '💎', costCoins: 2500, costCrystals: 0, description: 'A hollow violet crystal cave radiating warm glow.', visualName: 'Crystal Geode' },
  { id: 'sky-palace', name: 'Floating Sky Palace', emoji: '🏛️', costCoins: 0, costCrystals: 35, description: 'A gorgeous marble temple floating on a tiny cloud.', visualName: 'Sky Palace' }
];

// Persistent state for Dragon Village
interface VillageLocalState {
  houseId: string;
  unlockedHouses: string[];
  unlockedDecors: string[];
  foodInventory: { [key: string]: number };
  friendships: { [key: string]: { level: number; xp: number } };
  expansionLevel: number;
}

export default function DragonVillage({ stats, dragons, onBack, onUpdateStats, onUpdateDragons }: DragonVillageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Time cycle: morning / sunset / night
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'sunset' | 'night'>('morning');

  // Active Menu Tabs: 'meadow' | 'feed' | 'build' | 'postcard'
  const [activeTab, setActiveTab] = useState<'meadow' | 'feed' | 'build' | 'postcard'>('meadow');

  // Subtabs for Build: 'houses' | 'decors' | 'expansion'
  const [buildSubTab, setBuildSubTab] = useState<'houses' | 'decors' | 'expansion'>('houses');

  // Village State
  const [villageState, setVillageState] = useState<VillageLocalState>({
    houseId: 'wood-cabin',
    unlockedHouses: ['wood-cabin'],
    unlockedDecors: [],
    foodInventory: { 'magic-fruit': 3, 'golden-apple': 1 },
    friendships: {},
    expansionLevel: 1
  });

  // Selected dragon for interaction modal
  const [selectedDragonId, setSelectedDragonId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<'view' | 'pet' | 'wash'>('view');

  // Interactive Mini activity state
  const [petProgress, setPetProgress] = useState(0);
  const [dirtySpots, setDirtySpots] = useState<{ id: number; x: number; y: number; cleaned: boolean }[]>([]);
  const [bubbleParticles, setBubbleParticles] = useState<{ id: number; x: number; y: number; scale: number; life: number }[]>([]);

  // Postcard capture animation state
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [postcardImage, setPostcardImage] = useState<string | null>(null);

  // Message notifications
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load local state
  useEffect(() => {
    const saved = localStorage.getItem(`dragon_legends_village_${stats.playerName}`);
    if (saved) {
      try {
        setVillageState(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Setup initial friendships for unlocked dragons
      const initialFriendships: { [key: string]: { level: number; xp: number } } = {};
      dragons.forEach((d) => {
        if (d.unlocked) {
          initialFriendships[d.id] = { level: 1, xp: 0 };
        }
      });
      setVillageState((prev) => ({
        ...prev,
        friendships: initialFriendships
      }));
    }
  }, [dragons, stats.playerName]);

  // Save Local state helper
  const saveVillageState = (newState: VillageLocalState) => {
    setVillageState(newState);
    localStorage.setItem(`dragon_legends_village_${stats.playerName}`, JSON.stringify(newState));
  };

  // Trigger brief floating notifications
  const triggerAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 2500);
  };

  // Get active selected dragon details
  const currentSelectedDragon = dragons.find((d) => d.id === selectedDragonId);
  const dragonFriendship = selectedDragonId ? villageState.friendships[selectedDragonId] || { level: 1, xp: 0 } : { level: 1, xp: 0 };

  // Canvas-based real-time simulation logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Build lists of active dragons walking inside the meadow
    const unlockedDragons = dragons.filter((d) => d.unlocked);

    // Prepare positions and behaviors for active walking dragons
    const dragonPositions = unlockedDragons.map((d, index) => {
      return {
        id: d.id,
        name: d.name,
        rarity: d.rarity,
        x: 80 + index * 90,
        y: canvas.height - 110 - (index % 2) * 20,
        targetX: 80 + index * 90,
        behavior: 'walking' as 'walking' | 'sleeping' | 'eating' | 'flying' | 'playing',
        behaviorTimer: Math.random() * 3000 + 2000,
        bobAmt: Math.random() * 10,
        flapAngle: 0,
        facingLeft: Math.random() < 0.5,
        sleepingZzzTimer: 0,
        playSparkleTimer: 0,
        eatProgress: 0,
        speed: Math.random() * 0.4 + 0.3
      };
    });

    // Cloud positions
    const cloudList = Array.from({ length: 4 }).map((_, i) => ({
      x: Math.random() * 400,
      y: 40 + i * 35,
      scale: Math.random() * 0.8 + 0.5,
      speed: Math.random() * 0.15 + 0.05
    }));

    // Food particles thrown into the canvas
    const foodParticles: { x: number; y: number; emoji: string; targetX: number; targetY: number; reached: boolean }[] = [];

    // Particle sparkles inside canvas
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number; maxLife: number; life: number }[] = [];

    // Ambient floating fireflies at night
    const fireflies = Array.from({ length: 8 }).map(() => ({
      x: Math.random() * 400,
      y: Math.random() * 200 + 100,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.2 + 0.1
    }));

    // Dynamic clean loop
    const tick = () => {
      // 1. CLEAR CANVAS
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. DRAW SKY GRADIENT BASED ON TIME CYCLE
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (timeOfDay === 'morning') {
        skyGrad.addColorStop(0, '#7dd3fc'); // cyan-300
        skyGrad.addColorStop(0.6, '#cbd5e1'); // soft blue-gray
        skyGrad.addColorStop(1, '#a7f3d0'); // emerald-200 ground tint
      } else if (timeOfDay === 'sunset') {
        skyGrad.addColorStop(0, '#312e81'); // indigo-900
        skyGrad.addColorStop(0.4, '#f43f5e'); // rose-500
        skyGrad.addColorStop(0.8, '#fdba74'); // peach-300
        skyGrad.addColorStop(1, '#34d399'); // grass tint
      } else {
        skyGrad.addColorStop(0, '#020617'); // slate-950
        skyGrad.addColorStop(0.6, '#0f172a'); // slate-900
        skyGrad.addColorStop(1, '#064e3b'); // dark forest green
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw morning sun or night moon
      if (timeOfDay === 'morning') {
        ctx.fillStyle = '#fef08a'; // pale yellow
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.arc(320, 60, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (timeOfDay === 'sunset') {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#f43f5e';
        ctx.beginPath();
        ctx.arc(80, 100, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Starry night moon
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#94a3b8';
        ctx.beginPath();
        ctx.arc(310, 55, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Extra twinkle stars
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 15; i++) {
          const sx = (i * 27 + 34) % canvas.width;
          const sy = (i * 19 + 25) % 150;
          if (Math.sin(Date.now() * 0.003 + i) > 0.4) {
            ctx.fillRect(sx, sy, 2, 2);
          }
        }
      }

      // 3. DRAW CLOUDS
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      cloudList.forEach((c) => {
        c.x -= c.speed;
        if (c.x < -100) c.x = canvas.width + 50;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 14 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 12 * c.scale, c.y - 6 * c.scale, 18 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 24 * c.scale, c.y, 12 * c.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. DRAW DECORATIONS & HOUSES IN THE BACKGROUND MEADOW
      // Let's render the meadow hills
      ctx.fillStyle = timeOfDay === 'night' ? '#064e3b' : '#10b981';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 70);
      ctx.quadraticCurveTo(120, canvas.height - 110, 240, canvas.height - 75);
      ctx.quadraticCurveTo(320, canvas.height - 55, canvas.width, canvas.height - 80);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Lower closer hill layer
      ctx.fillStyle = timeOfDay === 'night' ? '#022c22' : '#059669';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 50);
      ctx.quadraticCurveTo(150, canvas.height - 40, 280, canvas.height - 65);
      ctx.quadraticCurveTo(340, canvas.height - 75, canvas.width, canvas.height - 55);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw the built Dragon House
      const activeHouse = DRAGON_HOUSES.find((h) => h.id === villageState.houseId) || DRAGON_HOUSES[0];
      const hx = canvas.width - 100;
      const hy = canvas.height - 115;

      ctx.save();
      if (activeHouse.id === 'wood-cabin') {
        // Stump Cabin
        ctx.fillStyle = '#78350f'; // Dark amber
        ctx.fillRect(hx, hy + 15, 60, 45);
        ctx.fillStyle = '#b45309'; // roof
        ctx.beginPath();
        ctx.moveTo(hx - 5, hy + 15);
        ctx.lineTo(hx + 30, hy - 5);
        ctx.lineTo(hx + 65, hy + 15);
        ctx.closePath();
        ctx.fill();
        // Door
        ctx.fillStyle = '#451a03';
        ctx.fillRect(hx + 20, hy + 35, 18, 25);
        // Window
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(hx + 12, hy + 25, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeHouse.id === 'stone-fortress') {
        // Stone Tower
        ctx.fillStyle = '#475569';
        ctx.fillRect(hx - 10, hy, 75, 60);
        // Battlements
        ctx.fillStyle = '#334155';
        ctx.fillRect(hx - 10, hy - 8, 15, 8);
        ctx.fillRect(hx + 12, hy - 8, 15, 8);
        ctx.fillRect(hx + 34, hy - 8, 15, 8);
        ctx.fillRect(hx + 55, hy - 8, 12, 8);
        // Door
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(hx + 27, hy + 40, 12, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(hx + 15, hy + 40, 24, 20);
      } else if (activeHouse.id === 'magic-crystal') {
        // Crystal cave geode
        ctx.fillStyle = '#2e1065';
        ctx.beginPath();
        ctx.arc(hx + 30, hy + 30, 32, 0, Math.PI * 2);
        ctx.fill();
        // Glow crystals inside
        ctx.fillStyle = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#d8b4fe';
        ctx.beginPath();
        ctx.moveTo(hx + 20, hy + 45);
        ctx.lineTo(hx + 30, hy + 15);
        ctx.lineTo(hx + 40, hy + 45);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Floating Sky Palace
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(hx - 15, hy - 5, 85, 55);
        // golden pillars
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(hx - 10, hy, 6, 50);
        ctx.fillRect(hx + 10, hy, 6, 50);
        ctx.fillRect(hx + 38, hy, 6, 50);
        ctx.fillRect(hx + 58, hy, 6, 50);
        // Palace triangular gold pediment roof
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(hx - 20, hy - 5);
        ctx.lineTo(hx + 27, hy - 25);
        ctx.lineTo(hx + 75, hy - 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // DRAW UNLOCKED DECORATIONS
      villageState.unlockedDecors.forEach((decorId) => {
        const d = VILLAGE_DECORS.find((item) => item.id === decorId);
        if (!d) return;

        // Position decors nicely based on their IDs
        let dx = 40;
        let dy = canvas.height - 65;
        if (d.id === 'flower-garden') {
          dx = 40;
          // Render group of flowers
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(dx, dy, 4, 0, Math.PI * 2);
          ctx.arc(dx + 12, dy - 4, 5, 0, Math.PI * 2);
          ctx.arc(dx + 20, dy + 2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#eab308'; // Center dot
          ctx.beginPath();
          ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
          ctx.arc(dx + 12, dy - 4, 1.5, 0, Math.PI * 2);
          ctx.arc(dx + 20, dy + 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (d.id === 'aether-fountain') {
          dx = 140;
          dy = canvas.height - 75;
          ctx.fillStyle = '#94a3b8'; // Stone gray
          ctx.fillRect(dx, dy + 15, 30, 15);
          ctx.beginPath();
          ctx.ellipse(dx + 15, dy + 15, 20, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          // Animated blue water drops
          ctx.fillStyle = '#38bdf8';
          const waterH = Math.sin(Date.now() * 0.01) * 12 + 15;
          ctx.fillRect(dx + 13, dy + 15 - waterH, 4, waterH);
        } else if (d.id === 'stone-path') {
          // Path drawn across meadow
          ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
          ctx.fillRect(0, canvas.height - 40, canvas.width, 10);
        } else if (d.id === 'magic-lantern') {
          dx = 240;
          dy = canvas.height - 110;
          ctx.fillStyle = '#78350f'; // Pole
          ctx.fillRect(dx, dy, 3, 50);
          ctx.fillStyle = '#f97316'; // lantern glow
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f97316';
          ctx.beginPath();
          ctx.arc(dx + 1, dy + 8, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (d.id === 'sky-portal') {
          dx = 25;
          dy = canvas.height - 130;
          // Glow swirling pastel portal
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;
          ctx.save();
          ctx.translate(dx + 15, dy + 15);
          ctx.rotate(Date.now() * 0.002);
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 25, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
          ctx.fill();
          ctx.restore();
        }
      });

      // 5. UPDATE AND DRAW PARTICLES
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(idx, 1);
        }
      });

      // Night Fireflies
      if (timeOfDay === 'night') {
        ctx.fillStyle = 'rgba(163, 230, 53, 0.8)'; // lime-400 glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#a3e635';
        fireflies.forEach((ff) => {
          ff.angle += Math.random() * 0.4 - 0.2;
          ff.x += Math.cos(ff.angle) * ff.speed;
          ff.y += Math.sin(ff.angle) * ff.speed;

          if (ff.x < 0) ff.x = canvas.width;
          if (ff.x > canvas.width) ff.x = 0;
          if (ff.y < 50) ff.y = canvas.height - 80;
          if (ff.y > canvas.height - 40) ff.y = 80;

          ctx.beginPath();
          ctx.arc(ff.x, ff.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }

      // 6. UPDATE AND DRAW FOOD ITEMS THROWN
      foodParticles.forEach((fp, idx) => {
        if (!fp.reached) {
          // falling
          fp.y += 2.5;
          if (fp.y >= fp.targetY) {
            fp.y = fp.targetY;
            fp.reached = true;
          }
        }
        // Draw emoji text
        ctx.font = '16px sans-serif';
        ctx.fillText(fp.emoji, fp.x, fp.y);

        // Check if nearest eating dragon reached it
        dragonPositions.forEach((drag) => {
          if (drag.behavior === 'eating') {
            const dist = Math.abs(drag.x - fp.x);
            if (dist < 18 && fp.reached) {
              // eaten!
              audio.playPowerup();
              foodParticles.splice(idx, 1);
              drag.behavior = 'playing';
              drag.behaviorTimer = 2000;
              // sparkle hearts
              for (let k = 0; k < 6; k++) {
                particles.push({
                  x: drag.x,
                  y: drag.y - 10,
                  vx: Math.random() * 2 - 1,
                  vy: -1.5 - Math.random() * 2,
                  color: '#ec4899', // pink heart spark
                  size: Math.random() * 3 + 2,
                  alpha: 1,
                  maxLife: 20,
                  life: 0
                });
              }
            }
          }
        });
      });

      // 7. DRAW DRAGONS
      dragonPositions.forEach((drag) => {
        // A. BEHAVIOR CHANGER TACTIC
        drag.behaviorTimer -= 16.67;
        if (drag.behaviorTimer <= 0) {
          drag.behaviorTimer = Math.random() * 4000 + 3000;
          const rolls = ['walking', 'sleeping', 'flying', 'playing'];
          const nextB = rolls[Math.floor(Math.random() * rolls.length)] as any;
          drag.behavior = nextB;

          if (nextB === 'flying') {
            drag.targetX = Math.random() * (canvas.width - 100) + 50;
          }
        }

        // B. BEHAVIOR PHYSICS ACTIONS
        if (drag.behavior === 'walking') {
          const pathMult = villageState.unlockedDecors.includes('stone-path') ? 1.4 : 1.0;
          if (drag.facingLeft) {
            drag.x -= drag.speed * pathMult;
            if (drag.x < 30) {
              drag.facingLeft = false;
              drag.x = 30;
            }
          } else {
            drag.x += drag.speed * pathMult;
            if (drag.x > canvas.width - 50) {
              drag.facingLeft = true;
              drag.x = canvas.width - 50;
            }
          }
          // walking bobbing
          drag.bobAmt = Math.sin(Date.now() * 0.01) * 3;
          drag.y = canvas.height - 85;
        } else if (drag.behavior === 'sleeping') {
          drag.bobAmt = 0;
          drag.y = canvas.height - 75; // Lies flat
          // Emit Zzz text floating
          drag.sleepingZzzTimer += 16.67;
          if (drag.sleepingZzzTimer >= 1500) {
            drag.sleepingZzzTimer = 0;
            particles.push({
              x: drag.facingLeft ? drag.x - 5 : drag.x + 5,
              y: drag.y - 12,
              vx: Math.random() * 0.4 - 0.2,
              vy: -0.6,
              color: '#93c5fd', // baby blue
              size: 2, // will render as small letter text
              alpha: 1,
              maxLife: 45,
              life: 0
            });
          }
        } else if (drag.behavior === 'flying') {
          // Floating high altitude sine waves
          drag.y = 80 + Math.sin(Date.now() * 0.003) * 20;
          if (Math.abs(drag.x - drag.targetX) > 10) {
            drag.x += (drag.targetX - drag.x) * 0.01;
            drag.facingLeft = drag.targetX < drag.x;
          } else {
            drag.targetX = Math.random() * (canvas.width - 80) + 40;
          }
          drag.bobAmt = 0;
        } else if (drag.behavior === 'playing') {
          // happy bouncy jump logic
          drag.bobAmt = -Math.abs(Math.sin(Date.now() * 0.015) * 16);
          drag.y = canvas.height - 85;

          // Tiny sparkles around playing dragon
          drag.playSparkleTimer += 16.67;
          if (drag.playSparkleTimer >= 600) {
            drag.playSparkleTimer = 0;
            particles.push({
              x: drag.x + Math.random() * 30 - 15,
              y: drag.y - 10 + drag.bobAmt,
              vx: Math.random() * 1 - 0.5,
              vy: -0.5,
              color: '#fef08a', // star sparks
              size: Math.random() * 2 + 1,
              alpha: 0.8,
              maxLife: 15,
              life: 0
            });
          }
        } else if (drag.behavior === 'eating') {
          // walks toward nearest food particle
          const foods = foodParticles.filter((f) => !f.reached || f.reached);
          if (foods.length > 0) {
            const targetFood = foods[0];
            drag.facingLeft = targetFood.x < drag.x;
            drag.x += (targetFood.x - drag.x) * 0.03;
            drag.y = canvas.height - 85;
            drag.bobAmt = Math.sin(Date.now() * 0.01) * 2;
          } else {
            // fallback if food disappears
            drag.behavior = 'walking';
          }
        }

        // C. DRAW THE CUTE RETRO 2D DRAGON ON MEADOW
        ctx.save();
        ctx.translate(drag.x, drag.y + drag.bobAmt);

        // Dragon flip rendering based on direction facing
        if (!drag.facingLeft) {
          ctx.scale(-1, 1);
        }

        const isSleeping = drag.behavior === 'sleeping';

        // Custom dragon skins and elements
        const currentDragConfig = dragons.find((d) => d.id === drag.id) || dragons[0];
        const primaryCol = currentDragConfig.id === 'sky-dragon' ? '#60a5fa' :
                           currentDragConfig.id === 'fire-dragon' ? '#f97316' :
                           currentDragConfig.id === 'ice-dragon' ? '#93c5fd' :
                           currentDragConfig.id === 'forest-dragon' ? '#34d399' :
                           currentDragConfig.id === 'storm-dragon' ? '#a855f7' : '#ec4899';

        // Dragon Body
        ctx.fillStyle = primaryCol;
        ctx.beginPath();
        if (isSleeping) {
          ctx.ellipse(0, 8, 16, 8, 0, 0, Math.PI * 2);
        } else {
          ctx.ellipse(0, 4, 14, 10, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Belly
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        if (isSleeping) {
          ctx.ellipse(4, 9, 8, 5, 0, 0, Math.PI * 2);
        } else {
          ctx.ellipse(4, 6, 7, 7, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Dragon head
        ctx.fillStyle = primaryCol;
        ctx.beginPath();
        if (isSleeping) {
          ctx.arc(-10, 3, 7, 0, Math.PI * 2);
        } else {
          ctx.arc(-8, -6, 9, 0, Math.PI * 2);
        }
        ctx.fill();

        // Horns
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        if (!isSleeping) {
          ctx.moveTo(-10, -14);
          ctx.lineTo(-13, -20);
          ctx.lineTo(-7, -15);
          ctx.closePath();
          ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#1e293b';
        if (isSleeping) {
          // Closed sleeping eye line
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-13, 3);
          ctx.quadraticCurveTo(-11, 5, -9, 3);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(-10, -7, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Little cute tail
        ctx.fillStyle = primaryCol;
        ctx.beginPath();
        ctx.moveTo(11, 4);
        ctx.quadraticCurveTo(18, 0, 20, -5);
        ctx.quadraticCurveTo(14, 8, 8, 8);
        ctx.closePath();
        ctx.fill();

        // Happy wing
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        const flapFactor = drag.behavior === 'flying' ? Math.sin(Date.now() * 0.02) * 8 : Math.sin(Date.now() * 0.005) * 4;
        ctx.moveTo(-1, 0);
        ctx.lineTo(8, -12 - flapFactor);
        ctx.lineTo(6, 4);
        ctx.closePath();
        ctx.fill();

        // Draw sleeping 'Zzz' text on canvas particles
        ctx.restore();
      });

      // Render custom Zzz or letters for sleep particles
      particles.forEach((p) => {
        if (p.color === '#93c5fd') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.font = '9px font-mono';
          ctx.fillText('Zzz', p.x, p.y);
        }
      });

      if (activeTab === 'meadow') {
        animId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => cancelAnimationFrame(animId);
  }, [dragons, timeOfDay, activeTab, villageState]);

  // Click on canvas meadow selector helper
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Detect if click landed near any of the walking dragons
    const unlockedDragons = dragons.filter((d) => d.unlocked);
    const stepSize = 90;

    let clickedIdx = -1;
    unlockedDragons.forEach((d, index) => {
      const approxX = 80 + index * stepSize;
      const approxY = canvas.height - 90;
      const dx = clickX - approxX;
      const dy = clickY - approxY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50) {
        clickedIdx = index;
      }
    });

    if (clickedIdx !== -1) {
      const targetDrag = unlockedDragons[clickedIdx];
      audio.playRoar();
      setSelectedDragonId(targetDrag.id);
      setInteractionMode('view');
      setPetProgress(0);
    }
  };

  // 1. PET SYSTEM LOGIC
  const handlePetAction = () => {
    audio.playFlap();
    const newProgress = Math.min(100, petProgress + 12);
    setPetProgress(newProgress);

    // add local sparkles and hearts
    const list = Array.from({ length: 4 }).map(() => ({
      id: Math.random(),
      x: Math.random() * 120 + 80,
      y: Math.random() * 80 + 100,
      scale: Math.random() * 1.5 + 0.5,
      life: 0
    }));

    if (newProgress >= 100) {
      audio.playMagicExplosion();
      // Level Up Friendship Check
      handleFriendshipBoost(35); // gives +35 XP
      setInteractionMode('view');
      triggerAlert(`Finished petting ${currentSelectedDragon?.name}! ❤️`, 'success');
    }
  };

  // 2. WASH SYSTEM LOGIC
  const startWashActivity = () => {
    setInteractionMode('wash');
    // generate dirty gray cloud spots on the dragon
    const spots = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: 60 + Math.random() * 140,
      y: 90 + Math.random() * 80,
      cleaned: false
    }));
    setDirtySpots(spots);
  };

  const handleWashScrub = (spotId: number) => {
    audio.playCrystal(3);
    const updated = dirtySpots.map((s) => {
      if (s.id === spotId) {
        return { ...s, cleaned: true };
      }
      return s;
    });
    setDirtySpots(updated);

    // spawn foam bubble particles
    const list = Array.from({ length: 5 }).map(() => ({
      id: Math.random(),
      x: 100 + Math.random() * 60,
      y: 110 + Math.random() * 50,
      scale: Math.random() * 1.2 + 0.4,
      life: 30
    }));
    setBubbleParticles((prev) => [...prev, ...list]);

    // Check if fully washed
    const allCleaned = updated.every((s) => s.cleaned);
    if (allCleaned) {
      audio.playMagicExplosion();
      handleFriendshipBoost(50); // gives +50 XP
      setInteractionMode('view');
      triggerAlert(`${currentSelectedDragon?.name} is shining clean! 🧼✨`, 'success');
    }
  };

  // 3. FEED SYSTEM LOGIC
  const handleFeedDragon = (foodId: string) => {
    if (!selectedDragonId) return;
    const currentInventory = villageState.foodInventory[foodId] || 0;
    if (currentInventory <= 0) {
      triggerAlert('No treats left! Buy more in the Treats menu.', 'error');
      return;
    }

    const foodItem = FOOD_ITEMS.find((f) => f.id === foodId);
    if (!foodItem) return;

    // Deduct food item
    const updatedInventory = { ...villageState.foodInventory };
    updatedInventory[foodId] = currentInventory - 1;

    saveVillageState({
      ...villageState,
      foodInventory: updatedInventory
    });

    // Play bubble feed sound
    audio.playPowerup();

    // Boost friendship
    const xpBoost = foodItem.xpValue;
    handleFriendshipBoost(xpBoost);
    triggerAlert(`Fed ${currentSelectedDragon?.name} with ${foodItem.name}! 🍓`, 'success');
  };

  // Purchase food treats helper
  const handleBuyFood = (food: FoodItem) => {
    if (food.costCoins > 0 && stats.coins < food.costCoins) {
      triggerAlert('Insufficient Gold coins!', 'error');
      return;
    }
    if (food.costCrystals > 0 && stats.crystals < food.costCrystals) {
      triggerAlert('Insufficient Cosmic Crystals!', 'error');
      return;
    }

    // Deduct player funds
    const coinsDeduct = food.costCoins;
    const crystalsDeduct = food.costCrystals;

    onUpdateStats({
      coins: stats.coins - coinsDeduct,
      crystals: stats.crystals - crystalsDeduct
    });

    // Add to inventory
    const updatedInventory = { ...villageState.foodInventory };
    updatedInventory[food.id] = (updatedInventory[food.id] || 0) + 1;

    saveVillageState({
      ...villageState,
      foodInventory: updatedInventory
    });

    audio.playPowerup();
    triggerAlert(`Bought 1x ${food.name}!`, 'success');
  };

  // Friendship levels management (1 to 20 limit)
  const handleFriendshipBoost = (xpAmount: number) => {
    if (!selectedDragonId) return;

    const currentF = villageState.friendships[selectedDragonId] || { level: 1, xp: 0 };
    let lvl = currentF.level;
    let xp = currentF.xp + xpAmount;
    const xpNeededForNextLvl = lvl * 60 + 40; // scales up

    if (xp >= xpNeededForNextLvl && lvl < 20) {
      xp -= xpNeededForNextLvl;
      lvl = Math.min(20, lvl + 1);
      audio.playMagicExplosion();
      triggerAlert(`🎉 FRIENDSHIP LEVELED UP to Lv.${lvl}!`, 'success');

      // Achievement progress tracking
      if (lvl >= 10) {
        triggerAlert('Achievement milestone progressed! Check quests.', 'success');
      }
    }

    const updatedFriendships = { ...villageState.friendships };
    updatedFriendships[selectedDragonId] = { level: lvl, xp };

    saveVillageState({
      ...villageState,
      friendships: updatedFriendships
    });
  };

  // 4. BUY HOUSES
  const handleBuyHouse = (house: DragonHouse) => {
    if (villageState.unlockedHouses.includes(house.id)) {
      // Set active
      saveVillageState({
        ...villageState,
        houseId: house.id
      });
      audio.playTap();
      triggerAlert(`Activated ${house.visualName}!`, 'success');
      return;
    }

    // Purchase
    if (house.costCoins > 0 && stats.coins < house.costCoins) {
      triggerAlert('Insufficient Gold coins!', 'error');
      return;
    }
    if (house.costCrystals > 0 && stats.crystals < house.costCrystals) {
      triggerAlert('Insufficient Cosmic Crystals!', 'error');
      return;
    }

    onUpdateStats({
      coins: stats.coins - house.costCoins,
      crystals: stats.crystals - house.costCrystals
    });

    saveVillageState({
      ...villageState,
      houseId: house.id,
      unlockedHouses: [...villageState.unlockedHouses, house.id]
    });

    audio.playMagicExplosion();
    triggerAlert(`Unlocked and Built ${house.name}! 🏰`, 'success');
  };

  // 5. BUY DECORS
  const handleBuyDecor = (decor: VillageDecor) => {
    if (villageState.unlockedDecors.includes(decor.id)) {
      triggerAlert('Decoration is already active in your meadow!', 'error');
      return;
    }

    // Purchase
    if (decor.costCoins > 0 && stats.coins < decor.costCoins) {
      triggerAlert('Insufficient Gold coins!', 'error');
      return;
    }
    if (decor.costCrystals > 0 && stats.crystals < decor.costCrystals) {
      triggerAlert('Insufficient Cosmic Crystals!', 'error');
      return;
    }

    onUpdateStats({
      coins: stats.coins - decor.costCoins,
      crystals: stats.crystals - decor.costCrystals
    });

    saveVillageState({
      ...villageState,
      unlockedDecors: [...villageState.unlockedDecors, decor.id]
    });

    audio.playMagicExplosion();
    triggerAlert(`Built ${decor.name}! 🌸`, 'success');
  };

  // 6. EXPAND VILLAGE
  const handleExpandVillage = () => {
    const cost = villageState.expansionLevel * 1500;
    if (stats.coins < cost) {
      triggerAlert('Insufficient gold to expand village!', 'error');
      return;
    }

    onUpdateStats({
      coins: stats.coins - cost
    });

    saveVillageState({
      ...villageState,
      expansionLevel: villageState.expansionLevel + 1
    });

    audio.playMagicExplosion();
    triggerAlert(`Village expanded to Level ${villageState.expansionLevel + 1}! Max dragon capacity increased! 🌳`, 'success');
  };

  // 7. SNAP PHOTO POSTCARD GALLERY
  const triggerCapturePostcard = () => {
    setIsCapturing(true);
    setShowFlash(true);
    audio.playTap();

    setTimeout(() => {
      setShowFlash(false);
    }, 200);

    setTimeout(() => {
      setIsCapturing(false);
      // We render a beautiful styled polaroid representing their active village snap
      setActiveTab('postcard');
      // Create a nice placeholder card layout using metadata parameters
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setPostcardImage(`Dragon Sky Village Postcard • ${dateStr}`);
    }, 1200);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-screen bg-transparent flex flex-col justify-between overflow-hidden p-4 select-none"
    >
      {/* 1. TOP TITLE / DAY-NIGHT SWITCH BAR */}
      <div className="relative z-10 flex justify-between items-center bg-black/45 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 tracking-wider uppercase font-display leading-none">
            DRAGON VILLAGE
          </h2>
          <p className="text-[9px] font-mono text-cyan-200 uppercase mt-0.5">Exp Level {villageState.expansionLevel}</p>
        </div>

        {/* Day / Night Shift buttons */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/10 space-x-1">
          <button
            onClick={() => { setTimeOfDay('morning'); audio.playTap(); }}
            className={`p-1.5 rounded-lg transition-all ${timeOfDay === 'morning' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Sunny Morning"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setTimeOfDay('sunset'); audio.playTap(); }}
            className={`p-1.5 rounded-lg transition-all ${timeOfDay === 'sunset' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Golden Sunset"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setTimeOfDay('night'); audio.playTap(); }}
            className={`p-1.5 rounded-lg transition-all ${timeOfDay === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Cosmic Night"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FLASH SCREEN EFFECT FOR CAMERA */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* 2. REAL-TIME CANVAS MEADOW SCREEN */}
      <div className="relative w-full h-[220px] rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden mt-3 bg-slate-800">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer"
          width="360"
          height="220"
        />

        {/* Overlay instructions */}
        <div className="absolute bottom-2 left-2 pointer-events-none bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10 text-[8px] font-mono text-slate-300 uppercase">
          Tap roaming dragon to play activities!
        </div>

        {/* Snap picture camera button floating */}
        <button
          onClick={triggerCapturePostcard}
          className="absolute top-2 right-2 p-2 rounded-full bg-cyan-500/85 hover:bg-cyan-500 border border-white/20 text-white shadow-lg active:scale-95 transition-all cursor-pointer z-10"
          title="Take Postcard Photo"
        >
          <Camera className="w-4 h-4 animate-pulse" />
        </button>
      </div>

      {/* ALERT MESSAGE POPUP */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            className="absolute left-1/2 top-48 -translate-x-1/2 z-40"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className={`px-4 py-2 rounded-2xl border text-center text-xs font-black uppercase shadow-xl ${alertMsg.type === 'success' ? 'bg-emerald-500/90 border-emerald-300 text-white shadow-emerald-500/20' : 'bg-rose-500/90 border-rose-300 text-white shadow-rose-500/20'}`}>
              {alertMsg.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CENTRAL ACTIVE MODULE INTERACTION (Petting / Washing / Postcard views) */}
      <div className="flex-1 my-3 relative flex flex-col justify-between overflow-hidden min-h-[200px]">
        
        {/* TAB BUTTONS BAR */}
        <div className="grid grid-cols-4 gap-2 bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner z-10">
          <button
            onClick={() => { setActiveTab('meadow'); audio.playTap(); }}
            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${activeTab === 'meadow' ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Meadow
          </button>
          <button
            onClick={() => { setActiveTab('feed'); audio.playTap(); }}
            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${activeTab === 'feed' ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Treats
          </button>
          <button
            onClick={() => { setActiveTab('build'); audio.playTap(); }}
            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${activeTab === 'build' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Build
          </button>
          <button
            onClick={() => { setActiveTab('postcard'); audio.playTap(); }}
            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${activeTab === 'postcard' ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Gallery
          </button>
        </div>

        {/* CONTAINER CONTENT */}
        <div className="flex-1 mt-3 bg-black/35 backdrop-blur-md rounded-3xl border border-white/25 shadow-2xl p-4 overflow-y-auto max-h-[230px]">
          
          {/* A. MEADOW TAB: Selected dragon interaction and activity launch */}
          {activeTab === 'meadow' && (
            <div className="h-full flex flex-col justify-between">
              {!selectedDragonId ? (
                <div className="flex flex-col items-center justify-center text-center h-full text-slate-300 space-y-2 py-4">
                  <span className="text-4xl animate-bounce">🏕️</span>
                  <p className="text-xs font-mono uppercase font-bold text-yellow-300">Quiet Meadow Breeze</p>
                  <p className="text-[10px] font-mono leading-relaxed max-w-[220px]">Click any walking dragon on the grass to play with them, feed them, or scrub them clean!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Selected Dragon Header */}
                  <div className="flex justify-between items-center bg-white/10 p-2.5 rounded-2xl border border-white/10">
                    <div className="text-left">
                      <p className="text-xs font-black text-white uppercase">{currentSelectedDragon?.name}</p>
                      <p className="text-[9px] font-mono text-cyan-300 uppercase font-extrabold">Friendship Lv.{dragonFriendship.level}</p>
                    </div>
                    {/* XP bar */}
                    <div className="w-24 text-right">
                      <p className="text-[8px] font-mono text-slate-300">XP: {dragonFriendship.xp}/{dragonFriendship.level * 60 + 40}</p>
                      <div className="w-full h-2 bg-black/40 rounded-full mt-0.5 overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 to-rose-600 rounded-full"
                          style={{ width: `${(dragonFriendship.xp / (dragonFriendship.level * 60 + 40)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interaction state switcher */}
                  {interactionMode === 'view' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Pet button */}
                      <button
                        onClick={() => { setInteractionMode('pet'); setPetProgress(0); audio.playTap(); }}
                        className="p-3 rounded-2xl bg-gradient-to-b from-pink-400 to-pink-600 border-b-4 border-pink-800 text-white text-xs font-black uppercase tracking-wide shadow-md hover:brightness-110 cursor-pointer flex flex-col items-center space-y-1"
                      >
                        <Heart className="w-5 h-5 fill-white text-pink-200" />
                        <span>Pet Dragon</span>
                      </button>

                      {/* Wash button */}
                      <button
                        onClick={() => { startWashActivity(); audio.playTap(); }}
                        className="p-3 rounded-2xl bg-gradient-to-b from-cyan-400 to-cyan-600 border-b-4 border-cyan-800 text-white text-xs font-black uppercase tracking-wide shadow-md hover:brightness-110 cursor-pointer flex flex-col items-center space-y-1"
                      >
                        <Droplet className="w-5 h-5 text-cyan-100" />
                        <span>Wash Bubble</span>
                      </button>

                      {/* Close selection button */}
                      <button
                        onClick={() => setSelectedDragonId(null)}
                        className="col-span-2 py-2 rounded-xl bg-slate-800 border border-white/5 text-[10px] font-black text-slate-300 uppercase tracking-wide active:scale-95 transition-all cursor-pointer"
                      >
                        Deselect Dragon
                      </button>
                    </div>
                  )}

                  {/* Pet Mini Game view */}
                  {interactionMode === 'pet' && (
                    <div className="space-y-3 text-center">
                      <p className="text-[10px] font-mono text-pink-300 uppercase tracking-wider font-bold">Tap heart pad repeatedly to fill petting mood!</p>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={handlePetAction}
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-rose-600 border-2 border-white/30 flex items-center justify-center text-3xl shadow-xl shadow-pink-500/25 cursor-pointer active:scale-90"
                        >
                          💖
                        </motion.button>

                        <div className="flex-1 text-left">
                          <p className="text-[10px] font-mono text-slate-300">AFFECTION RATE: {petProgress}%</p>
                          <div className="w-full h-3 bg-black/40 border border-white/10 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-red-500"
                              style={{ width: `${petProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setInteractionMode('view')}
                        className="w-full py-1.5 rounded-xl bg-slate-800 text-[9px] font-black uppercase text-slate-300 cursor-pointer"
                      >
                        Cancel petting
                      </button>
                    </div>
                  )}

                  {/* Wash Mini Game view */}
                  {interactionMode === 'wash' && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono text-cyan-300 text-center uppercase tracking-wider font-bold">Clean up all dirty cloud spots below!</p>
                      
                      <div className="grid grid-cols-5 gap-1.5 py-1 bg-black/45 rounded-2xl border border-white/5 p-2">
                        {dirtySpots.map((spot) => (
                          <button
                            key={spot.id}
                            disabled={spot.cleaned}
                            onClick={() => handleWashScrub(spot.id)}
                            className={`p-3 rounded-xl border text-base flex items-center justify-center transition-all ${spot.cleaned ? 'bg-cyan-500/20 border-cyan-500/40 opacity-40' : 'bg-slate-700 hover:bg-slate-600 border-white/10 active:scale-90 cursor-pointer animate-pulse'}`}
                          >
                            {spot.cleaned ? '🧼' : '💨'}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setInteractionMode('view')}
                        className="w-full py-1.5 rounded-xl bg-slate-800 text-[9px] font-black uppercase text-slate-300 text-center cursor-pointer"
                      >
                        Cancel wash
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* B. TREATS TAB: Buy and feed treats */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-[10px] font-mono text-yellow-300 uppercase font-bold">Magic Treats Pantry</p>
                {selectedDragonId && (
                  <p className="text-[9px] font-mono text-slate-300 uppercase">Selected: {currentSelectedDragon?.name}</p>
                )}
              </div>

              <div className="space-y-2.5">
                {FOOD_ITEMS.map((food) => {
                  const qty = villageState.foodInventory[food.id] || 0;
                  return (
                    <div key={food.id} className="flex items-center justify-between bg-white/5 p-2.5 rounded-2xl border border-white/10">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-2xl">{food.emoji}</span>
                        <div className="text-left">
                          <p className="text-xs font-black text-white">{food.name} <span className="text-cyan-300 font-mono text-[10px] ml-1">x{qty}</span></p>
                          <p className="text-[8px] text-slate-400 max-w-[150px] truncate">{food.description}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {/* Feed button if a dragon is selected */}
                        {selectedDragonId && (
                          <button
                            onClick={() => handleFeedDragon(food.id)}
                            disabled={qty <= 0}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${qty > 0 ? 'bg-gradient-to-b from-pink-400 to-pink-600 border-b-2 border-pink-800 text-white active:scale-95 cursor-pointer' : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-40'}`}
                          >
                            Feed
                          </button>
                        )}

                        {/* Buy treat button */}
                        <button
                          onClick={() => handleBuyFood(food)}
                          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 border-b-2 border-amber-800 text-white text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center space-x-0.5"
                        >
                          <span>Buy</span>
                          <span className="text-[8px] font-mono font-bold">
                            ({food.costCoins > 0 ? `🪙${food.costCoins}` : `💎${food.costCrystals}`})
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. BUILD TAB: Upgrading houses and decor items */}
          {activeTab === 'build' && (
            <div className="space-y-4">
              {/* Build sub-navigation */}
              <div className="flex space-x-2 bg-slate-900/40 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => { setBuildSubTab('houses'); audio.playTap(); }}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer ${buildSubTab === 'houses' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Houses
                </button>
                <button
                  onClick={() => { setBuildSubTab('decors'); audio.playTap(); }}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer ${buildSubTab === 'decors' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Decors
                </button>
                <button
                  onClick={() => { setBuildSubTab('expansion'); audio.playTap(); }}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer ${buildSubTab === 'expansion' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Expansion
                </button>
              </div>

              {/* Build Subcontent */}
              {buildSubTab === 'houses' && (
                <div className="space-y-2">
                  {DRAGON_HOUSES.map((house) => {
                    const isUnlocked = villageState.unlockedHouses.includes(house.id);
                    const isActive = villageState.houseId === house.id;
                    return (
                      <div key={house.id} className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/10">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-2xl">{house.emoji}</span>
                          <div className="text-left">
                            <p className="text-xs font-black text-white">{house.name}</p>
                            <p className="text-[8px] text-slate-400 max-w-[150px] truncate">{house.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyHouse(house)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${isActive ? 'bg-emerald-600 text-white cursor-default' : isUnlocked ? 'bg-slate-700 text-slate-300' : 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-2 border-amber-800 text-white'}`}
                        >
                          {isActive ? 'Active' : isUnlocked ? 'Equip' : house.costCoins > 0 ? `🪙 ${house.costCoins}` : `💎 ${house.costCrystals}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {buildSubTab === 'decors' && (
                <div className="space-y-2">
                  {VILLAGE_DECORS.map((decor) => {
                    const isUnlocked = villageState.unlockedDecors.includes(decor.id);
                    return (
                      <div key={decor.id} className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/10">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-2xl">{decor.emoji}</span>
                          <div className="text-left">
                            <p className="text-xs font-black text-white">{decor.name}</p>
                            <p className="text-[8px] text-slate-400 max-w-[150px] truncate">{decor.description}</p>
                            <p className="text-[8px] text-yellow-300 font-mono font-bold uppercase mt-0.5">{decor.effect}</p>
                          </div>
                        </div>

                        <button
                          disabled={isUnlocked}
                          onClick={() => handleBuyDecor(decor)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${isUnlocked ? 'bg-emerald-600 text-emerald-100 cursor-default opacity-60' : 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-2 border-amber-800 text-white cursor-pointer'}`}
                        >
                          {isUnlocked ? 'Active' : decor.costCoins > 0 ? `🪙 ${decor.costCoins}` : `💎 ${decor.costCrystals}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {buildSubTab === 'expansion' && (
                <div className="bg-white/5 p-3.5 rounded-3xl border border-white/10 text-center space-y-3">
                  <div className="text-5xl">🌳</div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase text-center">Meadow Land Expansion</h4>
                    <p className="text-[9px] text-slate-400 font-mono leading-relaxed mt-1 text-center">
                      Extend land borders to create spacious meadows for active flying and roaming dragons. Higher expansions increase friendship bonuses!
                    </p>
                  </div>

                  <div className="flex justify-between items-center bg-black/35 p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-slate-300">Next Expansion: Level {villageState.expansionLevel + 1}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">🪙 {villageState.expansionLevel * 1500}</span>
                  </div>

                  <button
                    onClick={handleExpandVillage}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 font-black text-xs uppercase text-white rounded-xl shadow-lg cursor-pointer"
                  >
                    Expand Meadow Size
                  </button>
                </div>
              )}
            </div>
          )}

          {/* D. POSTCARD GALLERY TAB: Saved snaps */}
          {activeTab === 'postcard' && (
            <div className="space-y-3 text-center">
              <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                <p className="text-[10px] font-mono text-pink-300 uppercase font-bold">Dragon Postcard Gallery</p>
                <p className="text-[9px] font-mono text-slate-400">OFFLINE SAVES</p>
              </div>

              {postcardImage ? (
                <div className="flex flex-col items-center p-3 bg-white border border-slate-200 shadow-2xl rounded-sm text-slate-900 max-w-xs mx-auto animate-fade-in">
                  {/* Styled snapshot mockup card */}
                  <div className="w-full aspect-[4/3] bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 rounded-sm relative overflow-hidden flex flex-col justify-center items-center">
                    <div className="absolute top-4 left-4 text-3xl">🐉</div>
                    <div className="absolute bottom-4 right-4 text-3xl">🏞️</div>
                    <div className="text-center font-display font-black italic text-white text-lg drop-shadow-md">
                      SKY VILLAGE PARADISE
                    </div>
                  </div>

                  <p className="text-[10px] font-mono font-bold mt-2.5 uppercase tracking-wide">
                    {postcardImage}
                  </p>
                  <p className="text-[8px] font-mono text-slate-400 uppercase">Tamer: {stats.playerName}</p>

                  <div className="grid grid-cols-2 gap-2 w-full mt-3">
                    <button
                      onClick={() => { audio.playTap(); triggerAlert('Postcard Saved to Photo roll! 📸', 'success'); }}
                      className="py-1.5 rounded bg-cyan-600 text-[9px] font-black uppercase text-white cursor-pointer"
                    >
                      Save Postcard
                    </button>
                    <button
                      onClick={() => setPostcardImage(null)}
                      className="py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-[9px] font-black uppercase text-slate-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-1.5">
                  <span className="text-4xl">📸</span>
                  <p className="text-[10px] font-mono uppercase font-bold text-pink-300">No Postcards Snapped</p>
                  <p className="text-[9px] font-mono max-w-[180px] leading-relaxed">Click the camera icon on the top right of the meadow scene to snap a commemorative polaroid postcard!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 4. CURRENT CURRENCY FOOTER BAR */}
      <div className="relative z-10 flex justify-between bg-black/45 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-xl mt-1 text-xs">
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400 font-bold">🪙</span>
          <span className="text-white font-black font-mono">{stats.coins}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-cyan-400 font-bold">💎</span>
          <span className="text-white font-black font-mono">{stats.crystals}</span>
        </div>
        <div className="text-[9px] font-mono text-slate-300 uppercase flex items-center">
          <span>Active house: {DRAGON_HOUSES.find((h) => h.id === villageState.houseId)?.visualName}</span>
        </div>
      </div>
    </div>
  );
}
