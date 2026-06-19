import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generate as generateApi, reports as reportsApi } from '../services/api';
import CvUploader from '../components/CvUploader';
import SummaryResult from '../components/SummaryResult';
import KeywordBadges from '../components/KeywordBadges';
import QualityChecklist from '../components/QualityChecklist';
import { 
  Sparkles, 
  Briefcase, 
  Wand2, 
  Save, 
  AlertCircle,
  Loader2,
  CheckCircle,
  Brain
} from 'lucide-react';

export default function Generate() {
  const navigate = useNavigate();
  
  // Input states
  const [selectedCv, setSelectedCv] = useState<any | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobContent, setJobContent] = useState('');
  
  // UI States
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Result states
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [editedSummary, setEditedSummary] = useState('');

  // Handle generation action
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCv) {
      setError("Por favor, selecione ou envie um currículo antes de prosseguir.");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Por favor, insira o título da vaga.");
      return;
    }
    if (!jobContent.trim() || jobContent.trim().length < 50) {
      setError("Por favor, insira os detalhes/descrição da vaga (mínimo de 50 caracteres para uma boa extração).");
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setGeneratedResult(null);
      
      const response = await generateApi.run({
        cvId: selectedCv.id,
        jobTitle: jobTitle.trim(),
        jobContent: jobContent.trim()
      });

      if (response && response.summary) {
        setGeneratedResult(response);
        setEditedSummary(response.summary);
      } else {
        throw new Error("Resposta inválida da geração");
      }
    } catch (err) {
      console.error("Error generating summary:", err);
      setError("Ocorreu um erro ao gerar o resumo. Verifique sua conexão e tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  // Handle saving the report
  const handleSaveReport = async () => {
    if (!generatedResult) return;

    try {
      setSaving(true);
      setError(null);

      const savedReport = await reportsApi.create({
        cvId: generatedResult.cvId,
        cvName: generatedResult.cvName || selectedCv.name,
        jobTitle: jobTitle.trim(),
        jobContent: jobContent.trim(),
        summary: editedSummary, // Use the potentially edited summary
        keywords: generatedResult.keywords
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/reports/${savedReport.id}`);
      }, 1000);
    } catch (err) {
      console.error("Error saving report:", err);
      setError("Ocorreu um erro ao salvar o relatório. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-indigo-600" />
          Otimizar Currículo para Vaga
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Forneça seu currículo de base e a descrição da vaga desejada. Nossa inteligência ajustará seu resumo para atingir score máximo no algoritmo da Gupy.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>Relatório salvo com sucesso! Redirecionando para a página de detalhes...</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        
        {/* Step 1: CV Selection (Uses CvUploader) */}
        <CvUploader 
          selectedCvId={selectedCv ? selectedCv.id : null} 
          onSelectCv={setSelectedCv} 
        />

        {/* Step 2: Job details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            2. Insira os Dados da Vaga Alvo
          </h2>

          <div className="space-y-4">
            {/* Job Title Input */}
            <div>
              <label htmlFor="job-title" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Título da Vaga
              </label>
              <div className="relative rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <input
                  type="text"
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Desenvolvedor Front-end React Pleno"
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-800 outline-none"
                  required
                />
              </div>
            </div>

            {/* Job Content Textarea */}
            <div>
              <label htmlFor="job-content" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Requisitos e Descrição da Vaga (Cole o texto completo)
              </label>
              <div className="relative rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <textarea
                  id="job-content"
                  value={jobContent}
                  onChange={(e) => setJobContent(e.target.value)}
                  placeholder="Cole aqui os requisitos técnicos, diferenciais, atribuições e descrição da vaga fornecidos no anúncio da Gupy..."
                  rows={6}
                  className="w-full bg-transparent p-3 text-sm text-gray-800 outline-none resize-y leading-relaxed"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                Dica: Quanto mais completa a descrição colada, melhor a IA conseguirá capturar as palavras-chave necessárias e estruturar o resumo profissional ideal.
              </p>
            </div>
          </div>
        </div>

        {/* Generate Trigger Button */}
        {!generatedResult && (
          <button
            type="submit"
            disabled={generating}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-85 text-white font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analisando currículo e mapeando requisitos da vaga...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Otimizar Resumo Profissional com IA</span>
              </>
            )}
          </button>
        )}
      </form>

      {/* Loading overlay/thinking steps when generating */}
      {generating && (
        <div className="mt-8 p-6 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-4 animate-pulse">
          <Brain className="w-10 h-10 text-indigo-600 mx-auto animate-bounce" />
          <h3 className="text-sm font-bold text-indigo-950">Engrenagem Inteligente Gupify</h3>
          <div className="max-w-xs mx-auto space-y-2 text-xs text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Extraindo perfil técnico do seu currículo...</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Analisando palavras-chave de maior peso da vaga...</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Formatando resumo no padrão exato da Gupy...</span>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED RESULTS */}
      {generatedResult && !generating && (
        <div className="mt-8 space-y-6 animate-fade-in">
          
          <div className="p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">Resumo Gerado com Sucesso!</h3>
                <p className="text-xs text-emerald-700">Analise os resultados abaixo antes de salvar o seu relatório.</p>
              </div>
            </div>
          </div>

          {/* Real-time editable summary result */}
          <SummaryResult 
            summary={editedSummary} 
            onChange={setEditedSummary} 
            readOnly={false}
          />

          {/* Top 3 extracted keywords */}
          <KeywordBadges keywords={generatedResult.keywords} />

          {/* Automatic 4-point quality checks (updates dynamically as summary changes!) */}
          <QualityChecklist 
            summary={editedSummary} 
            jobContent={jobContent} 
          />

          {/* Save Action Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Gostou do resultado?</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Salve o relatório no seu histórico. Você poderá editá-lo, exportá-lo em PDF ou até regenerá-lo depois.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Deseja mesmo refazer a geração? As edições manuais serão perdidas.")) {
                    setGeneratedResult(null);
                    setEditedSummary('');
                  }
                }}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Refazer Geração
              </button>
              
              <button
                type="button"
                onClick={handleSaveReport}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-80"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Salvar Relatório</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
