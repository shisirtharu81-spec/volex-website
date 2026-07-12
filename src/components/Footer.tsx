import React from 'react';
import { ShieldAlert, Heart, Terminal } from 'lucide-react';

import { WebsiteSettings } from '../types.js';

interface FooterProps {
  setView: (view: string) => void;
  currentView: string;
  websiteSettings?: WebsiteSettings | null;
}

export default function Footer({ setView, currentView, websiteSettings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/5 mt-24 relative overflow-hidden select-none">
      {/* Glow highlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#FF7A00]/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Network Branding */}
          <div className="md:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-3">
              {websiteSettings?.logoUrl ? (
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden shadow-[0_4px_15px_rgba(255,122,0,0.2)] p-0.5 bg-black/40 border border-white/10">
                  <img src={websiteSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#FF7A00] to-[#FF9F43] rounded-xl shadow-[0_4px_15px_rgba(255,122,0,0.3)]">
                  <span className="font-display font-black text-black text-lg">V</span>
                </div>
              )}
              <span className="font-display font-black tracking-wider text-xl premium-orange-text drop-shadow-[0_4px_10px_rgba(255,122,0,0.2)] uppercase">
                {websiteSettings?.websiteTitle || "VOLEX NETWORK"}
              </span>
            </div>
            <p className="text-[#B3B3B3] text-xs leading-relaxed max-w-sm font-semibold">
              The premier Minecraft server cluster featuring hyper-optimized Lifesteal and cozy Survival SMP realms. Connect and conquer today!
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">
              STORE COLLECTIONS
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-black font-display uppercase tracking-wider">
              <button onClick={() => setView('store-lifesteal')} className="text-[#B3B3B3] hover:text-[#FF7A00] transition-colors w-fit cursor-pointer text-left">
                Lifesteal Shop
              </button>
              <button onClick={() => setView('store-survival')} className="text-[#B3B3B3] hover:text-[#FF7A00] transition-colors w-fit cursor-pointer text-left">
                Survival Shop
              </button>
              <button onClick={() => setView('store-all')} className="text-[#B3B3B3] hover:text-[#FF7A00] transition-colors w-fit cursor-pointer text-left">
                All Products
              </button>
            </div>
          </div>

          {/* Column 3: Help & Support */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">
              SUPPORT & HELP
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-black font-display uppercase tracking-wider">
              <button onClick={() => setView('discord')} className="text-[#B3B3B3] hover:text-[#FF7A00] transition-colors w-fit cursor-pointer text-left">
                Join Discord
              </button>
              <button onClick={() => setView('faq')} className="text-[#B3B3B3] hover:text-[#FF7A00] transition-colors w-fit cursor-pointer text-left">
                General FAQ
              </button>
              <button onClick={() => setView('support')} className="text-[#B3B3B3] hover:text-[#FF7A00] transition-colors w-fit cursor-pointer text-left">
                Contact Support
              </button>
              
              {/* Secret/Console Shortcut for Admin Dashboard */}
              <button 
                onClick={() => setView('admin')} 
                className={`flex items-center gap-2 transition-all text-left w-fit cursor-pointer ${
                  currentView === 'admin' ? 'text-[#FF7A00]' : 'text-zinc-650 hover:text-zinc-400'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Disclaimer row (REQUIRED FOR MINECRAFT COMPLIANCE) */}
        <div className="pt-10 border-t border-white/5 text-center space-y-6">
          <div className="bg-[#111111]/40 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-center text-left max-w-5xl mx-auto">
            <ShieldAlert className="w-6 h-6 text-zinc-600 flex-shrink-0" />
            <p className="text-[10px] text-zinc-500 font-sans leading-relaxed font-semibold">
              <span className="text-zinc-400 font-bold">MOJANG COMPLIANCE DISCLAIMER:</span> We are not affiliated, associated, or endorsed by Mojang AB or Microsoft Studios. Any purchase made on this store directly funds the operation and development of the server network. Minecraft is trademark of Mojang Synergies AB.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-zinc-600 uppercase font-bold tracking-widest">
            <span>
              &copy; {currentYear} {websiteSettings?.websiteTitle || "VOLEX NETWORK"}. ALL RIGHTS RESERVED.
            </span>
            <span className="flex items-center gap-1.5 normal-case font-sans text-zinc-500">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-600 animate-pulse" /> for {websiteSettings?.websiteTitle || "Volex"} Minecraft Players.
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
