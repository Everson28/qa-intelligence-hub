import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Bug, Loader2, Table, PlusCircle, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { API_BASE } from '../../config';

const BugForm = ({ onAction, loading: submitLoading }) => {
  const { t } = useTranslation();
  const [view, setView] = useState('report'); // 'report' or 'list'
  const [bugs, setBugs] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [projects, setProjects] = useState(['General']);
  const [isNewProject, setIsNewProject] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    severity: 'Medium',
    priority: 'Medium',
    environment: 'QA',
    project: 'General',
    steps: '',
    expected: '',
    actual: ''
  });

  useEffect(() => {
    axios.get(`${API_BASE}/projects`)
      .then(res => setProjects(res.data))
      .catch(() => {});
  }, []);

  const fetchBugs = async () => {
    setListLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/bugs`);
      setBugs(res.data);
    } catch (err) {
      toast.error('Error cargando lista de bugs');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') fetchBugs();
  }, [view]);

  const handleSubmit = async () => {
    try {
        await onAction('/bugs', formData);
        toast.success('Bug reportado exitosamente');
        setFormData({ title: '', severity: 'Medium', environment: 'QA', steps: '', expected: '', actual: '' });
    } catch (err) {}
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE}/bugs/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bug_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Exportando reporte de bugs...');
    } catch (err) {
      toast.error('Error al exportar reporte');
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-red-600 p-4 rounded-2xl">
          <Bug size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.bugs')}</h2>
          <p className="text-slate-400 text-xs">Gestión centralizada de incidentes y defectos.</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit self-center relative z-10">
        <button 
          onClick={() => setView('report')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${view === 'report' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 dark:text-red-400' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <PlusCircle size={16} /> {t('forms.report_bug')}
        </button>
        <button 
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 dark:text-red-400' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Table size={16} /> {t('forms.view_bugs')}
        </button>
      </div>

      {view === 'report' ? (
        <div className="flex flex-col gap-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 flex justify-between">
                    Proyecto
                    <button onClick={() => setIsNewProject(!isNewProject)} className="text-blue-500 normal-case font-bold hover:underline decoration-2 underline-offset-4">
                        {isNewProject ? 'Existente' : 'Nuevo'}
                    </button>
                </label>
                {isNewProject ? (
                    <input 
                    className="w-full p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 outline-none bg-blue-50/30 dark:bg-blue-900/10 text-sm font-bold text-blue-600"
                    placeholder="Nombre del nuevo proyecto..."
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                    autoFocus
                    />
                ) : (
                    <select 
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-white dark:bg-slate-800 text-sm font-bold appearance-none cursor-pointer"
                    value={formData.project}
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                    >
                    {projects.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Título</label>
                <input 
                name="title"
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-red-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm shadow-sm"
                placeholder="Descripción corta del bug..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Severidad</label>
              <select name="severity" className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-sm" value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Prioridad</label>
              <select name="priority" className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-sm" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Entorno</label>
              <select name="environment" className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-sm" value={formData.environment} onChange={(e) => setFormData({...formData, environment: e.target.value})}>
                <option value="QA">QA</option>
                <option value="Staging">Staging</option>
                <option value="Prod">Prod</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Pasos para reproducir</label>
            <textarea name="steps" className="w-full h-24 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-sm resize-none" placeholder="1. Entrar a... 2. Click en..." value={formData.steps} onChange={(e) => setFormData({...formData, steps: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Resultado Esperado</label>
              <textarea name="expected" className="w-full h-24 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-sm resize-none" placeholder="Lo que debería pasar..." value={formData.expected} onChange={(e) => setFormData({...formData, expected: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Resultado Real</label>
              <textarea name="actual" className="w-full h-24 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-sm resize-none" placeholder="Lo que pasa realmente..." value={formData.actual} onChange={(e) => setFormData({...formData, actual: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={submitLoading || !formData.title}
            className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700"
          >
            {submitLoading ? <Loader2 className="animate-spin" /> : <Bug size={20} />}
            {t('forms.bugs')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
           <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">{bugs.length} Registrados</h4>
            <button onClick={handleExport} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-xl">
              <Download size={14} /> Exportar CSV
            </button>
          </div>
          {listLoading ? <Loader2 className="animate-spin text-blue-500" /> : bugs.map(b => (
            <div key={b.id} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 shadow-sm">{b.title}</div>
          ))}
        </div>
      )}

      {/* Background Icon */}
      <Bug className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default BugForm;
