'use client';

import React, { useEffect, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({ toast: () => {} });

const config = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    icon_color: 'text-emerald-600 dark:text-emerald-400',
    badge_bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20',
    label: 'Success',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-rose-500',
    icon_color: 'text-rose-600 dark:text-rose-400',
    badge_bg: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-500',
    icon_color: 'text-amber-600 dark:text-amber-400',
    badge_bg: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bar: 'bg-sky-500',
    icon_color: 'text-sky-600 dark:text-sky-400',
    badge_bg: 'bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/20',
    label: 'Info',
  },
};

interface ToastProps extends ToastItem {
  onDismiss: (id: string) => void;
}

function Toast({ id, type, message, onDismiss }: ToastProps) {
  const c = config[type];
  const Icon = c.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4500);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className="relative flex items-start gap-3 w-80 sm:w-84 rounded-xl shadow-2xl shadow-zinc-950/20 dark:shadow-black/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/90 overflow-hidden animate-in slide-in-from-right-5 fade-in duration-300 transition-all"
      role="alert"
    >
      {/* Accent left border pill */}
      <div className={`absolute left-0 top-2.5 bottom-2.5 w-1 ${c.bar} rounded-r-full`} />

      {/* Icon badge */}
      <div className="flex-shrink-0 pl-3.5 pt-3">
        <div className={`p-1.5 rounded-lg border ${c.badge_bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon_color}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-3 pr-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${c.icon_color}`}>
          {c.label}
        </p>
        <p className="text-xs font-medium leading-snug text-zinc-900 dark:text-zinc-100 break-words">
          {message}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 mt-2.5 mr-2.5 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-2 right-0 h-0.5 bg-transparent overflow-hidden">
        <div className={`h-full ${c.bar} opacity-40 animate-[shrink_4.5s_linear_forwards]`} />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 items-end"
      >
        {toasts.map(t => (
          <Toast key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
