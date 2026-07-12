import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

interface ContactSectionProps {
  addToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'advancement') => void;
}

export default function ContactSection({ addToast }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Purchase Issue');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      addToast("Failed to Send", "Please complete all fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        addToast("Ticket Submitted", "Our support staff will email you shortly.", "success");
        // Clear fields
        setName('');
        setEmail('');
        setMessage('');
      } else {
        addToast("Error", data.error || "Failed to submit.", "error");
      }
    } catch (err) {
      addToast("Network Error", "Unable to reach server. Please try again later.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20" id="contact-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* Support Info Side */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-[#FF7A00] uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-[#FF7A00]" />
              <span>Support Portal</span>
            </div>
            <h2 className="font-display font-black text-4xl uppercase tracking-tight text-white leading-tight italic">
              GET IN <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">TOUCH</span>
            </h2>
            <p className="text-[#B3B3B3] text-sm leading-relaxed font-semibold">
              If you have any purchase issues, billing queries, or in-game delivery delays, fill out our secure ticket form and our web support department will get back to you.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-start bg-[#111111]/60 border border-white/5 p-5 rounded-2xl">
              <div className="p-3 bg-black/40 border border-white/10 text-[#FF7A00] rounded-xl flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-mono font-black text-white uppercase tracking-wide">
                  Email Support
                </h4>
                <p className="text-xs text-[#B3B3B3] font-mono">
                  support@volexmc.net
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-[#111111]/60 border border-white/5 p-5 rounded-2xl">
              <div className="p-3 bg-black/40 border border-white/10 text-amber-400 rounded-xl flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-mono font-black text-white uppercase tracking-wide">
                  Fastest Option
                </h4>
                <p className="text-xs text-[#B3B3B3] font-semibold leading-normal">
                  For immediate 5-10min deliveries, open a ticket inside our Discord server. It is fully automated!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="lg:col-span-7 bg-[#111111]/70 backdrop-blur-md rounded-3xl border border-white/5 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-center">
          {success ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                  SUPPORT TICKET CREATED!
                </h3>
                <p className="text-[#B3B3B3] text-xs leading-relaxed max-w-sm mx-auto font-medium">
                  Thank you! Your inquiry was sent successfully. We have dispatched a confirmation email to you, and we will reply directly within 24 hours.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono font-bold text-[#FF7A00] border border-white/10 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                    Minecraft Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Steve_Mine"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-sans font-semibold rounded-xl transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-sans font-semibold rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                  Subject Category
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-sans font-semibold rounded-xl transition-all appearance-none cursor-pointer"
                >
                  <option value="Purchase Issue">Purchase Issue / Order Delay</option>
                  <option value="In-game bug">In-game Rank Bug</option>
                  <option value="Payment Issue">QR Code Payment Inquiries</option>
                  <option value="Server Suggestion">Partnerships & Business</option>
                  <option value="Other">Other General Support</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue with order ID and details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-sans font-semibold rounded-xl transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] hover:brightness-110 disabled:opacity-50 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_5px_15px_rgba(255,122,0,0.3)] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message ➔'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
