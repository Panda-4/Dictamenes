import { useState } from 'react';
import { Search, Plus, Filter, FileText, ChevronRight, Eye, X, ChevronDown, Download } from 'lucide-react';
import { SolicitudModel } from '../types';

interface DictamenListProps {
  onCreate: () => void;
  onEdit: (solicitud: SolicitudModel) => void;
  onViewDetail: (solicitud: SolicitudModel) => void;
  onDelete: (folioInterno: number) => void;
  onExportExcel: () => void;
  data: SolicitudModel[];
  userRole: string;
}

export default function DictamenList({ onCreate, onEdit, onViewDetail, onDelete, onExportExcel, data, userRole }: DictamenListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [filterOficio, setFilterOficio] = useState('');
  const [filterDependencia, setFilterDependencia] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const filteredData = data.filter(d => {
    const matchesSearch = !searchTerm || 
      d.folioInterno?.toString().includes(searchTerm) ||
      d.folioInterno?.toString().padStart(4, '0').includes(searchTerm);
    const matchesTipo = !filterTipo || d.tipoSolicitud === filterTipo;
    const matchesEstatus = !filterEstatus || d.estatusGeneral === filterEstatus;
    const matchesOficio = !filterOficio || (d.numeroOficioSolicitud || '').toLowerCase().includes(filterOficio.toLowerCase());
    const matchesDependencia = !filterDependencia || (d.dependenciaOPD && d.dependenciaOPD.toLowerCase().includes(filterDependencia.toLowerCase()));
    const matchesDateFrom = !filterDateFrom || (d.fechaRecepcionDGRMOM && d.fechaRecepcionDGRMOM >= filterDateFrom);
    const matchesDateTo = !filterDateTo || (d.fechaRecepcionDGRMOM && d.fechaRecepcionDGRMOM <= filterDateTo);
    return matchesSearch && matchesTipo && matchesEstatus && matchesOficio && matchesDependencia && matchesDateFrom && matchesDateTo;
  });

  const activeFilters = [filterTipo, filterEstatus, filterOficio, filterDependencia, filterDateFrom, filterDateTo].filter(Boolean).length;

  const clearFilters = () => { 
    setFilterTipo(''); 
    setFilterEstatus(''); 
    setFilterOficio('');
    setFilterDependencia('');
    setFilterDateFrom(''); 
    setFilterDateTo(''); 
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'En Opinión Técnica de Subdirección de Fianzas y Seguros': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
      case 'En proceso de elaboración': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800';
      case 'En Firma de Dirección General': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800';
      case 'En autorización de la OM': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Concluido Entregado a dependencia solicitante': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const selectCls = "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary p-2.5 transition-colors";

  return (
    <>
    <div className="w-full max-w-7xl mx-auto py-8 print:hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 tracking-tight">Sistema de Seguimiento a las Solicitudes de Dictamen</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Consulta y seguimiento de solicitudes</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Botón Exportar Excel */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-md shadow-emerald-600/20"
            title="Exportar a Excel con todos los campos"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
          {userRole !== 'CONSULTA' && (
          <button onClick={onCreate} className="flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gem-primary hover:bg-gem-primary-dark transition-all shadow-lg shadow-gem-primary/20">
            <Plus className="w-5 h-5" /> Nueva Solicitud
          </button>
          )}
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col pt-4">
        
        {/* Search + Filter toggle */}
        <div className="px-6 pb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por número de folio..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-all text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border transition-all ${showFilters || activeFilters > 0 ? 'bg-gem-primary/10 text-gem-primary border-gem-primary/20 dark:bg-gem-primary/20' : 'text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            <Filter className="w-4 h-4" /> Filtros {activeFilters > 0 && <span className="bg-gem-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{activeFilters}</span>}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="px-6 pb-4 border-t border-gray-100 dark:border-slate-700 pt-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tipo de Solicitud</label>
                <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className={`w-full ${selectCls}`}>
                  <option value="">Todos</option>
                  <option>Dictamen Técnico</option>
                  <option>Dictamen de Procedencia</option>
                  <option>Opinión Técnica Previa</option>
                  <option>Dictamen Previo</option>
                  <option>Excepción a Medidas de Austeridad</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Estatus</label>
                <select value={filterEstatus} onChange={e => setFilterEstatus(e.target.value)} className={`w-full ${selectCls}`}>
                  <option value="">Todos</option>
                  <option value="En Opinión Técnica de Subdirección de Fianzas y Seguros">En Opinión Técnica</option>
                  <option value="En proceso de elaboración">En proceso de elaboración</option>
                  <option value="En Firma de Dirección General">En Firma de Dirección General</option>
                  <option value="En autorización de la OM">En autorización de la OM</option>
                  <option value="Concluido Entregado a dependencia solicitante">Concluido Entregado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Número de Oficio</label>
                <input 
                  type="text" 
                  placeholder="Ej. OM/001/2026"
                  value={filterOficio} 
                  onChange={e => setFilterOficio(e.target.value)} 
                  className={`w-full ${selectCls}`} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dependencia</label>
                <input 
                  type="text" 
                  placeholder="Ej. Secretaría de Finanzas"
                  value={filterDependencia} 
                  onChange={e => setFilterDependencia(e.target.value)} 
                  className={`w-full ${selectCls}`} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Fecha Desde</label>
                <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className={`w-full ${selectCls}`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Fecha Hasta</label>
                <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className={`w-full ${selectCls}`} />
              </div>
            </div>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="mt-3 text-xs font-semibold text-gem-primary hover:underline">Limpiar filtros</button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
             <thead className="bg-gray-50/80 dark:bg-slate-800/80 text-xs uppercase text-gray-500 dark:text-slate-400 border-y border-gray-200 dark:border-slate-700">
                <tr>
                   <th className="px-6 py-4 font-semibold w-24">Folio</th>
                   <th className="px-6 py-4 font-semibold">Dependencia</th>
                   <th className="px-6 py-4 font-semibold">Oficio</th>
                   <th className="px-6 py-4 font-semibold">Tipo Solicitud</th>
                   <th className="px-6 py-4 font-semibold">Monto</th>
                   <th className="px-6 py-4 font-semibold text-center">Estatus</th>
                   <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 bg-white/50 dark:bg-transparent">
                {filteredData.map(item => (
                  <tr key={item.folioInterno} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-800 dark:text-slate-100 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                        #{item.folioInterno?.toString().padStart(4, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 dark:text-slate-100 truncate max-w-[260px]" title={item.dependenciaOPD}>
                        {item.dependenciaOPD || 'No especificada'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-600 dark:text-slate-400 truncate max-w-[200px] flex items-center gap-1.5" title={item.numeroOficioSolicitud}>
                        <FileText className="w-3.5 h-3.5 text-blue-500/80 dark:text-slate-500" />
                        <span>{item.numeroOficioSolicitud || 'S/N'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-300">{item.tipoSolicitud || 'No especificado'}</td>
                    <td className="px-6 py-4 font-mono">${item.montoSolicitud?.toLocaleString('es-MX', {minimumFractionDigits: 2}) || '0.00'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.estatusGeneral)}`}>
                         {item.estatusGeneral}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {userRole === 'ADMINISTRADOR' && (
                          <button 
                            onClick={() => item.folioInterno && onDelete(item.folioInterno)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors inline-flex opacity-0 group-hover:opacity-100"
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                        <button 
                           onClick={() => onViewDetail(item)}
                           className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors inline-flex opacity-0 group-hover:opacity-100"
                           title="Ver Detalle"
                        >
                           <Eye className="w-5 h-5" />
                        </button>
                        {userRole !== 'CONSULTA' && (
                        <button 
                           onClick={() => onEdit(item)}
                           className="p-2 text-gem-primary hover:bg-gem-primary/10 rounded-lg transition-colors inline-flex opacity-0 group-hover:opacity-100"
                           title="Editar"
                        >
                           <ChevronRight className="w-5 h-5" />
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredData.length === 0 && (
                   <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                          <Search className="w-6 h-6 text-gray-400 dark:text-slate-500" />
                        </div>
                        <p className="text-base font-medium">No se encontraron solicitudes</p>
                        <p className="text-sm">Intenta con otros términos de búsqueda.</p>
                      </td>
                   </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}
