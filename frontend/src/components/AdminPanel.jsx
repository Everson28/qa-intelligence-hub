import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  Users, 
  Settings, 
  Shield, 
  Activity, 
  Database, 
  AlertCircle, 
  Loader2,
  Clock,
  Layout,
  Trash2,
  Key,
  Plus,
  Zap,
  Globe,
  CheckCircle2,
  Smartphone,
  Cpu,
  Cloud,
  Layers
} from 'lucide-react';

import { API_ROOT, API_BASE } from '../config';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [routing, setRouting] = useState({});
  const [sysStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Modals / Forms
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user', preferred_lang: 'en' });
  const [showAIModal, setShowAIModal] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', base_url: '', api_key: '', is_cloud: false, default_model: '' });

  useEffect(() => {
    fetchAdminData();
  }, [activeSubTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'overview') {
        const res = await axios.get(`${API_BASE}/admin/system-status`);
        setSystemStatus(res.data);
      } else if (activeSubTab === 'users') {
        const res = await axios.get(`${API_BASE}/admin/users`);
        setUsers(res.data);
      } else if (activeSubTab === 'ai') {
        const res = await axios.get(`${API_BASE}/admin/ai/providers`);
        setProviders(res.data);
      } else if (activeSubTab === 'audit') {
        const res = await axios.get(`${API_BASE}/admin/ai/logs`);
        setLogs(res.data);
      }
    } catch (error) {
      toast.error(t('admin.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post(`${API_BASE}/auth/register`, newUser);
      toast.success(t('admin.user_created') || 'Success');
      setShowUserModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(t('admin.confirm_delete_user', { username: user.username }))) return;
    try {
      await axios.delete(`${API_BASE}/admin/users/${user.id}`);
      toast.success(t('admin.user_deleted'));
      fetchAdminData();
    } catch (err) {
      toast.error(t('admin.delete_user_error') + (err.response?.data?.detail || ''));
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await axios.patch(`${API_BASE}/admin/users/${id}/role?new_role=${newRole}`);
      toast.success(t('admin.role_updated'));
      fetchAdminData();
    } catch (err) {
      toast.error(t('admin.role_error'));
    }
  };

  const handleAddProvider = async () => {
    try {
      await axios.post(`${API_BASE}/admin/ai/providers`, newProvider);
      toast.success(t('admin.ai_provider_added') || 'Success');
      setShowAIModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error(t('admin.ai_provider_error') || 'Error');
    }
  };

  const activateProvider = async (id) => {
    try {
      await axios.patch(`${API_BASE}/admin/ai/providers/${id}/activate`);
      toast.success(t('admin.activate_success') || 'Success');
      fetchAdminData();
    } catch (err) {
      toast.error(t('admin.activate_error') || 'Error');
    }
  };

  const updateRouting = async (task, providerId) => {
    try {
      await axios.post(`${API_BASE}/admin/ai/routing`, { task_type: task, provider_id: providerId });
      toast.success(t('admin.routing_updated') || 'Success');
    } catch (err) {
      toast.error(t('admin.routing_error') || 'Error');
    }
  };

  if (loading && !showUserModal && !showAIModal) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Shield className="text-blue-400" /> {t('admin.cmd_center')}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{t('admin.cmd_center_desc')}</p>
        </div>
        <div className="flex gap-3 relative z-10">
            {activeSubTab === 'users' && (
                <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                    <Plus size={16} /> {t('admin.new_user')}
                </button>
            )}
            {activeSubTab === 'ai' && (
                <button onClick={() => setShowAIModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                    <Plus size={16} /> {t('admin.add_ai_provider')}
                </button>
            )}
        </div>
        <Activity className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      {/* Sub Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit self-center">
        {[
            { id: 'overview', label: t('admin.tab_overview'), icon: Layout },
            { id: 'users', label: t('admin.tab_engineers'), icon: Users },
            { id: 'ai', label: t('admin.tab_ai_hub'), icon: Cpu },
            { id: 'audit', label: t('admin.tab_audit'), icon: Clock }
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <tab.icon size={18} /> {tab.label}
            </button>
        ))}
      </div>

      {/* Overview Content */}
      {activeSubTab === 'overview' && sysStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8 border-t-4 border-blue-500 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-6">
                    <Database className="text-blue-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.card_core_data')}</span>
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">{sysStatus.bugs_total}</div>
                <p className="text-slate-500 text-xs mt-2 uppercase font-bold">{t('admin.card_defects')}</p>
            </div>
            <div className="card p-8 border-t-4 border-indigo-500 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-6">
                    <Cpu className="text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.card_ai_router')}</span>
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">{sysStatus.ai_engine}</div>
                <p className="text-slate-500 text-xs mt-2 uppercase font-bold">{t('admin.card_active_orch')}</p>
            </div>
            <div className="card p-8 border-t-4 border-emerald-500 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-6">
                    <Shield className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.card_security')}</span>
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">Active</div>
                <p className="text-slate-500 text-xs mt-2 uppercase font-bold">{t('admin.card_vault')}</p>
            </div>
        </div>
      )}

      {/* Users Content */}
      {activeSubTab === 'users' && (
        <div className="card overflow-hidden bg-white dark:bg-slate-900 border-none shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_engineer')}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_role')}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_lang')}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {user.avatar_url ? (
                        <img src={`${API_ROOT}${user.avatar_url}`} className="w-10 h-10 rounded-xl object-cover border border-slate-200" alt="Avatar" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                            {user.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-slate-700 dark:text-slate-200">{user.username}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase outline-none cursor-pointer transition-all ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="lead">Lead</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <Globe size={14} className="text-blue-500" /> {user.preferred_lang}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toast.error('Funcionalidad de cambio de contraseña en desarrollo')}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                          <Key size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Hub Content */}
      {activeSubTab === 'ai' && (
        <div className="flex flex-col gap-8">
            {/* Multi-Provider Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('admin.ai_providers_title')}</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {providers.map(p => (
                            <div key={p.id} className={`card p-6 flex items-center justify-between transition-all ${p.is_active ? 'border-2 border-indigo-500 bg-indigo-50/10' : 'bg-white dark:bg-slate-900 opacity-60'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.is_cloud ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {p.is_cloud ? <Cloud size={24} /> : <Smartphone size={24} />}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            {p.name} {p.is_active && <CheckCircle2 size={14} className="text-indigo-500" />}
                                        </h5>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{p.default_model}</p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{p.base_url}</p>
                                    </div>
                                </div>
                                {!p.is_active && (
                                    <button 
                                        onClick={() => activateProvider(p.id)}
                                        className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                                    >
                                        {t('admin.activate')}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('admin.ai_routing_title')}</h4>
                    <div className="card p-6 bg-white dark:bg-slate-900 flex flex-col gap-6">
                        {[
                            { task: t('admin.route_requirements'), type: 'requirements' },
                            { task: t('admin.route_scripts'), type: 'scripts' },
                            { task: t('admin.route_copilot'), type: 'copilot' },
                            { task: t('admin.route_oracle'), type: 'oracle' }
                        ].map(route => (
                            <div key={route.type} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full group-hover:h-10 transition-all"></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{route.task}</span>
                                </div>
                                <select 
                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                    onChange={(e) => updateRouting(route.type, e.target.value)}
                                >
                                    <option value="">{t('admin.default_active')}</option>
                                    {providers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Audit Logs Content */}
      {activeSubTab === 'audit' && (
        <div className="card overflow-hidden bg-white dark:bg-slate-900 border-none shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_task')}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_provider_model')}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_metrics')}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_duration')}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.th_date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                      {log.task_type}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{log.provider_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{log.model_name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-4 text-[10px] font-bold">
                        <span className="text-blue-500">P: {log.prompt_length} ch</span>
                        <span className="text-emerald-500">R: {log.response_length} ch</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <Zap size={14} className={log.duration_ms > 5000 ? 'text-amber-500' : 'text-blue-500'} />
                        <span className={log.duration_ms > 5000 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'}>
                            {(log.duration_ms / 1000).toFixed(2)}s
                        </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                        {new Date(log.created_at).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
                <Clock className="w-12 h-12 text-slate-200" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t('admin.no_ai_activity')}</p>
            </div>
          )}
        </div>
      )}

      {/* User Creation Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">{t('admin.modal_new_engineer')}</h3>
                <div className="space-y-4">
                    <input 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={t('admin.placeholder_username')}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    />
                    <input 
                        type="password"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={t('admin.placeholder_password')}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <select 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold"
                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="lead">Lead QA</option>
                        </select>
                        <select 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold"
                            onChange={(e) => setNewUser({...newUser, preferred_lang: e.target.value})}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setShowUserModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">{t('common.cancel') || 'Cancel'}</button>
                        <button onClick={handleCreateUser} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20">{t('admin.btn_create_access')}</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* AI Provider Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">{t('admin.modal_config_ai')}</h3>
                <div className="space-y-4">
                    <input 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder={t('admin.placeholder_name')}
                        onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder={t('admin.placeholder_base_url')}
                            onChange={(e) => setNewProvider({...newProvider, base_url: e.target.value})}
                        />
                        <input 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder={t('admin.placeholder_model')}
                            onChange={(e) => setNewProvider({...newProvider, default_model: e.target.value})}
                        />
                    </div>
                    <input 
                        type="password"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                        placeholder={t('admin.placeholder_api_key')}
                        onChange={(e) => setNewProvider({...newProvider, api_key: e.target.value})}
                    />
                    <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer transition-all hover:bg-slate-100">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500"
                            onChange={(e) => setNewProvider({...newProvider, is_cloud: e.target.checked})}
                        />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('admin.check_cloud')}</span>
                    </label>
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setShowAIModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">{t('admin.btn_discard')}</button>
                        <button onClick={handleAddProvider} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20">{t('admin.btn_add_infra')}</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
