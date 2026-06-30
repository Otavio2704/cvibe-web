import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generate as generateApi, reports as reportsApi } from '../services/api';
import { computeAtsScore } from '../utils/report';
import { classifyError } from '../utils/errors';
import type { GupifyError } from '../utils/errors';
import ErrorBanner from '../components/ErrorBanner';
import CvUploader from '../components/CvUploader';
import SummaryResult from '../components/SummaryResult';
import KeywordBadges from '../components/KeywordBadges';
import QualityChecklist from '../components/QualityChecklist';
import ScoreRing from '../components/ScoreRing';
import {
  Sparkles,
  Briefcase,
  Loader2,
  CheckCircle,
  Save,
  RotateCcw,
} from 'lucide-react';

// ─── Overlay de geração ───────────────────────────────────────────────────────

const FLOATING_KEYWORDS = [
  'Gestão de Projetos', 'Excel Avançado', 'Power BI', 'Atendimento', 'Vendas',
  'CRM', 'Comunicação', 'Liderança', 'Indicadores', 'Processos', 'Negociação',
  'Marketing Digital', 'Logística', 'Financeiro', 'People Analytics', 'Figma',
  'Pesquisa com Usuários', 'SQL', 'Agile', 'Compliance', 'Planejamento',
  'Análise de Dados', 'Sucesso do Cliente', 'Operações',
];

