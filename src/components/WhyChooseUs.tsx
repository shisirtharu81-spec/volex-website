import React from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, Cpu, MessageSquare, Trophy, Award, Sparkles } from 'lucide-react';

export default function WhyChooseUs() {
  const cards = [
    {
      title: "Instant Rank Delivery",
      description: "Our secure automated dispatchers deliver your custom ranks, coin bundles, and crate keys to your Minecraft username in 5-15 minutes.",
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      tag: "AUTOMATED"
    },
    {
      title: "Enterprise Protection",
      description: "Play without stress. Our servers run on highly optimized dedicated machines protected by premium Anycast DDoS mitigation networks.",
      icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
      tag: "99.9% UPTIME"
    },
    {
      title: "Hyper-Optimized TPS",
      description: "Enjoy butter-smooth gameplay with solid 20.0 TPS. Customized configurations ensure optimal hit-reg and minimal PvP packet latency.",
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      tag: "LAG-FREE"
    },
    {
      title: "Professional Support",
      description: "Need help? Our active helper and moderator team operates round-the-clock on Discord to resolve tickets and assist you instantly.",
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      tag: "24/7 HELPDESK"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="features-section">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#FF9F43] mb-4 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#FF7A00]" />
          <span>PROVEN QUALITY</span>
        </div>
        <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white italic">
          WHY PLAY ON <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">VOLEX NETWORK</span>
        </h2>
        <p className="text-[#B3B3B3] text-xs sm:text-sm mt-3 font-semibold leading-relaxed">
          We strive to provide the ultimate multiplayer sandbox experience. Here is why thousands of players choose Volex as their gaming home.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-card p-6 rounded-3xl border border-white/5 bg-[#111111]/45 backdrop-blur-md flex flex-col justify-between hover:border-[#FF7A00]/20 hover:shadow-[0_15px_30px_rgba(255,122,0,0.08)] relative group overflow-hidden"
          >
            {/* Soft backdrop ambient circle */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#FF7A00]/5 rounded-full filter blur-xl group-hover:bg-[#FF7A00]/15 transition-all duration-300"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-[#FF7A00]/15 transition-colors">
                  {card.icon}
                </div>
                <span className="text-[9px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded text-zinc-400">
                  {card.tag}
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-black text-lg text-white group-hover:text-[#FF7A00] transition-colors uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="text-[#B3B3B3] text-xs leading-relaxed font-semibold">
                  {card.description}
                </p>
              </div>
            </div>

            <div className="h-[2px] w-0 group-hover:w-full bg-[#FF7A00] mt-6 transition-all duration-300"></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
