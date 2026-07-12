import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, CheckCircle, Sparkles, HelpCircle, ClipboardCheck, CornerDownRight } from 'lucide-react';
import { Order, PaymentSettings } from '../types.js';

interface SuccessViewProps {
  order: Order | null;
  paymentSettings: PaymentSettings | null;
  setView: (view: string) => void;
}

export default function SuccessView({ order, paymentSettings, setView }: SuccessViewProps) {
  const discordInviteUrl = "https://discord.gg/FAFYpg7MUD"; // Volex Discord Server invite link

  const instructions = [
    { id: 1, text: "Join our Official Discord Server.", highlight: "Join Discord" },
    { id: 2, text: "Navigate to the #purchase-tickets channel and click 'Create Ticket'.", highlight: "Create Purchase Ticket" },
    { id: 3, text: "Send a screenshot of your QR transaction receipt.", highlight: "Send Payment Screenshot" },
    { id: 4, text: `Mention your Minecraft username (${order?.username || 'Steve'}) and Purchased Item.`, highlight: "Provide Purchase Details" },
    { id: 5, text: "A moderator will verify your payment details shortly.", highlight: "Staff Verification" },
    { id: 6, text: "Enjoy your rank, keys, coins, or cosmetics in-game!", highlight: "In-game Delivery" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center select-none bg-minecraft-grid">
      
      {/* Visual Success Check Banner */}
      <div className="relative flex flex-col items-center justify-center mb-10">
        <div className="absolute w-32 h-32 bg-green-500/10 rounded-full filter blur-2xl animate-pulse"></div>
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]"
        >
          <CheckCircle className="w-20 h-20" />
        </motion.div>
        
        <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight italic">
          PAYMENT SUBMITTED SUCCESSFULLY!
        </h2>
        <p className="text-[#B3B3B3] text-sm font-semibold max-w-lg mt-3 leading-relaxed">
          Your order ID <span className="text-[#FF7A00] font-mono font-black">#{order?.id || 'ORD-ABCXYZ'}</span> is now registered in our system as <span className="text-[#FF9F43] uppercase font-mono text-xs font-black bg-[#FF9F43]/10 px-2.5 py-1 rounded-lg border border-[#FF9F43]/20 tracking-wide">PENDING VERIFICATION</span>.
        </p>
      </div>

      {/* Main Action Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#111111]/70 backdrop-blur-md rounded-[32px] border border-white/5 p-6 sm:p-10 text-left mb-12 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7A00]/5 rounded-full filter blur-[100px]"></div>

        <h3 className="font-display font-black text-xs uppercase text-white tracking-widest mb-8 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-[#FF7A00]" />
          <span>Next Steps for Item Delivery</span>
        </h3>

        {/* Step List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructions.map((step) => (
            <div key={step.id} className="flex gap-4 items-start bg-black/40 border border-white/5 p-5 rounded-2xl">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-[#111111] border border-white/10 text-xs font-mono font-black text-[#FF7A00] shadow-inner">
                {step.id}
              </span>
              <div className="space-y-1">
                <span className="text-white font-display font-black text-xs uppercase tracking-wide block leading-none">
                  {step.highlight}
                </span>
                <span className="text-[#B3B3B3] font-sans text-xs sm:text-xs font-semibold leading-normal">
                  {step.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Discord CTA Block */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-md text-center lg:text-left space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-[#FF7A00] uppercase tracking-widest">
              Important Action
            </span>
            <p className="text-xs text-[#B3B3B3] leading-relaxed font-semibold">
              Join our community and claim your items inside a ticket. Make sure to have your screenshot receipt ready!
            </p>
          </div>
          
          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 py-4.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(88,101,242,0.3)] hover:shadow-[0_15px_30px_rgba(88,101,242,0.4)] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Join our Discord Server</span>
          </a>
        </div>
      </motion.div>

      {/* Navigation links */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setView('store-all')}
          className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer active:scale-95"
        >
          Return to Shop
        </button>
        <button
          onClick={() => setView('home')}
          className="px-6 py-3.5 text-zinc-500 hover:text-white font-display font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Go Back Home
        </button>
      </div>

    </div>
  );
}
