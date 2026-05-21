import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Loader2, Sparkles, BookOpen, PlusCircle } from 'lucide-react';
import axios from 'axios';

import { API_BASE } from '../../config';

const RequirementForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [userStory, setUserStory] = useState('');
  const [project, setProject] = useState('General');
  const [projects, setProjects] = useState(['General']);
  const [isNewProject, setIsNewProject] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/projects`)
      .then(res => setProjects(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!userStory) return;
    await onAction('/analyze-requirements', { user_story: userStory, project });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-blue-600 p-4 rounded-2xl">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.requirements')}</h2>
          <p className="text-slate-400 text-xs">Transforma historias de usuario en criterios de aceptación y casos de prueba.</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 flex items-center justify-between">
            Proyecto / Contexto
            <button 
              onClick={() => setIsNewProject(!isNewProject)}
              className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 normal-case font-bold"
            >
              <PlusCircle size={14} /> {isNewProject ? 'Seleccionar existente' : 'Nuevo proyecto'}
            </button>
          </label>
          
          {isNewProject ? (
            <input 
              type="text"
              className="w-full p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 outline-none bg-white dark:bg-slate-800 text-sm font-bold text-blue-600 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="Escribe el nombre del nuevo proyecto..."
              onChange={(e) => setProject(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="relative group/select">
                <select 
                className="w-full p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 outline-none bg-white dark:bg-slate-800 text-sm font-bold appearance-none cursor-pointer shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                >
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <PlusCircle size={18} className="rotate-45" />
                </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
            {t('forms.user_story_label')}
          </label>
          <textarea 
            className="w-full h-48 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm resize-none shadow-sm"
            placeholder={t('forms.user_story_placeholder')}
            value={userStory}
            onChange={(e) => setUserStory(e.target.value)}
          />
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !userStory}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.analyze_ia')}
      </button>

      {/* Background Icon */}
      <BookOpen className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default RequirementForm;
