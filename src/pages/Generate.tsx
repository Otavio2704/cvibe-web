import { useState, useMemo, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { generate as generateApi, reports as reportsApi } from '../services/api';
import { computeAtsScore } from '../utils/report';
import { classifyError } from '../utils/errors';
import type { CVibeError } from '../utils/errors';
import { ensureNotificationPermission, notifyIfInBackground } from '../utils/notifications';
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
  ArrowLeft,
} from 'lucide-react';

// ─── Overlay de geração ───────────────────────────────────────────────────────
//
// Com o streaming (SSE), o overlay deixa de ser só uma animação de espera: o
// resumo vai aparecendo em tempo real conforme a IA escreve. Isso elimina a
// sensação de "resposta que nunca chega" nos primeiros segundos — que era
// exatamente o sintoma relatado quando a geração levava minutos.

const FLOATING_KEYWORDS = [
  'Gestão de Projetos', 'Excel Avançado', 'Power BI', 'Atendimento', 'Vendas',
  'CRM', 'Comunicação', 'Liderança', 'Indicadores', 'Processos', 'Negociação',
  'Marketing Digital', 'Logística', 'Financeiro', 'People Analytics', 'Figma',
  'Pesquisa com Usuários', 'SQL', 'Agile', 'Compliance', 'Planejamento',
  'Análise de Dados', 'Sucesso do Cliente', 'Operações',
];

