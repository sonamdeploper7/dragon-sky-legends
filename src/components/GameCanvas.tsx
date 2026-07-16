/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../audio';
import { PlayerStats, Dragon, GameWorld } from '../types';
import { Play, Home, Share2, Shield, Zap, Sparkles, Magnet, HelpCircle, AlertCircle } from 'lucide-react';

interface GameCanvasProps {
  key?: string | number;
  stats: PlayerStats;
  dragons: Dragon[];
  worlds: GameWorld[];
  onGameEnd: (score: number, distance: number, crystals: number, coins: number, combo: number, checkReached: boolean) => void;
  onBackToMenu: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  collected?: boolean;
  angle?: number;
  speedY?: number;
}

interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  shootTimer: number;
  projectiles: { x: number; y: number; vx: number; vy: number; radius: number }[];
}

export default function GameCanvas({ stats, dragons, worlds, onGameEnd, onBackToMenu }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI state
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [crystals, setCrystals] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(1);
  const [activeShield, setActiveShield] = useState(false);
  const [activeMagnet, setActiveMagnet] = useState(false);
  const [activeBoost, setActiveBoost] = useState(false);
  const [activeSlowMo, setActiveSlowMo] = useState(false);
  const [activeRainbow, setActiveRainbow] = useState(false);

  // Game flow state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [hasCheatedDeath, setHasCheatedDeath] = useState(false);
  const [showWorldBanner, setShowWorldBanner] = useState(false);

  // New Upgraded visual overlay states
  const [windActive, setWindActive] = useState(false);
  const [windDirection, setWindDirection] = useState<'UPWIND' | 'DOWNWIND' | 'HEADWIND' | 'TAILWIND' | ''>('');
  const [windStrength, setWindStrength] = useState<'LIGHT' | 'MEDIUM' | 'STRONG' | ''>('');
  const [fogActive, setFogActive] = useState(false);
  const [bossType, setBossType] = useState<'Ancient Dragon' | 'Storm Spirit' | 'Crystal Guardian' | 'Lava Titan' | ''>('');
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [dangerWarning, setDangerWarning] = useState<string>('');

  // References for the loop
  const stateRef = useRef({
    dragonY: 150,
    dragonVy: 0,
    dragonX: 70,
    dragonWidth: 42,
    dragonHeight: 32,
    rotation: 0,
    gravity: 0.28,
    flapStrength: -5.8,
    speed: 3.2,
    originalSpeed: 3.2,
    distanceTraveled: 0,
    crystalsCollected: 0,
    coinsEarned: 0,
    comboLevel: 1,
    comboTimer: 0,
    score: 0,
    checkpointLimit: 2500, // Distance to complete stage (increased for epic boss milestones!)
    checkpointProgress: 0,
    checkpointReached: false,
    bossSpawnsAt: 500, // Spawns Boss 1 at 500 distance/score milestone!
    bossSpawned: false,
    bossDefeated: false,
    bossStage: 0, // 0: none, 1: 500, 2: 1000, 3: 1500, 4: 2000
    powerupDurations: {
      shield: 0,
      magnet: 0,
      boost: 0,
      slowmo: 0,
      rainbow: 0,
    },
    objects: [] as GameObject[],
    particles: [] as Particle[],
    boss: null as Boss | null,
    clouds: [] as { x: number; y: number; scale: number; speed: number }[],
    isGameOver: false,
    
    // Wind Gust system
    windActive: false,
    windDirection: '' as 'UPWIND' | 'DOWNWIND' | 'HEADWIND' | 'TAILWIND' | '',
    windStrength: '' as 'LIGHT' | 'MEDIUM' | 'STRONG' | '',
    windTimer: 10000, // Trigger wind every 10-15 seconds
    windDuration: 0,
    windLines: [] as { x: number; y: number; speed: number; len: number }[],

    // Fog Zone system
    fogActive: false,
    fogTimer: 18000, // Trigger fog every 18-24 seconds
    fogDuration: 0,

    // Falling Meteors system
    meteors: [] as { x: number; y: number; vx: number; vy: number; radius: number; warningTimer: number; active: boolean }[],
    meteorTimer: 6000, // Spawn meteor every 6-8 seconds

    // Lightning Storms system
    lightningStrikes: [] as { x: number; width: number; warningTimer: number; active: boolean; strikeTimer: number }[],
    lightningTimer: 8000, // Spawn lightning every 8-10 seconds

    // Boss fight helpers
    bossEnergyCrystals: [] as { id: string; x: number; y: number; width: number; height: number; active: boolean }[],
    bossAttackRings: [] as { id: string; x: number; y: number; r: number; active: boolean }[],
    timeInBossFight: 0,
    spawnCooldown: 0,
    lastPattern: '',
    spawnHistory: [] as string[],
  });

  const activeDragon = dragons.find((d) => d.id === stats.activeDragonId) || dragons[0];
  const activeWorld = worlds.find((w) => w.id === stats.activeWorldId) || worlds[0];

  // Trigger World Banner & world-specific music when entering the world
  useEffect(() => {
    setShowWorldBanner(true);
    // Play a delightful magic explosion / entry sound
    audio.playMagicExplosion();
    // Play world-specific background music!
    audio.startMusic(activeWorld.id);

    const timer = setTimeout(() => {
      setShowWorldBanner(false);
    }, 2800);

    return () => {
      clearTimeout(timer);
    };
  }, [activeWorld.id]);

  // Set up resize observer for canvas matching viewport width/height
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Populate initial clouds in state
    stateRef.current.clouds = Array.from({ length: 6 }).map((_, i) => ({
      x: Math.random() * 500,
      y: Math.random() * 250,
      scale: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
    }));

    return () => observer.disconnect();
  }, []);

  // Main gameplay execution loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = stateRef.current;

    const updateGame = () => {
      if (game.isGameOver || !isPlaying) return;

      // 1. Progress Distance
      const speedMultiplier = activeBoost ? 2.5 : activeSlowMo ? 0.6 : 1.0;
      const currentSpeed = game.speed * speedMultiplier;
      game.distanceTraveled += currentSpeed * 0.15;
      setDistance(Math.floor(game.distanceTraveled));

      // 2. Physics of Dragon
      game.dragonVy += game.gravity;
      game.dragonY += game.dragonVy;

      // Apply upper and lower boundaries
      if (game.dragonY < 10) {
        game.dragonY = 10;
        game.dragonVy = 0;
      }
      if (game.dragonY > canvas.height - 40) {
        // Safe landing or crash? If it has landed, it crashes unless shield active
        handlePlayerCrash();
      }

      // Smooth rotation based on speed
      game.rotation = Math.min(Math.max(game.dragonVy * 0.07, -0.6), 0.6);

      // 3. Power-up tick durations
      Object.keys(game.powerupDurations).forEach((key) => {
        const k = key as keyof typeof game.powerupDurations;
        if (game.powerupDurations[k] > 0) {
          game.powerupDurations[k] -= 16.67; // approx ms per frame
          if (game.powerupDurations[k] <= 0) {
            game.powerupDurations[k] = 0;
            // Disable indicators
            if (k === 'shield') setActiveShield(false);
            if (k === 'magnet') setActiveMagnet(false);
            if (k === 'boost') setActiveBoost(false);
            if (k === 'slowmo') setActiveSlowMo(false);
            if (k === 'rainbow') setActiveRainbow(false);
          }
        }
      });

      // 3b. Wind Gust effect & Tick Timers
      if (game.windActive) {
        const strengthMultiplier = game.windStrength === 'STRONG' ? 1.5 : game.windStrength === 'MEDIUM' ? 1.0 : 0.5;
        if (game.windDirection === 'UPWIND') {
          game.dragonVy -= 0.12 * strengthMultiplier;
        } else if (game.windDirection === 'DOWNWIND') {
          game.dragonVy += 0.12 * strengthMultiplier;
        } else if (game.windDirection === 'HEADWIND') {
          game.distanceTraveled -= currentSpeed * 0.05 * strengthMultiplier;
        } else if (game.windDirection === 'TAILWIND') {
          game.distanceTraveled += currentSpeed * 0.05 * strengthMultiplier;
        }
      }

      game.windTimer -= 16.67;
      if (game.windTimer <= 0) {
        if (!game.windActive) {
          game.windActive = true;
          const dirs: ('UPWIND' | 'DOWNWIND' | 'HEADWIND' | 'TAILWIND')[] = ['UPWIND', 'DOWNWIND', 'HEADWIND', 'TAILWIND'];
          const strengths: ('LIGHT' | 'MEDIUM' | 'STRONG')[] = ['LIGHT', 'MEDIUM', 'STRONG'];
          game.windDirection = dirs[Math.floor(Math.random() * dirs.length)];
          game.windStrength = strengths[Math.floor(Math.random() * strengths.length)];
          game.windDuration = 5000 + Math.random() * 5000;
          setWindActive(true);
          setWindDirection(game.windDirection);
          setWindStrength(game.windStrength);
          audio.playPowerup();
        } else {
          game.windTimer = 15000 + Math.random() * 10000;
        }
      }

      if (game.windActive) {
        game.windDuration -= 16.67;
        if (game.windDuration <= 0) {
          game.windActive = false;
          game.windDirection = '';
          game.windStrength = '';
          setWindActive(false);
          setWindDirection('');
          setWindStrength('');
          game.windTimer = 15000 + Math.random() * 10000;
        }
        if (Math.random() < 0.15) {
          game.particles.push({
            x: canvas.width + 50,
            y: Math.random() * canvas.height,
            vx: -6 - Math.random() * 6,
            vy: game.windDirection === 'UPWIND' ? -1 : game.windDirection === 'DOWNWIND' ? 1 : 0,
            size: Math.random() * 2 + 1,
            color: 'rgba(255, 255, 255, 0.4)',
            alpha: 0.6,
            life: 0,
            maxLife: 60,
          });
        }
      }

      // 3c. Fog ticks
      game.fogTimer -= 16.67;
      if (game.fogTimer <= 0) {
        if (!game.fogActive) {
          game.fogActive = true;
          game.fogDuration = 6000 + Math.random() * 4000;
          setFogActive(true);
        } else {
          game.fogTimer = 20000 + Math.random() * 12000;
        }
      }
      if (game.fogActive) {
        game.fogDuration -= 16.67;
        if (game.fogDuration <= 0) {
          game.fogActive = false;
          setFogActive(false);
          game.fogTimer = 20000 + Math.random() * 12000;
        }
      }

      // 3d. Meteor ticks
      game.meteorTimer -= 16.67;
      if (game.meteorTimer <= 0) {
        game.meteorTimer = 7000 + Math.random() * 6000;
        game.meteors.push({
          x: canvas.width + 100,
          y: -50,
          vx: -5 - Math.random() * 4,
          vy: 4 + Math.random() * 3,
          radius: 18,
          warningTimer: 1200,
          active: false
        });
        setDangerWarning('⚠️ METEOR WARNING!');
        setTimeout(() => setDangerWarning(''), 2000);
      }

      game.meteors.forEach((m, mIdx) => {
        if (m.warningTimer > 0) {
          m.warningTimer -= 16.67;
          if (m.warningTimer <= 0) {
            m.active = true;
          }
        } else {
          m.x += m.vx;
          m.y += m.vy;
          if (Math.random() < 0.6) {
            game.particles.push({
              x: m.x,
              y: m.y,
              vx: -m.vx * 0.2 + (Math.random() * 2 - 1),
              vy: -m.vy * 0.2 + (Math.random() * 2 - 1),
              size: Math.random() * 6 + 3,
              color: Math.random() < 0.5 ? '#f97316' : '#ef4444',
              alpha: 1,
              life: 0,
              maxLife: 20
            });
          }
          const distToPlayer = Math.sqrt(Math.pow(m.x - (game.dragonX + game.dragonWidth/2), 2) + Math.pow(m.y - (game.dragonY + game.dragonHeight/2), 2));
          if (distToPlayer < m.radius + 15) {
            game.meteors.splice(mIdx, 1);
            if (activeShield) {
              setActiveShield(false);
              game.powerupDurations.shield = 0;
              triggerExplosion(m.x, m.y, '#f97316', 20);
            } else if (!activeBoost) {
              handlePlayerCrash();
            }
          }
          if (m.y > canvas.height + 50 || m.x < -50) {
            triggerExplosion(m.x, canvas.height - 40, '#f97316', 15);
            game.meteors.splice(mIdx, 1);
          }
        }
      });

      // 3e. Lightning ticks
      game.lightningTimer -= 16.67;
      if (game.lightningTimer <= 0) {
        game.lightningTimer = 9000 + Math.random() * 7000;
        game.lightningStrikes.push({
          x: Math.random() * (canvas.width - 150) + 70,
          width: 45,
          warningTimer: 1200,
          active: false,
          strikeTimer: 250
        });
        setDangerWarning('⚠️ LIGHTNING INCOMING!');
        setTimeout(() => setDangerWarning(''), 2000);
      }

      game.lightningStrikes.forEach((ls, lIdx) => {
        if (ls.warningTimer > 0) {
          ls.warningTimer -= 16.67;
          if (ls.warningTimer <= 0) {
            ls.active = true;
            audio.playMagicExplosion();
          }
        } else if (ls.active) {
          ls.strikeTimer -= 16.67;
          if (game.dragonX + game.dragonWidth > ls.x && game.dragonX < ls.x + ls.width) {
            if (activeShield) {
              setActiveShield(false);
              game.powerupDurations.shield = 0;
            } else if (!activeBoost) {
              handlePlayerCrash();
            }
          }
          if (ls.strikeTimer <= 0) {
            game.lightningStrikes.splice(lIdx, 1);
          }
        }
      });

      // 3f. Difficulty scaling & Speed updates
      const currentDiffLevel = Math.min(5, Math.floor(game.distanceTraveled / 400) + 1);
      game.speed = game.originalSpeed + (currentDiffLevel - 1) * 0.6;

      // Update Combo decay
      if (game.comboTimer > 0) {
        game.comboTimer -= 16.67;
        if (game.comboTimer <= 0) {
          game.comboLevel = 1;
          setCombo(1);
        }
      }

      // 4. Update Particle Trails
      if (activeRainbow || activeBoost) {
        const colors = activeRainbow ? ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#fbbf24'] : ['#facc15', '#f59e0b', '#ef4444'];
        game.particles.push({
          x: game.dragonX - 10,
          y: game.dragonY + 12 + (Math.random() * 8 - 4),
          vx: -currentSpeed * 0.8,
          vy: Math.random() * 2 - 1,
          size: Math.random() * 4 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: 30,
        });
      } else {
        // Standard tiny magic blue sparkles trail
        if (Math.random() < 0.4) {
          game.particles.push({
            x: game.dragonX - 5,
            y: game.dragonY + 15,
            vx: -2,
            vy: Math.random() * 1 - 0.5,
            size: Math.random() * 3 + 1.5,
            color: '#38bdf8',
            alpha: 0.8,
            life: 0,
            maxLife: 25,
          });
        }
      }

      game.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) {
          game.particles.splice(idx, 1);
        }
      });

      // 5. Continuous & Fair Pattern-Based Spawn Controller
      if (!game.bossSpawned) {
        if (!game.spawnCooldown) {
          game.spawnCooldown = 0;
        }
        game.spawnCooldown -= 16.67;
        
        if (game.spawnCooldown <= 0) {
          // Reset cooldown to a fair continuous range (1200ms to 1700ms based on current speed)
          const baseCooldown = 1300 + Math.random() * 400;
          game.spawnCooldown = baseCooldown / (currentSpeed / game.speed); // scales with active boost or slowmo

          // 1. Select obstacle type dynamically based on the current active world
          let candidateObstacles = ['sky-temple', 'floating-island', 'cloud-wall', 'floating-lantern', 'dragon-gate'];
          if (activeWorld.id === 'sky-kingdom') {
            candidateObstacles = ['sky-temple', 'floating-island', 'cloud-wall', 'floating-lantern', 'dragon-gate'];
          } else if (activeWorld.id === 'cloud-city') {
            candidateObstacles = ['cloud-wall', 'tornado-column', 'lightning-orb', 'floating-island', 'crystal-ring'];
          } else if (activeWorld.id === 'crystal-canyon') {
            candidateObstacles = ['crystal-tower', 'crystal-cave', 'crystal-ring', 'crystal-wheel', 'energy-barrier'];
          } else if (activeWorld.id === 'frozen-peak') {
            candidateObstacles = ['ice-spike', 'broken-bridge', 'cloud-wall', 'stone-pillar', 'floating-lantern'];
          } else if (activeWorld.id === 'volcano-island') {
            candidateObstacles = ['fire-column', 'giant-mushroom', 'stone-pillar', 'energy-barrier', 'ancient-ruins'];
          } else if (activeWorld.id === 'storm-valley') {
            candidateObstacles = ['lightning-orb', 'tornado-column', 'energy-barrier', 'broken-bridge', 'crystal-wheel'];
          } else if (activeWorld.id === 'moon-realm') {
            candidateObstacles = ['floating-lantern', 'crystal-ring', 'crystal-cave', 'ancient-statue', 'energy-barrier'];
          } else if (activeWorld.id === 'sun-temple') {
            candidateObstacles = ['sky-temple', 'dragon-gate', 'ancient-statue', 'crystal-ring', 'stone-pillar'];
          } else if (activeWorld.id === 'galaxy-sky') {
            candidateObstacles = ['lightning-orb', 'crystal-wheel', 'energy-barrier', 'floating-island', 'crystal-cave'];
          } else if (activeWorld.id === 'ancient-ruins') {
            candidateObstacles = ['ancient-ruins', 'ancient-statue', 'magic-vine', 'stone-pillar', 'giant-mushroom'];
          }

          // Exclude the last spawned obstacle from choices to prevent repetitive spawning
          const filteredCandidates = candidateObstacles.filter((o) => !game.spawnHistory.includes(o));
          const finalCandidates = filteredCandidates.length > 0 ? filteredCandidates : candidateObstacles;
          const obstacleType = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];

          // Update spawn history
          game.spawnHistory.push(obstacleType);
          if (game.spawnHistory.length > 3) game.spawnHistory.shift();

          // 2. Select spawning pattern to maintain high variety
          // Patterns: 'TOP_BOTTOM_PAIR' | 'SINGLE_BOTTOM' | 'FLOATING_WITH_ANCHOR'
          const patterns: ('TOP_BOTTOM_PAIR' | 'SINGLE_BOTTOM' | 'FLOATING_WITH_ANCHOR')[] = [
            'TOP_BOTTOM_PAIR', 'SINGLE_BOTTOM', 'FLOATING_WITH_ANCHOR'
          ];
          // Exclude last pattern to ensure we NEVER repeat the same pattern continuously
          const filteredPatterns = patterns.filter(p => p !== game.lastPattern);
          const activePattern = filteredPatterns[Math.floor(Math.random() * filteredPatterns.length)];
          game.lastPattern = activePattern;

          const xPos = canvas.width + 50;

          if (activePattern === 'TOP_BOTTOM_PAIR') {
            // Every top obstacle must always have a matching bottom obstacle!
            // Thin or wide columns based on selected obstacleType
            const isWide = ['broken-bridge', 'sky-temple', 'crystal-cave'].includes(obstacleType);
            const width = isWide ? 65 : 34;
            
            // Randomly pick a fair flight gap and different gap sizes
            const gapSize = Math.floor(115 + Math.random() * 40); // different gap sizes (115px to 155px)
            const gapCenter = Math.floor(130 + Math.random() * (canvas.height - 300)); // gap center

            // Spawn matching top column
            game.objects.push({
              id: Math.random().toString(),
              x: xPos,
              y: 0,
              width,
              height: gapCenter - gapSize / 2,
              type: obstacleType,
              angle: 0
            });

            // Spawn matching bottom column
            game.objects.push({
              id: Math.random().toString(),
              x: xPos,
              y: gapCenter + gapSize / 2,
              width,
              height: canvas.height - (gapCenter + gapSize / 2) - 40,
              type: obstacleType,
              angle: 0
            });

            // Maintain fair gameplay: Place a guiding blue crystal right in the middle of the safe gap!
            if (Math.random() < 0.7) {
              game.objects.push({
                id: Math.random().toString(),
                x: xPos + width / 2 - 10,
                y: gapCenter - 10,
                width: 20,
                height: 20,
                type: 'crystal'
              });
            }
          } 
          else if (activePattern === 'SINGLE_BOTTOM') {
            // Rising bottom obstacle - completely attached, so fully supported
            const isWide = ['broken-bridge', 'sky-temple', 'floating-island', 'ancient-ruins'].includes(obstacleType);
            const width = isWide ? 68 : 36;
            const height = Math.floor(120 + Math.random() * 80); // heights (120px to 200px)

            game.objects.push({
              id: Math.random().toString(),
              x: xPos,
              y: canvas.height - height - 40,
              width,
              height,
              type: obstacleType,
              angle: 0
            });

            // Place a rare crystal or powerup above the obstacle as reward
            if (Math.random() < 0.5) {
              const itemType = Math.random() < 0.15 ? 'shield' : 'crystal';
              game.objects.push({
                id: Math.random().toString(),
                x: xPos + width / 2 - 10,
                y: canvas.height - height - 85,
                width: 20,
                height: 20,
                type: itemType
              });
            }
          } 
          else {
            // FLOATING_WITH_ANCHOR: Floating obstacle (like island, ring, etc.)
            // Drawn in vertical center with custom visual support lines/anchors in the render phase
            const width = 45;
            const height = 45;
            const yPos = Math.floor(80 + Math.random() * (canvas.height - height - 160));

            game.objects.push({
              id: Math.random().toString(),
              x: xPos,
              y: yPos,
              width,
              height,
              type: obstacleType,
              angle: 0,
              speedY: obstacleType === 'floating-lantern' ? 0.45 : 0 // gentle bobbing
            });

            // Guide crystal next to floating obstacle
            if (Math.random() < 0.6) {
              game.objects.push({
                id: Math.random().toString(),
                x: xPos + width + 15,
                y: yPos + height / 2 - 10,
                width: 20,
                height: 20,
                type: 'crystal'
              });
            }
          }

          // 3. Spawn floating collectible items / powerups / portals periodically (independent of pattern structure)
          if (Math.random() < 0.42) {
            const randType = Math.random();
            let itemType = 'crystal';
            let itemWidth = 20;
            let itemHeight = 20;

            if (randType < 0.35) {
              // Standard crystal
              itemType = 'crystal';
            } else if (randType < 0.55) {
              // Rare crystal
              const rareTypes = ['rare-crystal-blue', 'rare-crystal-purple', 'rare-crystal-gold', 'rare-crystal-rainbow', 'rare-crystal-legendary'];
              itemType = rareTypes[Math.floor(Math.random() * rareTypes.length)];
              itemWidth = 22;
              itemHeight = 22;
            } else if (randType < 0.75) {
              // Powerup item bubble
              const pTypes = ['shield', 'magnet', 'boost', 'slowmo', 'rainbow', 'treasure'];
              itemType = pTypes[Math.floor(Math.random() * pTypes.length)];
              itemWidth = 24;
              itemHeight = 24;
            } else {
              // Magic Portal
              const portalTypes = ['speed-portal-blue', 'speed-portal-purple', 'speed-portal-gold', 'speed-portal-green'];
              itemType = portalTypes[Math.floor(Math.random() * portalTypes.length)];
              itemWidth = 45;
              itemHeight = 45;
            }

            // Spawn floating item in a clear flight height range
            game.objects.push({
              id: Math.random().toString(),
              x: xPos + 180, // slightly offset to prevent overlapping
              y: 60 + Math.random() * (canvas.height - 180),
              width: itemWidth,
              height: itemHeight,
              type: itemType
            });
          }
        }
      }

      // Multi-stage Boss trigger system
      const triggerBossFight = (stage: number, name: 'Ancient Dragon' | 'Storm Spirit' | 'Crystal Guardian' | 'Lava Titan') => {
        game.bossStage = stage;
        game.bossSpawned = true;
        setBossActive(true);
        setBossType(name);
        setBossMaxHp(stage * 120);
        setBossHp(stage * 120);
        audio.playRoar();

        game.boss = {
          x: canvas.width + 120,
          y: canvas.height / 2 - 45,
          width: 90,
          height: 90,
          hp: stage * 120,
          maxHp: stage * 120,
          shootTimer: 0,
          projectiles: []
        };

        // Clear existing obstacles so it is a fair fight!
        game.objects = [];
        game.bossEnergyCrystals = [];
        game.bossAttackRings = [];
      };

      if (!game.bossSpawned) {
        if (game.score >= 500 && game.bossStage === 0) {
          triggerBossFight(1, 'Ancient Dragon');
        } else if (game.score >= 1000 && game.bossStage === 1) {
          triggerBossFight(2, 'Storm Spirit');
        } else if (game.score >= 1500 && game.bossStage === 2) {
          triggerBossFight(3, 'Crystal Guardian');
        } else if (game.score >= 2000 && game.bossStage === 3) {
          triggerBossFight(4, 'Lava Titan');
        }
      }

      // 6. Update Objects (glide leftwards)
      game.objects.forEach((obj, idx) => {
        // Move obstacles
        obj.x -= currentSpeed;
        
        // Dynamic moving obstacles
        if (obj.speedY) {
          obj.y += obj.speedY;
          if (obj.y < 30 || obj.y > canvas.height - obj.height - 60) {
            obj.speedY *= -1;
          }
        }

        // Magnet Attraction physics
        const isAttractable = obj.type === 'crystal' || obj.type === 'treasure' || obj.type.startsWith('rare-crystal');
        if (activeMagnet && isAttractable && !obj.collected) {
          const dx = game.dragonX - obj.x;
          const dy = game.dragonY - obj.y;
          const distToDragon = Math.sqrt(dx * dx + dy * dy);
          if (distToDragon < 150) {
            obj.x += (dx / distToDragon) * 8;
            obj.y += (dy / distToDragon) * 8;
          }
        }

        // Collision Check
        if (!obj.collected && checkCollision(game.dragonX, game.dragonY, game.dragonWidth, game.dragonHeight, obj.x, obj.y, obj.width, obj.height)) {
          if (obj.type === 'crystal') {
            obj.collected = true;
            handleCrystalCollect(obj);
          } else if (obj.type.startsWith('rare-crystal')) {
            obj.collected = true;
            handleRareCrystalCollect(obj.type);
          } else if (obj.type.startsWith('speed-portal')) {
            obj.collected = true;
            handlePortalCollect(obj.type);
          } else if (['shield', 'magnet', 'boost', 'slowmo', 'rainbow', 'treasure'].includes(obj.type)) {
            obj.collected = true;
            handlePowerupCollect(obj.type);
          } else {
            // Collision with static obstacle
            if (activeShield) {
              // Destroy obstacle, explode particles, trigger shockwave
              triggerExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2, '#ef4444', 15);
              audio.playMagicExplosion();
              setActiveShield(false);
              game.powerupDurations.shield = 0;
              game.objects.splice(idx, 1);
            } else if (activeBoost) {
              // Speed boost destroys obstacles automatically!
              triggerExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2, '#fbbf24', 20);
              audio.playMagicExplosion();
              game.objects.splice(idx, 1);
              game.score += 50;
              setScore(game.score);
            } else {
              handlePlayerCrash();
            }
          }
        }

        // Remove out-of-screen objects
        if (obj.x < -80) {
          game.objects.splice(idx, 1);
        }
      });

      // 7. Update Boss state
      if (game.boss) {
        const boss = game.boss;
        // Boss glides into frame from right
        if (boss.x > canvas.width - 120) {
          boss.x -= 1.5;
        } else {
          // Hover up and down
          boss.y = canvas.height / 2 - boss.height / 2 + Math.sin(Date.now() * 0.003) * 60;
        }

        // Boss attacks: shoot magic spheres every 1.8 seconds
        boss.shootTimer += 16.67;
        if (boss.shootTimer >= 1800) {
          boss.shootTimer = 0;
          audio.playCrystal(2);
          boss.projectiles.push({
            x: boss.x,
            y: boss.y + boss.height / 2,
            vx: -4.5,
            vy: (game.dragonY - boss.y) * 0.005 + (Math.random() * 1 - 0.5),
            radius: 8,
          });
        }

        // Update Boss projectiles
        boss.projectiles.forEach((proj, pIdx) => {
          proj.x += proj.vx;
          proj.y += proj.vy;

          // Check hit dragon
          const distToDragon = Math.sqrt(Math.pow(proj.x - (game.dragonX + game.dragonWidth/2), 2) + Math.pow(proj.y - (game.dragonY + game.dragonHeight/2), 2));
          if (distToDragon < proj.radius + 15) {
            boss.projectiles.splice(pIdx, 1);
            if (activeShield) {
              setActiveShield(false);
              game.powerupDurations.shield = 0;
              triggerExplosion(proj.x, proj.y, '#38bdf8', 12);
            } else if (activeBoost) {
              // immune
            } else {
              handlePlayerCrash();
            }
          }

          // Out of screen bounds removal
          if (proj.x < -20) {
            boss.projectiles.splice(pIdx, 1);
          }
        });

        // Dragon automatically shoots back magical crystals towards boss if player taps!
        // To keep controls lightweight and satisfying, the player automatically fires energy sparks at the boss
        if (Math.random() < 0.02) {
          triggerBossHurt();
        }
      }

      // 8. Checkpoint Completion Check
      if (game.distanceTraveled >= game.checkpointLimit && !game.checkpointReached) {
        game.checkpointReached = true;
        audio.playMagicExplosion();
        setShowGoalPrompt(true);
        setTimeout(() => {
          setShowGoalPrompt(false);
          setIsPlaying(false);
          onGameEnd(game.score, Math.floor(game.distanceTraveled), game.crystalsCollected, game.coinsEarned, game.comboLevel, true);
        }, 1800);
      }
    };

    // Render Canvas frame by frame
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A. BACKGROUND GRADIENTS (World themed)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (activeWorld.id === 'sky-kingdom') {
        grad.addColorStop(0, '#7dd3fc'); // Sky blue
        grad.addColorStop(1, '#a5b4fc'); // Indigo-300
      } else if (activeWorld.id === 'cloud-city') {
        grad.addColorStop(0, '#99f6e4'); // Teal-200
        grad.addColorStop(1, '#e0f2fe'); // Sky-100
      } else if (activeWorld.id === 'rainbow-valley') {
        grad.addColorStop(0, '#fbcfe8'); // Pink
        grad.addColorStop(0.5, '#fef08a'); // Yellow
        grad.addColorStop(1, '#ccfbf1'); // Teal
      } else if (activeWorld.id === 'volcano-island') {
        grad.addColorStop(0, '#f97316'); // Red-Orange
        grad.addColorStop(1, '#1e293b'); // Dark slate
      } else {
        grad.addColorStop(0, '#a78bfa'); // Purple
        grad.addColorStop(1, '#1e1b4b'); // Cosmic deep
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // B. PARALLAX MOVING CLOUDS & STAGE DECORATION
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      stateRef.current.clouds.forEach((c) => {
        c.x -= c.speed * (activeBoost ? 3 : 1);
        if (c.x < -150) c.x = canvas.width + 100;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 25 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 20 * c.scale, c.y - 10 * c.scale, 30 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 45 * c.scale, c.y, 20 * c.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw water ripple splash indicators at the very bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

      // C. RENDER PARTICLES TRAIL
      stateRef.current.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // D. RENDER WORLD OBSTACLES & CRYSTALS
      stateRef.current.objects.forEach((obj) => {
        if (obj.collected) return;

        // Draw visual support for floating obstacles to guarantee the "never generate floating obstacles with no visual support" requirement!
        const isItem = ['crystal', 'shield', 'magnet', 'boost', 'slowmo', 'rainbow', 'treasure'].includes(obj.type) || 
                       obj.type.startsWith('rare-crystal') || 
                       obj.type.startsWith('speed-portal');
        if (!isItem) {
          const isTopAttached = obj.y <= 10;
          const isBottomAttached = obj.y + obj.height >= canvas.height - 50;
          if (!isTopAttached && !isBottomAttached) {
            // This is a floating obstacle! Draw a gorgeous visual support anchor
            ctx.save();
            ctx.beginPath();
            // Let's draw from the top ceiling (y=0) to the center of the obstacle
            ctx.moveTo(obj.x + obj.width / 2, 0);
            ctx.lineTo(obj.x + obj.width / 2, obj.y + obj.height / 2);
            
            // Customize style based on active world or type
            if (activeWorld.id === 'sky-kingdom' || activeWorld.id === 'cloud-city') {
              // Glowing magic light beam
              ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
              ctx.lineWidth = 3;
              ctx.shadowBlur = 12;
              ctx.shadowColor = '#06b6d4';
              ctx.stroke();
              // Add a white core line
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.lineWidth = 1.0;
              ctx.stroke();
            } else if (activeWorld.id === 'ancient-ruins' || activeWorld.id === 'volcano-island') {
              // Ancient vine
              ctx.strokeStyle = '#047857';
              ctx.lineWidth = 2.5;
              ctx.stroke();
              // Draw some tiny vine leaves
              ctx.fillStyle = '#10b981';
              for (let leafY = 10; leafY < obj.y + 10; leafY += 25) {
                ctx.beginPath();
                ctx.ellipse(obj.x + obj.width / 2 + (leafY % 10 - 5), leafY, 4, 2, Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
              }
            } else {
              // Sturdy iron chain / rope link
              ctx.strokeStyle = '#64748b';
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 6]); // dotted/chained look
              ctx.stroke();
              ctx.setLineDash([]);
            }
            ctx.restore();
          }
        }

        ctx.save();

        if (obj.type === 'crystal') {
          // Render shiny blue crystal (rhombus style)
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(obj.x + obj.width / 2, obj.y);
          ctx.lineTo(obj.x + obj.width, obj.y + obj.height / 2);
          ctx.lineTo(obj.x + obj.width / 2, obj.y + obj.height);
          ctx.lineTo(obj.x, obj.y + obj.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Sparkle highlight
          ctx.fillStyle = 'white';
          ctx.fillRect(obj.x + obj.width / 2 - 2, obj.y + 4, 4, 4);
        } else if (obj.type.startsWith('rare-crystal')) {
          let cGlow = '#38bdf8';
          let cFill = '#60a5fa';
          let label = '💎';
          if (obj.type === 'rare-crystal-blue') { cGlow = '#2563eb'; cFill = '#3b82f6'; label = '🔷'; }
          else if (obj.type === 'rare-crystal-purple') { cGlow = '#8b5cf6'; cFill = '#a78bfa'; label = '🔮'; }
          else if (obj.type === 'rare-crystal-gold') { cGlow = '#eab308'; cFill = '#facc15'; label = '👑'; }
          else if (obj.type === 'rare-crystal-rainbow') { cGlow = '#ec4899'; cFill = '#f472b6'; label = '🌈'; }
          else if (obj.type === 'rare-crystal-legendary') { cGlow = '#10b981'; cFill = '#34d399'; label = '❇️'; }

          ctx.fillStyle = cFill;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 20;
          ctx.shadowColor = cGlow;
          ctx.beginPath();
          ctx.moveTo(obj.x + obj.width / 2, obj.y);
          ctx.lineTo(obj.x + obj.width, obj.y + obj.height / 3);
          ctx.lineTo(obj.x + obj.width * 0.8, obj.y + obj.height);
          ctx.lineTo(obj.x + obj.width * 0.2, obj.y + obj.height);
          ctx.lineTo(obj.x, obj.y + obj.height / 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = 'white';
          ctx.font = '10px sans-serif';
          ctx.fillText(label, obj.x + 3, obj.y + obj.height / 2 + 3);
        } else if (obj.type.startsWith('speed-portal')) {
          let pGlow = '#3b82f6';
          let label = '🌀';
          if (obj.type === 'speed-portal-blue') { pGlow = '#3b82f6'; label = '⏩'; }
          else if (obj.type === 'speed-portal-purple') { pGlow = '#a855f7'; label = '⏰'; }
          else if (obj.type === 'speed-portal-gold') { pGlow = '#fbbf24'; label = '🛡️'; }
          else if (obj.type === 'speed-portal-green') { pGlow = '#10b981'; label = '🪙'; }

          // Swirling portal effect
          ctx.strokeStyle = pGlow;
          ctx.shadowBlur = 20;
          ctx.shadowColor = pGlow;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, obj.height / 2, Date.now() * 0.005, 0, Math.PI * 2);
          ctx.stroke();

          // Outer ring
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2 + 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'white';
          ctx.font = '14px sans-serif';
          ctx.fillText(label, obj.x + obj.width / 2 - 7, obj.y + obj.height / 2 + 5);
        } else if (obj.type === 'shield') {
          // Shield item icon bubble
          ctx.fillStyle = '#3b82f6';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#3b82f6';
          ctx.beginPath();
          ctx.arc(obj.x + 12, obj.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = '10px sans-serif';
          ctx.fillText('🛡️', obj.x + 5, obj.y + 15);
        } else if (obj.type === 'magnet') {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f43f5e';
          ctx.beginPath();
          ctx.arc(obj.x + 12, obj.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.fillText('🧲', obj.x + 4, obj.y + 15);
        } else if (obj.type === 'boost') {
          ctx.fillStyle = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f59e0b';
          ctx.beginPath();
          ctx.arc(obj.x + 12, obj.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.fillText('⚡', obj.x + 6, obj.y + 16);
        } else if (obj.type === 'slowmo') {
          ctx.fillStyle = '#8b5cf6';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#8b5cf6';
          ctx.beginPath();
          ctx.arc(obj.x + 12, obj.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.fillText('⏰', obj.x + 5, obj.y + 15);
        } else if (obj.type === 'rainbow') {
          ctx.fillStyle = '#ec4899';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ec4899';
          ctx.beginPath();
          ctx.arc(obj.x + 12, obj.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.fillText('🌈', obj.x + 4, obj.y + 15);
        } else if (obj.type === 'treasure') {
          ctx.fillStyle = '#eab308';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#eab308';
          ctx.beginPath();
          ctx.arc(obj.x + 12, obj.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.fillText('🎁', obj.x + 4, obj.y + 15);
        } else {
          // ORIGINAL FANTASY OBSTACLES (22 TYPES)
          ctx.save();
          
          if (obj.type === 'crystal-tower') {
            // 1. Floating Crystal Towers (pink/cyan glowing obsidian spire)
            ctx.fillStyle = '#db2777';
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#f472b6';
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(obj.x + obj.width / 2, obj.y);
            ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
            ctx.lineTo(obj.x, obj.y + obj.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Facet line for gorgeous 3D look
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.moveTo(obj.x + obj.width / 2, obj.y);
            ctx.lineTo(obj.x + obj.width / 2, obj.y + obj.height);
            ctx.lineTo(obj.x, obj.y + obj.height);
            ctx.closePath();
            ctx.fill();
          } else if (obj.type === 'ancient-ruins') {
            // 2. Ancient Floating Ruins (slate gray broken column block with glowing runes)
            ctx.fillStyle = '#64748b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2.5;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

            // Glowing green runes/markings
            ctx.fillStyle = '#a7f3d0';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#34d399';
            ctx.font = '10px sans-serif';
            ctx.fillText('⚡', obj.x + 12, obj.y + 14);
            ctx.fillText('🔮', obj.x + obj.width - 20, obj.y + obj.height - 10);
          } else if (obj.type === 'stone-pillar') {
            // 3. Magic Stone Pillars (cracked gray columns wrapped in spiraling purple magic)
            ctx.fillStyle = '#475569';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 3;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

            // Spiraling magical energy rings
            ctx.fillStyle = '#c084fc';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#a855f7';
            for (let i = 20; i < obj.height; i += 40) {
              ctx.fillRect(obj.x - 3, obj.y + i, obj.width + 6, 8);
            }
          } else if (obj.type === 'floating-island') {
            // 4. Floating Islands (rocky soil with grass and roots dangling)
            ctx.fillStyle = '#78350f'; // Earthy brown
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + 12);
            ctx.lineTo(obj.x + obj.width, obj.y + 12);
            ctx.lineTo(obj.x + obj.width - 15, obj.y + obj.height);
            ctx.lineTo(obj.x + 15, obj.y + obj.height);
            ctx.closePath();
            ctx.fill();

            // Lush green grass top cap
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(obj.x - 2, obj.y, obj.width + 4, 12);

            // Small dangling vine roots
            ctx.strokeStyle = '#a16207';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(obj.x + 20, obj.y + obj.height);
            ctx.lineTo(obj.x + 22, obj.y + obj.height + 8);
            ctx.moveTo(obj.x + obj.width - 20, obj.y + obj.height);
            ctx.lineTo(obj.x + obj.width - 25, obj.y + obj.height + 10);
            ctx.stroke();
          } else if (obj.type === 'dragon-gate') {
            // 5. Ancient Dragon Gates (glowing runic arch with wings)
            ctx.fillStyle = '#334155';
            ctx.fillRect(obj.x + 8, obj.y, obj.width - 16, obj.height);
            
            // Central vortex portal
            ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#f97316';
            ctx.beginPath();
            ctx.ellipse(obj.x + obj.width / 2, obj.y + obj.height / 2, 8, 18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Decorative gold wings
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(obj.x - 4, obj.y + 6, 12, 12);
            ctx.fillRect(obj.x + obj.width - 8, obj.y + 6, 12, 12);
          } else if (obj.type === 'crystal-ring') {
            // 6. Crystal Rings (cyan glowing ring you dodge or slip through)
            ctx.strokeStyle = '#22d3ee';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#06b6d4';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();

            // Glowing central spark core
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'tree-branch') {
            // 7. Magic Tree Branches (cherry-blossom gold branches)
            ctx.fillStyle = '#d97706';
            ctx.fillRect(obj.x + 14, obj.y, 10, obj.height);

            // Glowing neon-pink floral blossoms
            ctx.fillStyle = '#f472b6';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ec4899';
            ctx.beginPath();
            ctx.arc(obj.x + 8, obj.y + 30, 8, 0, Math.PI * 2);
            ctx.arc(obj.x + 28, obj.y + 60, 9, 0, Math.PI * 2);
            ctx.arc(obj.x + 10, obj.y + 90, 8, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'floating-lantern') {
            // 8. Floating Lanterns (Japanese bobbing orange lanterns)
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(obj.x, obj.y + 4, obj.width, obj.height - 8);
            // Gold rims
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(obj.x - 2, obj.y, obj.width + 4, 4);
            ctx.fillRect(obj.x - 2, obj.y + obj.height - 4, obj.width + 4, 4);
            // Glowing candle center
            ctx.fillStyle = '#fef08a';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fbbf24';
            ctx.fillRect(obj.x + 6, obj.y + 8, obj.width - 12, obj.height - 16);
          } else if (obj.type === 'tornado-column') {
            // 9. Wind Tornado Columns (spinning windy storm column)
            ctx.fillStyle = 'rgba(186, 230, 253, 0.2)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#38bdf8';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // Wind swirls
            ctx.beginPath();
            for (let i = 0; i < obj.height; i += 20) {
              ctx.moveTo(obj.x, obj.y + i);
              ctx.bezierCurveTo(obj.x + obj.width, obj.y + i - 10, obj.x - obj.width, obj.y + i + 10, obj.x + obj.width, obj.y + i);
            }
            ctx.stroke();
          } else if (obj.type === 'ice-spike') {
            // 10. Ice Spikes (sharp glacial diamond fangs)
            const iceGrad = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
            iceGrad.addColorStop(0, '#e0f2fe');
            iceGrad.addColorStop(1, '#0284c7');
            ctx.fillStyle = iceGrad;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(obj.x + obj.width / 2, obj.y);
            ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
            ctx.lineTo(obj.x, obj.y + obj.height);
            ctx.closePath();
            ctx.fill();
          } else if (obj.type === 'fire-column') {
            // 11. Fire Columns (roaring flame burst)
            const fireGrad = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.height);
            fireGrad.addColorStop(0, '#fef08a');
            fireGrad.addColorStop(0.5, '#f97316');
            fireGrad.addColorStop(1, '#b91c1c');
            ctx.fillStyle = fireGrad;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ef4444';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          } else if (obj.type === 'lightning-orb') {
            // 12. Lightning Orbs (bright yellow ball with spark patterns)
            ctx.fillStyle = '#facc15';
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#eab308';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // High contrast electric flashes
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + obj.height / 2);
            ctx.lineTo(obj.x + obj.width, obj.y + obj.height / 2);
            ctx.stroke();
          } else if (obj.type === 'crystal-cave') {
            // 13. Floating Crystal Caves (hollow dark geode with magenta points)
            ctx.fillStyle = '#1e1b4b'; // Deep dark violet
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

            // Shimmering inner crystal shards
            ctx.fillStyle = '#d8b4fe';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#a855f7';
            ctx.fillRect(obj.x + 6, obj.y + 6, 12, 12);
            ctx.fillRect(obj.x + obj.width - 18, obj.y + obj.height - 18, 12, 12);
          } else if (obj.type === 'broken-bridge') {
            // 14. Broken Floating Bridges (floating timber with ropes)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(obj.x, obj.y + 4, obj.width, 10);
            ctx.fillRect(obj.x, obj.y + 22, obj.width, 10);
            
            // Yellow rope lines
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(obj.x + 10, obj.y, 4, obj.height);
            ctx.fillRect(obj.x + obj.width - 14, obj.y, 4, obj.height);
          } else if (obj.type === 'energy-barrier') {
            // 15. Magic Energy Barriers (translucent electric security matrix)
            ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            
            // central laser pulse
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + obj.height / 2);
            ctx.lineTo(obj.x + obj.width, obj.y + obj.height / 2);
            ctx.stroke();
          } else if (obj.type === 'crystal-wheel') {
            // 16. Rotating Crystal Wheels (smoothly rotating icy spinner)
            ctx.save();
            ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
            ctx.rotate(Date.now() * 0.002);
            ctx.fillStyle = '#38bdf8';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#0284c7';
            ctx.fillRect(-obj.width / 2, -4, obj.width, 8);
            ctx.fillRect(-4, -obj.height / 2, 8, obj.height);
            ctx.restore();
          } else if (obj.type === 'giant-mushroom') {
            // 17. Floating Giant Mushrooms (blue magic cap toadstool)
            // stem
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(obj.x + obj.width / 2 - 6, obj.y + 16, 12, obj.height - 16);
            // toadstool cap
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + 16, obj.width / 2, Math.PI, 0);
            ctx.fill();
            // spots
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + 8, 4, 0, Math.PI * 2);
            ctx.arc(obj.x + obj.width / 2 - 12, obj.y + 12, 3, 0, Math.PI * 2);
            ctx.arc(obj.x + obj.width / 2 + 12, obj.y + 12, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'rainbow-portal') {
            // 18. Rainbow Portals (swirling concentric rings)
            const portalGrad = ctx.createRadialGradient(
              obj.x + obj.width / 2, obj.y + obj.height / 2, 2,
              obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2
            );
            portalGrad.addColorStop(0, '#fbcfe8');
            portalGrad.addColorStop(0.5, '#ccfbf1');
            portalGrad.addColorStop(1, '#818cf8');
            ctx.fillStyle = portalGrad;
            ctx.shadowBlur = 16;
            ctx.shadowColor = '#c084fc';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'cloud-wall') {
            // 19. Cloud Walls (puffy cumulus cotton-candy wall)
            ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(obj.x + 15, obj.y + 15, 15, 0, Math.PI * 2);
            ctx.arc(obj.x + 35, obj.y + 10, 18, 0, Math.PI * 2);
            ctx.arc(obj.x + 55, obj.y + 15, 15, 0, Math.PI * 2);
            ctx.arc(obj.x + 35, obj.y + 30, 16, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'ancient-statue') {
            // 20. Floating Ancient Statues (Tiki slate mask with cyan glowing eyes)
            ctx.fillStyle = '#475569';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            // Eyebrow browline
            ctx.fillStyle = '#334155';
            ctx.fillRect(obj.x - 2, obj.y + 10, obj.width + 4, 8);
            // Glowing cyan eye cavities
            ctx.fillStyle = '#22d3ee';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#06b6d4';
            ctx.fillRect(obj.x + 6, obj.y + 22, 8, 6);
            ctx.fillRect(obj.x + obj.width - 14, obj.y + 22, 8, 6);
          } else if (obj.type === 'sky-temple') {
            // 21. Sky Temples (floating red/gold shrine pagoda roof)
            ctx.fillStyle = '#f8fafc'; // Pagoda building base
            ctx.fillRect(obj.x + 10, obj.y + 15, obj.width - 20, obj.height - 15);
            // Vermilion columns
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(obj.x + 14, obj.y + 15, 4, obj.height - 15);
            ctx.fillRect(obj.x + obj.width - 18, obj.y + 15, 4, obj.height - 15);
            // Pageant pagoda gold rim roof
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + 15);
            ctx.quadraticCurveTo(obj.x + obj.width / 2, obj.y - 4, obj.x + obj.width, obj.y + 15);
            ctx.lineTo(obj.x + obj.width - 10, obj.y + 6);
            ctx.quadraticCurveTo(obj.x + obj.width / 2, obj.y - 12, obj.x + 10, obj.y + 6);
            ctx.closePath();
            ctx.fill();
          } else if (obj.type === 'magic-vine') {
            // 22. Magic Vines (twisting throned vines with scarlet flowers)
            ctx.fillStyle = '#047857'; // Forest green stalk
            ctx.fillRect(obj.x + 12, obj.y, 10, obj.height);

            // Shimmering blossom points
            ctx.fillStyle = '#dc2626';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ef4444';
            ctx.beginPath();
            ctx.arc(obj.x + 8, obj.y + 20, 6, 0, Math.PI * 2);
            ctx.arc(obj.x + 20, obj.y + 55, 6, 0, Math.PI * 2);
            ctx.arc(obj.x + 6, obj.y + 90, 6, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Fallback general floating slate rock
            ctx.fillStyle = '#64748b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          
          ctx.restore();
        }

        ctx.restore();
      });

      // E. RENDER BOSS COMPANION
      if (game.boss) {
        const boss = game.boss;
        ctx.save();

        let bColor = '#ef4444';
        let bGlow = '#f43f5e';
        let bLabel = '🐲 ANCIENT DRAGON';
        let emoji = '🐲';

        if (bossType === 'Storm Spirit') {
          bColor = '#8b5cf6';
          bGlow = '#a855f7';
          bLabel = '⚡ STORM SPIRIT';
          emoji = '⚡';
        } else if (bossType === 'Crystal Guardian') {
          bColor = '#06b6d4';
          bGlow = '#22d3ee';
          bLabel = '💎 CRYSTAL GUARDIAN';
          emoji = '💎';
        } else if (bossType === 'Lava Titan') {
          bColor = '#b91c1c';
          bGlow = '#f97316';
          bLabel = '🔥 LAVA TITAN';
          emoji = '🔥';
        }

        ctx.shadowBlur = 25;
        ctx.shadowColor = bGlow;
        ctx.fillStyle = bColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;

        // Custom boss drawings
        if (bossType === 'Storm Spirit') {
          // Cloud puff shape
          ctx.beginPath();
          ctx.arc(boss.x + 30, boss.y + 30, 25, 0, Math.PI * 2);
          ctx.arc(boss.x + 60, boss.y + 25, 28, 0, Math.PI * 2);
          ctx.arc(boss.x + 45, boss.y + 60, 25, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (bossType === 'Crystal Guardian') {
          // Sharp geode crystal cluster
          ctx.beginPath();
          ctx.moveTo(boss.x + boss.width / 2, boss.y);
          ctx.lineTo(boss.x + boss.width, boss.y + boss.height / 3);
          ctx.lineTo(boss.x + boss.width * 0.8, boss.y + boss.height);
          ctx.lineTo(boss.x + boss.width * 0.2, boss.y + boss.height);
          ctx.lineTo(boss.x, boss.y + boss.height / 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (bossType === 'Lava Titan') {
          // Rugged stone slate face
          ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
          ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
          // Glowing lava cracks
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(boss.x + 10, boss.y + 25, boss.width - 20, 4);
          ctx.fillRect(boss.x + 15, boss.y + 50, boss.width - 30, 4);
        } else {
          // Ancient Dragon (winged reptile head)
          ctx.beginPath();
          ctx.ellipse(boss.x + boss.width/2, boss.y + boss.height/2, boss.width/2, boss.height/3, 0, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Horns
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(boss.x + 20, boss.y + 10);
          ctx.lineTo(boss.x + 10, boss.y - 12);
          ctx.lineTo(boss.x + 30, boss.y + 5);
          ctx.closePath();
          ctx.fill();
        }

        // Draw Boss text & labels
        ctx.fillStyle = '#fbcfe8';
        ctx.font = 'bold 11px monospace';
        ctx.shadowBlur = 0; // turn off shadow for text
        ctx.fillText(`${emoji} ${bLabel}`, boss.x - 10, boss.y - 12);

        // Draw HP bar
        const hpPercent = boss.hp / boss.maxHp;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(boss.x - 15, boss.y + boss.height + 14, boss.width + 30, 6);
        ctx.fillStyle = bGlow;
        ctx.fillRect(boss.x - 15, boss.y + boss.height + 14, (boss.width + 30) * hpPercent, 6);

        // Projectiles
        boss.projectiles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = bGlow;
          ctx.shadowBlur = 18;
          ctx.shadowColor = bGlow;
          ctx.fill();
        });
        ctx.restore();
      }

      // F. RENDER PLAYABLE DRAGON
      ctx.save();
      ctx.translate(game.dragonX + game.dragonWidth / 2, game.dragonY + game.dragonHeight / 2);
      ctx.rotate(game.rotation);

      // Render the player's dragon body (crisp responsive Canvas drawing)
      const isAltSkin = stats.selectedSkin !== 'Standard';
      const bodyColor = activeBoost ? '#eab308' : isAltSkin ? '#d946ef' : '#3b82f6';
      const wingColor = activeBoost ? '#fbbf24' : isAltSkin ? '#a855f7' : '#1d4ed8';

      // Wings flap animation scaling based on ticker time
      const flapFactor = Math.sin(Date.now() * 0.02) * 10;

      // Draw tail behind body
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.quadraticCurveTo(-25, 15, -30, 5);
      ctx.lineTo(-25, 0);
      ctx.closePath();
      ctx.fill();

      // Wing back
      ctx.fillStyle = wingColor;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-25, -25 - flapFactor);
      ctx.lineTo(-15, -5);
      ctx.fill();

      // Body circle oval
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 5, 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden belly
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(5, 7, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(15, -8, 12, 0, Math.PI * 2);
      ctx.fill();

      // Horns
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(12, -18);
      ctx.lineTo(8, -26);
      ctx.lineTo(16, -20);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(18, -10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(17, -11, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Little golden beak mouth
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(25, -8);
      ctx.lineTo(29, -6);
      ctx.lineTo(25, -4);
      ctx.closePath();
      ctx.fill();

      // Wing front
      ctx.fillStyle = wingColor;
      ctx.beginPath();
      ctx.moveTo(-2, -2);
      ctx.lineTo(-18, -22 + flapFactor);
      ctx.lineTo(-10, -2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // G. RENDER SHIELD ENERGY WAVE BUBBLE
      if (activeShield) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(game.dragonX + game.dragonWidth / 2, game.dragonY + game.dragonHeight / 2, 34, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // H. RENDER WEATHER SYSTEMS & STORMS (Wind, Fog, Meteors, Lightning)
      // 1. Meteors drawing
      game.meteors.forEach((m) => {
        ctx.save();
        if (m.warningTimer > 0) {
          const blink = Math.floor(Date.now() / 150) % 2 === 0;
          if (blink) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(canvas.width - 50, 80, 25, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('☄️ METEOR INCOMING', canvas.width - 130, 120);
          }
        } else {
          const radGrad = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, m.radius);
          radGrad.addColorStop(0, '#fef08a');
          radGrad.addColorStop(0.4, '#f97316');
          radGrad.addColorStop(1, '#7c2d12');
          ctx.fillStyle = radGrad;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ef4444';
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + 35, m.y - 20);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 2. Lightning drawing
      game.lightningStrikes.forEach((ls) => {
        ctx.save();
        if (ls.warningTimer > 0) {
          const blink = Math.floor(Date.now() / 180) % 2 === 0;
          ctx.fillStyle = blink ? 'rgba(234, 179, 8, 0.25)' : 'rgba(234, 179, 8, 0.08)';
          ctx.fillRect(ls.x, 0, ls.width, canvas.height - 40);
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ls.x, 0, ls.width, canvas.height - 40);
        } else if (ls.active) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.strokeStyle = '#facc15';
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#fbbf24';
          ctx.lineWidth = 5;

          ctx.beginPath();
          ctx.moveTo(ls.x + ls.width / 2, 0);
          ctx.lineTo(ls.x + 10, canvas.height * 0.3);
          ctx.lineTo(ls.x + ls.width - 10, canvas.height * 0.6);
          ctx.lineTo(ls.x + ls.width / 2, canvas.height - 40);
          ctx.stroke();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(ls.x + ls.width / 2, canvas.height - 40, 30, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 3. Fog zone mist overlay
      if (fogActive) {
        ctx.save();
        const fogGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        fogGrad.addColorStop(0, 'rgba(241, 245, 249, 0.6)');
        fogGrad.addColorStop(0.5, 'rgba(241, 245, 249, 0.45)');
        fogGrad.addColorStop(1, 'rgba(241, 245, 249, 0.6)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Loop request
      if (isPlaying && !game.isGameOver) {
        updateGame();
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, activeShield, activeMagnet, activeBoost, activeSlowMo, activeRainbow]);

  const handlePlayerFlap = () => {
    if (isGameOver) return;
    if (!isPlaying) {
      setIsPlaying(true);
      stateRef.current.isGameOver = false;
    }
    audio.playFlap();
    stateRef.current.dragonVy = stateRef.current.flapStrength;

    // Trigger magical wing puff particles
    const game = stateRef.current;
    for (let i = 0; i < 4; i++) {
      game.particles.push({
        x: game.dragonX - 10,
        y: game.dragonY + 16,
        vx: -2 - Math.random() * 2,
        vy: Math.random() * 2 - 1,
        size: Math.random() * 3 + 1,
        color: '#bae6fd',
        alpha: 0.7,
        life: 0,
        maxLife: 15,
      });
    }
  };

  const checkCollision = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) => {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  };

  const handleCrystalCollect = (obj: GameObject) => {
    const game = stateRef.current;
    game.crystalsCollected++;
    setCrystals(game.crystalsCollected);

    // Dynamic Combo Multiplier
    game.comboTimer = 2200; // Reset combo countdown
    game.comboLevel = Math.min(10, game.comboLevel + 1);
    setCombo(game.comboLevel);

    const bonusPoints = 10 * game.comboLevel;
    game.score += bonusPoints;
    setScore(game.score);

    audio.playCrystal(game.comboLevel);

    // Spawn high-contrast collecting spark particles
    for (let i = 0; i < 6; i++) {
      game.particles.push({
        x: obj.x + obj.width / 2,
        y: obj.y + obj.y / 2,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        size: Math.random() * 3 + 1.5,
        color: '#38bdf8',
        alpha: 1,
        life: 0,
        maxLife: 20,
      });
    }
  };

  const handlePowerupCollect = (type: string) => {
    const game = stateRef.current;
    audio.playPowerup();

    if (type === 'shield') {
      setActiveShield(true);
      game.powerupDurations.shield = 8000; // 8 seconds
    } else if (type === 'magnet') {
      setActiveMagnet(true);
      game.powerupDurations.magnet = 10000; // 10 seconds
    } else if (type === 'boost') {
      setActiveBoost(true);
      game.powerupDurations.boost = 4000; // 4 seconds invincibility speed
    } else if (type === 'slowmo') {
      setActiveSlowMo(true);
      game.powerupDurations.slowmo = 8000;
    } else if (type === 'rainbow') {
      setActiveRainbow(true);
      game.powerupDurations.rainbow = 8000;
    } else if (type === 'treasure') {
      game.coinsEarned += 100;
      setCoins(game.coinsEarned);
      game.score += 200;
      setScore(game.score);
    }
  };

  const handleRareCrystalCollect = (type: string) => {
    const game = stateRef.current;
    let multiplier = 1;
    let color = '#38bdf8';
    let rewardCrystals = 1;

    if (type === 'rare-crystal-blue') {
      multiplier = 2;
      color = '#2563eb';
      rewardCrystals = 1;
    } else if (type === 'rare-crystal-purple') {
      multiplier = 3;
      color = '#8b5cf6';
      rewardCrystals = 2;
    } else if (type === 'rare-crystal-gold') {
      multiplier = 5;
      color = '#eab308';
      rewardCrystals = 3;
    } else if (type === 'rare-crystal-rainbow') {
      multiplier = 8;
      color = '#ec4899';
      rewardCrystals = 5;
    } else if (type === 'rare-crystal-legendary') {
      multiplier = 15;
      color = '#10b981';
      rewardCrystals = 10;
    }

    game.crystalsCollected += rewardCrystals;
    setCrystals(game.crystalsCollected);

    game.comboTimer = 2500;
    game.comboLevel = Math.min(10, game.comboLevel + 2);
    setCombo(game.comboLevel);

    const bonusPoints = 50 * multiplier * game.comboLevel;
    game.score += bonusPoints;
    setScore(game.score);

    audio.playPowerup();

    for (let i = 0; i < 12; i++) {
      game.particles.push({
        x: game.dragonX + game.dragonWidth / 2,
        y: game.dragonY + game.dragonHeight / 2,
        vx: Math.random() * 8 - 4,
        vy: Math.random() * 8 - 4,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: 25,
      });
    }
  };

  const handlePortalCollect = (type: string) => {
    const game = stateRef.current;
    audio.playPowerup();

    if (type === 'speed-portal-blue') {
      setActiveBoost(true);
      game.powerupDurations.boost = 4000;
      setDangerWarning('⏩ HIGH SPEED PORTAL!');
    } else if (type === 'speed-portal-purple') {
      setActiveSlowMo(true);
      game.powerupDurations.slowmo = 5000;
      setDangerWarning('⏰ CHILL SLOW-MO ZONE!');
    } else if (type === 'speed-portal-gold') {
      setActiveShield(true);
      game.powerupDurations.shield = 6000;
      game.score += 250;
      setScore(game.score);
      setDangerWarning('🛡️ CELESTIAL INVINCIBILITY!');
    } else if (type === 'speed-portal-green') {
      game.coinsEarned += 150;
      setCoins(game.coinsEarned);
      game.score += 300;
      setScore(game.score);
      setDangerWarning('🪙 BONUS WEALTH ZONE!');
    }

    setTimeout(() => setDangerWarning(''), 2000);

    for (let i = 0; i < 15; i++) {
      game.particles.push({
        x: game.dragonX + game.dragonWidth / 2,
        y: game.dragonY + game.dragonHeight / 2,
        vx: Math.random() * 6 - 3,
        vy: Math.random() * 6 - 3,
        size: Math.random() * 3 + 2,
        color: '#10b981',
        alpha: 1,
        life: 0,
        maxLife: 20,
      });
    }
  };

  const triggerExplosion = (x: number, y: number, color: string, count = 10) => {
    const game = stateRef.current;
    for (let i = 0; i < count; i++) {
      game.particles.push({
        x,
        y,
        vx: Math.random() * 6 - 3,
        vy: Math.random() * 6 - 3,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: 30,
      });
    }
  };

  const triggerBossHurt = () => {
    const game = stateRef.current;
    if (!game.boss) return;
    const boss = game.boss;
    boss.hp = Math.max(0, boss.hp - 8);
    setBossHp(boss.hp);

    triggerExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#fb7185', 8);

    if (boss.hp <= 0) {
      audio.playMagicExplosion();
      triggerExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#fb923c', 30);
      game.boss = null;
      setBossActive(false);
      game.score += 1000; // Defeated boss score bonus
      game.coinsEarned += 250; // Defeated boss coin bonus
      setScore(game.score);
      setCoins(game.coinsEarned);
    }
  };

  const handlePlayerCrash = () => {
    if (activeShield || activeBoost) return;

    // Golden Shield cheat death chance!
    if (!hasCheatedDeath && stats.coins >= 200) {
      setHasCheatedDeath(true);
      setActiveShield(true);
      stateRef.current.powerupDurations.shield = 4000;
      stateRef.current.dragonY = 150;
      stateRef.current.dragonVy = -4;
      return;
    }

    // Actual Game Over
    const game = stateRef.current;
    game.isGameOver = true;
    setIsPlaying(false);
    setIsGameOver(true);
    audio.playGameOver();

    // Soft magical crash blast
    triggerExplosion(game.dragonX + 15, game.dragonY + 15, '#60a5fa', 20);

    // Save final scoring stats to metadata triggers
    setTimeout(() => {
      onGameEnd(game.score, Math.floor(game.distanceTraveled), game.crystalsCollected, game.coinsEarned, game.comboLevel, false);
    }, 1500);
  };

  return (
    <div
      ref={containerRef}
      id="game-mode-stage"
      className="relative w-full h-full min-h-screen bg-slate-900 select-none overflow-hidden"
    >
      {/* 1. HTML5 High-Performance Game Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handlePlayerFlap}
        className="w-full h-full block cursor-pointer"
      />

      {/* 2. LIVE DASHBOARD HEADS-UP DISPLAY (Score, Distance, Coins, Combos) */}
      <div className="absolute top-4 inset-x-4 pointer-events-none flex flex-col space-y-2 z-20">
        <div className="flex justify-between items-center bg-slate-950/40 backdrop-blur-sm p-3 rounded-2xl border border-white/5">
          {/* Active stats */}
          <div className="text-left">
            <p className="text-[10px] font-mono text-slate-300 tracking-widest uppercase">SCORE</p>
            <p className="text-xl font-black text-white font-mono leading-none">{score}</p>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-mono text-slate-300 tracking-widest uppercase">DISTANCE</p>
            <p className="text-sm font-extrabold text-cyan-300 font-mono">{distance}m</p>
          </div>

          <div className="flex space-x-2 text-right">
            {/* Coins */}
            <div className="flex items-center space-x-1 bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
              <span className="text-xs">🪙</span>
              <span className="text-xs font-mono font-bold text-amber-400">{coins}</span>
            </div>
            {/* Crystals */}
            <div className="flex items-center space-x-1 bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
              <span className="text-xs">💎</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{crystals}</span>
            </div>
          </div>
        </div>

        {/* Dynamic active powerup indicators bar */}
        <div className="flex space-x-1.5 justify-start">
          {activeShield && (
            <div className="flex items-center space-x-1 bg-blue-500/25 border border-blue-400/30 px-2 py-0.5 rounded-full text-[9px] font-black text-blue-200 uppercase animate-pulse shadow-[0_0_8px_#3b82f6]">
              <Shield className="w-2.5 h-2.5" /> <span>SHIELD ACTIVE</span>
            </div>
          )}
          {activeMagnet && (
            <div className="flex items-center space-x-1 bg-rose-500/25 border border-rose-400/30 px-2 py-0.5 rounded-full text-[9px] font-black text-rose-200 uppercase animate-pulse shadow-[0_0_8px_#f43f5e]">
              <Magnet className="w-2.5 h-2.5" /> <span>MAGNET CHARGED</span>
            </div>
          )}
          {activeBoost && (
            <div className="flex items-center space-x-1 bg-amber-500/25 border border-amber-400/30 px-2 py-0.5 rounded-full text-[9px] font-black text-amber-200 uppercase animate-pulse shadow-[0_0_8px_#f59e0b]">
              <Zap className="w-2.5 h-2.5" /> <span>MEGA BOOST INVINCIBLE</span>
            </div>
          )}
          {activeSlowMo && (
            <div className="flex items-center space-x-1 bg-purple-500/25 border border-purple-400/30 px-2 py-0.5 rounded-full text-[9px] font-black text-purple-200 uppercase animate-pulse">
              <span>⏰ TIME SLOWED</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. COMBO ALERT FLOAT OVERLAY */}
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            className="absolute top-24 left-6 pointer-events-none z-20"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [1, 1.2, 1], rotate: -5 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="bg-gradient-to-r from-pink-500 to-amber-500 px-3.5 py-1 rounded-2xl border-2 border-yellow-300 font-sans font-black text-sm text-yellow-50 shadow-[0_4px_12px_rgba(236,72,153,0.5)] tracking-widest uppercase">
              COMBO x{combo}!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. BOSS FIGHT ALERT BANNER */}
      <AnimatePresence>
        {bossActive && (
          <motion.div
            className="absolute top-1/4 inset-x-6 text-center pointer-events-none z-20"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 p-3 rounded-2xl border-2 border-red-400 text-white shadow-[0_10px_30px_rgba(239,68,68,0.5)]">
              <p className="text-yellow-300 font-extrabold tracking-widest text-base uppercase flex justify-center items-center space-x-2">
                <AlertCircle className="w-5 h-5 animate-bounce" />
                <span>BOSS APPROACHING!</span>
              </p>
              <p className="text-xs font-mono text-red-100 uppercase mt-0.5">Dodge active magic spheres!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. START UP TAP SCREEN TO START GENTLE OVERLAY */}
      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col justify-center items-center p-6 text-center z-10">
          <motion.div
            className="flex flex-col items-center max-w-xs"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <span className="text-5xl mb-4">🐉</span>
            <p className="text-white font-black text-xl tracking-wider select-none uppercase">
              READY FOR SKY?
            </p>
            <p className="text-xs font-mono text-cyan-200 mt-1 uppercase">
              World: {activeWorld.name}
            </p>
            
            {/* Guide Info */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 mt-5 text-left w-full space-y-1.5 text-[11px] text-slate-300 font-mono">
              <p className="text-yellow-400 font-bold uppercase mb-1">How To Play:</p>
              <p>🟢 Tap to flap wings and gain height</p>
              <p>🟢 Release to glide down smoothly</p>
              <p>🟢 Avoid rock pillars & obstacles</p>
              <p>🟢 Collect Crystals for massive Combos</p>
            </div>

            <motion.div
              onClick={handlePlayerFlap}
              className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 font-sans font-black text-white shadow-lg cursor-pointer animate-bounce uppercase"
            >
              TAP TO FLAP WINGS
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* 6. GOAL/CHECKPOINT REACHED BANNER */}
      <AnimatePresence>
        {showGoalPrompt && (
          <motion.div
            className="absolute inset-x-6 top-1/3 text-center pointer-events-none z-30"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 p-5 rounded-3xl border-4 border-yellow-200 text-amber-950 shadow-[0_15px_40px_rgba(245,158,11,0.6)]">
              <p className="text-3xl font-black uppercase flex justify-center items-center space-x-2">
                <Sparkles className="w-8 h-8 text-yellow-50 animate-pulse" />
                <span>GOAL REACHED!</span>
              </p>
              <p className="text-xs font-mono font-bold uppercase tracking-wider mt-1">
                Checkpoint unlocked! Chest rewards incoming...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. PREMIUM ANIMATED WORLD BANNER */}
      <AnimatePresence>
        {showWorldBanner && (
          <motion.div
            className="absolute inset-x-6 top-1/4 flex flex-col items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0, y: -120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          >
            {/* Outer Glowing Box */}
            <div className="relative p-6 rounded-3xl bg-slate-950/90 border-2 border-yellow-400 backdrop-blur-md text-center max-w-xs shadow-[0_0_50px_rgba(234,179,8,0.7)] overflow-hidden">
              {/* Animated Shining Light Sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                style={{ width: '100%', height: '100%' }}
              />

              {/* Sparkles visuals */}
              <div className="absolute top-2 left-2 animate-pulse">
                <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]" />
              </div>
              <div className="absolute bottom-2 right-2 animate-pulse delay-500">
                <Sparkles className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              </div>

              {/* World Icon */}
              <div className="text-4xl mb-1 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {activeWorld.id === 'sky-kingdom' && '☁️'}
                {activeWorld.id === 'cloud-city' && '🌈'}
                {activeWorld.id === 'crystal-canyon' && '💎'}
                {activeWorld.id === 'frozen-peak' && '❄️'}
                {activeWorld.id === 'volcano-island' && '🌋'}
                {activeWorld.id === 'storm-valley' && '⚡'}
                {activeWorld.id === 'moon-realm' && '🌙'}
                {activeWorld.id === 'sun-temple' && '☀️'}
                {activeWorld.id === 'galaxy-sky' && '🌌'}
                {activeWorld.id === 'ancient-ruins' && '🏰'}
              </div>

              {/* World Title with Golden gradient text */}
              <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-amber-500 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {activeWorld.name}
              </h1>

              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto my-2" />

              <p className="text-[9px] font-mono tracking-widest uppercase text-yellow-300 font-bold">
                ✨ Entering Realm ✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
