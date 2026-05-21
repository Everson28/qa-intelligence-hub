import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Bug, 
  FileUp, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Shield,
  Zap,
  Database,
  BrainCircuit,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import { API_ROOT, API_BASE } from '../config';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [projects, setProjects] = useState(['General']);
  const [selectedProject, setSelectedProject] = useState('General');
  const [loading, setLoading] = useState(true);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleVerdict, setOracleVerdict] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats individually to avoid total failure if one endpoint has issues
      const statsRes = await axios.get(`${API_BASE}/dashboard/stats`).catch(() => ({ data: null }));
      const analyticsRes = await axios.get(`${API_BASE}/dashboard/analytics`).catch(() => ({ data: [] }));
      const annRes = await axios.get(`${API_BASE}/announcements`).catch(() => ({ data: { message: null } }));
      const projRes = await axios.get(`${API_BASE}/projects`).catch(() => ({ data: ['General'] }));

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data || []);
      setAnnouncement(annRes.data?.message);
      setProjects(projRes.data || ['General']);
    } catch (error) {
      console.error("Critical dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOracleVerdict = async () => {
    setOracleLoading(true);
    setOracleVerdict(null);
    try {
      const response = await axios.get(`${API_BASE}/oracle/verdict`, {
        params: { project: selectedProject }
      });
      if (response.data.status === 'success') {
        setOracleVerdict(response.data.data);
        toast.success(t('dashboard.oracle_success'));
      } else {
        setOracleVerdict(response.data.data); // Muestra el mensaje de fallback del backend
      }
    } catch (error) {
      console.error("Oracle call failed:", error);
      toast.error(t('dashboard.oracle_error'));
      setOracleVerdict(t('dashboard.oracle_deep_analysis'));
    } finally {
      setOracleLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-spin text-blue-500 w-12 h-12" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">{t('common.loading')}</p>
      </div>
    </div>
  );

  const finalScore = stats?.health_score ?? 100;
  const statusLabel = finalScore >= 80 ? t('dashboard.status_healthy') : t('dashboard.status_at_risk');

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      
      {/* Global Announcement Banner */}
      {announcement && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 overflow-hidden relative">
            <div className="bg-amber-500 p-2 rounded-lg text-white animate-pulse">
                <AlertTriangle size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-amber-700 dark:text-amber-400 text-sm font-bold whitespace-nowrap animate-marquee">
                    {announcement}
                </p>
            </div>
        </div>
      )}

      {/* Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-none relative overflow-hidden group hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20">
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2 opacity-80">{t('dashboard.total_bugs')}</p>
            <h3 className="text-4xl font-black text-white">{stats?.bug_stats?.total || 0}</h3>
            <div className="flex items-center gap-2 mt-4 text-blue-200 text-xs font-bold">
                <TrendingUp size={14} /> {t('dashboard.trending_up')}
            </div>
          </div>
          <Bug className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform" />
        </div>

        <div className="card p-8 bg-white dark:bg-slate-900 relative overflow-hidden group hover:scale-[1.02] transition-all">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{t('dashboard.critical')}</p>
          <h3 className="text-4xl font-black text-red-500 dark:text-red-400">{stats?.bug_stats?.critical || 0}</h3>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${(stats?.bug_stats?.critical / (stats?.bug_stats?.total || 1) * 100) || 0}%` }}></div>
            </div>
          </div>
          <AlertTriangle className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-50 dark:text-slate-800/50" />
        </div>

        <div className="card p-8 bg-white dark:bg-slate-900 relative overflow-hidden group hover:scale-[1.02] transition-all">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{t('dashboard.migration')}</p>
          <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">{stats?.migration_stats?.total_files || 0}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-4 font-bold uppercase tracking-tight">{stats?.migration_stats?.total_records || 0} {t('dashboard.total_records')}</p>
          <FileUp className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-50 dark:text-slate-800/50" />
        </div>

        <div className="card p-8 bg-white dark:bg-slate-900 relative overflow-hidden group hover:scale-[1.02] transition-all">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{t('dashboard.quality_score')}</p>
          <div className="flex items-end gap-2">
            <h3 className={`text-4xl font-black ${finalScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{finalScore}%</h3>
            <span className="text-slate-400 text-xs mb-1 font-bold">{t('dashboard.health_label')}</span>
          </div>
          <div className={`mt-4 px-3 py-1 bg-opacity-10 text-[10px] font-black uppercase tracking-widest rounded-full w-fit ${
              finalScore >= 80 ? 'bg-emerald-500 text-emerald-500' : 'bg-amber-500 text-amber-500'
          }`}>
            {statusLabel}
          </div>
          <Shield className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-50 dark:text-slate-800/50" />
        </div>
      </section>

      {/* Main Insights & Oracle */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Welcome Banner */}
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1">
                    <h3 className="text-2xl font-black mb-4 tracking-tight flex items-center gap-3">
                        <Zap className="text-amber-400 fill-amber-400" /> 
                        {t('dashboard.welcome')}
                    </h3>
                    <p className="text-slate-400 leading-relaxed max-w-lg">
                        {t('dashboard.welcome_msg', { 
                          status: statusLabel, 
                          count: stats?.reports_count || 0 
                        })}
                    </p>
                    <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'copilot' }))}
                        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        {t('dashboard.consult_copilot')}
                    </button>
                </div>
                <div className="w-full md:w-48 flex flex-col items-center justify-center gap-2 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-6">
                    <div className="text-3xl font-black">{stats?.reports_count || 0}</div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">{t('dashboard.reports') || 'Reports'}</p>
                </div>
            </div>

            {/* Real-time Graph Integration */}
            <div className="mt-10 h-48 w-full bg-white/5 rounded-3xl p-4 border border-white/5 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics}>
                        <defs>
                            <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                            itemStyle={{ color: '#3b82f6' }}
                        />
                        <Area type="monotone" dataKey="duration" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDur)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="absolute top-4 left-6 pointer-events-none">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('dashboard.ai_latency_label')}</span>
                </div>
            </div>

            <Activity className="absolute -left-20 -bottom-20 w-80 h-80 text-white/5 pointer-events-none" />
          </div>

          {/* New Token Analytics Bar Chart */}
          {analytics.length > 0 && (
            <div className="card bg-white dark:bg-slate-900 p-8 border-none shadow-xl">
               <div className="flex justify-between items-center mb-6">
                   <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <Database size={18} className="text-indigo-500" /> {t('dashboard.token_performance')}
                   </h4>
                   <div className="flex gap-4 text-[10px] font-bold">
                       <span className="flex items-center gap-1 text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> {t('dashboard.prompt_legend')}</span>
                       <span className="flex items-center gap-1 text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {t('dashboard.response_legend')}</span>
                   </div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="prompt" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="response" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* Oracle Section */}
          <div className="card bg-indigo-900 border-none p-8 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl text-indigo-200">
                            <BrainCircuit size={24} />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">{t('dashboard.oracle_title')}</h4>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl border border-white/10">
                        <select 
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                          className="bg-transparent text-white text-xs font-bold px-3 py-1 outline-none cursor-pointer"
                        >
                          {projects.map(p => (
                            <option key={p} value={p} className="bg-indigo-900 text-white font-bold">{p}</option>
                          ))}
                        </select>

                        <button 
                            onClick={getOracleVerdict}
                            disabled={oracleLoading}
                            className="flex items-center gap-2 bg-white text-indigo-900 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all disabled:opacity-50"
                        >
                            {oracleLoading ? <Loader2 size={14} className="animate-spin" /> : t('dashboard.request_verdict')}
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {oracleVerdict ? (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-in slide-in-from-top-4">
                        <p className="text-indigo-100 text-sm leading-relaxed whitespace-pre-line font-medium">{oracleVerdict}</p>
                    </div>
                ) : (
                    <p className="text-indigo-300 text-sm italic">{t('dashboard.oracle_placeholder')}</p>
                )}
            </div>
            <BrainCircuit className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
          </div>
        </div>

        {/* Side Actions / Quick Status */}
        <div className="card dark:bg-slate-900 dark:border-slate-800 p-8 flex flex-col gap-8">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">{t('dashboard.health_status')}</h4>
            
            <div className="space-y-6">
                {[
                    { label: t('dashboard.ai_engine_label'), status: t('dashboard.operational'), color: "emerald", icon: Activity },
                    { label: t('dashboard.database_label'), status: t('dashboard.healthy'), color: "blue", icon: Database },
                    { label: t('dashboard.api_layer_label'), status: t('dashboard.secure'), color: "indigo", icon: Shield }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400`}>
                            <item.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                            <p className={`text-[10px] font-black uppercase text-${item.color}-500`}>{item.status}</p>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500 animate-pulse`}></div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        {t('dashboard.quote')}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">— QA Oracle</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
