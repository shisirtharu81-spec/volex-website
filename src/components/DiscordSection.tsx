import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Users, Star, Plus, ShieldCheck, Award, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function DiscordSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: 'Total Members', value: '14,204', color: 'text-indigo-400' },
    { label: 'Players Online', value: '1,402', color: 'text-green-500' },
    { label: 'Staff Online', value: '12 Active', color: 'text-[#FF7A00]' }
  ];

  const steps = [
    {
      title: "1. Join Server",
      description: "Click the Join Discord button on this page to securely join Volex Discord Network.",
      icon: <Users className="w-5 h-5 text-indigo-400" />
    },
    {
      title: "2. Open Ticket",
      description: "Find the #purchase-tickets channel under store category and click the 'Create Ticket' button.",
      icon: <Plus className="w-5 h-5 text-[#FF7A00]" />
    },
    {
      title: "3. Upload Receipt",
      description: "Paste your mobile banking or e-wallet screenshot showing your transaction reference number and exact paid amount.",
      icon: <Award className="w-5 h-5 text-yellow-500" />
    },
    {
      title: "4. Staff Verification",
      description: "Our dedicated support team will verify your receipt against store logs and apply your rewards instantly in-game.",
      icon: <ShieldCheck className="w-5 h-5 text-green-500" />
    }
  ];

  const discordFaqs = [
    {
      q: "What transaction screenshots are accepted?",
      a: "Any official receipt from your bank or e-wallet. It must clearly display the transaction ID/reference number, paid amount, paid account name, and payment date. Crop out any personal details (like bank balance) for your security!"
    },
    {
      q: "I opened a ticket, how long will I wait?",
      a: "Our staff team is located across multiple timezones and is active 24/7. Average verification time is 5-15 minutes, but during peak hours or system maintenance it may take up to 2 hours. Please do not ping staff repeatedly - we handle tickets in the order they are created!"
    },
    {
      q: "What if I entered the wrong Minecraft username during checkout?",
      a: "Don't worry! Simply state your correct username inside your ticket. Our moderators can manually correct the username on the pending order in our Admin Panel before pushing the delivery."
    },
    {
      q: "Can I get a refund if I change my mind?",
      a: "Due to the nature of digital products and in-game items, we do not offer refunds. All purchases are final. If you experience issues or didn't receive items, we will resolve it inside your ticket!"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20" id="discord-section">
      
      {/* Visual Header / Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#111111]/70 backdrop-blur-md border border-white/5 p-8 sm:p-14 mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A00]/5 rounded-full filter blur-xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="text-center lg:text-left max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest font-mono">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Official Community Hub</span>
            </span>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight leading-none italic">
              JOIN THE <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.3)]">VOLEX DISCORD</span>
            </h2>
            <p className="text-[#B3B3B3] text-sm leading-relaxed font-semibold">
              Get direct 24/7 support, claim store purchases, participate in giveaways, connect with other active players, and receive real-time server updates!
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 text-center sm:text-left">
              {stats.map((st) => (
                <div key={st.label} className="space-y-1">
                  <span className={`block font-display font-black text-xl sm:text-3xl ${st.color}`}>
                    {st.value}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase font-black tracking-wider">
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 text-center flex flex-col items-center bg-black/40 border border-white/5 p-8 rounded-3xl w-full max-w-sm">
            {/* Visual Avatar Grid representing members */}
            <div className="flex -space-x-3 mb-6">
              <img className="w-12 h-12 rounded-full border-2 border-zinc-900 object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80" alt="Avatar"/>
              <img className="w-12 h-12 rounded-full border-2 border-zinc-900 object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=80" alt="Avatar"/>
              <img className="w-12 h-12 rounded-full border-2 border-zinc-900 object-cover" src="https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=80" alt="Avatar"/>
              <div className="w-12 h-12 rounded-full border-2 border-zinc-900 bg-zinc-800 text-xs font-mono font-bold text-[#FF9F43] flex items-center justify-center shadow-lg">
                +14k
              </div>
            </div>

            <p className="text-xs text-[#B3B3B3] mb-6 font-semibold max-w-[240px] leading-relaxed">
              We are waiting for you inside! Join thousands of other Volex warriors.
            </p>

            <a
              href="https://discord.gg/FAFYpg7MUD"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-8 py-4.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(88,101,242,0.3)] hover:shadow-[0_15px_30px_rgba(88,101,242,0.4)] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Join Server Network
            </a>
          </div>

        </div>
      </div>

      {/* Ticket Guide section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-[#FF7A00] mb-3 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#FF7A00]" />
            <span>Delivery Walkthrough</span>
          </div>
          <h3 className="font-display font-black text-3xl uppercase tracking-tight text-white italic">
            HOW TO CLAIM YOUR <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">STORE ITEMS</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-[#111111]/80 backdrop-blur-md rounded-3xl border border-white/5 p-6 text-left flex flex-col justify-between hover:border-[#FF7A00]/20 hover:shadow-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="p-3.5 bg-black/40 rounded-xl inline-block border border-white/10 shadow-inner">
                  {step.icon}
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-black text-sm uppercase text-white tracking-wide">
                    {step.title}
                  </h4>
                  <p className="text-[#B3B3B3] text-xs leading-relaxed font-semibold">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discord FAQ accordions */}
      <div className="max-w-4xl mx-auto">
        <h3 className="font-display font-black text-2xl text-center uppercase tracking-tight text-white mb-8 italic">
          DISCORD <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">VERIFICATION FAQ</span>
        </h3>

        <div className="space-y-3.5">
          {discordFaqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-[#111111]/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
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
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 pt-1 text-[#B3B3B3] text-xs leading-relaxed font-semibold">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
