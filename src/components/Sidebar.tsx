import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, ChevronRight, History, Upload } from 'lucide-react';

export type ViewType = 'dashboard' | 'dictamenes-list' | 'dictamenes-form' | 'dictamenes-detail' | 'configuracion' | 'auditoria' | 'profile' | 'importar';

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
    { id: 'importar', label: 'Importar Excel', icon: Upload, roles: ['ADMINISTRADOR'] },
    { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['ADMINISTRADOR'] },
  ] as const;

  const navItems = allNavItems.filter(item => item.roles.includes(userRole as any));

  const isActive = (id: string) => {
    if (id === 'dictamenes-list' && (currentView === 'dictamenes-form' || currentView === 'dictamenes-detail')) return true;
    return currentView === id;
  };

  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 flex flex-col h-screen sticky top-0 border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-slate-900/50 relative z-20 print:hidden">
      {/* Logo / Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800">
        <div className="w-10 h-10 bg-gem-primary rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-2xl tracking-tighter">G</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs tracking-wider text-gem-primary dark:text-gem-secondary uppercase">Dirección General de Recursos Materiales</span>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium leading-tight">Sistema de Seguimiento a las Solicitudes de Dictamen</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-8 px-4 flex flex-col gap-1">
        <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Menú Principal</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                active
                  ? 'bg-gem-primary text-white font-semibold shadow-md shadow-gem-primary/20'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
              }`}
            >
              {active && (
                <div className="absolute inset-y-0 right-0 w-1 bg-gem-secondary rounded-l-full"></div>
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 text-white/60" />}
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
