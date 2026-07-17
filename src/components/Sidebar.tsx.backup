import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, ChevronRight, History } from 'lucide-react';

export type ViewType = 'dashboard' | 'dictamenes-list' | 'dictamenes-form' | 'dictamenes-detail' | 'configuracion' | 'auditoria';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  onLogout: () => void;
  userRole: string;
}

export default function Sidebar({ currentView, onChangeView, onLogout, userRole }: SidebarProps) {
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMINISTRADOR', 'AUTORIZADOR', 'CAPTURISTA'] },
    { id: 'dictamenes-list', label: 'Dictámenes', icon: FileText, roles: ['ADMINISTRADOR', 'AUTORIZADOR', 'CAPTURISTA'] },
    { id: 'auditoria', label: 'Auditoría', icon: History, roles: ['ADMINISTRADOR'] },
    { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['ADMINISTRADOR'] },
  ] as const;

  const navItems = allNavItems.filter(item => item.roles.includes(userRole as any));

  const isActive = (id: string) => {
    if (id === 'dictamenes-list' && (currentView === 'dictamenes-form' || currentView === 'dictamenes-detail')) return true;
    return currentView === id;
  };

  return (
    <div className="w-64 flex-shrink-0 bg-gradient-to-b from-gem-primary to-[#6b1535] text-white flex flex-col h-screen sticky top-0 border-r border-gem-primary-dark shadow-[4px_0_24px_rgba(149,31,69,0.15)] relative z-20 print:hidden">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
          <span className="text-white font-bold text-2xl tracking-tighter">G</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-widest text-gem-secondary uppercase">DGRM</span>
          <span className="text-xs text-white/70 font-medium">Sistema de Dictámenes</span>
        </div>
      </div>

      <div className="flex-1 py-8 px-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 px-2">Menú Principal</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                active 
                  ? 'bg-white text-gem-primary font-semibold shadow-lg' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {active && (
                <div className="absolute inset-y-0 left-0 w-1 bg-gem-secondary rounded-r-full"></div>
              )}
              <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 text-gem-primary/50" />}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-white/80 hover:bg-red-500/20 hover:text-white transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
