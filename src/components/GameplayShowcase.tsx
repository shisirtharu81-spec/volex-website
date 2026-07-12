import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Maximize2, X, Sparkles, Image as ImageIcon } from 'lucide-react';

interface GameplayShowcaseProps {
  activeImage?: string;
}

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?q=80&w=1200&auto=format&fit=crop';

export default function GameplayShowcase({ activeImage }: GameplayShowcaseProps) {
  const imageUrl = activeImage || DEFAULT_BANNER;
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="showcase-section">
      <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#FF9F43] mb-4 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#FF7A00]" />
          <span>REALM GALLERY</span>
        </div>
        <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white italic">
          HOMEPAGE <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">GALLERY</span>
        </h2>
        <p className="text-[#B3B3B3] text-xs sm:text-sm mt-3 font-semibold leading-relaxed">
          Take a glance at our active featured server highlight screenshot. Our custom spawn areas, thriving player bases, and cozy survival outposts are updated dynamically by our administration team.
        </p>
      </div>

      {/* Main Gallery Frame */}
      <div className="relative group max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/5 bg-black/40 aspect-[16/9] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full h-full relative"
        >
          <img
            src={imageUrl}
            alt="Volex active homepage gallery showcase"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-102"
          />
          {/* Visual bottom glass label */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-auto">
            <span className="px-3.5 py-1.5 rounded-xl bg-black/75 border border-white/10 text-[10px] font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>ACTIVE SHOWCASE VIEW</span>
            </span>
            
            <button
              onClick={() => setFullscreenImage(imageUrl)}
              className="p-2.5 rounded-xl bg-black/70 hover:bg-[#FF7A00] text-white hover:text-black border border-white/10 hover:border-transparent transition-all cursor-pointer shadow-lg"
              title="Expand Showcase"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen zoom lightbox */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              className="absolute top-6 right-6 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-[#FF7A00] hover:text-black transition-all cursor-pointer"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
              src={fullscreenImage}
              alt="Expanded active gallery screenshot"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
