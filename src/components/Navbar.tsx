import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Menu, X, MessageSquare, ExternalLink, Globe } from 'lucide-react';
import { ServerStatus, WebsiteSettings } from '../types.js';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  serverStatus: ServerStatus | null;
  addToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'advancement') => void;
  mcUsername: string | null;
  onLogout: () => void;
  websiteSettings?: WebsiteSettings | null;
}

export default function Navbar({ currentView, setView, serverStatus, addToast, mcUsername, onLogout, websiteSettings }: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const ipAddress = serverStatus?.ip || 'rex-2.drexhost.in:19121';

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

  const menuItems = [
    { name: 'Home', view: 'home' },
    { name: 'Store', view: 'store-all' },
    { name: 'Lifesteal', view: 'store-lifesteal' },
    { name: 'Survival', view: 'store-survival' },
    { name: 'FAQ', view: 'faq' },
    { name: 'Support', view: 'support' },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 mt-4">
      <nav className="max-w-7xl mx-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Brand */}
            <div 
              onClick={() => { setView('home'); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {websiteSettings?.logoUrl ? (
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,122,0,0.3)] group-hover:shadow-[0_0_30px_rgba(255,122,0,0.5)] group-hover:scale-105 transition-all duration-300 p-0.5 bg-black/40 border border-white/10">
                  <img src={websiteSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#FF7A00] to-[#FF9F43] rounded-xl shadow-[0_0_20px_rgba(255,122,0,0.4)] group-hover:shadow-[0_0_30px_rgba(255,122,0,0.6)] group-hover:scale-105 transition-all duration-300">
                  <span className="font-display font-black text-white text-xl">V</span>
                  <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
                </div>
              )}
              <div>
                <span className="font-display font-black tracking-tighter uppercase italic text-xl text-white">
                  {websiteSettings?.websiteTitle ? (
                    <>
                      {websiteSettings.websiteTitle.split(' ').map((word, idx) => (
                        <span key={idx} className={idx > 0 ? "text-[#FF7A00] group-hover:text-[#FF9F43] transition-colors pl-1" : ""}>
                          {word}
                        </span>
                      ))}
                    </>
                  ) : (
                    <>
                      VOLEX<span className="text-[#FF7A00] group-hover:text-[#FF9F43] transition-colors">NETWORK</span>
                    </>
                  )}
                </span>
                <span className="block font-mono text-[9px] text-[#B3B3B3] uppercase tracking-widest font-bold leading-none mt-0.5">
                  {websiteSettings?.websiteTagline || "Official Web Store"}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => {
                const isActive = currentView === item.view || 
                                 (item.view === 'store-all' && (currentView.startsWith('store-') && currentView !== 'store-lifesteal' && currentView !== 'store-survival'));
                return (
                  <button
                    key={item.name}
                    onClick={() => setView(item.view)}
                    className={`relative px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all rounded-xl cursor-pointer ${
                      isActive 
                        ? 'text-[#FF7A00] bg-white/5' 
                        : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-glow-active" 
                        className="absolute bottom-1 left-4 right-4 h-[2px] bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] rounded-full" 
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Player Count & IP Connect Button */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Status Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <span className={`w-2 h-2 rounded-full ${serverStatus?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-mono text-[10px] uppercase font-bold text-[#B3B3B3]">
                  {serverStatus?.online 
                    ? `${serverStatus.players.online} ONLINE` 
                    : 'SERVER OFFLINE'}
                </span>
              </div>

              {/* Discord Button with Animated Border */}
              <a
                href="https://discord.gg/FAFYpg7MUD"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group overflow-hidden p-[1px] rounded-xl cursor-pointer hidden md:block"
              >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#5865F2_0%,#FF7A00_50%,#5865F2_100%)]" />
                <div className="inline-flex h-full w-full items-center justify-center rounded-xl bg-black px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-white backdrop-blur-3xl group-hover:bg-zinc-900/90 transition-all">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-[#5865F2]" />
                  <span>Discord</span>
                </div>
              </a>

              {/* IP Address Copy Button - Glowing */}
              <button
                onClick={copyIp}
                className="relative group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] hover:brightness-110 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_30px_rgba(255,122,0,0.5)] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="font-mono tracking-normal">{ipAddress}</span>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Profile Card & Dropdown */}
              {mcUsername && (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer select-none active:scale-98"
                  >
                    <div className="w-6 h-6 rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://mc-heads.net/avatar/${mcUsername}/24.png`}
                        alt={mcUsername}
                        className="w-5 h-5 pixelated"
                      />
                    </div>
                    <span className="font-display text-xs font-bold text-white tracking-wide uppercase">
                      {mcUsername}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2.5 w-60 z-50 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden text-left"
                        >
                          <div className="p-4 border-b border-white/10 bg-gradient-to-b from-orange-600/10 to-transparent flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-white/10 flex items-center justify-center overflow-hidden">
                              <img
                                src={`https://mc-heads.net/avatar/${mcUsername}/32.png`}
                                alt={mcUsername}
                                className="w-8 h-8 pixelated"
                              />
                            </div>
                            <div>
                              <span className="block font-display text-xs font-black text-white uppercase tracking-wider">
                                {mcUsername}
                              </span>
                              <span className="inline-block px-1.5 py-0.5 rounded-md bg-orange-600/25 border border-orange-500/30 text-[8px] font-mono font-bold text-[#FF9F43] mt-0.5 uppercase tracking-widest">
                                Verified Character
                              </span>
                            </div>
                          </div>

                          <div className="p-2 space-y-1">
                            <div className="px-3 py-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                              Session Status
                            </div>
                            
                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-xs font-semibold">
                              <span className="text-zinc-400">Status</span>
                              <span className="text-emerald-400 font-bold uppercase flex items-center gap-1 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Connected
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                onLogout();
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl text-left cursor-pointer transition-colors"
                            >
                              Change Username
                            </button>

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                onLogout();
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl text-left cursor-pointer transition-colors"
                            >
                              Logout Session
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Admin Dashboard shortcut / Status indicator for mobile */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Status Indicator for smaller screens */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-[9px] font-mono font-bold text-[#B3B3B3]">
                <span className={`w-1.5 h-1.5 rounded-full ${serverStatus?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{serverStatus?.online ? serverStatus.players.online : 'OFFLINE'}</span>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#B3B3B3] hover:text-white transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 bg-black/95 overflow-hidden rounded-b-2xl"
            >
              <div className="px-4 py-6 space-y-2">
                {mcUsername && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between mb-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={`https://mc-heads.net/avatar/${mcUsername}/32.png`}
                          alt={mcUsername}
                          className="w-8 h-8 pixelated"
                        />
                      </div>
                      <div>
                        <span className="block font-display text-sm font-black text-white uppercase tracking-wider">
                          {mcUsername}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Verified
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setView(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 font-display text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                      currentView === item.view
                        ? 'text-[#FF7A00] bg-white/5'
                        : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}

                {/* Discord Link for mobile */}
                <a
                  href="https://discord.gg/FAFYpg7MUD"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-3 font-display text-sm font-bold uppercase tracking-wider text-white bg-indigo-600/20 border border-indigo-500/30 rounded-xl"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                    Join Official Discord
                  </span>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </a>

                {/* IP Copy on Mobile Menu */}
                <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>SERVER ADDRESS</span>
                    <span className="text-[#FF7A00]">MC 1.20.4 - 1.21.X</span>
                  </div>
                  <button
                    onClick={copyIp}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 font-mono text-zinc-200 font-bold transition-all"
                  >
                    <span>{ipAddress}</span>
                    {copied ? <Check className="w-4 h-4 text-[#FF7A00]" /> : <Copy className="w-4 h-4 text-[#B3B3B3]" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
