import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, Edit, History, X, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { SolicitudModel } from '../types';
import { authFetch, API_BASE } from '../services/authService';

interface DictamenDetalleProps {
  solicitud: SolicitudModel;
  onBack: () => void;
  onEdit: (solicitud: SolicitudModel) => void;
  userRole: string;
}

export default function DictamenDetalle({ solicitud, onBack, onEdit, userRole }: DictamenDetalleProps) {
  const [showHistorial, setShowHistorial] = useState(false);
  const [historialLogs, setHistorialLogs] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    if (showHistorial && solicitud.folioInterno) {
      fetchHistorial();
    }
  }, [showHistorial, solicitud.folioInterno]);

  const fetchHistorial = async () => {
    try {
      setLoadingHistorial(true);
      const res = await authFetch(`${API_BASE}/api/solicitudes/${solicitud.folioInterno}/historial`);
      if (res.ok) {
        const data = await res.json();
        setHistorialLogs(data.map((log: any) => ({
          ...log,
          fecha: log.fecha ? log.fecha.replace('T', ' ').substring(0, 19) : ''
        })));
      }
    } catch (e) {
      console.error('Error fetching request history:', e);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const parseCambios = (json: string | null) => {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
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

  return (
    <div className="w-full max-w-5xl mx-auto py-8 print:py-0 print:max-w-full">
      {/* Header / Actions (Hidden on Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Volver a la lista
        </button>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowHistorial(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-900 bg-gem-secondary hover:bg-gem-secondary-light transition-all shadow-md shadow-gem-secondary/20"
          >
            <History className="w-4 h-4 text-slate-900" /> Ver Seguimiento
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
          <button 
            onClick={() => onEdit(solicitud)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-gem-primary hover:bg-gem-primary-dark transition-all shadow-md shadow-gem-primary/20"
          >
            <Edit className="w-4 h-4" /> Editar Solicitud
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col print:shadow-none print:border-none print:rounded-none">
        
        {/* Print Header */}
        <div className="hidden print:block w-full pb-4 border-b-2 border-gem-primary mb-6">
          <img src="/membrete.png" alt="Gobierno del Estado de México" className="w-full h-auto object-contain max-h-24" />
        </div>

        {/* Card Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:bg-transparent print:px-0 print:py-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
              Detalle de Solicitud #{solicitud.folioInterno?.toString().padStart(4, '0')}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium text-sm">
              Oficio: <span className="text-gray-700 dark:text-slate-300">{solicitud.numeroOficioSolicitud}</span>
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(solicitud.estatusGeneral)}`}>
            {solicitud.estatusGeneral}
          </span>
        </div>
        
        {/* Card Body */}
        <div className="p-8 space-y-10 print:px-0">
          
          {/* Section 1: Información General & Presupuestal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-gem-primary uppercase tracking-widest border-b-2 border-gray-100 dark:border-slate-700 pb-2">Información General</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Tipo de Solicitud</span>
                  <p className="text-gray-800 dark:text-slate-200 font-medium text-base">{solicitud.tipoSolicitud || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Dependencia / OPD</span>
                  <p className="text-gray-800 dark:text-slate-200 font-medium text-base">{solicitud.dependenciaOPD || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Unidad Administrativa</span>
                  <p className="text-gray-800 dark:text-slate-200 font-medium text-base">{solicitud.unidadAdministrativa || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Monto de la Solicitud</span>
                  <p className="text-gray-900 dark:text-slate-100 font-bold text-lg font-mono">${solicitud.montoSolicitud?.toLocaleString('es-MX', {minimumFractionDigits: 2}) || '0.00'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-gem-primary uppercase tracking-widest border-b-2 border-gray-100 dark:border-slate-700 pb-2">Datos Presupuestales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Capítulo</span>
                  <p className="text-gray-800 dark:text-slate-200 font-medium text-base leading-relaxed">{solicitud.capitulo || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Centro de Costos</span>
                  <p className="text-gray-800 dark:text-slate-200 font-medium text-base">{solicitud.centroCostos || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Partida Presupuestal</span>
                  <p className="text-gray-800 dark:text-slate-200 font-medium text-base">{solicitud.partidaPresupuestal || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Giro</span>
                  <p className="text-gray-800 dark:text-slate-200 font-medium text-base">{solicitud.giro || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Fechas y Recepción */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-gem-primary uppercase tracking-widest border-b-2 border-gray-100 dark:border-slate-700 pb-2">Fechas y Recepción</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50/50 dark:bg-slate-900/30 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Recepción DGRM-OM</span>
                <p className="text-gray-800 dark:text-slate-200 font-medium">{solicitud.fechaRecepcionDGRMOM ? new Date(solicitud.fechaRecepcionDGRMOM).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Excepción DGRM-OM</span>
                <p className="text-gray-800 dark:text-slate-200 font-medium">{solicitud.excepcionDGRMOM ? 'Sí' : 'No'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Recepción Dictaminación</span>
                <p className="text-gray-800 dark:text-slate-200 font-medium">{solicitud.fechaRecepcionDictaminacion ? new Date(solicitud.fechaRecepcionDictaminacion).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Excepción Dictaminación</span>
                <p className="text-gray-800 dark:text-slate-200 font-medium">{solicitud.excepcionDictaminacion ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Flujo de Autorización */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-gem-primary uppercase tracking-widest border-b-2 border-gray-100 dark:border-slate-700 pb-2">Dictaminación y Autorizaciones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Procedente</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold ${solicitud.procedente === true ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : solicitud.procedente === false ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {solicitud.procedente === true ? 'Sí' : solicitud.procedente === false ? 'No' : 'Pendiente'}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Dictamen Previo</span>
                <span className="text-gray-800 dark:text-slate-200 font-medium block">
                  {solicitud.cuentaDictamenPrevio || 'N/D'}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Autorización OM</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold ${solicitud.cuentaAutorizacionOM === true ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : solicitud.cuentaAutorizacionOM === false ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {solicitud.cuentaAutorizacionOM === true ? 'Sí' : solicitud.cuentaAutorizacionOM === false ? 'No' : 'Pendiente'}
                </span>
              </div>
            </div>
            
            {/* Descripción */}
            {solicitud.descripcionSolicitud && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Descripción de la Solicitud</span>
                <p className="text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm leading-relaxed border border-gray-100 dark:border-slate-700">
                  {solicitud.descripcionSolicitud}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block w-full px-8 pb-16 pt-8 text-center font-bold text-gem-primary border-t-2 border-gem-secondary/50 mt-12 text-sm break-inside-avoid">
          "2026. Año del Humanismo Mexicano en el Estado de México."
        </div>
      </div>

      {/* Modal de Historial / Seguimiento */}
      {showHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-gem-primary dark:text-gem-secondary" />
                  Seguimiento de la Solicitud
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Folio: #{solicitud.folioInterno?.toString().padStart(4, '0')} | Oficio: {solicitud.numeroOficioSolicitud}
                </p>
              </div>
              <button 
                onClick={() => setShowHistorial(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all animate-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Columna Izquierda: Historial/Bitácora */}
              <div className="md:col-span-2 space-y-6">
                <h4 className="text-sm font-extrabold text-gem-primary dark:text-gem-secondary uppercase tracking-widest border-b-2 border-gray-100 dark:border-slate-700 pb-2">
                  Historial del Expediente
                </h4>

                {loadingHistorial ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-4 border-gem-primary/20 border-t-gem-primary rounded-full animate-spin"></div>
                    <p className="text-xs text-gray-400 font-medium">Cargando historial...</p>
                  </div>
                ) : historialLogs.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-slate-400">
                    <History className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium">No se encontraron registros de auditoría para esta solicitud.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-8 ml-3">
                    {historialLogs.map((log) => {
                      const cambios = parseCambios(log.cambiosDetalle);
                      const isCreation = log.accion === 'CREACIÓN';
                      const isDelete = log.accion === 'ELIMINACIÓN';
                      
                      return (
                        <div key={log.id} className="relative group">
                          {/* Circle Indicator */}
                          <div className={`absolute left-[-32px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 ${
                            isCreation ? 'bg-emerald-500' : isDelete ? 'bg-rose-500' : 'bg-gem-secondary'
                          }`} />

                          {/* Log Content Card */}
                          <div className="bg-gray-50/50 dark:bg-slate-900/25 p-4 rounded-xl border border-gray-100 dark:border-slate-800/80">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                              <div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isCreation ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  isDelete ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' :
                                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                  {log.accion}
                                </span>
                                <h5 className="font-bold text-gray-800 dark:text-slate-200 text-sm mt-1">
                                  {log.usuario} <span className="text-xs font-normal text-gray-500 dark:text-slate-400">({log.rol})</span>
                                </h5>
                              </div>
                              <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
                                {log.fecha}
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed mb-1">
                              {log.detalle}
                            </p>

                            {/* Detalle de cambios si existen */}
                            {cambios.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                                  Campos Modificados
                                </span>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {cambios.map((c: any, idx: number) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-1.5 text-[11px] bg-white dark:bg-slate-900/80 p-1.5 px-2.5 rounded-lg border border-gray-100 dark:border-slate-800">
                                      <span className="font-semibold text-gray-700 dark:text-slate-300">{c.campo}:</span>
                                      <span className="text-rose-600 dark:text-rose-400 line-through truncate max-w-[120px]" title={c.antes}>{c.antes}</span>
                                      <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[120px]" title={c.despues}>{c.despues}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Columna Derecha: Checklist e Info */}
              <div className="space-y-6">
                {/* Card de Estado de Validación */}
                <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-lg">
                  <h4 className="text-xs font-bold text-gem-secondary uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Estado de Validación
                  </h4>

                  {/* Checklist Items */}
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Recepción DGRM-OM',
                        detail: solicitud.fechaRecepcionDGRMOM ? `Ingresado: ${new Date(solicitud.fechaRecepcionDGRMOM).toLocaleDateString()}` : 'Pendiente de registrar recepción',
                        status: solicitud.fechaRecepcionDGRMOM ? 'completed' : 'pending'
                      },
                      {
                        title: 'Recepción Dictaminación',
                        detail: solicitud.fechaRecepcionDictaminacion ? `Recibido: ${new Date(solicitud.fechaRecepcionDictaminacion).toLocaleDateString()}` : 'Pendiente de ingresar a Dictaminación',
                        status: solicitud.fechaRecepcionDictaminacion ? 'completed' : 'pending'
                      },
                      {
                        title: 'Dictamen de Procedencia',
                        detail: solicitud.procedente === true ? 'Dictaminado Procedente' : solicitud.procedente === false ? 'Dictaminado No Procedente' : 'Pendiente de estudio técnico',
                        status: solicitud.procedente === true ? 'completed' : solicitud.procedente === false ? 'failed' : 'pending'
                      },
                      {
                        title: 'Autorización de la OM',
                        detail: solicitud.cuentaAutorizacionOM === true 
                          ? `Autorizado: Oficio ${solicitud.numeroOficioAutorizacion || 's/n'}` 
                          : solicitud.cuentaAutorizacionOM === false 
                            ? `No Autorizado: Oficio ${solicitud.numeroOficioRespuesta || 's/n'}` 
                            : 'Pendiente de dictamen / resolución',
                        status: solicitud.cuentaAutorizacionOM === true ? 'completed' : solicitud.cuentaAutorizacionOM === false ? 'failed' : 'pending'
                      },
                      {
                        title: 'Firma / Entrega Final',
                        detail: solicitud.estatusGeneral === 'Concluido Entregado a dependencia solicitante' 
                          ? 'Entregado a Dependencia Solicitante' 
                          : `Estatus: ${solicitud.estatusGeneral}`,
                        status: solicitud.estatusGeneral === 'Concluido Entregado a dependencia solicitante' ? 'completed' : 'in-progress'
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        {item.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {item.status === 'failed' && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        {item.status === 'pending' && (
                          <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        {item.status === 'in-progress' && (
                          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                        )}

                        <div>
                          <p className={`text-xs font-bold ${item.status === 'completed' ? 'text-slate-200' : item.status === 'failed' ? 'text-rose-300' : 'text-slate-400'}`}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card de Información de Registro */}
                <div className="bg-gray-50/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
                    Información de Registro
                  </h4>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-gray-400 dark:text-slate-500 block mb-0.5">Creado por</span>
                      <p className="text-gray-800 dark:text-slate-200 font-semibold">
                        {historialLogs.find(l => l.accion === 'CREACIÓN')?.usuario || 'SISTEMA'}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                        Rol: {historialLogs.find(l => l.accion === 'CREACIÓN')?.rol || 'ADMINISTRADOR'}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 dark:text-slate-500 block mb-0.5">Fecha de Registro</span>
                      <p className="text-gray-800 dark:text-slate-200 font-semibold">
                        {solicitud.fechaRecepcionDGRMOM 
                          ? new Date(solicitud.fechaRecepcionDGRMOM).toLocaleDateString('es-MX', {day: 'numeric', month: 'long', year: 'numeric'}) 
                          : historialLogs.find(l => l.accion === 'CREACIÓN')?.fecha?.substring(0, 10) || '-'}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 dark:text-slate-500 block mb-0.5">ID del Sistema</span>
                      <p className="text-gray-800 dark:text-slate-200 font-semibold font-mono">
                        sol_#{solicitud.folioInterno?.toString().padStart(4, '0')}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setShowHistorial(false)}
                className="px-5 py-2 rounded-xl font-bold text-white bg-gem-primary hover:bg-gem-primary-dark transition-all shadow-md shadow-gem-primary/20 text-xs"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
