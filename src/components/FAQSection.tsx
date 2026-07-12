import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        setFaqs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load FAQ", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 scroll-mt-20" id="faq-section">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-[#FF7A00] mb-3 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#FF7A00]" />
          <span>Faq Guidebook</span>
        </div>
        <h2 className="font-display font-black text-3xl uppercase tracking-tight text-white italic">
          FREQUENTLY ASKED <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">QUESTIONS</span>
        </h2>
        <p className="text-[#B3B3B3] text-xs sm:text-sm mt-3 max-w-lg mx-auto font-semibold leading-relaxed">
          Got questions about our web store or how we process items? Find instant, detailed answers below!
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-6 h-6 text-[#FF7A00] animate-spin mx-auto mb-3" />
          <span className="text-xs text-zinc-500 font-mono">LOADING FAQs...</span>
        </div>
      ) : faqs.length > 0 ? (
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIdx === index;
            return (
              <div
                key={index}
                className="bg-[#111111]/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300"
              >
                <button
                  onClick={() => setActiveIdx(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-display font-black text-sm uppercase tracking-wider text-zinc-200 hover:text-[#FF7A00] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#FF7A00]" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-zinc-950/20"
                    >
                      <p className="px-6 pb-6 pt-1 text-[#B3B3B3] text-xs sm:text-sm leading-relaxed font-semibold border-t border-white/5 mt-1">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#111111]/40 border border-white/5 rounded-3xl text-[#B3B3B3] text-xs">
          No FAQs configured. Check back soon!
        </div>
      )}
    </div>
  );
}
