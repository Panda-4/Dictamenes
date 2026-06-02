import React, { useState, useEffect } from 'react';
import { History, ArrowRightLeft, ShieldAlert, ChevronDown, ChevronUp, ArrowRight, Search, Download, Calendar, RotateCcw, ChevronLeft, ChevronRight, Layers, PlusCircle, RefreshCw, Trash2, LogIn, Monitor, Globe } from 'lucide-react';
import { authFetch, API_BASE } from '../services/authService';

interface CambioDetalle {
  campo: string;
  antes: string;
  despues: string;
}

interface AuditoriaLog {
  id: number;
  fecha: string;
  rol: string;
  usuario: string;
  accion: string;
  entidad: string;
  detalle: string;
  cambiosDetalle: string | null;
  ip: string | null;
  dispositivo: string | null;
}

type TabType = 'cambios' | 'accesos';

export default function Auditoria() {
  const [activeTab, setActiveTab] = useState<TabType>('cambios');

  // === ESTADO PARA CAMBIOS ===
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [usuarioInput, setUsuarioInput] = useState('');
  const [usuarioFilter, setUsuarioFilter] = useState('');
  const [accionFilter, setAccionFilter] = useState('');
  const [fechaDesdeFilter, setFechaDesdeFilter] = useState('');
  const [fechaHastaFilter, setFechaHastaFilter] = useState('');

  // === ESTADO PARA ACCESOS ===
  const [accesos, setAccesos] = useState<AuditoriaLog[]>([]);
  const [loadingAccesos, setLoadingAccesos] = useState(false);
  const [accesosPage, setAccesosPage] = useState(0);
  const [accesosTotal, setAccesosTotal] = useState(0);
  const [accesosPages, setAccesosPages] = useState(0);
  const [accesosUsuario, setAccesosUsuario] = useState('');
  const [accesosUsuarioInput, setAccesosUsuarioInput] = useState('');
  const [accesosDesde, setAccesosDesde] = useState('');
  const [accesosHasta, setAccesosHasta] = useState('');

  // === STATS ===
  const [stats, setStats] = useState({
    total: 0, creaciones: 0, actualizaciones: 0, eliminaciones: 0, accesos: 0,
  });

  // Debounce username - cambios
  useEffect(() => {
    const h = setTimeout(() => { setUsuarioFilter(usuarioInput); setCurrentPage(0); }, 400);
    return () => clearTimeout(h);
  }, [usuarioInput]);

  // Debounce username - accesos
  useEffect(() => {
    const h = setTimeout(() => { setAccesosUsuario(accesosUsuarioInput); setAccesosPage(0); }, 400);
    return () => clearTimeout(h);
  }, [accesosUsuarioInput]);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (activeTab === 'cambios') fetchLogs();
  }, [activeTab, currentPage, pageSize, usuarioFilter, accionFilter, fechaDesdeFilter, fechaHastaFilter]);

  useEffect(() => {
    if (activeTab === 'accesos') fetchAccesos();
  }, [activeTab, accesosPage, accesosUsuario, accesosDesde, accesosHasta]);

  const fetchStats = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/auditoria/stats`);
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error('Error fetching stats:', e); }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('size', String(pageSize));
      if (usuarioFilter) params.append('usuario', usuarioFilter);
      if (accionFilter) params.append('accion', accionFilter);
      if (fechaDesdeFilter) params.append('fechaDesde', fechaDesdeFilter + 'T00:00:00');
      if (fechaHastaFilter) params.append('fechaHasta', fechaHastaFilter + 'T23:59:59');
      const res = await authFetch(`${API_BASE}/api/auditoria?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.content.map((log: any) => ({
          ...log,
          fecha: log.fecha ? log.fecha.replace('T', ' ').substring(0, 19) : ''
        })));
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      }
    } catch (e) { console.error('Error fetching logs:', e); }
    finally { setLoading(false); }
  };

  const fetchAccesos = async () => {
    try {
      setLoadingAccesos(true);
      const params = new URLSearchParams();
      params.append('page', String(accesosPage));
      params.append('size', '20');
      if (accesosUsuario) params.append('usuario', accesosUsuario);
      if (accesosDesde) params.append('fechaDesde', accesosDesde + 'T00:00:00');
      if (accesosHasta) params.append('fechaHasta', accesosHasta + 'T23:59:59');
      const res = await authFetch(`${API_BASE}/api/auditoria/accesos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAccesos(data.content.map((log: any) => ({
          ...log,
          fecha: log.fecha ? log.fecha.replace('T', ' ').substring(0, 19) : ''
        })));
        setAccesosPages(data.totalPages);
        setAccesosTotal(data.totalElements);
      }
    } catch (e) { console.error('Error fetching accesos:', e); }
    finally { setLoadingAccesos(false); }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (accionFilter) params.append('accion', accionFilter);
      if (usuarioFilter) params.append('usuario', usuarioFilter);
      if (fechaDesdeFilter) params.append('fechaDesde', fechaDesdeFilter + 'T00:00:00');
      if (fechaHastaFilter) params.append('fechaHasta', fechaHastaFilter + 'T23:59:59');
      const res = await authFetch(`${API_BASE}/api/auditoria/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_logs_${new Date().toISOString().substring(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) { console.error('Error al exportar:', e); }
  };

  const handleClearFilters = () => {
    setUsuarioInput(''); setUsuarioFilter(''); setAccionFilter('');
    setFechaDesdeFilter(''); setFechaHastaFilter(''); setCurrentPage(0);
  };

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const parseCambios = (json: string | null): CambioDetalle[] => {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  };

  // ─── PAGINACIÓN ────────────────────────────────────────────────────────────
  const PaginationBar = ({ page, setPage, totalPgs, total, size }: any) => (
    <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-900/20">
      <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        Mostrando {page * size + 1}–{Math.min((page + 1) * size, total)} de {total} registros
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setPage(0)} disabled={page === 0} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4 -mr-1.5 inline-block" /><ChevronLeft className="w-4 h-4 inline-block" />
        </button>
        <button onClick={() => setPage((p: number) => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 px-2">Página {page + 1} de {totalPgs}</span>
        <button onClick={() => setPage((p: number) => Math.min(totalPgs - 1, p + 1))} disabled={page === totalPgs - 1} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => setPage(totalPgs - 1)} disabled={page === totalPgs - 1} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight className="w-4 h-4 inline-block" /><ChevronRight className="w-4 h-4 -ml-1.5 inline-block" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 tracking-tight">Auditoría del Sistema</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Registro de todas las operaciones e inicios de sesión en la plataforma.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Operaciones', value: stats.total, icon: Layers, accent: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-50 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'Creaciones', value: stats.creaciones, icon: PlusCircle, accent: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Actualizaciones', value: stats.actualizaciones, icon: RefreshCw, accent: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-50 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400' },
          { label: 'Eliminaciones', value: stats.eliminaciones, icon: Trash2, accent: 'from-rose-500 to-red-600', iconBg: 'bg-rose-50 dark:bg-rose-900/40', iconColor: 'text-rose-600 dark:text-rose-400' },
          { label: 'Inicios de Sesión', value: stats.accesos || 0, icon: LogIn, accent: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-50 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400' },
        ].map((card, i) => (
          <div key={i} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.accent}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100">{card.value.toLocaleString()}</h4>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-900/40">
          <button
            onClick={() => setActiveTab('cambios')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'cambios' ? 'border-gem-primary text-gem-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Bitácora de Cambios
          </button>
          <button
            onClick={() => setActiveTab('accesos')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'accesos' ? 'border-gem-primary text-gem-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
          >
            <LogIn className="w-4 h-4" />
            Historial de Accesos
            {stats.accesos > 0 && (
              <span className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full">{stats.accesos}</span>
            )}
          </button>
        </div>

        {/* ─── PESTAÑA: BITÁCORA DE CAMBIOS ─── */}
        {activeTab === 'cambios' && (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">Registro Detallado</h3>
                  <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gem-primary hover:bg-gem-primary-dark transition-all rounded-xl shadow-lg shadow-gem-primary/10">
                    <Download className="w-4 h-4" /> Exportar CSV
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input type="text" placeholder="Buscar usuario..." value={usuarioInput} onChange={e => setUsuarioInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <select value={accionFilter} onChange={e => { setAccionFilter(e.target.value); setCurrentPage(0); }}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200">
                      <option value="">Todas las acciones</option>
                      <option value="CREACIÓN">CREACIÓN</option>
                      <option value="ACTUALIZACIÓN">ACTUALIZACIÓN</option>
                      <option value="ELIMINACIÓN">ELIMINACIÓN</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input type="date" value={fechaDesdeFilter} onChange={e => { setFechaDesdeFilter(e.target.value); setCurrentPage(0); }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200" title="Fecha desde" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input type="date" value={fechaHastaFilter} onChange={e => { setFechaHastaFilter(e.target.value); setCurrentPage(0); }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200" title="Fecha hasta" />
                  </div>
                </div>
                {(usuarioFilter || accionFilter || fechaDesdeFilter || fechaHastaFilter) && (
                  <div className="flex justify-end">
                    <button onClick={handleClearFilters} className="flex items-center gap-1.5 text-xs font-bold text-gem-primary hover:text-gem-primary-dark transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla cambios */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-9 h-9 border-4 border-gem-primary/20 border-t-gem-primary rounded-full animate-spin"></div>
                    <p className="text-xs font-semibold text-gray-400">Cargando bitácora...</p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
                  <thead className="bg-gray-50/80 dark:bg-slate-900/50 text-xs uppercase text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-4 font-semibold w-10"></th>
                      <th className="px-6 py-4 font-semibold w-44">Fecha / Hora</th>
                      <th className="px-6 py-4 font-semibold">Usuario y Rol</th>
                      <th className="px-6 py-4 font-semibold text-center">Acción</th>
                      <th className="px-6 py-4 font-semibold">Módulo</th>
                      <th className="px-6 py-4 font-semibold">IP</th>
                      <th className="px-6 py-4 font-semibold">Dispositivo</th>
                      <th className="px-6 py-4 font-semibold">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {logs.map(log => {
                      const cambios = parseCambios(log.cambiosDetalle);
                      const hasCambios = cambios.length > 0;
                      const isExpanded = expandedRows.has(log.id);
                      return (
                        <React.Fragment key={log.id}>
                          <tr className={`hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors ${hasCambios ? 'cursor-pointer' : ''}`} onClick={() => hasCambios && toggleExpand(log.id)}>
                            <td className="px-4 py-4 text-center">
                              {hasCambios && (
                                <button className="p-1 rounded-lg text-gray-400 hover:text-gem-primary hover:bg-gem-primary/10 transition-all">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">{log.fecha}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800 dark:text-slate-200">{log.usuario}</div>
                              <div className="text-xs text-gem-primary font-medium mt-0.5">{log.rol}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                log.accion?.toUpperCase().includes('CREACIÓN') || log.accion?.toUpperCase().includes('CREACION') ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                                log.accion?.toUpperCase().includes('ELIMINACIÓN') || log.accion?.toUpperCase().includes('ELIMINACION') ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700' :
                                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700'
                              }`}>
                                <ArrowRightLeft className="w-3 h-3" />
                                {log.accion}
                              </span>
                              {hasCambios && (
                                <div className="mt-1">
                                  <span className="text-[10px] font-medium text-gem-primary bg-gem-primary/10 px-2 py-0.5 rounded-full">
                                    {cambios.length} campo{cambios.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-300">{log.entidad}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 font-mono">
                                <Globe className="w-3 h-3 shrink-0" />
                                {log.ip || '—'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                                <Monitor className="w-3 h-3 shrink-0" />
                                {log.dispositivo || '—'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-600 dark:text-slate-400 max-w-xs truncate" title={log.detalle}>{log.detalle}</div>
                            </td>
                          </tr>
                          {hasCambios && isExpanded && (
                            <tr>
                              <td colSpan={8} className="px-0 py-0">
                                <div className="mx-6 my-3 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/60 dark:to-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                  <div className="px-5 py-3 border-b border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 flex items-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4 text-gem-primary" />
                                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                      Detalle de cambios — {cambios.length} campo{cambios.length !== 1 ? 's' : ''} modificado{cambios.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-100 dark:border-slate-700">
                                        <th className="px-5 py-2.5 text-left text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/3">Campo</th>
                                        <th className="px-5 py-2.5 text-left text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider w-1/3">Valor Anterior</th>
                                        <th className="px-3 py-2.5 w-6"></th>
                                        <th className="px-5 py-2.5 text-left text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider w-1/3">Valor Nuevo</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                                      {cambios.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors">
                                          <td className="px-5 py-2.5 font-semibold text-gray-700 dark:text-slate-300 text-xs">{c.campo}</td>
                                          <td className="px-5 py-2.5">
                                            <span className="inline-block bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-800/40 max-w-[200px] truncate" title={c.antes}>{c.antes}</span>
                                          </td>
                                          <td className="px-1 py-2.5 text-center">
                                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mx-auto" />
                                          </td>
                                          <td className="px-5 py-2.5">
                                            <span className="inline-block bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/40 max-w-[200px] truncate" title={c.despues}>{c.despues}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                            <ShieldAlert className="w-6 h-6 text-gray-400 dark:text-slate-500" />
                          </div>
                          <p className="text-base font-medium">No hay registros</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {!loading && totalPages > 0 && (
              <PaginationBar page={currentPage} setPage={setCurrentPage} totalPgs={totalPages} total={totalElements} size={pageSize} />
            )}
          </>
        )}

        {/* ─── PESTAÑA: HISTORIAL DE ACCESOS ─── */}
        {activeTab === 'accesos' && (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">Historial de Inicios de Sesión</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Solo lectura — Registro cronológico de todos los accesos al sistema</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input type="text" placeholder="Buscar usuario..." value={accesosUsuarioInput} onChange={e => setAccesosUsuarioInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input type="date" value={accesosDesde} onChange={e => { setAccesosDesde(e.target.value); setAccesosPage(0); }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200" title="Fecha desde" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input type="date" value={accesosHasta} onChange={e => { setAccesosHasta(e.target.value); setAccesosPage(0); }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200" title="Fecha hasta" />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingAccesos ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-9 h-9 border-4 border-gem-primary/20 border-t-gem-primary rounded-full animate-spin"></div>
                    <p className="text-xs font-semibold text-gray-400">Cargando accesos...</p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
                  <thead className="bg-gray-50/80 dark:bg-slate-900/50 text-xs uppercase text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-44">Fecha / Hora</th>
                      <th className="px-6 py-4 font-semibold">Usuario</th>
                      <th className="px-6 py-4 font-semibold">Rol</th>
                      <th className="px-6 py-4 font-semibold">Dirección IP</th>
                      <th className="px-6 py-4 font-semibold">Dispositivo / Navegador</th>
                      <th className="px-6 py-4 font-semibold">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {accesos.map(log => (
                      <tr key={log.id} className="hover:bg-violet-50/40 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">{log.fecha}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800 dark:text-slate-200">{log.usuario}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700">
                            <LogIn className="w-3 h-3" />
                            {log.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300 font-mono">
                            <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                            {log.ip || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                            <Monitor className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                            {log.dispositivo || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate" title={log.detalle}>{log.detalle}</td>
                      </tr>
                    ))}
                    {accesos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                            <LogIn className="w-6 h-6 text-gray-400 dark:text-slate-500" />
                          </div>
                          <p className="text-base font-medium">Sin registros de acceso</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {!loadingAccesos && accesosPages > 0 && (
              <PaginationBar page={accesosPage} setPage={setAccesosPage} totalPgs={accesosPages} total={accesosTotal} size={20} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
