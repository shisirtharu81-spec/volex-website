import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Youtube, Music, Twitter, Sparkles, ExternalLink } from 'lucide-react';

export default function SocialLinksSection() {
  const socialChannels = [
    {
      name: "Discord Server",
      handle: "1,420 Active Members",
      description: "Chat with fellow warriors, create support tickets, and participate in legendary rank giveaways.",
      color: "from-indigo-600/30 to-indigo-950/20 hover:border-indigo-500/40",
      buttonColor: "bg-indigo-600 hover:bg-indigo-500",
      icon: <MessageSquare className="w-8 h-8 text-indigo-400" />,
      link: "https://discord.gg/volex",
      tag: "COMMUNITY"
    },
    {
      name: "YouTube Channel",
      handle: "@VolexNetwork",
      description: "Watch epic server trailers, tournament highlights, gameplay updates, and dev diaries.",
      color: "from-red-600/30 to-red-950/20 hover:border-red-500/40",
      buttonColor: "bg-red-600 hover:bg-red-500",
      icon: <Youtube className="w-8 h-8 text-red-400" />,
      link: "https://youtube.com",
      tag: "VIDEOS"
    },
    {
      name: "TikTok Hub",
      handle: "@VolexMC",
      description: "Browse hilarious clips, heart-pumping PvP duels, custom realm showcases, and memes.",
      color: "from-pink-600/30 to-pink-950/20 hover:border-pink-500/40",
      buttonColor: "bg-pink-600 hover:bg-pink-500",
      icon: <Music className="w-8 h-8 text-pink-400" />,
      link: "https://tiktok.com",
      tag: "SHORTS"
    },
    {
      name: "Twitter / X",
      handle: "@VolexNetwork",
      description: "Stay updated on maintenance schedules, server restarts, sale coupons, and event countdowns.",
      color: "from-zinc-800/60 to-black hover:border-zinc-500/40",
      buttonColor: "bg-zinc-800 hover:bg-zinc-700",
      icon: <Twitter className="w-8 h-8 text-zinc-300" />,
      link: "https://twitter.com",
      tag: "ANNOUNCEMENTS"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="socials-section">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#FF9F43] mb-4 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#FF7A00]" />
          <span>STAY CONNECTED</span>
        </div>
        <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white italic">
          JOIN OUR <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">SOCIAL NETWORKS</span>
        </h2>
        <p className="text-[#B3B3B3] text-xs sm:text-sm mt-3 font-semibold leading-relaxed">
          The action doesn't stop inside Minecraft. Follow us across our social channels to receive custom codes, participate in tournaments, and keep tabs on updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {socialChannels.map((chan, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8, scale: 1.01 }}
            className={`rounded-3xl bg-gradient-to-br border border-white/5 p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 ${chan.color}`}
          >
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                  {chan.icon}
                </div>
                <span className="text-[9px] font-mono font-black bg-black/50 px-2.5 py-1 rounded-md text-[#FF9F43] uppercase tracking-wider">
                  {chan.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                  {chan.name}
                </h3>
                <p className="text-xs font-mono font-bold text-zinc-400">
                  {chan.handle}
                </p>
                <p className="text-[#B3B3B3] text-xs mt-2 leading-relaxed font-semibold">
                  {chan.description}
                </p>
              </div>
            </div>

            <a
              href={chan.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 w-full py-3.5 rounded-xl text-white text-xs font-display font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${chan.buttonColor}`}
            >
              <span>Follow Us</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
