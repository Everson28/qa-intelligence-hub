import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-20 pb-10 border-t border-slate-200 pt-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-2">
            <img src="/Logo/qa_black.svg" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="font-black text-slate-800 tracking-tight text-xl">QA Intelligence Hub</span>
          </div>
          <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
            {t('footer.mission')}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">dearmas28</div>
          <div className="flex gap-4">
            <a href="https://github.com/Everson28" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm">
              <Github size={20} />
            </a>
            <a href="https://www.linkedin.com/in/de-armas/?locale=es" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm">
              <Linkedin size={20} />
            </a>
            <a href="mailto:dearmas1128@gmail.com" className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all shadow-sm">
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-slate-400 text-sm justify-center md:justify-end mb-2">
            {t('footer.made_with')} <Heart size={14} className="text-red-500 fill-current animate-pulse" /> {t('footer.in_latam')}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase">
            © {currentYear} QA HUB | {t('footer.all_rights')}
          </div>
        </div>
      </div>
      
      <div className="mt-10 pt-6 border-t border-slate-100 text-center">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Human-in-the-loop Intelligence System v1.2.0
        </span>
      </div>
    </footer>
  );
};

export default Footer;
