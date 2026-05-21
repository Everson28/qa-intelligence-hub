import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FileText, Upload, Loader2, CheckCircle, FolderOpen, FileCheck, Clock, FileUp } from 'lucide-react';

import { API_BASE } from '../../config';

const DataMigrationForm = ({ onUploadSuccess, loading: parentLoading, setLoading }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Polling for job status
  useEffect(() => {
    let interval;
    if (activeJobId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/jobs/${activeJobId}`);
          setJobStatus(res.data);
          if (res.data.status === 'completed') {
            clearInterval(interval);
            setActiveJobId(null);
            const result = JSON.parse(res.data.result);
            onUploadSuccess({ 
              records_count: result.records_count || result.records, 
              pdf_path: result.pdf_path || result.pdf,
              xlsx_path: result.xlsx_path,
              csv_path: result.csv_path,
              transformed_path: result.transformed,
              insights: result.insights
            });
            toast.success(t('forms.migration_complete') || 'Migration completed successfully');
            setLoading(false);
          }
 else if (res.data.status === 'failed') {
            clearInterval(interval);
            setActiveJobId(null);
            toast.error('Error en la migración: ' + res.data.error);
            setLoading(false);
          }
        } catch (err) {
          console.error("Error polling job:", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeJobId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls', 'mdb', 'accdb'].includes(ext)) {
        setFile(droppedFile);
      } else {
        toast.error("Formato no soportado. Use CSV o Excel.");
      }
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No hay archivo seleccionado");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/migrate-data`, formData);
      setActiveJobId(response.data.job_id);
      setFile(null);
      toast.success('Tarea iniciada en segundo plano');
    } catch (error) {
      console.error("Migration: Error en la subida:", error);
      const errorMsg = error.response?.data?.detail || error.message;
      toast.error("Error al iniciar migración: " + errorMsg);
      setLoading(false);
    }
  };

  if (activeJobId || (jobStatus && jobStatus.status === 'processing')) {
    return (
        <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 gap-6 animate-pulse relative overflow-hidden group">
            <div className="relative w-24 h-24 z-10">
                <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/20 rounded-full"></div>
                <div 
                    className="absolute inset-0 border-4 border-blue-500 rounded-full transition-all duration-500"
                    style={{ clipPath: `inset(${100 - (jobStatus?.progress || 0)}% 0 0 0)` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-black">
                    {jobStatus?.progress || 0}%
                </div>
            </div>
            <div className="text-center relative z-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Procesando Migración</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Estamos modernizando tus datos y generando el reporte PDF en segundo plano...</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full relative z-10">
                <Clock size={14} className="animate-spin" /> {jobStatus?.status || 'Iniciando'}
            </div>
            <FileUp className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 transition-transform duration-500" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative overflow-hidden group">
      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 relative z-10">
        <div className="flex items-center gap-3 text-blue-800 dark:text-blue-300 font-bold mb-2">
          <FileText size={18} /> {t('forms.legacy_module')}
        </div>
        <p className="text-blue-600 dark:text-blue-400 text-sm leading-relaxed">
          {t('forms.migration_desc')}
        </p>
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px' }}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.mdb,.accdb"
        />
        
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all group ${
            file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm' : 
            (isDragging ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400')
          }`}
        >
          {file ? <FileCheck className="mb-4 text-emerald-600" size={48} /> : <Upload className={`mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-500'}`} size={48} />}
          
          <p className={`font-medium mb-4 text-center ${file ? 'text-emerald-700' : (isDragging ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400')}`}>
            {file ? file.name : (isDragging ? "Suelta el archivo aquí" : t('forms.select_file'))}
          </p>
          
          <button 
            type="button"
            onClick={handleButtonClick}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-sm mb-2 ${
              file ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <FolderOpen size={18} />
            {file ? "Cambiar archivo" : "Seleccionar archivo"}
          </button>
          
          {!file && !isDragging && <p className="text-slate-400 text-xs mt-2 italic">También puedes arrastrar y soltar archivos aquí</p>}
        </div>

        <button 
          onClick={handleUpload}
          disabled={parentLoading || !file}
          className={`btn-primary w-full flex items-center justify-center gap-2 py-4 transition-all ${file ? 'scale-105 shadow-xl shadow-blue-500/20' : ''}`}
        >
          {parentLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
          {t('forms.start_migration')}
        </button>
      </div>

      {/* Background Icon */}
      <FileUp className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default DataMigrationForm;
