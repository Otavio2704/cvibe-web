import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generate as generateApi, reports as reportsApi } from '../services/api';
import CvUploader from '../components/CvUploader';
import SummaryResult from '../components/SummaryResult';
import KeywordBadges from '../components/KeywordBadges';
import QualityChecklist from '../components/QualityChecklist';
import ScoreRing from '../components/ScoreRing';
import {
  Sparkles,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle,
  Save,
  RotateCcw,
} from 'lucide-react';

const FLOATING_KEYWORDS = [
  'React', 'TypeScript', 'Node.js', 'Spring Boot', 'Docker', 'AWS',
  'PostgreSQL', 'Git', 'API REST', 'Scrum', 'CI/CD', 'Kubernetes',
  'Java', 'Python', 'Tailwind', 'Clean Code', 'TDD', 'Microsserviços',
  'Redis', 'MongoDB', 'GraphQL', 'Next.js', 'Figma', 'Agile',
];

function GeneratingOverlay() {
  const [visibleWords, setVisibleWords] = useState<{ id: number; word: string; x: number; y: number; delay: number; size: number }[]>([]);
  const [dots, setDots] = useState('');
  const counterRef = useRef(0);

  // Anima os "..."
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Adiciona palavras flutuantes aleatoriamente
  useEffect(() => {
    const add = () => {
      const word = FLOATING_KEYWORDS[Math.floor(Math.random() * FLOATING_KEYWORDS.length)];
      const id   = counterRef.current++;
      setVisibleWords(prev => [
        ...prev.slice(-14), // máximo 15 palavras na tela
        {
          id,
          word,
          x: 5 + Math.random() * 90,   // % horizontal
          y: 5 + Math.random() * 90,   // % vertical
          delay: 0,
          size: Math.random() > 0.6 ? 13 : 11,
        },
      ]);
    };

    add();
    const id = setInterval(add, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/90 backdrop-blur-sm">

      {/* Palavras flutuantes no fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {visibleWords.map(w => (
          <span
            key={w.id}
            className="absolute font-semibold text-indigo-400/30 animate-float-word transition-all"
            style={{
              left: `${w.x}%`,
              top:  `${w.y}%`,
              fontSize: w.size,
              animationDuration: `${2.5 + Math.random() * 2}s`,
            }}
          >
            {w.word}
          </span>
        ))}
      </div>

      {/* Card central */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-8 py-10 bg-white rounded-2xl shadow-xl border border-slate-100">

        {/* Ícone animado */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>

        <h2 className="text-lg font-black text-slate-900 mb-1">
          Gerando resumo{dots}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          A IA está analisando seu currículo e extraindo as{' '}
          <span className="text-indigo-600 font-semibold">palavras-chave de maior impacto</span>{' '}
          para o algoritmo da Gupy.
        </p>

        {/* Barra indeterminada */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-indeterminate" />
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Isso pode levar alguns segundos.
        </p>
      </div>
    </div>
  );
}

/* Reutiliza a mesma lógica de score do QualityChecklist */
const CLICHES     = ['proativo','dedicado','fora da caixa','perfeccionista','apaixonado','motivado'];
const ACTION_VERBS = ['desenvolvi','implementei','criei','liderei','otimizei','gerenciei','estruturei','coordenei','construí'];

function computeScore(summary: string, jobContent: string): number {
  if (!summary || summary.length < 10) return 0;
  const norm = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ');
  const ns = norm(summary);
  const nj = norm(jobContent);
  let score = 0;

  if (summary.length >= 800 && summary.length <= 1400) score += 25;
  else if (summary.length >= 500) score += 12;

  if (ACTION_VERBS.some((v) => ns.includes(norm(v)))) score += 25;
  if (!CLICHES.some((c) => ns.includes(norm(c)))) score += 25;

  if (jobContent.length > 10) {
    const sw   = new Set(ns.split(/\s+/).filter((w) => w.length > 3));
    const hits = nj.split(/\s+/).filter((w) => w.length > 3 && sw.has(w)).length;
    if (hits >= 5) score += 25;
    else if (hits >= 2) score += 15;
  } else {
    score += 10;
  }

  return Math.min(score, 100);
}

const GENERATION_STEPS = [
  'Extraindo perfil técnico do currículo...',
  'Mapeando palavras-chave de maior peso da vaga...',
  'Calculando similaridade semântica (cosseno)...',
  'Formatando no padrão exato da Gupy...',
  'Validando score ATS e qualidade do texto...',
];

export default function Generate() {
  const navigate = useNavigate();

  // Inputs
  const [selectedCv,  setSelectedCv]  = useState<any | null>(null);
  const [jobTitle,    setJobTitle]    = useState('');
  const [jobContent,  setJobContent]  = useState('');

  // UI
  const [generating, setGenerating] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  // Results
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [editedSummary,   setEditedSummary]   = useState('');

  const liveScore = useMemo(
    () => computeScore(editedSummary, jobContent),
    [editedSummary, jobContent],
  );

  /* ── Generate ─────────────────────────────────────────────────────────── */

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCv) {
      setError('Selecione ou envie um currículo antes de continuar.');
      return;
    }
    if (!jobTitle.trim()) {
      setError('Informe o título da vaga.');
      return;
    }
    if (!jobContent.trim() || jobContent.trim().length < 50) {
      setError('Cole a descrição completa da vaga (mínimo de 50 caracteres).');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setGeneratedResult(null);

      const response = await generateApi.run({
        cvId:       selectedCv.id,
        jobTitle:   jobTitle.trim(),
        jobContent: jobContent.trim(),
      });

      if (response?.summary) {
        setGeneratedResult(response);
        setEditedSummary(response.summary);
      } else {
        throw new Error('Resposta inválida da geração.');
      }
    } catch {
      setError('Erro ao gerar o resumo. Verifique sua conexão e tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Save ─────────────────────────────────────────────────────────────── */

  const handleSave = async () => {
    if (!generatedResult) return;
    try {
      setSaving(true);
      setError(null);

      const saved = await reportsApi.create({
        cvId:       generatedResult.cvId,
        cvName:     generatedResult.cvName || selectedCv?.name,
        jobTitle:   jobTitle.trim(),
        jobContent: jobContent.trim(),
        summary:    editedSummary,
        keywords:   generatedResult.keywords,
        score:      liveScore,
      });

      setSuccess(true);
      setTimeout(() => navigate(`/reports/${saved.id}`), 900);
    } catch {
      setError('Erro ao salvar o relatório. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading overlay ──────────────────────────────────────────────────── */

  if (generating) return <GeneratingOverlay />;

  /* ── Results ──────────────────────────────────────────────────────────── */

  if (generatedResult && !generating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setGeneratedResult(null); setEditedSummary(''); }}
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

        {/* Success */}
        {success && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Relatório salvo! Redirecionando...
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: editor + keywords + checklist */}
          <div className="lg:col-span-2 space-y-4">
            <SummaryResult
              summary={editedSummary}
              onChange={setEditedSummary}
              readOnly={false}
            />
            <KeywordBadges keywords={generatedResult.keywords} />
            <QualityChecklist summary={editedSummary} jobContent={jobContent} />
          </div>

          {/* Right: actions */}
          <div className="space-y-4">
            <div className="card bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Ações
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar relatório
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Refazer a geração? As edições manuais serão perdidas.')) {
                      setGeneratedResult(null);
                      setEditedSummary('');
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

  /* ── Form ─────────────────────────────────────────────────────────────── */

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Otimizar currículo</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Informe o currículo e a vaga desejada. A IA ajusta seu resumo para score máximo no algoritmo da Gupy.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-5">

        {/* Step 1: CV */}
        <CvUploader
          selectedCvId={selectedCv?.id ?? null}
          onSelectCv={setSelectedCv}
        />

        {/* Step 2: Job */}
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
                placeholder="Ex: Desenvolvedor React Pleno"
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
                placeholder="Cole aqui os requisitos técnicos, atribuições e descrição completa da vaga anunciada na Gupy..."
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

        {/* CTA */}
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
