import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  RotateCcw, 
  Search, 
  FilePlus, 
  FileEdit, 
  Trash2, 
  CheckSquare, 
  LayoutDashboard, 
  Download, 
  History, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { 
  RolPermiso, 
  LISTA_METADATA_PERMISOS, 
  getMatrizPermisos, 
  toggleRolPermiso 
} from '../services/permisoService';

interface RoleInfo {
  id: string;
  nombre: string;
  descripcion: string;
  badge: string;
  border: string;
  bgLight: string;
}

const ROLES: RoleInfo[] = [
  {
    id: 'CAPTURISTA',
    nombre: 'Capturista',
    descripcion: 'Personal encargado de la captura inicial y registro de solicitudes de dictamen técnico.',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
    border: 'border-teal-500',
    bgLight: 'bg-teal-50/50 dark:bg-teal-900/10',
  },
  {
    id: 'AUTORIZADOR',
    nombre: 'Autorizador',
    descripcion: 'Mando revisor con facultad para emitir dictámenes favorables (Procedente) o desfavorables (Rechazado).',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    border: 'border-blue-500',
    bgLight: 'bg-blue-50/50 dark:bg-blue-900/10',
  },
  {
    id: 'CONSULTA',
    nombre: 'Consulta',
    descripcion: 'Usuarios con acceso de sólo lectura para seguimiento, consulta y generación de reportes.',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    border: 'border-cyan-500',
    bgLight: 'bg-cyan-50/50 dark:bg-cyan-900/10',
  },
  {
    id: 'ADMINISTRADOR',
    nombre: 'Administrador',
    descripcion: 'Superusuario con control global del sistema, catálogos, cuentas y políticas de acceso.',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    border: 'border-purple-500',
    bgLight: 'bg-purple-50/50 dark:bg-purple-900/10',
  },
];

const PERMISO_ICONS: Record<string, React.ElementType> = {
  SOLICITUDES_CREAR: FilePlus,
  SOLICITUDES_EDITAR: FileEdit,
  SOLICITUDES_ELIMINAR: Trash2,
  SOLICITUDES_VALIDAR: CheckSquare,
  VER_DASHBOARD: LayoutDashboard,
  EXPORTAR_DATOS: Download,
  VER_AUDITORIA: History,
  ADMIN_CATALOGOS: SlidersHorizontal,
};

