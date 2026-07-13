import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reports as reportsApi } from '../services/api';
import { classifyError } from '../utils/errors';
import ErrorBanner from '../components/ErrorBanner';
import type { CVibeError } from '../utils/errors';
import SummaryResult from '../components/SummaryResult';
import KeywordBadges from '../components/KeywordBadges';
import QualityChecklist from '../components/QualityChecklist';
import ScoreRing from '../components/ScoreRing';
import { computeAtsScore, formatReportDate, getVersionDate } from '../utils/report';
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  Save,
  Download,
  Clock,
  Loader2,
  Trash2,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';

// 🔒 Sanitização contra XSS no document.write
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<CVibeError | null>(null);
  const [editedSummary, setEditedSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<CVibeError | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<CVibeError | null>(null);
  const [deleteError, setDeleteError] = useState<CVibeError | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const liveScore = useMemo(
    () => computeAtsScore(editedSummary, report?.jobContent || ''),
    [editedSummary, report],
  );

  const loadReport = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setLoadError(null);
      const data = await reportsApi.get(id);
      if (data) {
        setReport(data);
        setEditedSummary(data.summary || '');
      } else {
        throw new Error('not found');
      }
    } catch (err) {
      setLoadError(classifyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [id]);

  // Limpa erro de offline automaticamente ao reconectar
  useEffect(() => {
    if (loadError?.kind !== 'offline') return;
    const handler = () => loadReport();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [loadError]);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setSaveError(null);
      const updated = await reportsApi.update(id, { summary: editedSummary });
      setReport(updated);
      setEditedSummary(updated.summary);
      showSuccess('Alterações salvas!');
    } catch (err) {
      setSaveError(classifyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    if (!confirm('Gerar uma nova versão com IA? A atual será arquivada no histórico.')) return;
    try {
      setRegenerating(true);
      setRegenError(null);
      const regenerated = await reportsApi.regenerate(id);
      setReport(regenerated);
      setEditedSummary(regenerated.summary);
      showSuccess('Novo resumo gerado!');
    } catch (err) {
      setRegenError(classifyError(err, 'generate'));
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Excluir este relatório definitivamente?')) return;
    try {
      setDeleteError(null);
      await reportsApi.remove(id);
      navigate('/dashboard');
    } catch (err) {
      setDeleteError(classifyError(err, 'delete'));
    }
  };

  const handleRestoreVersion = (versionSummary: string) => {
    if (confirm('Carregar esta versão no editor?')) {
      setEditedSummary(versionSummary);
      showSuccess('Versão carregada. Clique em "Salvar" para fixá-la.');
    }
  };

  const handleExportPDF = () => {
    if (!report) return;
    const w = window.open('', '_blank');
    if (!w) {
      alert('Permita pop-ups para exportar o PDF.');
      return;
    }

    const kws = (report.keywords || [])
      .map((k: string) => `<li>#${escapeHtml(k)}</li>`)
      .join('');

    w.document.write(`
      <html><head><title>CVibe — ${escapeHtml(report.jobTitle)}</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;color:#0f172a;margin:40px;line-height:1.6}
        .logo{font-size:22px;font-weight:900;color:#4f46e5}
        .sub{font-size:11px;color:#64748b;margin-top:4px;border-bottom:2px solid #4f46e5;padding-bottom:16px;margin-bottom:28px}
        h2{font-size:20px;font-weight:800;margin:0 0 12px}
        .meta{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;font-size:13px;color:#475569;margin-bottom:24px}
        .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#4f46e5;margin-top:28px;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
        .box{background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:20px;font-size:14px;white-space:pre-wrap;line-height:1.7}
        ul{list-style:none;padding:0;display:flex;gap:16px;font-size:14px;font-weight:600;color:#4f46e5}
        .footer{margin-top:56px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;padding-top:14px}
      </style></head><body>
      <div class="logo">CVibe</div>
      <div class="sub">Otimizador de Perfil para Processos Seletivos</div>
      <h2>${escapeHtml(report.jobTitle)}</h2>
      <div class="meta">
        <strong>Currículo:</strong> ${escapeHtml(report.cvName || '—')}<br>
        <strong>Gerado em:</strong> ${escapeHtml(formatReportDate(report.createdAt))}<br>
        <strong>Tamanho:</strong> ${editedSummary.length} caracteres
      </div>
      <div class="label">Resumo otimizado — cole no campo "Sobre você" da plataforma de vagas</div>
      <div class="box">${escapeHtml(editedSummary).replace(/\n/g, '<br>')}</div>
      <div class="label">Palavras-chave de alto impacto</div>
      <ul>${kws}</ul>
      <div class="footer">Gerado pelo CVibe · Uso pessoal e educacional</div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  // ── Estados de carregamento / erro total ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Carregando relatório...</p>
      </div>
    );
  }

  if (loadError || !report) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 space-y-4">
        <ErrorBanner
          error={loadError ?? { kind: 'not_found', message: 'Relatório não encontrado.' }}
          onRetry={loadError?.kind !== 'not_found' ? loadReport : undefined}
        />
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 btn-primary text-white font-semibold rounded-xl text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  const isModified = editedSummary !== report.summary;
  const hasVersions = (report.versions?.length || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-5">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 pb-6 border-b border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
              {report.id}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3" />
              {formatReportDate(report.updatedAt || report.createdAt)}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate" title={report.jobTitle}>
            {report.jobTitle}
          </h1>
          <p className="text-xs text-slate-500">
            Currículo: <span className="font-semibold text-slate-700">{report.cvName || 'da sessão'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ScoreRing score={liveScore} size={64} stroke={6} />
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 bg-white hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-red-100 text-red-600 bg-red-50/50 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Feedbacks de ação */}
      {actionSuccess && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Erros específicos por ação — cada um com seu contexto */}
      {saveError && (
        <div className="mb-4">
          <ErrorBanner
            error={saveError}
            onRetry={handleSave}
            onDismiss={() => setSaveError(null)}
          />
        </div>
      )}
      {regenError && (
        <div className="mb-4">
          <ErrorBanner
            error={regenError}
            onRetry={handleRegenerate}
            onDismiss={() => setRegenError(null)}
          />
        </div>
      )}
      {deleteError && (
        <div className="mb-4">
          <ErrorBanner
            error={deleteError}
            onDismiss={() => setDeleteError(null)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <SummaryResult
            summary={editedSummary}
            onChange={setEditedSummary}
            readOnly={saving || regenerating}
          />
          <KeywordBadges keywords={report.keywords} />
          <QualityChecklist summary={editedSummary} jobContent={report.jobContent || ''} />
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 self-start">
          <div className="card bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Controles</p>
            <div className="space-y-2">
              <button
                onClick={handleSave}
                disabled={!isModified || saving || regenerating}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isModified
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100 active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Salvar alterações
              </button>

              <button
                onClick={handleRegenerate}
                disabled={saving || regenerating}
                className="btn-primary w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {regenerating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5" />
                }
                {regenerating ? 'Regenerando...' : 'Regenerar com IA'}
              </button>
            </div>

            {isModified && (
              <p className="text-[10px] text-amber-600 font-semibold mt-3 text-center">
                ⚠ Edições não salvas
              </p>
            )}
          </div>

          <div className="card bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Histórico de versões
            </p>
            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
              Clique em uma versão para carregá-la no editor.
            </p>

            {!hasVersions ? (
              <p className="text-xs text-slate-400 italic text-center py-3 bg-slate-50 rounded-lg">
                Apenas a versão inicial disponível.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {report.versions.map((ver: any, idx: number) => {
                  const isCurrent = editedSummary === ver.summary;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleRestoreVersion(ver.summary)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all hover:bg-indigo-50/30 ${
                        isCurrent ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1 gap-2">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          v{ver.version ?? idx + 1}
                        </span>
                        <span className="text-slate-400 text-right">
                          {formatReportDate(getVersionDate(ver))}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{ver.summary}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" />
              Dados da vaga
            </p>
            <div className="space-y-3">
              <div className="bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Título</p>
                <p className="text-[11px] font-semibold text-slate-700 break-words">
                  {report.jobTitle || 'Título não informado'}
                </p>
              </div>
              <div className="bg-slate-50 px-2.5 py-2.5 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Descrição enviada</p>
                <div className="max-h-44 overflow-y-auto text-[11px] text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {report.jobContent || 'Nenhuma descrição registrada.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
