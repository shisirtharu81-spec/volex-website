import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ShieldAlert, Check, Copy, Sparkles, Send, Tag, Trash2 } from 'lucide-react';
import { Product, PaymentSettings, Order } from '../types.js';

interface CheckoutModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmitOrder: (details: { username: string; discord: string; email?: string; productId: string; couponCode?: string; discountAmount?: number }) => Promise<{ order: Order; paymentSettings: PaymentSettings } | null>;
  onSuccess: (order: Order, paymentSettings: PaymentSettings) => void;
  addToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'advancement') => void;
}

export default function CheckoutModal({ product, onClose, onSubmitOrder, onSuccess, addToast }: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [discord, setDiscord] = useState('');
  const [email, setEmail] = useState('');
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paySettings, setPaySettings] = useState<PaymentSettings | null>(null);
  const [copiedText, setCopiedText] = useState<'number' | 'instructions' | null>(null);

  if (!product) return null;

  const finalPrice = appliedCoupon ? Math.max(0, product.price - appliedCoupon.discountAmount) : product.price;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !discord.trim()) {
      addToast("Required Fields Missing", "Please enter your Minecraft and Discord usernames.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await onSubmitOrder({
        username: username.trim(),
        discord: discord.trim(),
        email: email.trim() || undefined,
        productId: product.id,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: appliedCoupon ? appliedCoupon.discountAmount : undefined
      });

      if (response) {
        setCreatedOrder(response.order);
        setPaySettings(response.paymentSettings);
        setStep(2);
        addToast("Order Initiated", "Details submitted! Please proceed to QR Code payment.", "info");
      }
    } catch (err) {
      addToast("Failed to initiate order", "Please try again later.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      addToast("Coupon Code Required", "Please enter a code to apply.", "error");
      return;
    }
    if (!username.trim()) {
      addToast("Username Required", "Please enter your Minecraft username first.", "error");
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          username: username.trim(),
          cartTotal: product.price,
          productId: product.id,
          categoryId: product.category,
          gameMode: product.gameMode
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount
        });
        addToast("Coupon Applied!", `Saved $${data.discountAmount.toFixed(2)} with coupon "${data.code}"`, "success");
      } else {
        addToast("Coupon Invalid", data.error || "The promo code is invalid or not applicable.", "error");
      }
    } catch (err) {
      addToast("Connection Error", "Could not validate coupon.", "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    addToast("Coupon Removed", "Discount has been removed.", "info");
  };

  const handleIHavePaid = () => {
    if (!createdOrder || !paySettings) return;
    onSuccess(createdOrder, paySettings);
    onClose();
  };

  const copyPaymentInfo = (text: string, type: 'number' | 'instructions') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    addToast("Copied!", `${type === 'number' ? 'Payment number' : 'Details'} copied to clipboard.`, "success");
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-[#111111]/95 backdrop-blur-md rounded-[32px] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-8"
      >
        {/* Top Header */}
        <div className="relative p-6 bg-black/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-[#FF7A00] drop-shadow-[0_0_8px_rgba(255,122,0,0.4)]" />
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-white">
              Checkout & Purchase
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-[#FF7A00] transition-colors text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Selected Product Banner */}
        <div className="p-5 bg-[#FF7A00]/5 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img 
              src={product.image} 
              alt={product.name} 
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover bg-black border border-white/10"
            />
            <div>
              <h4 className="font-display font-black text-[9px] uppercase tracking-widest text-[#FF7A00]">
                Purchasing Item
              </h4>
              <p className="font-display font-black text-sm text-white uppercase tracking-wide leading-tight">
                {product.name}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="block text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">
              TOTAL PRICE
            </span>
            <div className="flex flex-col items-end">
              {appliedCoupon && (
                <span className="text-xs text-zinc-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="font-display font-black text-2xl text-white">
                ${finalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Form Body - Step 1 & 2 */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleStep1Submit}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                    1. Minecraft Username <span className="text-[#FF7A00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Steve_Mine"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-sans font-bold transition-all"
                  />
                  <span className="block text-[10px] text-zinc-500 font-semibold leading-relaxed">
                    Must match your in-game username exactly so rewards can be delivered.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                    2. Discord Username <span className="text-[#FF7A00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. steve_mine"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-sans font-bold transition-all"
                  />
                  <span className="block text-[10px] text-zinc-500 font-semibold leading-relaxed">
                    Required to verify your transaction ticket in our Discord.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                    3. Email Address <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. steve@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-sans font-bold transition-all"
                  />
                  <span className="block text-[10px] text-zinc-500 font-semibold leading-relaxed">
                    For custom purchase receipts and future updates.
                  </span>
                </div>

                {/* Coupon Input Field */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <label className="block text-[10px] font-mono font-black text-[#B3B3B3] uppercase tracking-widest">
                    Have a coupon / promo code?
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-[#FF7A00]/50 text-white text-xs sm:text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,122,0,0.1)] font-mono font-bold uppercase transition-all disabled:opacity-50"
                      />
                    </div>
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-4 py-3 bg-red-600/15 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 hover:border-red-500 transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-bold uppercase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-5 py-3 bg-zinc-800 hover:bg-[#FF7A00] text-zinc-300 hover:text-black rounded-xl font-display font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <span className="block text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" /> Promo code "{appliedCoupon.code}" successfully applied!
                    </span>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] hover:brightness-110 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_5px_15px_rgba(255,122,0,0.3)] disabled:opacity-55 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    {submitting ? 'Creating Order...' : 'Continue to Payment ➔'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Alert/Payment Name info */}
                <div className="bg-[#FF7A00]/5 border border-white/5 p-4 rounded-2xl text-xs flex gap-3 text-zinc-300">
                  <ShieldAlert className="w-5 h-5 text-[#FF7A00] flex-shrink-0" />
                  <div className="font-semibold leading-relaxed">
                    <span className="font-black text-[#FF7A00] uppercase block mb-1">
                      Direct QR Code Payment Only
                    </span>
                    You are paying to <span className="text-white font-black">{paySettings?.paymentName}</span>. Please complete this using your banking/wallet app.
                  </div>
                </div>

                {/* Amount / Price highlight */}
                <div className="text-center bg-black/40 border border-white/5 rounded-2xl p-4">
                  <span className="block text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">
                    SCAN AND PAY EXACTLY
                  </span>
                  <div className="flex justify-center items-baseline gap-2 mt-1">
                    {appliedCoupon && (
                      <span className="text-sm text-zinc-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                    <span className="font-display font-black text-3xl text-[#FF7A00] block drop-shadow-[0_0_10px_rgba(255,122,0,0.2)]">
                      ${finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center">
                  <div className="p-3 bg-white rounded-3xl shadow-2xl overflow-hidden max-w-[210px] aspect-square flex items-center justify-center border-4 border-[#FF7A00]/35">
                    <img 
                      src={paySettings?.qrCodeUrl} 
                      alt="Payment QR Code" 
                      className="w-[180px] h-[180px] object-contain select-none"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-black mt-3 text-center uppercase tracking-widest">
                    OFFICIAL PAY QR • ORDER ID: {createdOrder?.id}
                  </span>
                </div>

                {/* Account Details / Payment Number */}
                <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 text-xs">
                  <div>
                    <span className="block text-zinc-500 font-mono text-[9px] uppercase font-black tracking-wider">
                      Payment Account
                    </span>
                    <span className="text-white font-black font-display uppercase tracking-wide text-xs">
                      {paySettings?.paymentName}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="block text-zinc-500 font-mono text-[9px] uppercase font-black tracking-wider">
                      Payment Number
                    </span>
                    <span className="text-white font-mono font-bold flex items-center gap-1.5 mt-0.5 text-xs">
                      {paySettings?.paymentNumber}
                      <button 
                        onClick={() => copyPaymentInfo(paySettings?.paymentNumber || '', 'number')}
                        className="text-[#FF7A00] hover:text-[#FF9F43] transition-colors text-[10px] font-bold font-mono uppercase tracking-wider"
                      >
                        Copy
                      </button>
                    </span>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">
                    Instructions:
                  </span>
                  <p className="text-xs text-[#B3B3B3] leading-relaxed font-semibold bg-black/40 p-4 rounded-2xl border border-white/5">
                    {paySettings?.instructions}
                  </p>
                </div>

                {/* Submit action */}
                <div className="pt-2">
                  <button
                    onClick={handleIHavePaid}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF7A00] to-[#FF9F43] hover:brightness-110 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_5px_15px_rgba(255,122,0,0.3)] active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-black" />
                    <span>I Have Paid</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
