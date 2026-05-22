import React, { useState, useEffect } from 'react';
import { User, LogOut, Globe, Activity, Zap, ZapOff, Search, FileText, Bug as BugIcon, Database, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProfileAvatar from './ProfileAvatar';
import { API_ROOT, API_BASE } from '../config';

const Header = ({ activeTab, currentUser, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [aiStatus, setAiStatus] = useState('checking');
  const [user, setUser] = useState(currentUser);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  // Close profile card on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileCard && !event.target.closest('.profile-container')) {
        setShowProfileCard(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileCard]);

  // Universal Search Logic
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`${API_BASE}/search?q=${searchQuery}`);
        setSearchResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchQuery('');
    // Disparar navegación basada en el tipo
    const tabMap = { 'report': 'history', 'bug': 'bugs', 'migration': 'migration' };
    window.dispatchEvent(new CustomEvent('nav-change', { detail: tabMap[result.type] }));
  };

  const checkHealth = () => {
    axios.get(`${API_BASE}/system/health`)
      .then(res => setAiStatus(res.data.ai_engine))
      .catch(() => setAiStatus('Offline'));
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-sm transition-colors duration-300 relative z-50">
      <div className="flex-1">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          {t(`common.titles.${activeTab}`) || "QA Intelligence Hub"}
        </h2>
        <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 dark:text-slate-400 font-medium">{t('common.header_subtitle')}</p>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                    aiStatus === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                    aiStatus === 'Issues' ? 'bg-amber-500' : 'bg-red-500'
                }`}></div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 dark:text-slate-500">
                    {t('dashboard.ai_engine_label')}: {aiStatus}
                </span>
            </div>
        </div>
      </div>

      {/* Universal Search Bar */}
      <div className="flex-1 max-w-md relative order-last md:order-none">
          <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search_placeholder') || "Search reports, bugs or migrations..."}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-sm font-medium transition-all shadow-sm"
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                      <X size={14} />
                  </button>
              )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-2 max-h-80 overflow-auto">
                      {searchResults.length > 0 ? searchResults.map((res, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleResultClick(res)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all text-left group"
                          >
                              <div className={`p-2.5 rounded-xl ${
                                  res.type === 'report' ? 'bg-blue-50 text-blue-600' :
                                  res.type === 'bug' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                  {res.type === 'report' && <FileText size={18} />}
                                  {res.type === 'bug' && <BugIcon size={18} />}
                                  {res.type === 'migration' && <Database size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{res.title}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.category}</p>
                              </div>
                              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                          </button>
                      )) : (
                          <div className="p-8 text-center">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('common.no_results_found') || 'No results found'}</p>
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>

      <div className="flex items-center gap-4 self-end md:self-center">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <Globe size={18} className="text-blue-600" />
          {i18n.language.startsWith('en') ? 'EN' : 'ES'}
        </button>

        {user && (
          <div className="relative profile-container">
            {/* Ultra-Minimal Micro Avatar Trigger */}
            <div 
                onClick={() => setShowProfileCard(!showProfileCard)}
                className={`p-0.5 rounded-full transition-all cursor-pointer active:scale-95 ${showProfileCard ? 'ring-4 ring-blue-500/20 bg-blue-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:shadow-lg'}`}
            >
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden">
                    <ProfileAvatar user={user} onUpdate={(url) => setUser({...user, avatar_url: url})} />
                </div>
            </div>

            {/* Premium Floating Hover Card */}
            {showProfileCard && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[1.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 z-[100]">
                    {/* User Header Section */}
                    <div className="p-5 pb-4 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm shrink-0 overflow-hidden">
                                <ProfileAvatar user={user} onUpdate={(url) => setUser({...user, avatar_url: url})} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate leading-tight">{user.username}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('common.active_status')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="p-2">
                        <button 
                        onClick={() => {
                            setShowProfileCard(false);
                            onLogout();
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all group/item"
                        >
                        <div className="flex items-center gap-3">
                            <LogOut size={14} className="group-hover/item:translate-x-0.5 transition-transform" />
                            <span className="text-xs font-bold">{t('common.logout')}</span>
                        </div>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </button>
                    </div>
                    
                    {/* Decorative Pointer */}
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-50 dark:bg-slate-800 rotate-45 border-l border-t border-slate-200/50 dark:border-slate-700/50"></div>
                </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
