import { API_BASE, authFetch } from './authService';

export interface RolPermiso {
  id: number;
  rol: 'ADMINISTRADOR' | 'AUTORIZADOR' | 'CAPTURISTA' | 'CONSULTA' | string;
  permiso: string;
  habilitado: boolean;
}

export interface PermisoMeta {
  key: string;
  nombre: string;
  descripcion: string;
  categoria: 'dictamenes' | 'vistas' | 'sistema';
}

export const LISTA_METADATA_PERMISOS: PermisoMeta[] = [
  {
    key: 'SOLICITUDES_CREAR',
    nombre: 'Crear Solicitudes',
    descripcion: 'Permite registrar nuevas solicitudes de dictamen técnico',
    categoria: 'dictamenes',
  },
  {
    key: 'SOLICITUDES_EDITAR',
    nombre: 'Editar Solicitudes',
    descripcion: 'Permite modificar solicitudes existentes (útil para corrección de datos)',
    categoria: 'dictamenes',
  },
  {
    key: 'SOLICITUDES_ELIMINAR',
    nombre: 'Eliminar Solicitudes',
    descripcion: 'Permite dar de baja o descartar registros del sistema',
    categoria: 'dictamenes',
  },
  {
    key: 'SOLICITUDES_VALIDAR',
    nombre: 'Validar y Emitir Dictamen',
    descripcion: 'Permite dictaminar solicitudes como Procedente o Rechazado',
    categoria: 'dictamenes',
  },
  {
    key: 'VER_DASHBOARD',
    nombre: 'Acceso a Tablero y Métricas',
    descripcion: 'Visualización de gráficas estadísticas e indicadores de gestión',
    categoria: 'vistas',
  },
  {
    key: 'EXPORTAR_DATOS',
    nombre: 'Exportar Reportes',
    descripcion: 'Descarga masiva de listados a Microsoft Excel y fichas en PDF',
    categoria: 'vistas',
  },
  {
    key: 'VER_AUDITORIA',
    nombre: 'Bitácora de Auditoría',
    descripcion: 'Consulta de traza de acciones, accesos e historial de cambios',
    categoria: 'sistema',
  },
  {
    key: 'ADMIN_CATALOGOS',
    nombre: 'Administración de Catálogos',
    descripcion: 'Gestión de dependencias, capítulos, unidades y excepciones',
    categoria: 'sistema',
  },
];

// Obtener la matriz completa de roles y permisos
export async function getMatrizPermisos(): Promise<RolPermiso[]> {
  const res = await authFetch(`${API_BASE}/api/roles/permisos`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al obtener matriz de permisos');
  }
  return res.json();
}

// Obtener los permisos asignados al usuario logueado en sesión
export async function getMisPermisos(): Promise<string[]> {
  try {
    const res = await authFetch(`${API_BASE}/api/roles/mis-permisos`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('Error consultando permisos de sesión:', err);
    return [];
  }
}

// Alternar o asignar permiso a un rol
export async function toggleRolPermiso(rol: string, permiso: string, habilitado: boolean): Promise<RolPermiso> {
  const res = await authFetch(`${API_BASE}/api/roles/${rol}/permisos/${permiso}`, {
    method: 'PUT',
    body: JSON.stringify({ habilitado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar permiso');
  }
  return res.json();
}