function GeneratingOverlay({ liveText, onCancel }: { liveText: string; onCancel: () => void }) {
  const [visibleWords, setVisibleWords] = useState<
    { id: number; word: string; x: number; y: number; size: number }[]
  >([]);
  const [dots, setDots] = useState('');
  const counterRef = useRef(0);
  const textoRef = useRef<HTMLDivElement | null>(null);

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

  // Mantém o texto mais recente sempre visível (acompanha a "digitação" da IA)
  useEffect(() => {
    const el = textoRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [liveText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/90 backdrop-blur-sm px-4">
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

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg px-8 py-10 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 shrink-0">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>

        <h2 className="text-lg font-black text-slate-900 mb-1">
          {liveText ? 'Escrevendo seu resumo' : 'Analisando seu currículo'}{dots}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {liveText ? (
            <>
              A IA está conectando suas experiências aos requisitos da vaga. Você pode acompanhar
              o texto sendo escrito abaixo.
            </>
          ) : (
            <>
              A IA está extraindo as{' '}
              <span className="text-indigo-600 font-semibold">
                competências, termos e requisitos de maior impacto
              </span>{' '}
              para os algoritmos de triagem das plataformas de recrutamento.
            </>
          )}
        </p>

        {liveText ? (
          <div
            ref={textoRef}
            className="w-full max-h-64 overflow-y-auto text-left text-sm leading-relaxed text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 whitespace-pre-wrap"
          >
            {liveText}
            <span className="inline-block w-[2px] h-4 bg-indigo-500 align-middle ml-0.5 animate-pulse" />
          </div>
        ) : (
          <>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-indigo-500 rounded-full animate-indeterminate" />
            </div>
            <p className="text-[11px] text-slate-400 mb-5">Conectando à IA…</p>
          </>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
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
  const [liveText, setLiveText] = useState('');
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<CVibeError | null>(null);
  const [saveError, setSaveError] = useState<CVibeError | null>(null);
  const [success, setSuccess] = useState(false);

  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [pendingResult, setPendingResult] = useState<any | null>(null);
  const [editedSummary, setEditedSummary] = useState('');

  const cancelledRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

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

  // Se a geração terminou com a aba em segundo plano, o usuário recebe a
  // notificação; quando ele volta para a aba, levamos direto ao resultado.
  useEffect(() => {
    if (!pendingResult || document.hidden) return;

    const id = pendingResult.reportId || pendingResult.id;
    const autoFechar = window.setTimeout(() => setPendingResult(null), 6000);
    navigate(`/reports/${id}`);

    return () => window.clearTimeout(autoFechar);
  }, [pendingResult, navigate]);

  const runGeneration = () => {
    const cv = selectedCv;
    if (!cv) return;

    cancelledRef.current = false;
    setError(null);
    setSaveError(null);
    setGeneratedResult(null);
    setPendingResult(null);
    setLiveText('');

    const controller = new AbortController();
    abortRef.current = controller;

    // Rede de segurança local: se o stream ficar mudo por muito tempo (ou o
    // backend publicado não tiver o endpoint), o front não espera para sempre.
    const limite = window.setTimeout(() => controller.abort(), 180_000);

    const aoTerminar = (response: any) => {
      window.clearTimeout(limite);
      if (cancelledRef.current) return;

      setLiveText('');
      setGenerating(false);
      abortRef.current = null;

      if (!response?.summary) {
        setError(classifyError(new Error('Resposta inválida da geração.'), 'generate'));
        return;
      }

      if (document.hidden) {
        // Usuário saiu da aba: guarda o resultado e mostra o atalho quando voltar
        setPendingResult(response);
      } else {
        setGeneratedResult(response);
        setEditedSummary(response.summary);
      }

      notifyIfInBackground({
        title: 'Currículo otimizado!',
        body: jobTitle.trim()
          ? `O resumo para "${jobTitle.trim()}" já está pronto. Volte pra conferir e salvar.`
          : 'Seu resumo já está pronto. Volte pra conferir e salvar.',
      });
    };

    const aoFalhar = (err: unknown) => {
      window.clearTimeout(limite);
      if (cancelledRef.current) return;

      const classified = classifyError(err, 'generate');
      setLiveText('');
      setGenerating(false);
      abortRef.current = null;
      setError(classified);
      notifyIfInBackground({
        title: 'Erro ao gerar currículo',
        body: classified.message,
      });
    };

    // flushSync: pinta o overlay ANTES do primeiro await. Sem isso, o usuário
    // fica alguns instantes olhando o botão travado enquanto o stream conecta.
    flushSync(() => setGenerating(true));

    generateApi
      .stream(
        {
          cvId: cv.id,
          jobTitle: jobTitle.trim(),
          jobContent: jobContent.trim(),
          cvName: cv.name,
        },
        {
          signal: controller.signal,
          onSummaryDelta: (delta) => setLiveText((prev) => prev + delta),
          onDone: (resultado) => aoTerminar(resultado),
          onError: (mensagem) => aoFalhar(new Error(mensagem)),
        },
      )
      .finally(() => window.clearTimeout(limite));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pede a permissão de notificação aqui (dentro do clique do usuário,
    // antes de qualquer await) pra não ser bloqueada pelo navegador.
    ensureNotificationPermission();

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

    runGeneration();
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
    setLiveText('');
    setError(null);
  };

  const handleRetry = async () => {
    setRetrying(true);
    runGeneration();
    setRetrying(false);
  };

  const handleSave = async () => {
    if (!generatedResult) return;
    try {
      setSaving(true);
      setSaveError(null);
      const reportId = generatedResult.reportId || generatedResult.id;
      await reportsApi.update(reportId, { summary: editedSummary });
      setSuccess(true);
      setTimeout(() => navigate(`/reports/${reportId}`), 900);
    } catch (err) {
      setSaveError(classifyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  // ── Overlay (com o texto chegando em tempo real) ──
  if (generating) return <GeneratingOverlay liveText={liveText} onCancel={handleCancel} />;

  // ── Resultado gerado enquanto o usuário estava em outra aba ──
  if (pendingResult) {
    const id = pendingResult.reportId || pendingResult.id;
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 animate-fade-in">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <h2 className="text-sm font-bold">Seu resumo ficou pronto!</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            A geração terminou enquanto você estava em outra aba. Abra o resultado para conferir,
            editar e salvar.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/reports/${id}`)}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-slate-950 hover:bg-slate-900 active:scale-[0.99] transition-all"
            >
              Ver resultado
            </button>
            <button
              type="button"
              onClick={() => setPendingResult(null)}
              className="px-4 py-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Resultado ──
  if (generatedResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setGeneratedResult(null); setEditedSummary(''); setSaveError(null); }}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 active:scale-95 transition-all"
            title="Voltar ao formulário"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="flex-1">
            <h1 className="font-serif-editorial text-xl font-semibold text-slate-950 tracking-tight">Resumo gerado</h1>
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

        {saveError && (
          <div className="mb-5">
            <ErrorBanner error={saveError} onRetry={handleSave} onDismiss={() => setSaveError(null)} />
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
                      setSaveError(null);
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
      <div className="mb-8 pb-6 border-b border-slate-200">
        <span className="text-[11px] uppercase font-bold tracking-[0.18em] text-indigo-700 block mb-2">Otimizador</span>
        <h1 className="font-serif-editorial text-2xl font-semibold text-slate-950 tracking-tight">Otimizar currículo</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Informe o currículo e a vaga desejada. A IA ajusta seu resumo para aumentar a aderência aos algoritmos de triagem das plataformas de recrutamento.
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

        <div className="card bg-white border border-slate-100 rounded-lg p-6">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 mb-4">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
              2
            </span>
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Dados da vaga
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
                placeholder="Cole aqui as responsabilidades, requisitos, habilidades desejadas, benefícios e a descrição completa da vaga anunciada..."
                rows={6}
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all resize-none placeholder:text-slate-300 leading-relaxed"
                required
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-400">
                  Quanto mais completo, mais precisa é a extração de palavras-chave.
                </p>
                <span
                  className={`text-[10px] font-bold shrink-0 ml-2 ${
                    jobContent.trim().length >= 50 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {jobContent.trim().length}/50
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="w-full py-3.5 rounded-lg text-sm font-black text-white bg-slate-950 hover:bg-slate-900 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Otimizar com IA
        </button>
      </form>
    </div>
  );
}
