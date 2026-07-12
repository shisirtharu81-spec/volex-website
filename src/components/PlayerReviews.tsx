import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, MessageSquare, Plus, Check, AlertCircle, X } from 'lucide-react';
import { Review } from '../types.js';

interface PlayerReviewsProps {
  addToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'advancement') => void;
}

export default function PlayerReviews({ addToast }: PlayerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Submit review form states
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !text.trim()) {
      addToast("Validation Failed", "Please fill out all required fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, rating, text })
      });
      if (res.ok) {
        addToast("Review Submitted", "Thank you! Your feedback helps us improve Volex Network.", "advancement");
        setUsername('');
        setRating(5);
        setText('');
        setIsOpen(false);
        fetchReviews();
      } else {
        const errData = await res.json();
        addToast("Submission Failed", errData.error || "Could not save review.", "error");
      }
    } catch (err) {
      addToast("Connection Error", "Our database is offline. Please retry in a bit.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="reviews-section">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
        <div className="text-left max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#FF9F43] mb-4 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#FF7A00]" />
            <span>COMMUNITY VOICE</span>
          </div>
          <h2 className="font-display font-black text-4xl uppercase tracking-tight text-white italic">
            PLAYER <span className="premium-orange-text drop-shadow-[0_4px_20px_rgba(255,122,0,0.2)]">TESTIMONIALS</span>
          </h2>
          <p className="text-[#B3B3B3] text-xs sm:text-sm mt-3 font-semibold leading-relaxed">
            Don't just take our word for it. Read honest reviews from active players in our community about their Volex Network experience.
          </p>
        </div>

        {/* Write a Review Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-[#FF7A00] hover:brightness-110 text-black font-display font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-95 shadow-[0_5px_15px_rgba(255,122,0,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black stroke-[3px]" />
          <span>Write a Review</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <motion.div
              key={rev.id}
              whileHover={{ y: -5 }}
              className="glass-card p-6 rounded-3xl border border-white/5 bg-[#111111]/45 backdrop-blur-md flex flex-col justify-between hover:border-[#FF7A00]/20 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-650'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[#E0E0E0] text-xs leading-relaxed font-semibold italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Player Profile Footer */}
              <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-white/5">
                <img
                  src={rev.avatar || `https://minotar.net/avatar/${rev.username}/64`}
                  alt={rev.username}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 shadow-inner"
                  onError={(e) => {
                    // Fallback to Steve avatar on lookup failure
                    (e.target as HTMLImageElement).src = 'https://minotar.net/avatar/Steve/64';
                  }}
                />
                <div className="text-left">
                  <h4 className="font-display font-black text-sm text-white uppercase tracking-tight">
                    {rev.username}
                  </h4>
                  <span className="block text-[9px] font-mono font-bold text-zinc-550 uppercase">
                    {rev.date || 'VERIFIED PLAYER'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#111111]/40 border border-white/5 rounded-3xl">
          <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-display font-black text-sm text-[#B3B3B3] uppercase tracking-wider">No reviews logged yet.</h3>
          <p className="text-zinc-500 text-[11px] mt-1">Be the first player to voice your thoughts!</p>
        </div>
      )}

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -15 }}
              className="relative w-full max-w-md p-6 sm:p-8 bg-[#0C0C0C] border border-white/10 rounded-3xl shadow-2xl z-10 text-left overflow-hidden"
            >
              {/* Backglow decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/10 rounded-full filter blur-[40px] pointer-events-none"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight italic">
                  SHARE YOUR <span className="premium-orange-text">VOICE</span>
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-wider">
                    Minecraft Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Minecraft username for skin avatar"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-sm focus:outline-none transition-all font-semibold"
                  />
                </div>

                {/* Stars Rating selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-wider">
                    Star Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating !== null ? hoverRating : rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Message Text */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-wider">
                    Review Comment *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your honest thoughts about the server ranks, keys, PvP, or support..."
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-sm focus:outline-none transition-all font-semibold resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#FF7A00] hover:brightness-110 disabled:brightness-75 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-[0_5px_15px_rgba(255,122,0,0.3)] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
