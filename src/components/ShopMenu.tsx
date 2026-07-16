/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { audio } from '../audio';
import { PlayerStats } from '../types';

interface ShopMenuProps {
  stats: PlayerStats;
  onBack: () => void;
  onBuyCoins: (coins: number, priceCrystals: number) => void;
  onBuyCrystals: (crystals: number, priceUSD: number) => void;
  onBuyBundle: (name: string, coins: number, crystals: number, priceUSD: number) => void;
}

const COIN_PACKS = [
  { coins: 1000, priceCrystals: 10, icon: '🪙', label: 'Tamer Bag' },
  { coins: 5000, priceCrystals: 45, icon: '💰', label: 'Guardian Chest' },
  { coins: 15000, priceCrystals: 120, icon: '👑', label: 'Sky Vault' }
];

const CRYSTAL_PACKS = [
  { crystals: 50, priceUSD: 1.99, icon: '💎', label: 'Shard Box' },
  { crystals: 150, priceUSD: 4.99, icon: '🔮', label: 'Prism Satchel' },
  { crystals: 500, priceUSD: 14.99, icon: '🌌', label: 'Galaxy Core' }
];

const BUNDLES = [
  { name: 'Starter Hatch Pack', coins: 3000, crystals: 100, priceUSD: 3.99, icon: '🎁', desc: 'Get a headstart with hatching currency!' },
  { name: 'Mythic Wyrm Legacy', coins: 10000, crystals: 400, priceUSD: 9.99, icon: '🐉', desc: 'Supercharge your dragon collection!' }
];

