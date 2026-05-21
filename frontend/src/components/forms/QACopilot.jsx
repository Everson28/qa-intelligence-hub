import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Bot, Send, Loader2, User, Sparkles, History } from 'lucide-react';
import toast from 'react-hot-toast';

import { API_BASE } from '../../config';

const QACopilot = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('copilot_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: t('forms.copilot_welcome') }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('copilot_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { 
        message: input,
        history: newMessages.slice(-6) 
      });
      const assistantMessage = { role: 'assistant', content: response.data.data };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(t('forms.copilot_error') || 'Error connecting to Copilot');
      setMessages(prev => [...prev, { role: 'assistant', content: "Sigo aquí, pero tuve un problema de conexión. ¿Podrías repetir eso?" }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('¿Borrar historial del chat?')) {
      const reset = [{ role: 'assistant', content: t('forms.copilot_welcome') }];
      setMessages(reset);
      localStorage.removeItem('copilot_history');
      toast.success('Chat reiniciado');
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300 relative group">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 relative z-10">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Bot size={20} />
            </div>
            <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">QA Copilot</h3>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">{t('forms.strat_assistant')}</p>
            </div>
        </div>
        <button 
            onClick={clearHistory}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
            title="Limpiar chat"
        >
            <History size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin relative z-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Sparkles size={16} />
              </div>
            )}
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-200 dark:border-slate-700'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none animate-pulse text-slate-400 text-xs italic">
                El asistente está pensando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3 relative z-10">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('forms.copilot_placeholder')}
          className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
      
      {/* Subtle Background Icon */}
      <Bot className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 opacity-50 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default QACopilot;
