import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Copy, Check, MessageSquare, Swords, Trees, Trophy, Users, Sparkles, Server, Zap } from 'lucide-react';
import { ServerStatus } from '../types.js';

interface HeroProps {
  setView: (view: string) => void;
  serverStatus: ServerStatus | null;
  addToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'advancement') => void;
}

interface RecentPurchase {
  username: string;
  productName: string;
  gameMode: string;
  price: number;
  status: string;
}

export default function Hero({ setView, serverStatus, addToast }: HeroProps) {
  const [copied, setCopied] = useState(false);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [activePromo, setActivePromo] = useState<any>(null);
  const [loadingPromo, setLoadingPromo] = useState(true);
  
  const ipAddress = serverStatus?.ip || 'rex-2.drexhost.in:19121';
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse coordinates for parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for lag-free cursor tracking
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Dynamic parallax transformations for multiple depth layers
  const textLayerX = useTransform(smoothX, [-300, 300], [-10, 10]);
  const textLayerY = useTransform(smoothY, [-300, 300], [-10, 10]);
  
  const itemLayerX1 = useTransform(smoothX, [-300, 300], [-25, 25]);
  const itemLayerY1 = useTransform(smoothY, [-300, 300], [-25, 25]);

  const itemLayerX2 = useTransform(smoothX, [-300, 300], [20, -20]);
  const itemLayerY2 = useTransform(smoothY, [-300, 300], [20, -20]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const copyIp = () => {
    navigator.clipboard.writeText(ipAddress);
    setCopied(true);
    addToast(
      "Server IP Copied",
      "Successfully copied rex-2.drexhost.in:19121! Direct connect in Minecraft.",
      "advancement"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchActivePromo = async () => {
    try {
      const res = await fetch('/api/coupons/active');
      const data = await res.json();
      setActivePromo(data);
    } catch (err) {
      console.error("Error fetching active promotion coupon", err);
    } finally {
      setLoadingPromo(false);
    }
  };

  useEffect(() => {
    fetch('/api/recent-purchases')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentPurchases(data);
        }
      })
      .catch(err => console.error("Error fetching recent purchases", err));

    fetchActivePromo();
    // Poll active promo every 30 seconds to update when admin updates coupons
    const interval = setInterval(fetchActivePromo, 30000);
    return () => clearInterval(interval);
  }, []);

  const latestPurchase = recentPurchases.length > 0 ? recentPurchases[0] : null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center min-h-[92vh] py-20 px-4 md:px-8 overflow-hidden select-none"
    >
      {/* Dynamic Ambient Floating Sparks (Canvas-free high-perf CSS implementation) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[15%] w-1.5 h-1.5 rounded-full bg-orange-500/45 animate-[ping_3s_infinite]" />
        <div className="absolute top-[40%] right-[10%] w-2.5 h-2.5 rounded-full bg-orange-400/30 animate-[ping_4s_infinite]" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[30%] left-[8%] w-2 h-2 rounded-full bg-orange-500/25 animate-[ping_5s_infinite]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[75%] left-[30%] w-1.5 h-1.5 rounded-full bg-white/20 animate-[ping_3.5s_infinite]" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[25%] right-[28%] w-2 h-2 rounded-full bg-orange-400/40 animate-[ping_4.5s_infinite]" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Interactive Floating 3D Minecraft Blocks Layer 1 */}
      <motion.div 
        style={{ x: itemLayerX1, y: itemLayerY1 }}
        className="absolute top-[15%] left-[6%] pointer-events-none opacity-40 xl:opacity-60 hidden lg:block z-0 select-none"
      >
        <motion.div 
          animate={{ y: [0, -12, 0], rotate: [8, 12, 8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF7A00]/25 to-black/60 border border-white/10 flex items-center justify-center text-2xl shadow-2xl backdrop-blur-sm"
        >
          ⚔️
        </motion.div>
      </motion.div>

      {/* Floating Voxel Item 2 */}
      <motion.div 
        style={{ x: itemLayerX2, y: itemLayerY2 }}
        className="absolute bottom-[20%] right-[5%] pointer-events-none opacity-35 xl:opacity-50 hidden lg:block z-0 select-none"
      >
        <motion.div 
          animate={{ y: [0, 14, 0], rotate: [-6, -10, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF9F43]/25 to-black/60 border border-white/10 flex items-center justify-center text-xl shadow-2xl backdrop-blur-sm"
        >
          💎
        </motion.div>
      </motion.div>

      {/* Floating Voxel Item 3 */}
      <motion.div 
        style={{ x: itemLayerX1, y: itemLayerY2 }}
        className="absolute top-[28%] right-[8%] pointer-events-none opacity-30 xl:opacity-45 hidden xl:block z-0 select-none"
      >
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [-12, -8, -12] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="w-12 h-12 rounded-xl bg-gradient-to-bl from-[#FF7A00]/20 to-black/60 border border-white/5 flex items-center justify-center text-lg shadow-2xl backdrop-blur-sm"
        >
          ❤️
        </motion.div>
      </motion.div>

      {/* Floating Voxel Item 4 */}
      <motion.div 
        style={{ x: itemLayerX2, y: itemLayerY1 }}
        className="absolute bottom-[28%] left-[10%] pointer-events-none opacity-25 xl:opacity-40 hidden xl:block z-0 select-none"
      >
        <motion.div 
          animate={{ y: [0, 12, 0], rotate: [10, 14, 10] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500/20 to-black/60 border border-white/5 flex items-center justify-center text-lg shadow-2xl backdrop-blur-sm"
        >
          🍎
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Main Tagline, Copy IP, CTAs) */}
          <div className="lg:col-span-8 text-left space-y-8">
            
            {/* Tagline Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9F43] animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-[#FF9F43] font-black uppercase">Official Web Store</span>
            </div>

            {/* Huge Premium Display Typography with Gradient text */}
            <motion.div 
              style={{ x: textLayerX, y: textLayerY }}
              className="space-y-4"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.9] uppercase italic"
              >
                <span className="block text-white">UNLEASH THE</span>
                <span className="block premium-orange-text drop-shadow-[0_4px_30px_rgba(255,122,0,0.35)]">
                  WARRIOR WITHIN
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-[#B3B3B3] text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl font-medium"
              >
                Welcome to Volex Network's premier web store. Support our server cluster featuring hyper-optimized Lifesteal and cozy Survival SMP realms. Unlock ranks, coin packs, mythical keys, and gorgeous cosmetics!
              </motion.p>
            </motion.div>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              {/* Premium IP Copy Container */}
              <div className="group relative flex items-center justify-between gap-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl pl-5 pr-1.5 py-1.5 shadow-2xl max-w-md w-full hover:border-[#FF7A00]/30 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[#B3B3B3] group-hover:text-white font-mono text-sm tracking-wider font-bold transition-colors">{ipAddress}</span>
                </div>
                <button 
                  onClick={copyIp}
                  className="bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] hover:brightness-110 text-black text-xs font-display font-black px-5 py-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,122,0,0.3)]"
                >
                  <span>{copied ? 'Copied' : 'Copy IP'}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                </button>
              </div>

              {/* Secondary CTA Button (Discord Link) */}
              <button
                onClick={() => setView('discord')}
                className="flex items-center justify-center gap-2 px-7 py-4.5 bg-white/5 hover:bg-white/10 text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl border border-white/10 hover:border-[#FF7A00]/30 hover:shadow-[0_0_20px_rgba(255,122,0,0.1)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#FF7A00]" />
                <span>Join Discord</span>
              </button>
            </motion.div>

            {/* Dynamic Statistics Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-4xl"
            >
              {/* Stat 1: Player Count */}
              <div className="glass-card p-5 rounded-3xl flex flex-col justify-between hover:border-[#FF7A00]/20 transition-all relative group overflow-hidden bg-black/40">
                <div className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-xl group-hover:bg-[#FF7A00]/10 transition-colors">
                  <Server className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <span className="text-[10px] font-mono font-black text-[#B3B3B3] uppercase">Online Players</span>
                <span className="text-2xl font-display font-black mt-2 text-white">
                  {serverStatus === null ? (
                    '...'
                  ) : !serverStatus.online ? (
                    <span className="text-red-500 font-bold">Offline</span>
                  ) : serverStatus.players?.online === 0 ? (
                    '0 Players'
                  ) : (
                    (serverStatus.players?.online ?? 0).toLocaleString()
                  )}
                  {serverStatus?.online && (
                    <span className="text-[10px] font-mono font-bold text-green-500 ml-1.5">PLAY</span>
                  )}
                </span>
              </div>

              {/* Stat 2: Discord Members */}
              <div className="glass-card p-5 rounded-3xl flex flex-col justify-between hover:border-[#FF7A00]/20 transition-all relative group overflow-hidden bg-black/40">
                <div className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-xl group-hover:bg-indigo-500/10 transition-colors">
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono font-black text-[#B3B3B3] uppercase">Community</span>
                <span className="text-2xl font-display font-black mt-2 text-white">
                  {serverStatus?.discordMembers ? serverStatus.discordMembers.toLocaleString() : '1,420'}
                  <span className="text-[10px] font-mono font-bold text-[#5865F2] ml-1.5">JOIN</span>
                </span>
              </div>

              {/* Stat 3: Active Promo (Linked to live Coupon System) */}
              <div className="glass-card p-5 rounded-3xl flex flex-col justify-between hover:border-[#FF7A00]/20 transition-all relative group overflow-hidden bg-black/40">
                <div className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-xl group-hover:bg-red-500/10 transition-colors">
                  <Zap className="w-4 h-4 text-red-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono font-black text-[#B3B3B3] uppercase">Active Promo</span>
                {loadingPromo ? (
                  <span className="text-xs font-mono text-zinc-500 mt-2">Loading...</span>
                ) : !activePromo ? (
                  <span className="text-base font-display font-black mt-2 text-zinc-500 leading-tight">
                    No Active Promotion
                  </span>
                ) : (
                  <div className="mt-1.5 text-left space-y-0.5">
                    <span className="text-glow-orange text-lg font-display font-black text-[#FF7A00] block tracking-wider leading-tight">
                      {activePromo.code}
                    </span>
                    <span className="text-xs font-display font-black text-white block leading-none">
                      {activePromo.discountType === 'percentage' ? `${activePromo.value}% OFF` : `$${activePromo.value} OFF`}
                    </span>
                    <span className="text-[8px] font-mono font-black text-zinc-400 block tracking-wider uppercase">
                      {activePromo.appliesTo === 'lifesteal' ? 'LIFESTEAL ONLY' : activePromo.appliesTo === 'survival' ? 'SURVIVAL ONLY' : 'GLOBAL'}
                    </span>
                    {activePromo.expiryDate && (
                      <span className="text-[7px] font-mono font-bold text-zinc-500 block leading-none mt-0.5">
                        EXP: {activePromo.expiryDate}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stat 4: Server Version */}
              <div className="glass-card p-5 rounded-3xl flex flex-col justify-between hover:border-[#FF7A00]/20 transition-all relative group overflow-hidden bg-black/40">
                <div className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-xl group-hover:bg-[#FF9F43]/10 transition-colors">
                  <Trophy className="w-4 h-4 text-[#FF9F43]" />
                </div>
                <span className="text-[10px] font-mono font-black text-[#B3B3B3] uppercase">Compatibility</span>
                <span className="text-xs font-mono font-black mt-2.5 text-white leading-tight">
                  {serverStatus?.version || '1.20.4 - 1.21.X'}
                  <span className="text-[8px] font-mono block text-[#B3B3B3] mt-0.5">JAVA & BEDROCK</span>
                </span>
              </div>
            </motion.div>

          </div>

          {/* Right Column (Latest Purchase Widget) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 flex justify-center lg:justify-end"
          >
            <div className="glass-card p-6 rounded-[28px] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group overflow-hidden hover:border-[#FF7A00]/30 transition-all duration-500 bg-black/40">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/10 rounded-full filter blur-[40px] group-hover:bg-[#FF7A00]/20 transition-all duration-500 pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] text-[#FF9F43] uppercase tracking-widest font-mono font-black flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-[#FF7A00] absolute"></span>
                  <span>LATEST PURCHASE</span>
                </p>
                <div className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-mono text-[#B3B3B3] font-bold uppercase tracking-wider">SECURE</div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl relative">
                <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {latestPurchase?.gameMode === 'survival' ? '🌲' : '⚔️'}
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    {latestPurchase ? latestPurchase.username : 'NotchMC'}
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" title="Online"></span>
                  </p>
                  <p className="text-xs text-[#FF9F43] uppercase tracking-wider font-black">
                    {latestPurchase 
                      ? `${latestPurchase.productName}`
                      : 'VIP+ RANK'
                    }
                  </p>
                  <span className="block text-[9px] text-[#B3B3B3] font-mono uppercase font-semibold">
                    {latestPurchase?.gameMode === 'survival' ? '🌲 Survival Realm' : '⚔️ Lifesteal Realm'}
                  </span>
                </div>
              </div>

              {/* Separator line */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-5"></div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#B3B3B3] font-black">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-green-500" />
                  <span>MC VERIFIED</span>
                </span>
                <span className="text-green-500 flex items-center gap-1.5 font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-lg">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span>DELIVERED</span>
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Quick Mode Selection Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mt-20"
        >
          {/* Lifesteal Selection Card */}
          <div
            onClick={() => setView('store-lifesteal')}
            className="group relative overflow-hidden rounded-3xl bg-[#111111]/40 backdrop-blur-md border border-white/10 hover:border-[#FF7A00]/40 hover:shadow-[0_20px_40px_rgba(255,122,0,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left p-8"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#FF7A00]/5 to-transparent rounded-full filter blur-xl group-hover:from-[#FF7A00]/15 transition-all pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-black group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300">
                <Swords className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-black text-xl text-white group-hover:text-[#FF7A00] transition-colors uppercase italic tracking-wide flex items-center gap-2">
                  <span>Lifesteal Realm</span>
                  <span className="text-[9px] font-mono font-bold tracking-normal uppercase bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-red-400">HARDCORE</span>
                </h3>
                <p className="text-[#B3B3B3] text-xs leading-relaxed font-semibold">
                  Steal hearts, win duels, dominate the leaderboard. Purchase legendary VIP & Champion ranks, coin bags, custom key packs, and dragon wings cosmetics.
                </p>
                <div className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-mono uppercase font-black text-[#FF7A00] tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>EXPLORE LIFESTEAL PRODUCTS</span>
                  <span>➔</span>
                </div>
              </div>
            </div>
          </div>

          {/* Survival Selection Card */}
          <div
            onClick={() => setView('store-survival')}
            className="group relative overflow-hidden rounded-3xl bg-[#111111]/40 backdrop-blur-md border border-white/10 hover:border-[#FF9F43]/40 hover:shadow-[0_20px_40px_rgba(255,159,67,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left p-8"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#FF9F43]/5 to-transparent rounded-full filter blur-xl group-hover:from-[#FF9F43]/15 transition-all pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="p-4 bg-amber-950/40 border border-amber-500/30 text-amber-500 rounded-2xl group-hover:bg-amber-500 group-hover:text-black group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300">
                <Trees className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-black text-xl text-white group-hover:text-[#FF9F43] transition-colors uppercase italic tracking-wide flex items-center gap-2">
                  <span>Survival SMP</span>
                  <span className="text-[9px] font-mono font-bold tracking-normal uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400">COZY PLAY</span>
                </h3>
                <p className="text-[#B3B3B3] text-xs leading-relaxed font-semibold">
                  Build custom claims, establish trades, and cozy up with friends. Purchase Overlord ranks, survival coins bundles, and mythical crate keys.
                </p>
                <div className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-mono uppercase font-black text-[#FF9F43] tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>EXPLORE SURVIVAL PRODUCTS</span>
                  <span>➔</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
