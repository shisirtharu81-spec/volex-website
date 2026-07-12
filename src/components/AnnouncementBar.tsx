import React from 'react';
import { Megaphone, ExternalLink, X } from 'lucide-react';
import { WebsiteSettings } from '../types.js';

interface AnnouncementBarProps {
  settings: WebsiteSettings | null;
}

export default function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const [closed, setClosed] = React.useState(false);

  if (!settings || !settings.announcementEnabled || closed) {
    return null;
  }

  const { announcementText, announcementBgColor, announcementLink, announcementAnimation } = settings;

  const getAnimationClass = () => {
    switch (announcementAnimation) {
      case 'scroll':
        return 'animate-marquee whitespace-nowrap';
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  const barContent = (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm font-semibold tracking-wide text-white uppercase relative overflow-hidden transition-all duration-300`}>
      <Megaphone className="w-4 h-4 shrink-0 animate-bounce text-yellow-300" />
      <span className={getAnimationClass()}>{announcementText}</span>
      {announcementLink && (
        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 hover:opacity-100 transition-opacity" />
      )}
    </div>
  );

  return (
    <div 
      className="relative w-full z-50 border-b border-white/10"
      style={{ backgroundColor: announcementBgColor || '#FF7A00' }}
    >
      {announcementLink ? (
        <a 
          href={announcementLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full hover:brightness-110 active:brightness-95 transition-all"
        >
          {barContent}
        </a>
      ) : (
        barContent
      )}
      <button 
        onClick={() => setClosed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/75 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
