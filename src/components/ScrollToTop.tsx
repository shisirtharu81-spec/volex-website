import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      id="scroll-to-top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-xl bg-black/60 border border-zinc-800/80 backdrop-blur-md text-[#FF7A00] hover:text-white hover:bg-[#FF7A00] hover:border-[#FF9F43] shadow-lg hover:shadow-[#FF7A00]/20 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
      title="Scroll to Top"
    >
      <ArrowUp className="w-5 h-5 animate-pulse" />
    </button>
  );
}
