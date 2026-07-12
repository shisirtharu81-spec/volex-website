import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, ChevronRight, User, Loader2, Check } from 'lucide-react';

import { WebsiteSettings } from '../types.js';

interface MCVerificationProps {
  onVerify: (username: string) => void;
  websiteSettings?: WebsiteSettings | null;
}

export default function MCVerification({ onVerify, websiteSettings }: MCVerificationProps) {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://mc-heads.net/avatar/Steve/100.png');
  const [isValid, setIsValid] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Validate Minecraft username rule (3-16 chars, alphanumeric & underscores)
  const validateUsername = (name: string) => {
    const mcRegex = /^[a-zA-Z0-9_]{3,16}$/;
    return mcRegex.test(name);
  };

  useEffect(() => {
    // Debounce the avatar fetch as the user types
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (validateUsername(username)) {
      setIsValid(true);
      const timeout = setTimeout(() => {
        setAvatarUrl(`https://mc-heads.net/avatar/${username}/100.png`);
      }, 350);
      setTypingTimeout(timeout);
    } else {
      setIsValid(false);
      if (username.trim() === '') {
        setAvatarUrl('https://mc-heads.net/avatar/Steve/100.png');
      }
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsEntering(true);
    // Add a premium transitional delay to simulate portal teleportation and server verification
    setTimeout(() => {
      onVerify(username);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden p-4">
      {/* Immersive Background Grid and Lights */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-minecraft-grid opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] rounded-full bg-gradient-to-r from-orange-600/10 to-transparent opacity-60 blur-[150px] animate-pulse"></div>
        <div className="absolute inset-0 noise-overlay"></div>
      </div>

      <AnimatePresence mode="wait">
        {!isEntering ? (
          <motion.div
            key="verification-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-full max-w-md p-8 rounded-3xl glass-card border border-white/5 relative z-10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] text-center space-y-6"
          >
            {/* Visual Header Icon */}
            {websiteSettings?.logoUrl ? (
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-zinc-900/80 border border-white/10 rounded-2xl p-2.5 shadow-lg mb-2 overflow-hidden">
                <img src={websiteSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain animate-fadeIn" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="relative inline-flex items-center justify-center p-3.5 bg-orange-950/20 border border-orange-500/20 rounded-2xl text-orange-500 shadow-lg mb-2">
                <Shield className="w-8 h-8" />
                <div className="absolute inset-0 rounded-2xl bg-orange-500/10 animate-ping opacity-30"></div>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-orange-500 uppercase flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> character login required
              </span>
              <h1 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                {websiteSettings?.websiteTitle || "Volex Network"}
              </h1>
              <p className="text-[#999999] text-xs font-semibold px-2">
                {websiteSettings?.websiteTagline || "Provide your Minecraft Character Username to apply personalized perks, skins, and checkout verification."}
              </p>
            </div>

            {/* Dynamic Real-time Character Avatar head preview */}
            <div className="py-4 flex justify-center">
              <div className="relative group">
                {/* Glowing Aura back */}
                <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative w-24 h-24 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-center overflow-hidden p-2 shadow-2xl">
                  <img
                    src={avatarUrl}
                    alt="Character Head Preview"
                    className="w-18 h-18 object-contain pixelated rounded-md select-none transition-transform duration-300 group-hover:scale-110"
                    onError={() => setAvatarUrl('https://mc-heads.net/avatar/Steve/100.png')}
                  />
                  
                  {isValid && (
                    <div className="absolute bottom-1 right-1 bg-emerald-500 text-black p-0.5 rounded-full border border-zinc-950">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input fields */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider pl-1">
                  Minecraft Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Steve"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm font-semibold tracking-wide text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/10 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Enter Button */}
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-3.5 rounded-xl font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isValid
                    ? 'bg-orange-600 hover:bg-orange-500 text-black shadow-lg shadow-orange-600/15 active:scale-98'
                    : 'bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <span>Enter Store</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                Protected by Volex anti-bot shield
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="entering-transition"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center space-y-6 z-10"
          >
            {/* Hyperspace Portal Portal animation effect */}
            <div className="relative flex items-center justify-center w-28 h-28 mb-2">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-orange-500/30 animate-spin-slow"></div>
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-orange-500/60 animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-orange-600/10 blur-xl"></div>
              
              <div className="relative w-16 h-16 rounded-2xl bg-zinc-950 border border-orange-500/30 flex items-center justify-center overflow-hidden">
                <img
                  src={avatarUrl}
                  alt="Entering Character"
                  className="w-11 h-11 object-contain pixelated"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                Verifying {username}
              </h2>
              <div className="flex items-center justify-center gap-2 text-orange-500 font-mono text-[10px] uppercase tracking-widest font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synchronizing Realm Cosmetics...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
