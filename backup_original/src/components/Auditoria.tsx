import React, { useState, useEffect } from 'react';
import { History, ArrowRightLeft, ShieldAlert, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
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
}

export default function Auditoria() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/auditoria`);
      if (res.ok) {
        const data = await res.json();
        // Format dates simply for display
        const formattedData = data.map((log: any) => ({
          ...log,
          fecha: log.fecha ? log.fecha.replace('T', ' ').substring(0, 19) : ''
        }));
        // Sort descending by ID so newest is first
        formattedData.sort((a: AuditoriaLog, b: AuditoriaLog) => b.id - a.id);
        setLogs(formattedData);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const parseCambios = (json: string | null): CambioDetalle[] => {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  };

  const filteredLogs = logs.filter(log => 
    (log.usuario && log.usuario.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.detalle && log.detalle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.entidad && log.entidad.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 tracking-tight">Auditoría del Sistema</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Registro de todas las operaciones realizadas en la plataforma.</p>
        </div>
      </div>

      {/* Registro de Auditoría (Tabla) */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col pt-4">
        <div className="px-6 pb-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">Registro Detallado</h3>
          <div className="flex gap-3 text-sm">
            <input 
              type="text" 
              placeholder="Buscar acción o usuario..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
             <thead className="bg-gray-50/80 dark:bg-slate-900/50 text-xs uppercase text-gray-500 dark:text-slate-400 border-y border-gray-200 dark:border-slate-700">
                <tr>
                   <th className="px-6 py-4 font-semibold w-10"></th>
                   <th className="px-6 py-4 font-semibold w-52">Fecha / Hora</th>
                   <th className="px-6 py-4 font-semibold">Usuario y Rol</th>
                   <th className="px-6 py-4 font-semibold text-center">Acción</th>
                   <th className="px-6 py-4 font-semibold">Módulo / Entidad</th>
                   <th className="px-6 py-4 font-semibold">Detalle del Cambio</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredLogs.map(log => {
                  const cambios = parseCambios(log.cambiosDetalle);
                  const hasCambios = cambios.length > 0;
                  const isExpanded = expandedRows.has(log.id);

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors ${hasCambios ? 'cursor-pointer' : ''}`}
                          onClick={() => hasCambios && toggleExpand(log.id)}>
                        {/* Expand toggle */}
                        <td className="px-4 py-4 text-center">
                          {hasCambios && (
                            <button 
                              className="p-1 rounded-lg text-gray-400 hover:text-gem-primary hover:bg-gem-primary/10 transition-all"
                              title="Ver cambios detallados"
                            >
                              {isExpanded 
                                ? <ChevronUp className="w-4 h-4" /> 
                                : <ChevronDown className="w-4 h-4" />
                              }
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">
                          {log.fecha}
                        </td>
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
                                {cambios.length} campo{cambios.length !== 1 ? 's' : ''} modificado{cambios.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-300">
                          {log.entidad}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 dark:text-slate-400 max-w-md truncate" title={log.detalle}>
                             {log.detalle}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row: detailed changes */}
                      {hasCambios && isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-0 py-0">
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
                                      <td className="px-5 py-2.5 font-semibold text-gray-700 dark:text-slate-300 text-xs">
                                        {c.campo}
                                      </td>
                                      <td className="px-5 py-2.5">
                                        <span className="inline-block bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-800/40 max-w-[200px] truncate" title={c.antes}>
                                          {c.antes}
                                        </span>
                                      </td>
                                      <td className="px-1 py-2.5 text-center">
                                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mx-auto" />
                                      </td>
                                      <td className="px-5 py-2.5">
                                        <span className="inline-block bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/40 max-w-[200px] truncate" title={c.despues}>
                                          {c.despues}
                                        </span>
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
                {filteredLogs.length === 0 && (
                   <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                          <ShieldAlert className="w-6 h-6 text-gray-400 dark:text-slate-500" />
                        </div>
                        <p className="text-base font-medium">No hay registros</p>
                      </td>
                   </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
