import React from 'react';
import { User, Shield, Calendar, Clock, LogOut, ArrowLeft, Mail } from 'lucide-react';
import { AuthUser } from '../services/authService';

interface ProfileProps {
  user: AuthUser | null;
  onLogout: () => void;
  onBack: () => void;
}

function decodeTokenPayload(token: string): Record<string, any> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const rolColors: Record<string, string> = {
  ADMINISTRADOR: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  AUTORIZADOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  CAPTURISTA: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  CONSULTA: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
};

export default function Profile({ user, onLogout, onBack }: ProfileProps) {
  if (!user) return null;

  const payload = decodeTokenPayload(user.token);
  const expDate = payload?.exp ? new Date(payload.exp * 1000) : null;
  const iatDate = payload?.iat ? new Date(payload.iat * 1000) : null;
  const isExpired = expDate ? expDate < new Date() : false;

  return (
    <div className="w-full max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-slate-700 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-gem-primary via-gem-secondary to-gem-primary opacity-90"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gem-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 p-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gem-primary/10 dark:bg-gem-primary/20 border-2 border-gem-primary/20 flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-gem-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 truncate">
                {user.nombreCompleto}
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`${rolColors[user.rol] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'} px-3 py-1 rounded-lg text-xs font-bold`}>
                  {user.rol}
                </span>
                <span className="text-sm text-gray-500 dark:text-slate-400 font-mono">@{user.username}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
              <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" /> Información de la Cuenta
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                <p className="text-base font-semibold text-gray-800 dark:text-slate-100">{user.nombreCompleto}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nombre de Usuario</label>
                <p className="text-base font-semibold text-gray-800 dark:text-slate-100 font-mono">{user.username}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rol</label>
                <div>
                  <span className={`${rolColors[user.rol] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'} px-3 py-1 rounded-lg text-xs font-bold`}>
                    {user.rol}
                  </span>
                </div>
              </div>
            </div>

            {payload && (
              <>
                <div className="border-b border-gray-100 dark:border-slate-700 pb-2 pt-2">
                  <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Sesión
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {iatDate && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Inicio de Sesión
                      </label>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                        {iatDate.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {expDate && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Expiración
                      </label>
                      <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                        {expDate.toLocaleString()}
                        {isExpired && ' (Expirada)'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" /> Regresar
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-600/30"
            >
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
