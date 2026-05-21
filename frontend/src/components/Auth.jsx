import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { API_ROOT, API_BASE } from '../config';

const Auth = ({ onLogin }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? new URLSearchParams({ username, password })
      : { username, password };

    const headers = isLogin 
      ? { 'Content-Type': 'application/x-www-form-urlencoded' }
      : { 'Content-Type': 'application/json' };

    try {
      localStorage.removeItem('token'); // Clean state
      const res = await axios.post(`${API_BASE}${endpoint}`, payload, { headers });
      if (isLogin) {
        const token = res.data.access_token;
        localStorage.setItem('token', token);
        // Set header immediately to prevent race conditions
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        toast.success(t('auth.login_success') || 'Login successful');
        onLogin(token);
      } else {
        toast.success(t('auth.reg_success'));
        setIsLogin(true);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || t('auth.comm_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="card w-full max-w-md p-10 relative z-10 backdrop-blur-xl bg-white/95 border-white/20 shadow-2xl rounded-[2.5rem]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20 p-2">
            <img src="/Logo/qa_white.svg" alt="QA Hub Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">QA Hub</h1>
          <p className="text-slate-500 font-medium mt-1">{t('auth.auth_subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider ml-1">{t('auth.username_label')}</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                placeholder="qa_specialist"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider ml-1">{t('auth.password')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isLogin ? t('auth.login') : t('auth.create_account')}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-8 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          {isLogin ? t('auth.no_account') : t('auth.have_account')}
        </button>
      </div>
    </div>
  );
};

export default Auth;
