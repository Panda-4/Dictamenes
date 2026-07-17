import React, { useState } from 'react';
import { Save, X, RefreshCw, FileText, CheckCircle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { SolicitudModel, TipoSolicitud } from '../types';

interface DictamenFormProps {
  onCancel: () => void;
  onSave: (data: SolicitudModel) => void;
  initialData?: SolicitudModel | null;
  errorMessage?: string;
}

export default function DictamenForm({ onCancel, onSave, initialData, errorMessage }: DictamenFormProps) {
  const [formData, setFormData] = useState<Partial<SolicitudModel>>(
    initialData ? { ...initialData } : {
      tipoSolicitud: '',
      estatusGeneral: 'En Opinión Técnica de Subdirección de Fianzas y Seguros',
      excepcionDGRMOM: false,
      excepcionDictaminacion: false,
    }
  );

  const [isCapitulosOpen, setIsCapitulosOpen] = useState(false);

  const CATALOGO_CAPITULOS = [
    { id: '1000', label: '1000 - Servicios Personales' },
    { id: '2000', label: '2000 - Materiales y Suministros' },
    { id: '3000', label: '3000 - Servicios Generales' },
    { id: '4000', label: '4000 - Transferencias, Asignaciones, Subsidios y Otras Ayudas' },
    { id: '5000', label: '5000 - Bienes Muebles, Inmuebles e Intangibles' },
    { id: '6000', label: '6000 - Inversión Pública' },
  ];

  const handleCapituloChange = (capLabel: string) => {
    const currentVal = formData.capitulo || '';
    // Cambiamos a punto y coma (;) como separador para evitar conflictos con comas en el texto
    const selected = currentVal.split('; ').filter(c => c.trim() !== '');
    
    let newSelected: string[];
    if (selected.includes(capLabel)) {
      newSelected = selected.filter(c => c !== capLabel);
    } else {
      newSelected = [...selected, capLabel].sort();
    }
    
    setFormData(prev => ({ ...prev, capitulo: newSelected.join('; ') }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let finalValue: any = type === 'checkbox' ? checked : value;
    if (value === "true") finalValue = true;
    if (value === "false") finalValue = false;
    
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const getStatusColorCls = (status?: string) => {
    switch(status) {
      case 'En Opinión Técnica de Subdirección de Fianzas y Seguros': return 'bg-blue-500 shadow-blue-500/50';
      case 'En proceso de elaboración': return 'bg-amber-500 shadow-amber-500/50';
      case 'En Firma de Dirección General': return 'bg-purple-500 shadow-purple-500/50';
      case 'En autorización de la OM': return 'bg-emerald-500 shadow-emerald-500/50';
      case 'Concluido Entregado a dependencia solicitante': return 'bg-gray-500 shadow-gray-500/50';
      default: return 'bg-blue-500 shadow-blue-500/50';
    }
  };

  const handleClear = () => {
    setFormData({
      tipoSolicitud: '',
      estatusGeneral: 'Recibido',
      excepcionDGRMOM: false,
      excepcionDictaminacion: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as SolicitudModel);
  };

  const requiresSubformA = ["Dictamen Técnico", "Dictamen de Procedencia", "Opinión Técnica Previa"].includes(formData.tipoSolicitud as string);
  const requiresSubformB = formData.tipoSolicitud === "Dictamen Previo";
  const requiresSubformC = formData.tipoSolicitud === "Excepción a Medidas de Austeridad";

  return (
    <div className="w-full max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Documento Contable */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-gem-primary" />
            Registro de Solicitud Administrativa
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-2 tracking-wide uppercase">
            Gobierno del Estado de México • Coordinación de Dictaminación
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-gem-secondary-dark uppercase tracking-wider mb-1">Folio Interno Asignado</div>
          <div className="text-2xl font-mono font-bold text-gem-primary bg-gem-primary/5 px-4 py-2 rounded-lg border border-gem-primary/20">
            {formData.folioInterno ? `#-${formData.folioInterno.toString().padStart(6, '0')}` : 'AUTO-GENERADO'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-slate-700 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-10 relative overflow-hidden">
        {/* Subtle decorative elements for high-end feel */}
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-gem-primary via-gem-secondary to-gem-primary opacity-90"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gem-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gem-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-12">
          {/* SECTION 1: DATOS GENERALES */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-slate-700 pb-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">1</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Datos Generales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Tipo de Solicitud *</label>
                <select 
                  name="tipoSolicitud" 
                  value={formData.tipoSolicitud || ''} 
                  onChange={handleChange}
                  required
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm"
                >
                  <option value="">Seleccione un tipo...</option>
                  <option value="Dictamen Técnico">Dictamen Técnico</option>
                  <option value="Dictamen de Procedencia">Dictamen de Procedencia</option>
                  <option value="Opinión Técnica Previa">Opinión Técnica Previa</option>
                  <option value="Dictamen Previo">Dictamen Previo</option>
                  <option value="Excepción a Medidas de Austeridad">Excepción a Medidas de Austeridad</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Número de Oficio de Solicitud *</label>
                <input 
                  type="text" 
                  name="numeroOficioSolicitud"
                  value={formData.numeroOficioSolicitud || ''}
                  onChange={handleChange}
                  required
                  placeholder="Ej. GEM-202X-001"
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Dependencia / OPD *</label>
                <select 
                  name="dependenciaOPD" 
                  value={formData.dependenciaOPD || ''} 
                  onChange={handleChange}
                  required
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm"
                >
                  <option value="">Seleccione...</option>
                 <option value="Poder Legislativo">Poder Legislativo</option>
<option value="Unidad de Información">Unidad de Información</option>
<option value="Gubernatura">Gubernatura</option>
<option value="Coordinación General de Comunicación Social">Coordinación General de Comunicación Social</option>
<option value="Secretaría General de Gobierno">Secretaría General de Gobierno</option>
<option value="Secretaría de Seguridad">Secretaría de Seguridad</option>
<option value="Secretaría de Finanzas">Secretaría de Finanzas</option>
<option value="Secretaría de Salud">Secretaría de Salud</option>
<option value="Secretaría del Trabajo">Secretaría del Trabajo</option>
<option value="Secretaría de Desarrollo Económico">Secretaría de Desarrollo Económico</option>
<option value="Secretaría de la Contraloría">Secretaría de la Contraloría</option>
<option value="Secretaría de Movilidad">Secretaría de Movilidad</option>
<option value="Secretaría del Campo">Secretaría del Campo</option>
<option value="Secretaría de Cultura y Turismo">Secretaría de Cultura y Turismo</option>
<option value="Secretaría de las Mujeres">Secretaría de las Mujeres</option>
<option value="Secretaría de Educación, Ciencia, Tecnología e Innovación">Secretaría de Educación, Ciencia, Tecnología e Innovación</option>
<option value="Secretaría de Bienestar">Secretaría de Bienestar</option>
<option value="Secretaría de Desarrollo Urbano e Infraestructura">Secretaría de Desarrollo Urbano e Infraestructura</option>
<option value="Secretaría del Medio Ambiente y Desarrollo Sostenible">Secretaría del Medio Ambiente y Desarrollo Sostenible</option>
<option value="Secretaría del Agua">Secretaría del Agua</option>
<option value="Consejería Jurídica">Consejería Jurídica</option>
<option value="Oficialía Mayor">Oficialía Mayor</option>
<option value="Jefatura de Gabinete y Proyectos Especiales">Jefatura de Gabinete y Proyectos Especiales</option>
<option value="Vocería de la Gubernatura">Vocería de la Gubernatura</option>
<option value="Coordinación Técnica">Coordinación Técnica</option>
<option value="Agencia Digital del Estado de México">Agencia Digital del Estado de México</option>
<option value="Poder Judicial">Poder Judicial</option>
<option value="Instituto Electoral del Estado de México">Instituto Electoral del Estado de México</option>
<option value="Comisión de Derechos Humanos del Estado de México">Comisión de Derechos Humanos del Estado de México</option>
<option value="Tribunal de Justicia Administrativa">Tribunal de Justicia Administrativa</option>
<option value="Junta Local de Conciliación y Arbitraje Valle de Toluca">Junta Local de Conciliación y Arbitraje Valle de Toluca</option>
<option value="Tribunal Estatal de Conciliación y Arbitraje">Tribunal Estatal de Conciliación y Arbitraje</option>
<option value="Universidad Autónoma del Estado de México">Universidad Autónoma del Estado de México</option>
<option value="Junta Local de Conciliación y Arbitraje del Valle Cuautitlán-Texcoco">Junta Local de Conciliación y Arbitraje del Valle Cuautitlán-Texcoco</option>
<option value="Tribunal Electoral del Estado de México">Tribunal Electoral del Estado de México</option>
<option value="Instituto de Transparencia, Acceso a la Información Pública y Protección de Datos Personales">Instituto de Transparencia, Acceso a la Información Pública y Protección de Datos Personales</option>
<option value="Fiscalía General de Justicia">Fiscalía General de Justicia</option>
<option value="Secretaría Ejecutiva del Sistema Estatal Anticorrupción">Secretaría Ejecutiva del Sistema Estatal Anticorrupción</option>
<option value="Otros">Otros</option>

                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Unidad Administrativa *</label>
                <input 
                  type="text" 
                  name="unidadAdministrativa"
                  value={formData.unidadAdministrativa || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Fecha de recepción en DGRM / OM</label>
                <div className="flex gap-4 items-center mt-1">
                  <input 
                    type="date" 
                    name="fechaRecepcionDGRMOM"
                    value={formData.fechaRecepcionDGRMOM || ''}
                    onChange={handleChange}
                    className="flex-1 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm"
                  />
                  <label className="flex items-center gap-2 cursor-pointer bg-red-50 text-red-700 px-3 py-2.5 rounded-lg border border-red-100 shadow-sm text-sm font-medium hover:bg-red-100 transition-colors">
                    <input 
                      type="checkbox" 
                      name="excepcionDGRMOM" 
                      checked={formData.excepcionDGRMOM || false} 
                      onChange={handleChange}
                      className="rounded text-red-600 focus:ring-red-500 bg-white"
                    />
                    Excepción
                  </label>
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Fecha de recepción en Dptto. de Dictaminación  /Coord.Jurídica</label>
                <div className="flex gap-4 items-center mt-1">
                  <input 
                    type="date" 
                    name="fechaRecepcionDictaminacion"
                    value={formData.fechaRecepcionDictaminacion || ''}
                    onChange={handleChange}
                    className="flex-1 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm"
                  />
                  <label className="flex items-center gap-2 cursor-pointer bg-red-50 text-red-700 px-3 py-2.5 rounded-lg border border-red-100 shadow-sm text-sm font-medium hover:bg-red-100 transition-colors">
                    <input 
                      type="checkbox" 
                      name="excepcionDictaminacion" 
                      checked={formData.excepcionDictaminacion || false} 
                      onChange={handleChange}
                      className="rounded text-red-600 focus:ring-red-500 bg-white"
                    />
                    Excepción
                  </label>
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Capítulo(s) Presupuestal(es)</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCapitulosOpen(!isCapitulosOpen)}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary flex items-center justify-between p-3 transition-all shadow-sm"
                  >
                    <span className="truncate text-xs font-medium">
                      {(formData.capitulo || '').split('; ').filter(Boolean).length > 0 
                        ? `${(formData.capitulo || '').split('; ').filter(Boolean).length} seleccionados` 
                        : 'Seleccione capítulos...'}
                    </span>
                    {isCapitulosOpen ? <ChevronUp className="w-4 h-4 text-gem-primary" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isCapitulosOpen && (
                    <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 space-y-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                      {CATALOGO_CAPITULOS.map((cap) => {
                        const isChecked = (formData.capitulo || '').split('; ').includes(cap.label);
                        return (
                          <label 
                            key={cap.id} 
                            className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer group ${
                              isChecked 
                                ? 'bg-gem-primary/10 text-gem-primary-dark dark:text-gem-primary-light' 
                                : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleCapituloChange(cap.label)}
                              className="rounded border-gray-300 text-gem-primary focus:ring-gem-primary dark:bg-slate-900 dark:border-slate-600"
                            />
                            <span className="text-[11px] font-medium leading-tight">
                              {cap.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                {formData.capitulo && (
                  <p className="text-[10px] text-gray-400 mt-1 truncate px-1">
                    {formData.capitulo}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Partida Presupuestal *</label>
                <input 
                  type="text" 
                  name="partidaPresupuestal"
                  value={formData.partidaPresupuestal || ''}
                  onChange={handleChange}
                  required
                  placeholder="Ej. 3311"
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Monto de la Solicitud *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">$</span>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    name="montoSolicitud"
                    value={formData.montoSolicitud || ''}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="w-full font-mono pl-8 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Estatus General</label>
                <div className="relative flex items-center">
                  <div className={`absolute left-3 w-3 h-3 rounded-full shadow-md transition-colors duration-300 ${getStatusColorCls(formData.estatusGeneral || 'En Opinión Técnica de Subdirección de Fianzas y Seguros')}`}></div>
                  <select 
                    name="estatusGeneral" 
                    value={formData.estatusGeneral || 'En Opinión Técnica de Subdirección de Fianzas y Seguros'} 
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 pl-9 transition-colors shadow-sm"
                  >
                    <option value="En Opinión Técnica de Subdirección de Fianzas y Seguros">En Opinión Técnica de Subdirección de Fianzas y Seguros</option>
                    <option value="En proceso de elaboración">En proceso de elaboración</option>
                    <option value="En Firma de Dirección General">En Firma de Dirección General</option>
                    <option value="En autorización de la OM">En autorización de la OM</option>
                    <option value="Concluido Entregado a dependencia solicitante">Concluido Entregado a dependencia solicitante</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: SUBFORMULARIOS CONDICIONALES */}
          
          {(requiresSubformA || requiresSubformB) && (
            <section className="bg-gem-primary/5 rounded-2xl p-6 border border-gem-primary/10">
              <div className="flex items-center gap-3 mb-6 border-b border-gem-primary/20 pb-3">
                <div className="w-8 h-8 rounded-full bg-gem-primary text-white flex items-center justify-center font-bold font-mono">2</div>
                <h3 className="text-xl font-semibold text-gem-primary-dark">
                  {requiresSubformA ? "Evaluación del Dictamen Técnico" : "Dictamen Previo"}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 block">Descripción de la solicitud</label>
                  <textarea 
                    name="descripcionSolicitud"
                    rows={3}
                    onChange={handleChange}
                    value={formData.descripcionSolicitud || ''}
                    className="w-full bg-white/80 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-3 transition-colors shadow-sm resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 bg-white/60 p-5 rounded-xl border border-gray-100 shadow-sm">
                    <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-green-600" /> ¿Es Procedente?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-green-50 ui-checked:bg-green-100 ui-checked:border-green-500 ui-checked:text-green-800 bg-white">
                        <input type="radio" name="procedente" value="true" checked={formData.procedente === true} onChange={handleChange} className="sr-only" />
                        <span className="font-medium text-sm">Sí, procedente</span>
                      </label>
                      <label className="flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-red-50 ui-checked:bg-red-100 ui-checked:border-red-500 ui-checked:text-red-800 bg-white">
                        <input type="radio" name="procedente" value="false" checked={formData.procedente === false} onChange={handleChange} className="sr-only" />
                        <span className="font-medium text-sm">No procedente</span>
                      </label>
                    </div>

                    {formData.procedente === true && (
                      <div className="space-y-4 mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-600">Fecha de envío para autorización de la OM</label>
                          <input type="date" name="fechaEnvioAutorizacionOM" value={formData.fechaEnvioAutorizacionOM || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-600">Fecha de emisión de autorización</label>
                          <input type="date" name="fechaEmisionAutorizacion" value={formData.fechaEmisionAutorizacion || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-600">Fecha envío p/ firma DG</label>
                          <input type="date" name="fechaEnvioFirmaDG" value={formData.fechaEnvioFirmaDG || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-600">Fecha de envío a la Dependencia/ OPD</label>
                          <input type="date" name="fechaEnvioDependencia" value={formData.fechaEnvioDependencia || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                        </div>
                      </div>
                    )}
                    
                    {formData.procedente === false && (
                      <div className="space-y-4 mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-600">Fecha envío respuesta p/ firma DG</label>
                          <input type="date" name="fechaEnvioRespuestaFirmaDG" value={formData.fechaEnvioRespuestaFirmaDG || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-600">Fecha de envío respuesta a la Dependencia/ OPD</label>
                          <input type="date" name="fechaEnvioRespuestaDependencia" value={formData.fechaEnvioRespuestaDependencia || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {requiresSubformA && (
                    <div className="space-y-6">
                      {/* Antecedentes Sub A */}
                      <div className="bg-white/60 p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                         <label className="block text-sm font-bold text-gray-800">¿Cuenta con Dictamen Previo?</label>
                         <select name="cuentaDictamenPrevio" value={formData.cuentaDictamenPrevio || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5">
                            <option value="">Seleccione...</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                            <option value="N/A">N/A</option>
                         </select>
                         {formData.cuentaDictamenPrevio === "Sí" && (
                           <div className="grid grid-cols-2 gap-4 mt-3 animate-in slide-in-from-top-2">
                              <input type="date" name="fechaEmisionDictamenPrevio" placeholder="Fecha emisión" value={formData.fechaEmisionDictamenPrevio || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2.5" title="Fecha de emisión de dictamen previo" />
                              <input type="text" name="numeroOficioDictamenPrevio" placeholder="N° de oficio" value={formData.numeroOficioDictamenPrevio || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2.5" title="Oficio de dictamen previo"/>
                           </div>
                         )}
                      </div>

                      <div className="bg-white/60 p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                         <label className="block text-sm font-bold text-gray-800">¿Cuenta con Excepción a Medidas de Austeridad?</label>
                         <select name="cuentaExcepcionAusteridad" value={formData.cuentaExcepcionAusteridad || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5">
                            <option value="">Seleccione...</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                            <option value="N/A">N/A</option>
                         </select>
                         {formData.cuentaExcepcionAusteridad === "Sí" && (
                           <div className="mt-3 animate-in slide-in-from-top-2">
                              <input type="date" name="fechaEmisionExcepcion" placeholder="Fecha emisión" value={formData.fechaEmisionExcepcion || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2.5" title="Fecha emisión de excepción" />
                           </div>
                         )}
                      </div>

                      {/* Estudio de Mercado y OM */}
                      <div className="bg-white/60 p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <label className="block text-sm font-bold text-gray-800">Monto de Estudio de Mercado</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-medium">$</span>
                          </div>
                          <input 
                            type="number" 
                            step="0.01"
                            name="montoEstudioMercado"
                            value={formData.montoEstudioMercado || ''}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full font-mono pl-8 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary block p-2.5 transition-colors shadow-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-600">Fecha de envío para autorización a la OM</label>
                          <input type="date" name="fechaEnvioAutorizacionOM_A" value={formData.fechaEnvioAutorizacionOM_A || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                        </div>

                        <label className="block text-sm font-bold text-gray-800 mt-4 pt-2 border-t border-gray-100">¿Cuenta con autorización de la OM?</label>
                        <select name="cuentaAutorizacionOM" value={formData.cuentaAutorizacionOM?.toString() || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5">
                           <option value="">Seleccione...</option>
                           <option value="true">Sí</option>
                           <option value="false">No</option>
                        </select>
                        
                        {formData.cuentaAutorizacionOM === true && (
                          <div className="space-y-3 mt-3 animate-in slide-in-from-top-2 border-t border-gray-100 pt-3">
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Número de oficio de autorización</label>
                               <input type="text" name="numeroOficioAutorizacion" value={formData.numeroOficioAutorizacion || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Fecha de envío de respuesta de OM a la DGRM</label>
                               <input type="date" name="fechaEnvioRespuestaOM_DGRM" value={formData.fechaEnvioRespuestaOM_DGRM || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Fecha de recepción en la DGRM</label>
                               <input type="date" name="fechaRecepcionDGRM" value={formData.fechaRecepcionDGRM || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Fecha de respuesta de DGRM a la Dependencia/OPD</label>
                               <input type="date" name="fechaRespuestaDGRM_Dependencia" value={formData.fechaRespuestaDGRM_Dependencia || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                          </div>
                        )}

                        {formData.cuentaAutorizacionOM === false && (
                          <div className="space-y-3 mt-3 animate-in slide-in-from-top-2 border-t border-gray-100 pt-3">
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Número de oficio de respuesta</label>
                               <input type="text" name="numeroOficioRespuesta" value={formData.numeroOficioRespuesta || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Fecha de envío de respuesta de OM a la DGRM</label>
                               <input type="date" name="fechaEnvioRespuestaOM_DGRM" value={formData.fechaEnvioRespuestaOM_DGRM || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Fecha de recepción en la DGRM</label>
                               <input type="date" name="fechaRecepcionDGRM" value={formData.fechaRecepcionDGRM || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                             <div className="space-y-1">
                               <label className="block text-xs font-semibold text-gray-600">Fecha de respuesta de DGRM a la Dependencia/OPD</label>
                               <input type="date" name="fechaRespuestaDGRM_Dependencia" value={formData.fechaRespuestaDGRM_Dependencia || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5" />
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </section>
          )}

          {requiresSubformC && (
            <section className="bg-gem-secondary/10 rounded-2xl p-6 border border-gem-secondary/20">
              <div className="flex items-center gap-3 mb-6 border-b border-gem-secondary/30 pb-3">
                <div className="w-8 h-8 rounded-full bg-gem-secondary text-white flex items-center justify-center font-bold font-mono">2</div>
                <h3 className="text-xl font-semibold text-gem-secondary-dark">
                  Excepción a Medidas de Austeridad
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Tipo de Excepción</label>
                  <select name="tipoExcepcion" value={formData.tipoExcepcion || ''} onChange={handleChange} className="w-full bg-white/80 border border-gray-200 text-gray-800 text-sm rounded-xl p-3">
                    <option value="">Seleccione...</option>
                    <option value="Compra de Equipos">Compra de Equipos de Cómputo</option>
                    <option value="Plazas de Nuevo Ingreso">Plazas de Nuevo Ingreso</option>
                    <option value="Viáticos y Pasajes">Viáticos y Pasajes</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Monto de Suficiencia Presupuestal</label>
                  <input type="number" name="montoSuficienciaPresupuestal" value={formData.montoSuficienciaPresupuestal || ''} onChange={handleChange} className="w-full bg-white/80 border border-gray-200 font-mono text-sm rounded-xl p-3" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Descripción detallada</label>
                  <textarea name="descripcionExcepcion" value={formData.descripcionExcepcion || ''} onChange={handleChange} rows={3} className="w-full bg-white/80 border border-gray-200 text-gray-800 text-sm rounded-xl p-3"></textarea>
                </div>
                
                 <div className="space-y-4 bg-white/60 p-5 rounded-xl border border-gray-100 shadow-sm mt-4">
                    <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-green-600" /> ¿Es Procedente?
                    </label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-green-50 bg-white ${formData.procedente === true ? 'bg-green-100 border-green-500 text-green-800' : ''}`}>
                        <input type="radio" name="procedente" value="true" checked={formData.procedente === true} onChange={handleChange} className="sr-only" />
                        <span className="font-medium text-sm">Sí</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-red-50 bg-white ${formData.procedente === false ? 'bg-red-100 border-red-500 text-red-800' : ''}`}>
                        <input type="radio" name="procedente" value="false" checked={formData.procedente === false} onChange={handleChange} className="sr-only" />
                        <span className="font-medium text-sm">No</span>
                      </label>
                    </div>
                </div>
                
                <div className="space-y-1 mt-4">
                  <label className="block text-sm font-semibold text-gray-700">Fecha de Respuesta</label>
                  <input type="date" name="fechaRespuestaExcepcion" value={formData.fechaRespuestaExcepcion || ''} onChange={handleChange} className="w-full bg-white/80 border border-gray-200 text-sm rounded-xl p-3" />
                </div>
              </div>
            </section>
          )}


          {/* ERROR DEL SERVIDOR */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-3 animate-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Error al guardar la solicitud</p>
                <pre className="whitespace-pre-wrap text-xs">{errorMessage}</pre>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="pt-8 border-t border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-gem-primary-light" />
                Verifique los datos antes de guardar. Toda operación queda registrada.
             </div>
             <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  type="button" 
                  onClick={handleClear}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <RefreshCw className="w-5 h-5" /> Limpiar
                </button>
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <X className="w-5 h-5" /> Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gem-primary hover:bg-gem-primary-dark transition-all shadow-lg shadow-gem-primary/30"
                >
                  <Save className="w-5 h-5" /> Guardar Documento
                </button>
             </div>
          </div>

        </div>
      </form>
    </div>
  );
}
