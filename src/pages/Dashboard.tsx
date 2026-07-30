import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { reports as reportsApi, cv as cvApi } from '../services/api';
import { useSession } from '../context/SessionContext';
import { computeAtsScore, formatReportDate, getReportUpdatedAt } from '../utils/report';
import { classifyError } from '../utils/errors';
import ErrorBanner from '../components/ErrorBanner';
import type { CVibeError } from '../utils/errors';
import {
  PlusCircle,
  FileText,
  ChevronRight,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Loader2,
  Info,
  SlidersHorizontal,
  Search,
  XCircle,
} from 'lucide-react';

type ScoreFilter = 'all' | 'excellent' | 'good' | 'attention';
type VersionsFilter = 'all' | 'withVersions' | 'singleVersion';
type DateFilter = 'all' | 'today' | 'last7' | 'last30';

function scoreBadgeClasses(score: number) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-rose-700 bg-rose-50 border-rose-100';
}

export default function Dashboard() {
  const { isMockMode } = useSession();
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [cvsCount, setCvsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CVibeError | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; error: CVibeError } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [versionsFilter, setVersionsFilter] = useState<VersionsFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reportsData, cvsData] = await Promise.all([
        reportsApi.list(),
        cvApi.list(),
      ]);
      setReportsList(reportsData || []);
      setCvsCount(cvsData ? cvsData.length : 0);
    } catch (err) {
      setError(classifyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  // Limpa erro de offline automaticamente ao reconectar
  useEffect(() => {
    if (error?.kind !== 'offline') return;
    const handler = () => loadDashboardData();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [error]);

  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Tem certeza que deseja excluir este relatório permanentemente?')) return;

    try {
      setDeleteLoading(id);
      setDeleteError(null);
      await reportsApi.remove(id);
      setReportsList((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      // Erro de delete aparece inline no card, não substitui o erro de carregamento
      setDeleteError({ id, error: classifyError(err, 'delete') });
    } finally {
      setDeleteLoading(null);
    }
  };

  const enhancedReports = useMemo(
    () =>
      reportsList.map((report) => ({
        ...report,
        atsScore: computeAtsScore(report.summary || '', report.jobContent || ''),
        referenceDate: getReportUpdatedAt(report),
      })),
    [reportsList],
  );

  const visibleReports = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const now = new Date();

    const filtered = enhancedReports.filter((report) => {
      if (normalizedSearch) {
        const haystack = [
          report.jobTitle,
          report.cvName,
          report.summary,
          ...(Array.isArray(report.keywords) ? report.keywords : []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      if (scoreFilter === 'excellent' && report.atsScore < 80) return false;
      if (scoreFilter === 'good' && (report.atsScore < 60 || report.atsScore >= 80)) return false;
      if (scoreFilter === 'attention' && report.atsScore >= 60) return false;

      const versionCount = report.versions?.length || 0;
      if (versionsFilter === 'withVersions' && versionCount <= 1) return false;
      if (versionsFilter === 'singleVersion' && versionCount > 1) return false;

      if (dateFilter !== 'all') {
        const reportTime = report.referenceDate ? new Date(report.referenceDate).getTime() : 0;
        if (!reportTime) return false;
        const diffDays = (now.getTime() - reportTime) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'today' && diffDays >= 1) return false;
        if (dateFilter === 'last7' && diffDays > 7) return false;
        if (dateFilter === 'last30' && diffDays > 30) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const dateA = a.referenceDate ? new Date(a.referenceDate).getTime() : 0;
      const dateB = b.referenceDate ? new Date(b.referenceDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [enhancedReports, searchQuery, scoreFilter, versionsFilter, dateFilter]);

  const hasActiveFilters =
    searchQuery.trim() || scoreFilter !== 'all' || versionsFilter !== 'all' || dateFilter !== 'all';

  const bestScore = useMemo(
    () => (enhancedReports.length ? Math.max(...enhancedReports.map((r) => r.atsScore)) : null),
    [enhancedReports],
  );

  const clearFilters = () => {
    setSearchQuery('');
    setScoreFilter('all');
    setVersionsFilter('all');
    setDateFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-[0.18em] text-indigo-700 block mb-2">Painel</span>
          <h1 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
            Suas otimizações
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Gerencie os relatórios de otimização de currículos gerados nesta sessão.
          </p>
        </div>

        <Link
          to="/generate"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-900 active:scale-95 text-white text-sm font-bold rounded-lg transition-all shrink-0"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Nova Otimização
        </Link>
      </div>

      {isMockMode && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200/40 text-amber-800 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Modo de Demonstração Local Ativo</span>
            Seus relatórios e currículos estão sendo processados localmente no seu navegador porque o servidor de nuvem está inativo ou em repouso. Toda a inteligência de triagem continua 100% funcional!
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200 mb-8">
        <div className="bg-white p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase block">Currículos Enviados</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-950">{cvsCount}</span>
            <span className="text-xs text-slate-400">arquivos na sessão</span>
          </div>
        </div>

        <div className="bg-white p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase block">Relatórios Salvos</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-950">{reportsList.length}</span>
            <span className="text-xs text-slate-400">cargos otimizados</span>
          </div>
        </div>

        <div className="relative bg-slate-950 p-5 overflow-hidden">
          <span className="relative text-xs font-semibold text-indigo-300 uppercase block flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Melhor Pontuação ATS
          </span>
          <div className="relative flex items-baseline gap-2 mt-2">
            {bestScore === null ? (
              <span className="text-sm text-slate-400 font-medium">Ainda sem relatórios</span>
            ) : (
              <>
                <span className="text-3xl font-black text-white">{bestScore}%</span>
                <span className="text-xs text-slate-400 font-semibold bg-white/5 px-1.5 py-0.5 rounded">
                  em {enhancedReports.length === 1 ? 'seu relatório' : `${enhancedReports.length} relatórios`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Erro de carregamento geral — com retry */}
      {error && (
        <div className="mb-6">
          <ErrorBanner
            error={error}
            onRetry={loadDashboardData}
          />
        </div>
      )}

      {/* Erro de delete — aparece separado para não esconder o painel inteiro */}
      {deleteError && (
        <div className="mb-4">
          <ErrorBanner
            error={deleteError.error}
            onDismiss={() => setDeleteError(null)}
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-950">
            Histórico de Relatórios
          </h2>
        </div>

        {!loading && reportsList.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <label className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-gray-600">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por vaga, currículo, resumo ou palavra-chave..."
                  className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
              </label>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros avançados
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pontuação ATS</span>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300"
                >
                  <option value="all">Qualquer pontuação</option>
                  <option value="excellent">Excelente — 80% ou mais</option>
                  <option value="good">Boa — entre 60% e 79%</option>
                  <option value="attention">Precisa atenção — abaixo de 60%</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Versões</span>
                <select
                  value={versionsFilter}
                  onChange={(e) => setVersionsFilter(e.target.value as VersionsFilter)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300"
                >
                  <option value="all">Todos os relatórios</option>
                  <option value="withVersions">Com revisões salvas</option>
                  <option value="singleVersion">Sem revisões</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Período</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300"
                >
                  <option value="all">Qualquer data</option>
                  <option value="today">Criados/alterados hoje</option>
                  <option value="last7">Últimos 7 dias</option>
                  <option value="last30">Últimos 30 dias</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
              <p className="text-xs text-slate-500">
                Mostrando <span className="font-bold text-slate-800">{visibleReports.length}</span> de{' '}
                <span className="font-bold text-slate-800">{reportsList.length}</span> relatórios.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Carregando relatórios">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 animate-pulse">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                  <div className="h-4 w-24 bg-slate-100 rounded" />
                  <div className="h-4 w-14 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-2/3 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-1/3 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : visibleReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 sm:p-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {reportsList.length === 0 ? 'Nenhum relatório gerado' : 'Nenhum relatório encontrado com esse filtro'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mt-1.5 mb-6">
              {reportsList.length === 0
                ? 'Você ainda não tem relatórios de otimização salvos nesta sessão. Cole os dados da vaga e comece o ranqueamento automatizado.'
                : 'Tente limpar a busca ou alterar os filtros avançados para visualizar outros relatórios desta sessão.'}
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              Otimizar Meu Primeiro Currículo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visibleReports.map((report) => (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="block bg-white hover:bg-slate-50/80 active:scale-[0.995] rounded-lg border border-slate-200 hover:border-indigo-300 transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        ID: {report.id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        <Calendar className="w-3 h-3" />
                        {formatReportDate(report.referenceDate)}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${scoreBadgeClasses(report.atsScore)}`}>
                        ATS {report.atsScore}%
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-950 truncate" title={report.jobTitle}>
                      {report.jobTitle}
                    </h3>

                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="font-semibold text-gray-700">Currículo:</span>
                      <span className="truncate max-w-xs">{report.cvName || 'Currículo da Sessão'}</span>
                    </p>

                    {report.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 leading-relaxed font-normal">
                        {report.summary}
                      </p>
                    )}

                    {report.keywords && report.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {report.keywords.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-indigo-50/60 text-indigo-700 border border-indigo-100/40 px-2 py-0.5 rounded-md">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    {(report.versions?.length || 0) > 1 && (
                      <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {report.versions.length} versões
                      </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteReport(e, report.id)}
                        disabled={deleteLoading === report.id}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                        title="Excluir relatório"
                      >
                        {deleteLoading === report.id
                          ? <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          : <Trash2 className="w-4.5 h-4.5" />
                        }
                      </button>
                      <div className="p-2 text-indigo-600 bg-indigo-50 rounded-xl">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
