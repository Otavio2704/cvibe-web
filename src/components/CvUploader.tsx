import React, { useState, useEffect } from 'react';
import { cv as cvApi } from '../services/api';
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  PlusCircle, 
  FileCheck 
} from 'lucide-react';

interface CvUploaderProps {
  selectedCvId: string | null;
  onSelectCv: (cv: any) => void;
}

export default function CvUploader({ selectedCvId, onSelectCv }: CvUploaderProps) {
  const [cvList, setCvList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Fetch CV list on mount
  const loadCvs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cvApi.list();
      setCvList(data || []);
      
      // Auto-select the first CV if none is selected and we have CVs
      if (data && data.length > 0 && !selectedCvId) {
        onSelectCv(data[0]);
      }
    } catch (err) {
      console.error("Error loading CVs:", err);
      setError("Não foi possível carregar os currículos salvos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCvs();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'docx') {
      setError("Por favor, envie apenas arquivos nos formatos PDF ou DOCX.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("O arquivo excede o limite de tamanho de 5MB.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadSuccess(false);

      const formData = new FormData();
      formData.append('file', file);

      const newCv = await cvApi.upload(formData);
      
      setUploadSuccess(true);
      
      // Reload CV list and select the newly uploaded CV
      await loadCvs();
      onSelectCv(newCv);
      
      // Clear success alert after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error("Error uploading CV:", err);
      setError("Ocorreu um erro ao enviar o arquivo do currículo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Delete CV
  const handleDeleteCv = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop selection trigger
    if (!confirm("Tem certeza que deseja excluir este currículo? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      setError(null);
      await cvApi.remove(id);
      
      // Update list
      const updatedList = cvList.filter(item => item.id !== id);
      setCvList(updatedList);
      
      // If we deleted the currently selected CV, select another one or reset
      if (selectedCvId === id) {
        if (updatedList.length > 0) {
          onSelectCv(updatedList[0]);
        } else {
          onSelectCv(null);
        }
      }
    } catch (err) {
      console.error("Error deleting CV:", err);
      setError("Não foi possível excluir o currículo selecionado.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          1. Escolha ou Envie seu Currículo
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          O Gupify utilizará as informações do seu currículo para contextualizar e mapear sua experiência de acordo com a vaga.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Currículo enviado e processado com sucesso!</span>
        </div>
      )}

      {/* Grid of existing CVs */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Currículos Salvos nesta Sessão ({cvList.length})
        </label>

        {loading ? (
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Carregando currículos...</span>
          </div>
        ) : cvList.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
            Nenhum currículo enviado nesta sessão. Faça o upload abaixo para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cvList.map((cv) => {
              const isSelected = selectedCvId === cv.id;
              return (
                <div
                  key={cv.id}
                  onClick={() => onSelectCv(cv)}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate" title={cv.name}>
                        {cv.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cv.uploadedAt ? `Enviado em ${new Date(cv.uploadedAt).toLocaleDateString('pt-BR')}` : 'Salvo na Sessão'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteCv(e, cv.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 shrink-0 transition-colors"
                    title="Excluir currículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="relative" onDragEnter={handleDrag}>
        <input
          type="file"
          id="cv-file-upload"
          className="hidden"
          accept=".pdf,.docx"
          onChange={onFileInputChange}
          disabled={uploading}
        />
        
        <label
          htmlFor="cv-file-upload"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
            dragActive 
              ? 'border-indigo-600 bg-indigo-50/50' 
              : 'border-gray-200 hover:border-indigo-500/60 bg-gray-50/30 hover:bg-indigo-50/10'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center py-2 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
              <span className="text-sm font-medium text-gray-700">Processando e extraindo dados do currículo...</span>
              <span className="text-xs text-gray-400 mt-1">Isso leva apenas alguns instantes</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Clique para enviar ou arraste o arquivo aqui
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Suporta formatos PDF e DOCX (Tamanho máx: 5MB)
              </p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Enviar Novo Arquivo
              </span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
