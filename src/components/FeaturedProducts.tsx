import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Star, Award, ArrowRight } from 'lucide-react';
import { Product } from '../types.js';

interface FeaturedProductsProps {
  products: Product[];
  onBuy: (product: Product) => void;
}

export default function FeaturedProducts({ products, onBuy }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<'featured' | 'best' | 'new'>('featured');

  // Dynamically extract products for display to avoid mock dependencies
  const activeProducts = products.filter(p => p.active);

  // Group 1: Featured (sortOrder = 0 or 1, or higher priced ones)
  const featured = activeProducts
    .slice()
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  // Group 2: Best Sellers (arbitrary slice from the mid pricing)
  const bestSellers = activeProducts
    .slice()
    .reverse()
    .slice(0, 4);

  // Group 3: New Releases (by id/order of addition)
  const newReleases = activeProducts
    .slice()
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .slice(0, 4);

  const getDisplayedProducts = () => {
    switch (activeTab) {
      case 'featured':
        return featured;
      case 'best':
        return bestSellers;
      case 'new':
        return newReleases;
    }
  };

  const displayed = getDisplayedProducts();

  if (activeProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="featured-section">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="text-left max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#FF9F43] mb-4 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#FF7A00]" />
            <span>PLAYER FAVORITES</span>
          </div>
          <h2 className="font-display font-black text-4xl uppercase tracking-tight text-white italic">
            PREMIUM <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">COLLECTION</span>
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-[#111111]/80 border border-white/5 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'featured'
                ? 'bg-[#FF7A00] text-black font-black'
                : 'text-[#B3B3B3] hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Featured</span>
          </button>
          
          <button
            onClick={() => setActiveTab('best')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'best'
                ? 'bg-[#FF7A00] text-black font-black'
                : 'text-[#B3B3B3] hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Best Sellers</span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#FF7A00] text-black font-black'
                : 'text-[#B3B3B3] hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>New Releases</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayed.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col justify-between h-full overflow-hidden rounded-3xl bg-[#111111]/45 backdrop-blur-md border border-white/5 hover:border-[#FF7A00]/30 transition-all duration-300 shadow-xl"
            >
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-md bg-black/80 border border-white/10 text-[9px] font-mono font-bold text-[#FF9F43] uppercase tracking-wider">
                {p.gameMode === 'lifesteal' ? '⚔️ Lifesteal' : '🌲 Survival'}
              </div>

              {/* Card Banner / Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark sleek gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent"></div>
              </div>

              {/* Card Content body */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-display font-black text-base text-white group-hover:text-[#FF7A00] transition-colors tracking-tight uppercase line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-[#B3B3B3] text-[11px] leading-relaxed font-semibold line-clamp-2">
                    {p.description}
                  </p>
                </div>

                {/* Price and buy action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                      PRICE
                    </span>
                    <span className="font-display font-black text-xl text-white">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => onBuy(p)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-gradient-to-r hover:from-[#FF7A00] hover:to-[#FF9F43] hover:text-black hover:border-transparent font-display font-black text-[10px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <span>Buy</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
