import React, { useEffect } from 'react';
import { CheckCircle, Trash2, AlertTriangle, X } from 'lucide-react';

export interface ConfirmModalItem {
  label: string;
  value: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  variant: 'save' | 'delete' | 'edit';
  items?: ConfirmModalItem[];
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const variantConfig = {
  save: {
    icon: CheckCircle,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-500/30',
    accentBar: 'from-emerald-500 to-teal-500',
    defaultConfirm: 'Confirmar Guardado',
  },
  delete: {
    icon: Trash2,
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    btnClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/30',
    accentBar: 'from-red-500 to-rose-500',
    defaultConfirm: 'Eliminar Registro',
  },
  edit: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    btnClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-500/30',
    accentBar: 'from-amber-500 to-orange-500',
    defaultConfirm: 'Confirmar Edición',
  },
};

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, variant, items, confirmText, cancelText, loading }: ConfirmModalProps) {
  const config = variantConfig[variant];
  const IconComp = config.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Accent Bar */}
        <div className={`h-1.5 bg-gradient-to-r ${config.accentBar}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-5">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`p-3 rounded-xl ${config.iconBg} shrink-0`}>
              <IconComp className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 leading-tight">{title}</h3>
              {message && (
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
              )}
            </div>
          </div>

          {/* Data Summary Table */}
          {items && items.length > 0 && (
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden mb-6">
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">{item.label}</span>
                    <span className="text-gray-800 dark:text-slate-200 font-semibold text-right max-w-[55%] truncate" title={item.value}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all border border-gray-200 dark:border-slate-600 disabled:opacity-50"
            >
              {cancelText || 'Cancelar'}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 ${config.btnClass}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IconComp className="w-4 h-4" />
              )}
              {confirmText || config.defaultConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
