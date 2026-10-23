import { API_BASE, authFetch } from './authService';

export interface CatalogoItem {
  id: number;
  tipo: 'DEPENDENCIA' | 'CAPITULO' | 'UNIDAD_ADMINISTRATIVA' | 'TIPO_EXCEPCION';
  codigo?: string;
  nombre: string;
  orden?: number;
  activo: boolean;
  fechaCreacion?: string;
}

// Obtener elementos activos (para selects de formularios y filtros)
export async function getCatalogosActivos(tipo: string): Promise<CatalogoItem[]> {
  const res = await authFetch(`${API_BASE}/api/catalogos/${tipo}`);
  if (!res.ok) {
    throw new Error(`Error al cargar catálogo de ${tipo}`);
  }
  return res.json();
}

// Obtener todos los elementos (para administración)
export async function getCatalogosAdmin(tipo: string): Promise<CatalogoItem[]> {
  const res = await authFetch(`${API_BASE}/api/catalogos/${tipo}/admin`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error al obtener catálogo administrativo`);
  }
  return res.json();
}

// Guardar nuevo elemento
export async function createCatalogoItem(item: Partial<CatalogoItem>): Promise<CatalogoItem> {
  const res = await authFetch(`${API_BASE}/api/catalogos`, {
    method: 'POST',
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear elemento de catálogo');
  }
  return res.json();
}

// Actualizar elemento existente
export async function updateCatalogoItem(id: number, item: Partial<CatalogoItem>): Promise<CatalogoItem> {
  const res = await authFetch(`${API_BASE}/api/catalogos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar elemento');
  }
  return res.json();
}

// Activar o desactivar (toggle)
export async function toggleCatalogoActivo(id: number): Promise<CatalogoItem> {
  const res = await authFetch(`${API_BASE}/api/catalogos/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al alternar estatus');
  }
  return res.json();
}

// Eliminar elemento de catálogo
export async function deleteCatalogoItem(id: number): Promise<void> {
  const res = await authFetch(`${API_BASE}/api/catalogos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar elemento');
  }
}
