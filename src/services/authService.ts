// Centralización de URL del API — usar VITE_API_URL en .env para producción
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface AuthUser {
  username: string;
  rol: string;
  nombreCompleto: string;
  token: string;
}

// Callback global para cuando la sesión expira
let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(callback: () => void): void {
  onSessionExpired = callback;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(error.error || 'Credenciales incorrectas');
  }

  const data = await res.json();
  const user: AuthUser = {
    username: data.username,
    rol: data.rol,
    nombreCompleto: data.nombreCompleto,
    token: data.token,
  };
  localStorage.setItem('auth_user', JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem('auth_user');
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  const user = getUser();
  return user?.token || null;
}

export function isAuthenticated(): boolean {
  const user = getUser();
  if (!user?.token) return false;
  // Check JWT expiration from payload
  try {
    const payload = JSON.parse(atob(user.token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Si el token ya expiró antes de hacer la petición, cerrar sesión
  if (!isAuthenticated()) {
    logout();
    if (onSessionExpired) onSessionExpired();
    return new Response(JSON.stringify({ error: 'Sesión expirada' }), { status: 401 });
  }

  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    // No forzar Content-Type para FormData: el navegador lo genera con el boundary correcto
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });

  // Interceptor global: si el servidor responde 401, la sesión expiró
  if (response.status === 401) {
    logout();
    if (onSessionExpired) onSessionExpired();
  }

  return response;
}
