import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reports as reportsApi } from '../services/api';
import SummaryResult from '../components/SummaryResult';
import KeywordBadges from '../components/KeywordBadges';
import QualityChecklist from '../components/QualityChecklist';
import ScoreRing from '../components/ScoreRing';
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  Save,
  Download,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';

const CLICHES      = ['proativo','dedicado','fora da caixa','perfeccionista','apaixonado','motivado'];
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

export default function Report() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report,        setReport]        = useState<any | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [editedSummary, setEditedSummary] = useState('');
  const [saving,        setSaving]        = useState(false);
  const [regenerating,  setRegenerating]  = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const liveScore = useMemo(
    () => computeScore(editedSummary, report?.jobContent || ''),
    [editedSummary, report],
  );

  const loadReport = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await reportsApi.get(id);
      if (data) {
        setReport(data);
        setEditedSummary(data.summary || '');
      } else {
        throw new Error('Relatório não encontrado.');
      }
    } catch {
      setError('Não foi possível carregar o relatório. Ele pode ter sido excluído ou a sessão expirou.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [id]);

  /* ── Save ─────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      setActionSuccess('');
      const updated = await reportsApi.update(id, { summary: editedSummary });
      setReport(updated);
      setEditedSummary(updated.summary);
      setActionSuccess('Alterações salvas!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch {
      setError('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Regenerate ───────────────────────────────────────────────────────── */
  const handleRegenerate = async () => {
    if (!id) return;
    if (!confirm('Gerar uma nova versão com IA? A atual será arquivada no histórico.')) return;
    try {
      setRegenerating(true);
      setError(null);
      setActionSuccess('');
      const regenerated = await reportsApi.regenerate(id);
      setReport(regenerated);
      setEditedSummary(regenerated.summary);
      setActionSuccess('Novo resumo gerado!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch {
      setError('Falha ao regenerar o resumo.');
    } finally {
      setRegenerating(false);
    }
  };

  /* ── Delete ───────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Excluir este relatório definitivamente?')) return;
    try {
      setError(null);
      await reportsApi.remove(id);
      navigate('/dashboard');
    } catch {
      setError('Não foi possível excluir o relatório.');
    }
  };

  /* ── Restore version ──────────────────────────────────────────────────── */
  const handleRestoreVersion = (versionSummary: string) => {
    if (confirm('Carregar esta versão no editor?')) {
      setEditedSummary(versionSummary);
      setActionSuccess('Versão carregada. Clique em "Salvar" para fixá-la.');
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  /* ── PDF export ───────────────────────────────────────────────────────── */
  const handleExportPDF = () => {
    if (!report) return;
    const w = window.open('', '_blank');
    if (!w) { alert('Permita pop-ups para exportar o PDF.'); return; }
    const kws = (report.keywords || []).map((k: string) => `<li>#${k}</li>`).join('');
    w.document.write(`
      <html><head><title>Gupify — ${report.jobTitle}</title>
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
      <div class="logo">Gupify</div>
      <div class="sub">Otimizador de Perfil para a Gupy</div>
      <h2>${report.jobTitle}</h2>
      <div class="meta">
        <strong>Currículo:</strong> ${report.cvName || '—'}<br>
        <strong>Gerado em:</strong> ${new Date(report.createdAt).toLocaleDateString('pt-BR')}<br>
        <strong>Tamanho:</strong> ${editedSummary.length} caracteres
      </div>
      <div class="label">Resumo otimizado — cole no campo "Sobre você" da Gupy</div>
      <div class="box">${editedSummary.replace(/\n/g, '<br>')}</div>
      <div class="label">Palavras-chave de alto impacto</div>
      <ul>${kws}</ul>
      <div class="footer">Gerado pelo Gupify · Uso pessoal e educacional</div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  /* ── Loading / error states ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Carregando relatório...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-900">Erro ao carregar</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'Relatório não encontrado.'}</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 btn-primary text-white font-semibold rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>
      </div>
    );
  }

  const isModified = editedSummary !== report.summary;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mb-5">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 pb-6 border-b border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
              {report.id}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3" />
              {new Date(report.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
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

      {/* ── Feedback banners ────────────────────────────────────────────── */}
      {actionSuccess && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionSuccess}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2/3: content */}
        <div className="lg:col-span-2 space-y-5">
          <SummaryResult
            summary={editedSummary}
            onChange={setEditedSummary}
            readOnly={saving || regenerating}
          />
          <KeywordBadges keywords={report.keywords} />
          <QualityChecklist summary={editedSummary} jobContent={report.jobContent || ''} />
        </div>

        {/* Right 1/3: controls */}
        <div className="space-y-5">

          {/* Actions */}
          <div className="card bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Controles
            </p>
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
                {regenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {regenerating ? 'Regenerando...' : 'Regenerar com IA'}
              </button>
            </div>

            {isModified && (
              <p className="text-[10px] text-amber-600 font-semibold mt-3 text-center">
                ⚠ Edições não salvas
              </p>
            )}
          </div>

          {/* Version history */}
          <div className="card bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Histórico de versões
            </p>
            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
              Clique em uma versão para carregá-la no editor.
            </p>

            {!report.versions || report.versions.length === 0 ? (
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
                        isCurrent
                          ? 'border-indigo-300 bg-indigo-50/40'
                          : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          v{ver.version ?? idx + 1}
                        </span>
                        <span className="text-slate-400">
                          {ver.createdAt
                            ? new Date(ver.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : 'Salva'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {ver.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Job data */}
          <div className="card bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" />
              Dados da vaga
            </p>
            <p className="text-[11px] font-semibold text-slate-700 bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100 mb-3">
              {report.jobTitle}
            </p>
            <div className="max-h-36 overflow-y-auto text-[11px] text-slate-500 leading-relaxed whitespace-pre-wrap bg-slate-50 px-2.5 py-2.5 rounded-lg border border-slate-100">
              {report.jobContent || 'Nenhuma descrição registrada.'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
