import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    progressColor: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    progressColor: 'bg-red-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
    progressColor: 'bg-blue-500',
  },
};

function SingleToast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const IconComp = config.icon;
  const DURATION = 4500;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-md min-w-[320px] max-w-[420px] overflow-hidden transition-all duration-300 ${config.bg} ${
        isExiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-8 fade-in duration-300'
      }`}
    >
      <IconComp className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <p className={`text-sm font-medium flex-1 leading-snug ${config.textColor}`}>{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5">
        <div
          className={`h-full ${config.progressColor} transition-all duration-100 ease-linear rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[110] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