export default function ShopMenu({ stats, onBack, onBuyCoins, onBuyCrystals, onBuyBundle }: ShopMenuProps) {
  const [activeCategory, setActiveCategory] = useState<'currencies' | 'bundles'>('currencies');

  const handleCoinPurchase = (pack: any) => {
    if (stats.crystals < pack.priceCrystals) {
      audio.playTap();
      return;
    }
    audio.playMagicExplosion();
    onBuyCoins(pack.coins, pack.priceCrystals);
  };

  const handleCrystalPurchase = (pack: any) => {
    audio.playMagicExplosion();
    onBuyCrystals(pack.crystals, pack.priceUSD);
  };

  const handleBundlePurchase = (bundle: any) => {
    audio.playMagicExplosion();
    onBuyBundle(bundle.name, bundle.coins, bundle.crystals, bundle.priceUSD);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-transparent flex flex-col justify-between p-6 select-none text-white">
      {/* HEADER BAR - Vibrant Palette Style */}
      <div className="flex justify-between items-center z-10">
        <button
          id="btn-shop-back"
          onClick={() => { audio.playTap(); onBack(); }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-slate-400 to-slate-600 border-b-4 border-slate-800 text-white text-[10px] font-black tracking-wider transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md uppercase"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> <span>BACK</span>
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_0_rgba(15,23,42,1)] font-display flex items-center space-x-1.5">
          <ShoppingBag className="w-5 h-5 text-yellow-300" />
          <span>fantasy shop</span>
        </h2>
        <div className="bg-black/30 backdrop-blur-md border-2 border-cyan-400 rounded-full py-0.5 px-3 flex items-center shadow-lg">
          <span className="text-sm mr-1">💎</span>
          <span className="text-xs font-black font-mono text-white">{stats.crystals}</span>
        </div>
      </div>

      {/* SHOP SWITCHER TABS - Glassmorphic and Tactile */}
      <div className="grid grid-cols-2 gap-1.5 z-10 mt-4 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border-2 border-white/20 shadow-xl">
        <button
          id="tab-shop-currencies"
          onClick={() => { audio.playTap(); setActiveCategory('currencies'); }}
          className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
            activeCategory === 'currencies'
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-800 text-white shadow-md'
              : 'text-slate-300 hover:text-white font-bold hover:bg-white/5'
          }`}
        >
          🪙 Currencies
        </button>
        <button
          id="tab-shop-bundles"
          onClick={() => { audio.playTap(); setActiveCategory('bundles'); }}
          className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
            activeCategory === 'bundles'
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-800 text-white shadow-md'
              : 'text-slate-300 hover:text-white font-bold hover:bg-white/5'
          }`}
        >
          🎁 Special Bundles
        </button>
      </div>

      {/* SHOP CATEGORY CONTAINER */}
      <div className="my-auto flex flex-col justify-start items-center min-h-[360px] z-10 w-full overflow-y-auto max-h-[420px] py-2">
        {activeCategory === 'currencies' ? (
          /* COIN AND CRYSTAL PACKS LIST */
          <div className="w-full max-w-sm space-y-4">
            {/* Coins Section */}
            <div className="space-y-2 text-left">
              <p className="text-[9px] font-mono font-black text-amber-300 uppercase tracking-widest pl-1">
                EXCHANGE CRYSTALS FOR COINS
              </p>
              
              <div className="grid grid-cols-3 gap-2.5">
                {COIN_PACKS.map((pack) => (
                  <div key={pack.coins} className="bg-black/20 p-3 rounded-2xl border-2 border-white/10 flex flex-col justify-between items-center text-center">
                    <span className="text-3xl mb-1.5">{pack.icon}</span>
                    <p className="text-[10px] font-black text-white uppercase truncate w-full">{pack.label}</p>
                    <p className="text-[10px] text-amber-300 font-mono font-black mt-0.5">+{pack.coins}🪙</p>
                    
                    <button
                      id={`btn-shop-buy-coins-${pack.coins}`}
                      onClick={() => handleCoinPurchase(pack)}
                      className="mt-2 w-full py-1.5 bg-gradient-to-b from-cyan-400 to-cyan-600 border-b-4 border-cyan-800 rounded-xl text-[10px] font-black text-white uppercase cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md"
                    >
                      💎 {pack.priceCrystals}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Crystals Section */}
            <div className="space-y-2 text-left pt-2">
              <p className="text-[9px] font-mono font-black text-cyan-300 uppercase tracking-widest pl-1">
                ACQUIRE MAGICAL CRYSTAL SHARDS
              </p>
              
              <div className="grid grid-cols-3 gap-2.5">
                {CRYSTAL_PACKS.map((pack) => (
                  <div key={pack.crystals} className="bg-black/20 p-3 rounded-2xl border-2 border-white/10 flex flex-col justify-between items-center text-center">
                    <span className="text-3xl mb-1.5">{pack.icon}</span>
                    <p className="text-[10px] font-black text-white uppercase truncate w-full">{pack.label}</p>
                    <p className="text-[10px] text-cyan-300 font-mono font-black mt-0.5">+{pack.crystals}💎</p>
                    
                    <button
                      id={`btn-shop-buy-crystals-${pack.crystals}`}
                      onClick={() => handleCrystalPurchase(pack)}
                      className="mt-2 w-full py-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-4 border-yellow-800 rounded-xl text-[10px] font-black text-white uppercase cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md"
                    >
                      ${pack.priceUSD}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* BUNDLES LIST */
          <div className="w-full max-w-sm space-y-3.5">
            {BUNDLES.map((b) => (
              <div key={b.name} className="bg-black/30 backdrop-blur-md border-2 border-white/20 p-4 rounded-2xl flex justify-between items-center text-left shadow-xl">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-wide">{b.name}</p>
                      <p className="text-[9px] font-mono text-amber-300 uppercase font-black">
                        Includes: 🪙{b.coins} • 💎{b.crystals}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-2 leading-tight">
                    {b.desc}
                  </p>
                </div>

                <button
                  id={`btn-shop-bundle-${b.name}`}
                  onClick={() => handleBundlePurchase(b)}
                  className="px-4 py-2 bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-4 border-yellow-800 rounded-xl text-[10px] font-black text-white uppercase cursor-pointer active:translate-y-0.5 active:border-b-2 shadow-md flex flex-col items-center"
                >
                  <span>BUY</span>
                  <span className="text-[8px] font-mono font-black">${b.priceUSD}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="text-center text-[10px] font-mono text-slate-400 z-10 mt-4 uppercase tracking-wider">
        GOOGLE PLAY IN-APP PURCHASES DECLARED • OFFLINE ACTIVE
      </div>
    </div>
  );
}
