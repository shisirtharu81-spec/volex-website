import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'advancement';
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'advancement':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500/30';
      case 'error':
        return 'border-red-500/30';
      case 'advancement':
        return 'border-amber-500/50';
      default:
        return 'border-orange-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg bg-zinc-950/95 border ${getBorderColor()} shadow-2xl overflow-hidden relative`}
    >
      {toast.type === 'advancement' && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
      )}
      
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-grow">
        <h4 className={`text-xs uppercase tracking-wider font-display font-bold ${toast.type === 'advancement' ? 'text-amber-400' : 'text-zinc-300'}`}>
          {toast.type === 'advancement' ? '✦ Advancement Made! ✦' : toast.title}
        </h4>
        <p className="text-sm text-zinc-100 font-sans font-medium mt-0.5">
          {toast.description}
        </p>
      </div>
      
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors text-xs ml-2 font-mono"
      >
        ✕
      </button>
    </motion.div>
  );
}
