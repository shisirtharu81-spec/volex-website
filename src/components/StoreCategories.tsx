import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Flame, Star, Coins, Key, Palette, Eye, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Product, Category } from '../types.js';

interface StoreCategoriesProps {
  initialMode?: 'all' | 'lifesteal' | 'survival';
  products: Product[];
  categories: Category[];
  onBuy: (product: Product) => void;
}

export default function StoreCategories({ initialMode = 'all', products, categories, onBuy }: StoreCategoriesProps) {
  const [activeMode, setActiveMode] = useState<'lifesteal' | 'survival'>(
    initialMode === 'all' || initialMode === 'lifesteal' ? 'lifesteal' : 'survival'
  );
  
  // Track selected category sub-filter
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialMode !== 'all') {
      setActiveMode(initialMode as 'lifesteal' | 'survival');
    }
    // Reset category filter when game mode changes
    setSelectedCategorySlug('all');
  }, [initialMode]);

  // Filter categories corresponding to current active gameMode
  const activeCategories = categories.filter(c => c.gameMode === activeMode);

  // Filter products by mode, category, and search query
  const filteredProducts = products.filter(p => {
    // 1. Filter by Game Mode
    if (p.gameMode !== activeMode) return false;

    // 2. Filter by Category Slug
    if (selectedCategorySlug !== 'all') {
      const category = categories.find(c => c.id === p.category);
      if (!category || category.slug !== selectedCategorySlug) return false;
    }

    // 3. Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      return matchName || matchDesc;
    }

    return true;
  });

  // Helper to get category icons for display
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'ranks':
        return <Star className="w-4 h-4 text-[#FF7A00]" />;
      case 'coins':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'crate-keys':
        return <Key className="w-4 h-4 text-yellow-400" />;
      case 'cosmetics':
        return <Palette className="w-4 h-4 text-purple-400" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-[#FF7A00]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="store-section">
      
      {/* Top Banner & Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#FF9F43] mb-4 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#FF7A00]" />
          <span>Volex Secure checkout</span>
        </div>
        <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white italic">
          VOLEX <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">NETWORK STORE</span>
        </h2>
        <p className="text-[#B3B3B3] text-xs sm:text-sm mt-3 font-semibold leading-relaxed">
          Upgrade your gameplay. Explore our fully loaded server store containing legendary donor ranks, custom economy coins, premium keys, and exclusive cosmetics.
        </p>
      </div>

      {/* Main Game Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 max-w-xl mx-auto">
        <button
          onClick={() => { setActiveMode('lifesteal'); setSelectedCategorySlug('all'); }}
          className={`w-full flex items-center justify-center gap-3 px-8 py-5 font-display font-black text-xs uppercase tracking-wider rounded-2xl border transition-all duration-300 cursor-pointer ${
            activeMode === 'lifesteal'
              ? 'bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] border-transparent text-black shadow-[0_10px_25px_rgba(255,122,0,0.3)] scale-[1.02]'
              : 'bg-[#111111]/80 border-white/5 text-[#B3B3B3] hover:text-white hover:border-white/10 hover:bg-[#111111]'
          }`}
        >
          <Flame className={`w-5 h-5 ${activeMode === 'lifesteal' ? 'text-black' : 'text-[#FF7A00]'}`} />
          <span>Lifesteal Store</span>
        </button>

        <button
          onClick={() => { setActiveMode('survival'); setSelectedCategorySlug('all'); }}
          className={`w-full flex items-center justify-center gap-3 px-8 py-5 font-display font-black text-xs uppercase tracking-wider rounded-2xl border transition-all duration-300 cursor-pointer ${
            activeMode === 'survival'
              ? 'bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] border-transparent text-black shadow-[0_10px_25px_rgba(255,122,0,0.3)] scale-[1.02]'
              : 'bg-[#111111]/80 border-white/5 text-[#B3B3B3] hover:text-white hover:border-white/10 hover:bg-[#111111]'
          }`}
        >
          <Star className={`w-5 h-5 ${activeMode === 'survival' ? 'text-black' : 'text-amber-400'}`} />
          <span>Survival Store</span>
        </button>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 bg-[#111111]/45 backdrop-blur-md p-5 sm:p-7 rounded-3xl border border-white/5 shadow-2xl">
        
        {/* Category Sub-Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSelectedCategorySlug('all')}
            className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              selectedCategorySlug === 'all'
                ? 'bg-white/5 border-white/10 text-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.15)]'
                : 'bg-transparent border-transparent text-[#B3B3B3] hover:text-white hover:bg-white/5'
            }`}
          >
            All Items
          </button>
          
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                selectedCategorySlug === cat.slug
                  ? 'bg-white/5 border-white/10 text-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.15)]'
                  : 'bg-transparent border-transparent text-[#B3B3B3] hover:text-white hover:bg-white/5'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Search Box */}
        <div className="relative w-full lg:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-3 rounded-2xl bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-sm placeholder-zinc-500 focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] transition-all font-sans font-semibold"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
            >
              CLEAR
            </button>
          )}
        </div>

      </div>

      {/* Interactive Products Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((p) => {
              const catObj = categories.find(c => c.id === p.category);
              const isHighValue = p.price >= 20;
              
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ y: -6 }}
                  className={`group relative flex flex-col justify-between h-full overflow-hidden rounded-3xl bg-[#111111]/90 border transition-all duration-300 ${
                    isHighValue 
                      ? 'border-[#FF7A00]/30 hover:border-[#FF7A00]/70 hover:shadow-[0_15px_30px_rgba(255,122,0,0.15)]' 
                      : 'border-white/5 hover:border-white/20 hover:shadow-2xl'
                  }`}
                >
                  
                  {/* High Value Glowing tag */}
                  {isHighValue && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] text-[9px] font-mono font-black uppercase text-black tracking-widest glow-orange shadow-lg">
                      Elite Offer
                    </div>
                  )}

                  {/* Card Banner / Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Dark sleek gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent"></div>
                    
                    {/* Category Label Overlay */}
                    <span className="absolute bottom-4 left-4 px-2.5 py-0.5 rounded-md bg-black/85 border border-white/10 text-[9px] font-mono font-bold text-[#FF9F43] uppercase tracking-widest">
                      {catObj ? catObj.name : 'STORE'}
                    </span>
                  </div>

                  {/* Card Content body */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-display font-black text-lg text-white group-hover:text-[#FF7A00] transition-colors tracking-tight leading-tight uppercase">
                        {p.name}
                      </h3>
                      <p className="text-[#B3B3B3] text-xs leading-relaxed font-semibold line-clamp-3">
                        {p.description}
                      </p>
                    </div>

                    {/* Bottom Price + Action CTA */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                          PRICE
                        </span>
                        <span className="font-display font-black text-2xl text-white">
                          ${p.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => onBuy(p)}
                        className={`flex items-center justify-center gap-1.5 px-5 py-3 font-display font-black text-[11px] uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                          isHighValue
                            ? 'bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] text-black hover:brightness-110 shadow-[0_5px_15px_rgba(255,122,0,0.3)]'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-gradient-to-r hover:from-[#FF7A00] hover:to-[#FF9F43] hover:text-black hover:border-transparent'
                        }`}
                      >
                        <span>Purchase</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-[#111111]/40 border border-white/5 rounded-3xl w-full shadow-2xl">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4 animate-pulse" />
            <h3 className="font-display font-black text-lg text-[#B3B3B3] uppercase tracking-wider">No products available.</h3>
            <p className="text-zinc-500 text-xs mt-2 max-w-sm mx-auto font-semibold leading-relaxed">
              Products are currently being updated by our server administrators. Please check back later!
            </p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