function GeneratingOverlay({ onCancel }: { onCancel: () => void }) {
  const [visibleWords, setVisibleWords] = useState<
    { id: number; word: string; x: number; y: number; size: number }[]
  >([]);
  const [dots, setDots] = useState('');
  const counterRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const add = () => {
      const word = FLOATING_KEYWORDS[Math.floor(Math.random() * FLOATING_KEYWORDS.length)];
      const id = counterRef.current++;
      setVisibleWords((prev) => [
        ...prev.slice(-14),
        { id, word, x: 5 + Math.random() * 90, y: 5 + Math.random() * 90, size: Math.random() > 0.6 ? 13 : 11 },
      ]);
    };
    add();
    const id = setInterval(add, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/90 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {visibleWords.map((w) => (
          <span
            key={w.id}
            className="absolute font-semibold text-indigo-400/30 animate-float-word transition-all"
            style={{ left: `${w.x}%`, top: `${w.y}%`, fontSize: w.size, animationDuration: `${2.5 + Math.random() * 2}s` }}
          >
            {w.word}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-8 py-10 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>

        <h2 className="text-lg font-black text-slate-900 mb-1">Gerando resumo{dots}</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          A IA está analisando seu currículo e extraindo as{' '}
          <span className="text-indigo-600 font-semibold">
            competências, termos e requisitos de maior impacto
          </span>{' '}
          para o algoritmo da Gupy.
        </p>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-indigo-500 rounded-full animate-indeterminate" />
        </div>

        <p className="text-[11px] text-slate-400 mb-5">Isso pode levar alguns segundos.</p>

        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Generate() {
  const navigate = useNavigate();

  const [selectedCv, setSelectedCv] = useState<any | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobContent, setJobContent] = useState('');

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<GupifyError | null>(null);
  const [success, setSuccess] = useState(false);

  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [editedSummary, setEditedSummary] = useState('');

  const cancelledRef = useRef(false);

  const liveScore = useMemo(
    () => computeAtsScore(editedSummary, jobContent),
    [editedSummary, jobContent],
  );

  // Limpa erro de offline automaticamente ao reconectar
  useEffect(() => {
    if (error?.kind !== 'offline') return;
    const handler = () => setError(null);
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [error]);

  const runGeneration = async () => {
    cancelledRef.current = false;
    setGenerating(true);
    setError(null);
    setGeneratedResult(null);

    try {
      const response = await generateApi.run({
        cvId: selectedCv.id,
        jobTitle: jobTitle.trim(),
        jobContent: jobContent.trim(),
        cvName: selectedCv.name,
      });

      if (cancelledRef.current) return;

      if (response?.summary) {
        setGeneratedResult(response);
        setEditedSummary(response.summary);
      } else {
        throw new Error('Resposta inválida da geração.');
      }
    } catch (err) {
      if (cancelledRef.current) return;
      setError(classifyError(err, 'generate'));
    } finally {
      if (!cancelledRef.current) setGenerating(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCv) {
      setError({ kind: 'generic', message: 'Selecione ou envie um currículo antes de continuar.' });
      return;
    }
    if (!jobTitle.trim()) {
      setError({ kind: 'generic', message: 'Informe o título da vaga.' });
      return;
    }
    if (!jobContent.trim() || jobContent.trim().length < 50) {
      setError({ kind: 'generic', message: 'Cole a descrição completa da vaga (mínimo de 50 caracteres).' });
      return;
    }

    await runGeneration();
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    setGenerating(false);
    setError(null);
  };

  const handleRetry = async () => {
    setRetrying(true);
    await runGeneration();
    setRetrying(false);
  };

  const handleSave = async () => {
    if (!generatedResult) return;
    try {
      setSaving(true);
      setError(null);
      const reportId = generatedResult.reportId || generatedResult.id;
      await reportsApi.update(reportId, { summary: editedSummary });
      setSuccess(true);
      setTimeout(() => navigate(`/reports/${reportId}`), 900);
    } catch (err) {
      setError(classifyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  // ── Overlay ──
  if (generating) return <GeneratingOverlay onCancel={handleCancel} />;

  // ── Resultado ──
  if (generatedResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setGeneratedResult(null); setEditedSummary(''); setError(null); }}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            title="Voltar ao formulário"
          >
            ‹
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Resumo gerado</h1>
            <p className="text-xs text-slate-500">Edite, confira o score e salve o relatório.</p>
          </div>
          <ScoreRing score={liveScore} size={64} stroke={6} />
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Relatório salvo! Redirecionando...
          </div>
        )}

        {error && (
          <div className="mb-5">
            <ErrorBanner error={error} onRetry={handleSave} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <SummaryResult summary={editedSummary} onChange={setEditedSummary} readOnly={false} />
            <KeywordBadges keywords={generatedResult.keywords} />
            <QualityChecklist summary={editedSummary} jobContent={jobContent} />
          </div>

          <div className="space-y-4">
            <div className="card bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ações</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar relatório
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Refazer a geração? As edições manuais serão perdidas.')) {
                      setGeneratedResult(null);
                      setEditedSummary('');
                      setError(null);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Gerar novo
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                Após salvar, você pode editar, regenerar com IA e exportar em PDF na tela do relatório.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulário ──
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Otimizar currículo</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Informe o currículo e a vaga desejada. A IA ajusta seu resumo para aumentar a aderência ao algoritmo da Gupy.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner
            error={error}
            onRetry={
              selectedCv && jobTitle.trim() && jobContent.trim().length >= 50 && error.kind !== 'generic'
                ? handleRetry
                : undefined
            }
            retrying={retrying}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-5">
        <CvUploader selectedCvId={selectedCv?.id ?? null} onSelectCv={setSelectedCv} />

        <div className="card bg-white border border-slate-100 rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-slate-900 mb-4">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            2 · Dados da vaga
          </h2>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="job-title"
                className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
              >
                Título do cargo
              </label>
              <input
                type="text"
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Analista Administrativo Pleno"
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div>
              <label
                htmlFor="job-content"
                className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
              >
                Descrição e requisitos (cole o texto completo)
              </label>
              <textarea
                id="job-content"
                value={jobContent}
                onChange={(e) => setJobContent(e.target.value)}
                placeholder="Cole aqui as responsabilidades, requisitos, habilidades desejadas, benefícios e a descrição completa da vaga anunciada na Gupy..."
                rows={6}
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all resize-none placeholder:text-slate-300 leading-relaxed"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Quanto mais completo, mais precisa é a extração de palavras-chave.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="btn-primary w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Otimizar com IA
        </button>
      </form>
    </div>
  );
}