export default function GestionRolesPermisos() {
  const [selectedRol, setSelectedRol] = useState<string>('CAPTURISTA');
  const [permisos, setPermisos] = useState<RolPermiso[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    cargarPermisos();
  }, []);

  const cargarPermisos = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getMatrizPermisos();
      setPermisos(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'No fue posible cargar la matriz de permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPermisoHabilitado = (rol: string, permisoKey: string): boolean => {
    if (rol === 'ADMINISTRADOR') return true;
    const item = permisos.find(p => p.rol === rol && p.permiso === permisoKey);
    return item ? item.habilitado : false;
  };

  const handleToggle = async (rol: string, permisoKey: string) => {
    if (rol === 'ADMINISTRADOR') return;

    const actual = isPermisoHabilitado(rol, permisoKey);
    const nuevoEstado = !actual;
    const opKey = `${rol}_${permisoKey}`;

    setUpdatingKey(opKey);
    setErrorMessage(null);

    // Actualización optimista en interfaz
    setPermisos(prev => {
      const exists = prev.some(p => p.rol === rol && p.permiso === permisoKey);
      if (exists) {
        return prev.map(p => p.rol === rol && p.permiso === permisoKey ? { ...p, habilitado: nuevoEstado } : p);
      } else {
        return [...prev, { id: Date.now(), rol, permiso: permisoKey, habilitado: nuevoEstado }];
      }
    });

    try {
      await toggleRolPermiso(rol, permisoKey, nuevoEstado);
      const meta = LISTA_METADATA_PERMISOS.find(m => m.key === permisoKey);
      setToastMessage(`Permiso "${meta?.nombre || permisoKey}" ${nuevoEstado ? 'activado' : 'desactivado'} para rol ${rol}.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      // Revertir optimismo
      setPermisos(prev => prev.map(p => p.rol === rol && p.permiso === permisoKey ? { ...p, habilitado: actual } : p));
      setErrorMessage(err.message || 'Error al guardar el permiso.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setUpdatingKey(null);
    }
  };

  // Restablecer valores recomendados por defecto
  const handleRestablecerValores = async () => {
    if (!window.confirm(`¿Deseas restablecer los permisos por defecto para el rol ${selectedRol}?`)) return;
    
    const defaultsMap: Record<string, Record<string, boolean>> = {
      CAPTURISTA: {
        SOLICITUDES_CREAR: true,
        SOLICITUDES_EDITAR: false,
        SOLICITUDES_ELIMINAR: false,
        SOLICITUDES_VALIDAR: false,
        VER_DASHBOARD: true,
        EXPORTAR_DATOS: true,
        VER_AUDITORIA: false,
        ADMIN_CATALOGOS: false,
      },
      AUTORIZADOR: {
        SOLICITUDES_CREAR: false,
        SOLICITUDES_EDITAR: false,
        SOLICITUDES_ELIMINAR: false,
        SOLICITUDES_VALIDAR: true,
        VER_DASHBOARD: true,
        EXPORTAR_DATOS: true,
        VER_AUDITORIA: true,
        ADMIN_CATALOGOS: false,
      },
      CONSULTA: {
        SOLICITUDES_CREAR: false,
        SOLICITUDES_EDITAR: false,
        SOLICITUDES_ELIMINAR: false,
        SOLICITUDES_VALIDAR: false,
        VER_DASHBOARD: true,
        EXPORTAR_DATOS: true,
        VER_AUDITORIA: false,
        ADMIN_CATALOGOS: false,
      },
    };

    const defs = defaultsMap[selectedRol];
    if (!defs) return;

    setIsLoading(true);
    try {
      for (const [permisoKey, habilitado] of Object.entries(defs)) {
        await toggleRolPermiso(selectedRol, permisoKey, habilitado);
      }
      await cargarPermisos();
      setToastMessage(`Permisos del rol ${selectedRol} restablecidos con éxito.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e: any) {
      setErrorMessage('Ocurrió un error al restablecer los valores por defecto.');
    } finally {
      setIsLoading(false);
    }
  };

  const rolActualInfo = ROLES.find(r => r.id === selectedRol) || ROLES[0];

  const permisosFiltrados = LISTA_METADATA_PERMISOS.filter(p => {
    if (!filtroTexto.trim()) return true;
    const term = filtroTexto.toLowerCase();
    return p.nombre.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term);
  });

  const contarPermisosActivos = (rol: string) => {
    if (rol === 'ADMINISTRADOR') return LISTA_METADATA_PERMISOS.length;
    return LISTA_METADATA_PERMISOS.filter(p => isPermisoHabilitado(rol, p.key)).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-slate-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gem-primary" />
            Seguridad y Matriz de Privilegios Dinámicos
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Configura en tiempo real qué acciones tiene permitidas cada rol dentro del sistema.
          </p>
        </div>

        {/* Status Toast */}
        {toastMessage && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {toastMessage}
          </div>
        )}
      </div>

      {/* Banner Especial de Capacidades (Caso de uso del usuario) */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-start gap-3.5 shadow-sm">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
            Flexibilidad Operativa: Corrección y Privilegios Temporales
          </span>
          <p className="text-amber-800/90 dark:text-slate-300 text-xs leading-relaxed">
            Si un usuario <strong>Capturista</strong> cometió una equivocación o requiere subsanar un folio, puedes activar el switch <strong>"Editar Solicitudes"</strong> para otorgarle acceso de edición de inmediato. Una vez corregido el registro, puedes desactivarlo nuevamente para mantener el control estricto.
          </p>
        </div>
      </div>

      {/* Selector de Rol mediante Tarjetas Interactivas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES.map(r => {
          const isSelected = selectedRol === r.id;
          const activos = contarPermisosActivos(r.id);
          const total = LISTA_METADATA_PERMISOS.length;

          return (
            <button
              key={r.id}
              onClick={() => setSelectedRol(r.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? `ring-2 ring-gem-primary shadow-md bg-white dark:bg-slate-800 ${r.border}`
                  : 'bg-gray-50/70 dark:bg-slate-900/40 border-gray-200 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${r.badge}`}>
                  {r.nombre}
                </span>
                {r.id === 'ADMINISTRADOR' ? (
                  <Lock className="w-3.5 h-3.5 text-purple-500" title="Superusuario bloqueado con acceso total" />
                ) : (
                  <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 font-semibold">
                    {activos}/{total}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1">
                {r.descripcion}
              </div>

              {isSelected && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-gem-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-gem-primary animate-pulse"></span>
                  Configurando ahora
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenedor de Permisos del Rol Seleccionado */}
      <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
        
        {/* Barra de Filtro y Acciones Rápidas */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              placeholder="Buscar privilegio..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {selectedRol !== 'ADMINISTRADOR' && (
              <button
                onClick={handleRestablecerValores}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gem-primary dark:hover:text-gem-secondary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="Restablecer valores predeterminados para este rol"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restablecer por defecto
              </button>
            )}
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${rolActualInfo.badge}`}>
              Rol: {rolActualInfo.nombre}
            </span>
          </div>
        </div>

        {/* Mensaje de Error si aplica */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Aviso especial para Administrador */}
        {selectedRol === 'ADMINISTRADOR' && (
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-xl flex items-center gap-3 text-xs text-purple-900 dark:text-purple-300">
            <Lock className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              Los privilegios del rol <strong>ADMINISTRADOR</strong> están blindados de forma permanente para garantizar la operatividad y recuperación del sistema.
            </span>
          </div>
        )}

        {/* Lista de Permisos con Switch Interactivo */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gem-primary/20 border-t-gem-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {permisosFiltrados.map(permiso => {
              const Icon = PERMISO_ICONS[permiso.key] || Shield;
              const isEnabled = isPermisoHabilitado(selectedRol, permiso.key);
              const isUpdating = updatingKey === `${selectedRol}_${permiso.key}`;
              const isLocked = selectedRol === 'ADMINISTRADOR';

              return (
                <div
                  key={permiso.key}
                  className={`p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'bg-white dark:bg-slate-800/90 border-gray-200 dark:border-slate-700 shadow-sm'
                      : 'bg-gray-50/60 dark:bg-slate-900/40 border-gray-100 dark:border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isEnabled 
                        ? 'bg-gem-primary/10 text-gem-primary dark:bg-gem-primary/20' 
                        : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
                          {permiso.nombre}
                        </span>
                        {permiso.key === 'SOLICITUDES_EDITAR' && selectedRol === 'CAPTURISTA' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded">
                            Clave para corrección
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {permiso.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <div className="shrink-0 pt-0.5">
                    {isLocked ? (
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Fijo
                      </span>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        disabled={isUpdating}
                        onClick={() => handleToggle(selectedRol, permiso.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gem-primary focus:ring-offset-2 ${
                          isEnabled ? 'bg-gem-primary' : 'bg-gray-300 dark:bg-slate-700'
                        } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                        title={isEnabled ? 'Clic para desactivar' : 'Clic para activar'}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {permisosFiltrados.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-400 text-xs">
                No se encontraron privilegios que coincidan con "{filtroTexto}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
