import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if it is a touch device
    const checkTouch = () => {
      const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsTouchDevice(touch);
    };
    checkTouch();

    if (isTouchDevice) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    const onMouseLeave = () => {
      setIsHidden(true);
    };

    const onMouseEnter = () => {
      setIsHidden(false);
    };

    // Listen for hover on buttons, links, categories, products, inputs, and admins
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], .product-card, .category-tab, .interactive-hover'
      );
      
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovered(true));
        el.addEventListener('mouseleave', () => setIsHovered(false));
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    
    // Add hover listeners on load and on any mutations (view changes)
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      observer.disconnect();
    };
  }, [isTouchDevice]);

  if (isTouchDevice || isHidden) return null;

  return (
    <>
      {/* Outer floating ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#FF7A00]/60 pointer-events-none z-50 transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 select-none"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isHovered ? 1.5 : 1})`,
          backgroundColor: isHovered ? 'rgba(255, 122, 0, 0.1)' : 'transparent',
          boxShadow: isHovered ? '0 0 15px rgba(255, 122, 0, 0.4)' : 'none',
        }}
      />
      {/* Core cursor dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#FF7A00] rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 select-none mix-blend-screen"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          boxShadow: '0 0 10px #FF7A00, 0 0 20px #FF9F43',
        }}
      />
    </>
  );
}
