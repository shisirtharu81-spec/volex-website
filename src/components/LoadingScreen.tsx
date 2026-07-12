import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { WebsiteSettings } from '../types.js';

interface LoadingScreenProps {
  onComplete: () => void;
  websiteSettings?: WebsiteSettings | null;
}

export default function LoadingScreen({ onComplete, websiteSettings }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Smooth progress counter from 0 to 100
    const duration = 1200; // 1.2 seconds loading
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.floor((currentStep / steps) * 100));
      setProgress(nextProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Start fadeout transition slightly before calling complete
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 400); // Wait for CSS opacity fade
        }, 150);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] transition-opacity duration-500 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] rounded-full bg-gradient-to-br from-[#FF7A00]/15 to-transparent blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center select-none">
        
        {/* Glowing Shield Logo */}
        <div className="relative mb-6 animate-pulse">
          <div className="absolute inset-0 bg-[#FF7A00]/20 opacity-25 blur-xl rounded-full scale-110"></div>
          {websiteSettings?.logoUrl ? (
            <div className="relative w-24 h-24 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl p-2 flex items-center justify-center overflow-hidden">
              <img src={websiteSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="relative p-5 rounded-3xl bg-zinc-900 border-2 border-[#FF7A00]/80 shadow-2xl shadow-[#FF7A00]/30 flex items-center justify-center">
              <Shield className="w-12 h-12 text-[#FF7A00]" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Text Brand */}
        <h1 className="text-3xl font-black tracking-widest text-white uppercase font-display mb-1">
          {websiteSettings?.websiteTitle ? (
            <>
              {websiteSettings.websiteTitle.split(' ').map((word, idx) => (
                <span key={idx} className={idx > 0 ? "text-[#FF7A00] pl-1.5" : ""}>
                  {word}
                </span>
              ))}
            </>
          ) : (
            <>
              VOLEX <span className="text-[#FF7A00]">NETWORK</span>
            </>
          )}
        </h1>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">
          {websiteSettings?.websiteTagline || "Establishing Secure Connection..."}
        </p>

        {/* Progress Value */}
        <div className="text-2xl font-mono font-bold text-[#FF7A00] mb-2">
          {progress}%
        </div>

        {/* Progress Bar Track */}
        <div className="w-64 h-1.5 rounded-full bg-zinc-900 border border-zinc-800/80 overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_#FF7A00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic loading hints */}
        <div className="mt-4 text-xs text-zinc-500 font-mono tracking-wider h-4">
          {progress < 30 && "Loading assets..."}
          {progress >= 30 && progress < 60 && "Connecting to server query..."}
          {progress >= 60 && progress < 85 && "Loading customized styling..."}
          {progress >= 85 && progress < 100 && "Optimizing gaming portal..."}
          {progress === 100 && "Welcome to Volex Store!"}
        </div>
      </div>
    </div>
  );
}
