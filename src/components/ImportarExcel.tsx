import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { authFetch, API_BASE } from '../services/authService';
import { SolicitudModel } from '../types';

interface FilaError {
  numeroFila: number;
  numeroOficio: string;
  mensajes: string[];
}

interface ExcelImportDto {
  validos: SolicitudModel[];
  duplicados: SolicitudModel[];
  errores: FilaError[];
}

interface ImportarExcelProps {
  onSuccess: () => void;
  onCancel: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ImportarExcel({ onSuccess, onCancel, addToast }: ImportarExcelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelImportDto | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState<'omit' | 'update'>('omit');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Descargar la plantilla
  const handleDownloadTemplate = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/solicitudes/import/template`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_importacion_solicitudes.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        addToast('Plantilla descargada correctamente', 'success');
      } else {
        addToast('Error al descargar la plantilla', 'error');
      }
    } catch (e) {
      console.error(e);
      addToast('Error de conexión al descargar la plantilla', 'error');
    }
  };

  // Manejo de drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      } else {
        addToast('Solo se permiten archivos Excel (.xlsx)', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        addToast('Solo se permiten archivos Excel (.xlsx)', 'error');
      }
    }
  };

  // Enviar el archivo para análisis
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch(`${API_BASE}/api/solicitudes/import/preview`, {
        method: 'POST',
        // No pasamos Headers content-type para que el navegador configure el boundary multipart
        body: formData,
      });

      if (res.ok) {
        const data: ExcelImportDto = await res.json();
        setPreviewData(data);
        addToast('Archivo analizado exitosamente. Revisa el resumen.', 'success');
      } else {
        const err = await res.json().catch(() => ({ message: 'Error al procesar el archivo Excel.' }));
        addToast(err.message || 'Error al analizar el archivo', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('Error de red al intentar analizar el archivo', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confirmar y realizar la importación
  const handleConfirmImport = async () => {
    if (!previewData) return;

    // Decidir qué registros enviar al backend
    let registrosAImportar = [...previewData.validos];
    if (duplicateAction === 'update') {
      registrosAImportar = [...registrosAImportar, ...previewData.duplicados];
    }

    if (registrosAImportar.length === 0) {
      addToast('No hay registros válidos para importar', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/solicitudes/import/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrosAImportar),
      });

      if (res.ok) {
        addToast(`Carga masiva completada. Se importaron ${registrosAImportar.length} registros.`, 'success');
        onSuccess();
      } else {
        addToast('Error al importar los registros en la base de datos', 'error');
      }
    } catch (e) {
      console.error(e);
      addToast('Error de conexión al confirmar importación', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
  };

  const totalRecords = previewData
    ? previewData.validos.length + previewData.duplicados.length + previewData.errores.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Carga Masiva desde Excel</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Importa múltiples solicitudes de dictamen de manera masiva utilizando una plantilla oficial.
            </p>
          </div>
        </div>
        {!previewData && (
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gem-primary/30 text-gem-primary hover:bg-gem-primary/5 dark:border-gem-secondary/30 dark:text-gem-secondary dark:hover:bg-gem-secondary/5 font-semibold transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Descargar Plantilla Oficial
          </button>
        )}
      </div>

      {!previewData ? (
        /* PASO 1: Subida de Archivo */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-gem-primary bg-gem-primary/5 dark:border-gem-secondary dark:bg-gem-secondary/5'
                  : 'border-gray-300 dark:border-slate-700 hover:border-gem-primary dark:hover:border-gem-secondary'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gem-primary/10 dark:bg-gem-secondary/10 text-gem-primary dark:text-gem-secondary rounded-2xl flex items-center justify-center shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                {file ? (
                  <div>
                    <p className="text-lg font-bold text-gray-800 dark:text-slate-200">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-slate-350">
                      Arrastra tu plantilla de Excel aquí o{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gem-primary dark:text-gem-secondary font-bold hover:underline"
                      >
                        busca el archivo
                      </button>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Formatos permitidos: .xlsx</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!file || isAnalyzing}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
                  !file || isAnalyzing
                    ? 'bg-gray-300 dark:bg-slate-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gem-primary hover:bg-gem-primary-dark dark:bg-gem-primary/95 dark:hover:bg-gem-primary shadow-md shadow-gem-primary/20'
                }`}
              >
                {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAnalyzing ? 'Analizando...' : 'Analizar Archivo'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* PASO 2: Resumen y Vista Previa (Semáforo) */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shadow-inner">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-450 dark:text-slate-400 font-medium">Total Procesado</p>
                <h4 className="text-2xl font-black text-gray-850 dark:text-slate-100">{totalRecords}</h4>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-450 dark:text-slate-400 font-medium">Registros Válidos</p>
                <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {previewData.validos.length}
                </h4>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-450 dark:text-slate-400 font-medium">Duplicados (Oficio)</p>
                <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {previewData.duplicados.length}
                </h4>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shadow-inner">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-450 dark:text-slate-400 font-medium">Filas con Errores</p>
                <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {previewData.errores.length}
                </h4>
              </div>
            </div>
          </div>

          {/* Configuración de Registros Duplicados */}
          {previewData.duplicados.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-450">Registros Duplicados Detectados</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Se encontraron oficios que ya existen en el sistema. Elige la acción correspondiente:
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-200 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setDuplicateAction('omit')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    duplicateAction === 'omit'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Omitir (No importar)
                </button>
                <button
                  onClick={() => setDuplicateAction('update')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    duplicateAction === 'update'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Actualizar Existentes
                </button>
              </div>
            </div>
          )}

          {/* Tabla / Detalle de Errores (Si hay) */}
          {previewData.errores.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-rose-50/50 dark:bg-rose-950/10 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-rose-900 dark:text-rose-450 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Detalle de Errores (No se importarán estas filas)
                </h3>
                <span className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded-full font-bold">
                  {previewData.errores.length} fila(s) afectadas
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-sm divide-y divide-gray-200 dark:divide-slate-800">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-bold">
                    <tr>
                      <th className="px-6 py-3 text-center">Fila Excel</th>
                      <th className="px-6 py-3">Número de Oficio</th>
                      <th className="px-6 py-3">Errores Detectados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
                    {previewData.errores.map((err, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/35">
                        <td className="px-6 py-4 font-bold text-center text-rose-600 dark:text-rose-400 w-28 bg-rose-50/20 dark:bg-rose-950/5">
                          {err.numeroFila}
                        </td>
                        <td className="px-6 py-4 font-medium max-w-xs truncate">
                          {err.numeroOficio || <span className="italic text-gray-405">Vacio</span>}
                        </td>
                        <td className="px-6 py-4">
                          <ul className="list-disc list-inside space-y-1 text-xs text-rose-600 dark:text-rose-400">
                            {err.mensajes.map((msg, mIdx) => (
                              <li key={mIdx}>{msg}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tabla / Detalle de Duplicados */}
          {previewData.duplicados.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-amber-900 dark:text-amber-450 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Registros que ya existen (Coincidencia por Oficio)
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  duplicateAction === 'omit'
                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {duplicateAction === 'omit' ? 'Omitiendo carga' : 'Sobrescribiendo datos'}
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-sm divide-y divide-gray-200 dark:divide-slate-800">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-bold">
                    <tr>
                      <th className="px-6 py-3">Número de Oficio</th>
                      <th className="px-6 py-3">Dependencia</th>
                      <th className="px-6 py-3">Tipo Solicitud</th>
                      <th className="px-6 py-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
                    {previewData.duplicados.map((dup, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/35">
                        <td className="px-6 py-4 font-bold text-amber-700 dark:text-amber-400">{dup.numeroOficioSolicitud || 'S/N'}</td>
                        <td className="px-6 py-4">{dup.dependenciaOPD || 'No especificada'}</td>
                        <td className="px-6 py-4">{dup.tipoSolicitud || 'No especificado'}</td>
                        <td className="px-6 py-4 text-right font-semibold">
                          ${Number(dup.montoSolicitud || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Listado de Registros Válidos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-450 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Registros Válidos Listos para Cargar
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">
                {previewData.validos.length} listos
              </span>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {previewData.validos.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm">
                  No hay registros nuevos válidos en esta carga.
                </div>
              ) : (
                <table className="w-full text-left text-sm divide-y divide-gray-200 dark:divide-slate-800">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-bold">
                    <tr>
                      <th className="px-6 py-3">Número de Oficio</th>
                      <th className="px-6 py-3">Dependencia</th>
                      <th className="px-6 py-3">Tipo Solicitud</th>
                      <th className="px-6 py-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
                    {previewData.validos.map((val, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/35">
                        <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400">{val.numeroOficioSolicitud || 'S/N'}</td>
                        <td className="px-6 py-4">{val.dependenciaOPD || 'No especificada'}</td>
                        <td className="px-6 py-4">{val.tipoSolicitud || 'No especificado'}</td>
                        <td className="px-6 py-4 text-right font-semibold">
                          ${Number(val.montoSolicitud || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Acciones Finales */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                Se guardarán exactamente{' '}
                <span className="font-bold text-gray-800 dark:text-slate-100">
                  {duplicateAction === 'update'
                    ? previewData.validos.length + previewData.duplicados.length
                    : previewData.validos.length}
                </span>{' '}
                registros.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold transition-colors disabled:opacity-50"
              >
                Volver a subir
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting || (previewData.validos.length === 0 && (previewData.duplicados.length === 0 || duplicateAction === 'omit'))}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
                  isImporting || (previewData.validos.length === 0 && (previewData.duplicados.length === 0 || duplicateAction === 'omit'))
                    ? 'bg-gray-300 dark:bg-slate-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gem-primary hover:bg-gem-primary-dark dark:bg-gem-primary/95 dark:hover:bg-gem-primary shadow-md shadow-gem-primary/20'
                }`}
              >
                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isImporting ? 'Importando...' : 'Confirmar Importación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
