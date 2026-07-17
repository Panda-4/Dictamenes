import React, { useState, useEffect } from 'react';
import { Save, UserCog, Database, Shield, Bell, Plus, X, Edit2, UserX, Settings, CheckCircle } from 'lucide-react';
import { authFetch, API_BASE } from '../services/authService';

interface UsuarioData {
  id?: number;
  nombreCompleto: string;
  username: string;
  password?: string;
  rol: string;
  dependencia: string;
  activo: boolean;
}

const EMPTY_USER: UsuarioData = {
  nombreCompleto: '',
  username: '',
  password: '',
  rol: 'CAPTURISTA',
  dependencia: '',
  activo: true,
};

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioData | null>(null);
  const [formUser, setFormUser] = useState<UsuarioData>(EMPTY_USER);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (activeTab === 'usuarios') fetchUsuarios();
  }, [activeTab]);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios`);
      if (res.ok) {
        setUsuarios(await res.json());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormUser(EMPTY_USER);
    setShowModal(true);
    setErrorMsg('');
  };

  const openEdit = (user: UsuarioData) => {
    setEditingUser(user);
    setFormUser({ ...user, password: '' });
    setShowModal(true);
    setErrorMsg('');
  };

  const handleSaveUser = async () => {
    setErrorMsg('');
    const body: Record<string, string> = {
      nombreCompleto: formUser.nombreCompleto,
      username: formUser.username,
      rol: formUser.rol,
      dependencia: formUser.dependencia,
      activo: String(formUser.activo),
    };
    if (formUser.password) body.password = formUser.password;

    try {
      let res: Response;
      if (editingUser?.id) {
        res = await authFetch(`${API_BASE}/api/usuarios/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        if (!formUser.password) {
          setErrorMsg('La contraseña es obligatoria para nuevos usuarios.');
          return;
        }
        res = await authFetch(`${API_BASE}/api/usuarios`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        setShowModal(false);
        fetchUsuarios();
        setSuccessMsg(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Error al guardar');
      }
    } catch (error) {
      setErrorMsg('Error de conexión');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const rolLabel = (rol: string) => {
    const colors: Record<string, string> = {
      ADMINISTRADOR: 'bg-purple-100 text-purple-800',
      AUTORIZADOR: 'bg-blue-100 text-blue-800',
      CAPTURISTA: 'bg-teal-100 text-teal-800',
    };
    return <span className={`${colors[rol] || 'bg-gray-100 text-gray-800'} px-2.5 py-1 rounded-lg text-xs font-bold`}>{rol}</span>;
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 tracking-tight">Configuración del Sistema</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Administración de usuarios, catálogos y preferencias.</p>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" /> {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
           {[
             { id: 'usuarios', icon: UserCog, label: 'Gestión de Usuarios' },
             { id: 'catalogos', icon: Database, label: 'Catálogos' },
             { id: 'seguridad', icon: Shield, label: 'Seguridad y Roles' },
             { id: 'notificaciones', icon: Bell, label: 'Notificaciones' },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                 activeTab === tab.id 
                 ? 'bg-gem-primary/10 text-gem-primary border border-gem-primary/20 shadow-sm dark:bg-gem-primary/20' 
                 : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border border-transparent'
               }`}
             >
               <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-gem-primary' : 'text-gray-400'}`} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 min-h-[500px]">
          
          {/* ===== TAB: USUARIOS ===== */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Usuarios del Sistema</h3>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-gem-primary text-white rounded-lg text-sm font-semibold hover:bg-gem-primary-dark transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" /> Nuevo Usuario
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-gem-primary/20 border-t-gem-primary rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700">
                         <tr>
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Dependencia</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                         {usuarios.map(user => (
                           <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                             <td className="p-4 font-semibold text-gray-800 dark:text-slate-100">{user.nombreCompleto}</td>
                             <td className="p-4 text-gray-600 dark:text-slate-400 font-mono text-xs">{user.username}</td>
                             <td className="p-4 text-gray-600 dark:text-slate-400">{user.dependencia || '—'}</td>
                             <td className="p-4">{rolLabel(user.rol)}</td>
                             <td className="p-4 text-center">
                               <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                 {user.activo ? 'Activo' : 'Inactivo'}
                               </span>
                             </td>
                             <td className="p-4 text-right">
                               <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => openEdit(user)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-gem-primary hover:bg-gem-primary/10 rounded-lg transition-colors" title="Editar">
                                   <Edit2 className="w-4 h-4" />
                                 </button>
                                 {user.activo && (
                                   <button onClick={() => user.id && handleDeactivate(user.id)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Desactivar">
                                     <UserX className="w-4 h-4" />
                                   </button>
                                 )}
                               </div>
                             </td>
                           </tr>
                         ))}
                         {usuarios.length === 0 && (
                           <tr>
                             <td colSpan={6} className="p-12 text-center text-gray-400 dark:text-slate-500 font-medium">No hay usuarios registrados.</td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: CATALOGOS ===== */}
          {activeTab === 'catalogos' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-gray-100 dark:border-slate-700 pb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Catálogos Maestros</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Administración de listas desplegables y opciones fijas del sistema.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {['Dependencias y OPDs', 'Capítulos Presupuestales', 'Unidades Administrativas', 'Tipos de Excepción'].map((cat, i) => (
                    <div key={i} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-gem-primary/50 cursor-pointer transition-colors bg-gray-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-700 flex justify-between items-center">
                       <span className="font-semibold text-gray-700 dark:text-slate-200">{cat}</span>
                       <span className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-full font-bold">Gestionar</span>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* ===== TAB: SEGURIDAD ===== */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-gray-100 dark:border-slate-700 pb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Roles y Permisos</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Referencia de los roles disponibles en el sistema.</p>
              </div>

              <div className="space-y-4">
                {[
                  { rol: 'ADMINISTRADOR', color: 'border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-900/10', badge: 'bg-purple-100 text-purple-800',
                    permisos: ['CRUD completo de solicitudes', 'Eliminar solicitudes', 'Gestión de usuarios', 'Ver auditoría', 'Acceso a configuración'] },
                  { rol: 'AUTORIZADOR', color: 'border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10', badge: 'bg-blue-100 text-blue-800',
                    permisos: ['Leer y actualizar solicitudes', 'Cambiar estatus de dictámenes', 'Ver dashboard'] },
                  { rol: 'CAPTURISTA', color: 'border-teal-200 bg-teal-50/50 dark:border-teal-900/30 dark:bg-teal-900/10', badge: 'bg-teal-100 text-teal-800',
                    permisos: ['Crear solicitudes', 'Leer solicitudes propias', 'Ver dashboard'] },
                ].map(r => (
                  <div key={r.rol} className={`border ${r.color} rounded-xl p-5`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <span className={`${r.badge} px-3 py-1 rounded-lg text-xs font-bold`}>{r.rol}</span>
                    </div>
                    <ul className="space-y-1.5 ml-8">
                      {r.permisos.map((p, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TAB: NOTIFICACIONES ===== */}
          {activeTab === 'notificaciones' && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 space-y-4 animate-in fade-in py-20">
               <Settings className="w-16 h-16 opacity-20" />
               <p className="font-medium text-lg text-gray-500 dark:text-slate-500">Módulo en construcción</p>
            </div>
          )}

        </div>
      </div>

      {/* ===== MODAL: CREAR/EDITAR USUARIO ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Nombre Completo *</label>
                <input
                  type="text"
                  value={formUser.nombreCompleto}
                  onChange={e => setFormUser({ ...formUser, nombreCompleto: e.target.value })}
                  required
                  className="w-full border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Usuario *</label>
                  <input
                    type="text"
                    value={formUser.username}
                    onChange={e => setFormUser({ ...formUser, username: e.target.value })}
                    disabled={!!editingUser}
                    required
                    className="w-full border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contraseña {editingUser ? '(dejar vacío si no cambia)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formUser.password || ''}
                    onChange={e => setFormUser({ ...formUser, password: e.target.value })}
                    className="w-full border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Rol *</label>
                  <select
                    value={formUser.rol}
                    onChange={e => setFormUser({ ...formUser, rol: e.target.value })}
                    className="w-full border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-colors"
                  >
                    <option value="CAPTURISTA">Capturista</option>
                    <option value="AUTORIZADOR">Autorizador</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Dependencia</label>
                  <input
                    type="text"
                    value={formUser.dependencia}
                    onChange={e => setFormUser({ ...formUser, dependencia: e.target.value })}
                    className="w-full border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-gem-primary/20 focus:border-gem-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="flex items-center gap-2 px-5 py-2.5 bg-gem-primary text-white rounded-xl text-sm font-bold hover:bg-gem-primary-dark transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                {editingUser ? 'Actualizar' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
