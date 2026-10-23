import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Edit2, Trash2, Power, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  CatalogoItem, 
  getCatalogosAdmin, 
  createCatalogoItem, 
  updateCatalogoItem, 
  toggleCatalogoActivo, 
  deleteCatalogoItem 
} from '../services/catalogoService';

interface Props {
  catalogoTipo: 'DEPENDENCIA' | 'CAPITULO' | 'UNIDAD_ADMINISTRATIVA' | 'TIPO_EXCEPCION';
  catalogoTitulo: string;
  onClose: () => void;
}

export default function GestionCatalogoModal({ catalogoTipo, catalogoTitulo, onClose }: Props) {
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Formulario de edición/creación
  const [modoEdicion, setModoEdicion] = useState(false);
  const [itemActual, setItemActual] = useState<{ id?: number; codigo: string; nombre: string; orden: number }>({
    codigo: '',
    nombre: '',
    orden: 0,
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarElementos();
  }, [catalogoTipo]);

  const cargarElementos = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getCatalogosAdmin(catalogoTipo);
      setItems(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const abrirCreacion = () => {
    setItemActual({
      codigo: '',
      nombre: '',
      orden: items.length + 1,
    });
    setModoEdicion(true);
    setErrorMsg('');
  };

  const abrirEdicion = (item: CatalogoItem) => {
    setItemActual({
      id: item.id,
      codigo: item.codigo || '',
      nombre: item.nombre,
      orden: item.orden || 0,
    });
    setModoEdicion(true);
    setErrorMsg('');
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setItemActual({ codigo: '', nombre: '', orden: 0 });
    setErrorMsg('');
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemActual.nombre.trim()) {
      setErrorMsg('El nombre o descripción es obligatorio.');
      return;
    }

    setGuardando(true);
    setErrorMsg('');
    try {
      if (itemActual.id) {
        await updateCatalogoItem(itemActual.id, {
          nombre: itemActual.nombre.trim(),
          codigo: itemActual.codigo.trim() || undefined,
          orden: Number(itemActual.orden) || 0,
        });
        setSuccessMsg('Elemento actualizado correctamente.');
      } else {
        await createCatalogoItem({
          tipo: catalogoTipo,
          nombre: itemActual.nombre.trim(),
          codigo: itemActual.codigo.trim() || undefined,
          orden: Number(itemActual.orden) || 0,
          activo: true,
        });
        setSuccessMsg('Elemento agregado con éxito.');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
      cancelarEdicion();
      await cargarElementos();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el elemento.');
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstatus = async (id: number) => {
    try {
      await toggleCatalogoActivo(id);
      setItems(prev => prev.map(it => it.id === id ? { ...it, activo: !it.activo } : it));
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo cambiar el estatus.');
    }
  };

  const eliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente "${nombre}"? Si ya está en uso en dictámenes anteriores, es preferible solo desactivarlo.`)) {
      return;
    }
    try {
      await deleteCatalogoItem(id);
      setItems(prev => prev.filter(it => it.id !== id));
      setSuccessMsg('Elemento eliminado.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo eliminar el elemento.');
    }
  };

  const itemsFiltrados = items.filter(it => 
    it.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (it.codigo && it.codigo.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gem-primary bg-gem-primary/10 px-2 py-0.5 rounded-full">
                Catálogo Maestro
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mt-1">{catalogoTitulo}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificaciones */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Barra de herramientas / Búsqueda y Botón Nuevo */}
        <div className="p-6 pb-2">
          {modoEdicion ? (
            <form onSubmit={guardar} className="p-4 bg-gem-primary/5 dark:bg-slate-900/50 rounded-xl border border-gem-primary/20 space-y-3 mb-4">
              <h4 className="text-sm font-bold text-gem-primary dark:text-gem-gold">
                {itemActual.id ? 'Editar Elemento' : 'Nuevo Elemento'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {catalogoTipo === 'CAPITULO' && (
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Código / Clave</label>
                    <input
                      type="text"
                      placeholder="Ej. 1000"
                      value={itemActual.codigo}
                      onChange={e => setItemActual({ ...itemActual, codigo: e.target.value })}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-gray-800 dark:text-slate-100"
                    />
                  </div>
                )}
                <div className={catalogoTipo === 'CAPITULO' ? 'md:col-span-7' : 'md:col-span-10'}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Nombre / Descripción *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nombre oficial..."
                    value={itemActual.nombre}
                    onChange={e => setItemActual({ ...itemActual, nombre: e.target.value })}
                    className="w-full text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-gray-800 dark:text-slate-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Orden</label>
                  <input
                    type="number"
                    value={itemActual.orden}
                    onChange={e => setItemActual({ ...itemActual, orden: parseInt(e.target.value) || 0 })}
                    className="w-full text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-gray-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-gem-primary hover:bg-gem-primary/90 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {guardando ? 'Guardando...' : (itemActual.id ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar elemento..."
                  value={filtro}
                  onChange={e => setFiltro(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gem-primary/20 text-gray-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={cargarElementos}
                  title="Recargar"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={abrirCreacion}
                  className="px-4 py-2 bg-gem-primary hover:bg-gem-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nuevo Registro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Elementos */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-gem-primary" />
              <span>Cargando catálogo...</span>
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-slate-400 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
              No se encontraron registros en este catálogo.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Orden</th>
                  {catalogoTipo === 'CAPITULO' && <th className="py-2.5 px-3">Código</th>}
                  <th className="py-2.5 px-3">Nombre / Descripción</th>
                  <th className="py-2.5 px-3 text-center">Estatus</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50 text-sm">
                {itemsFiltrados.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-3 text-xs text-gray-400 font-mono w-16">{it.orden || 0}</td>
                    {catalogoTipo === 'CAPITULO' && (
                      <td className="py-3 px-3 font-mono text-xs font-bold text-gray-700 dark:text-slate-300 w-24">
                        {it.codigo || '-'}
                      </td>
                    )}
                    <td className="py-3 px-3 font-semibold text-gray-800 dark:text-slate-100">
                      {it.nombre}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        it.activo 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400 border border-gray-200 dark:border-slate-600'
                      }`}>
                        {it.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => alternarEstatus(it.id)}
                          title={it.activo ? 'Desactivar opción' : 'Activar opción'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            it.activo 
                              ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30' 
                              : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirEdicion(it)}
                          title="Editar"
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminar(it.id, it.nombre)}
                          title="Eliminar"
                          className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400 flex justify-between items-center">
          <span>Total: <strong>{itemsFiltrados.length}</strong> registros</span>
          <span className="text-[11px] text-gray-400">💡 Los registros inactivos no aparecerán en nuevos formularios pero conservan los históricos.</span>
        </div>

      </div>
    </div>
  );
}
