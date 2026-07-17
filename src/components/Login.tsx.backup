import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Decorative blurs */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-gem-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-gem-secondary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gem-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gem-primary/30 border border-gem-primary-light/30">
            <span className="text-white font-bold text-4xl tracking-tighter">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Sistema de Dictámenes
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1 tracking-wide uppercase">
            Gobierno del Estado de México • DGRM
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] p-8 space-y-6 relative overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-gem-primary via-gem-secondary to-gem-primary"></div>

          <div className="space-y-1 pt-2">
            <h2 className="text-xl font-bold text-gray-800">Iniciar Sesión</h2>
            <p className="text-sm text-gray-500">Ingrese sus credenciales para acceder al sistema.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ej. admin"
              autoFocus
              className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm placeholder:text-gray-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 pr-12 transition-colors shadow-sm placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gem-primary hover:bg-gem-primary-dark transition-all shadow-lg shadow-gem-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          © {new Date().getFullYear()} Dirección General de Recursos Materiales
        </p>
      </div>
    </div>
  );
}
