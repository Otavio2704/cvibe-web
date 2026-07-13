import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { reports as reportsApi, cv as cvApi } from '../services/api';
import { useSession } from '../context/SessionContext';
import { computeAtsScore, formatReportDate, getReportUpdatedAt } from '../utils/report';
import { classifyError } from '../utils/errors';
import ErrorBanner from '../components/ErrorBanner';
import type { CVibeError } from '../utils/errors';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ChevronRight,
  Trash2,
  Calendar,
  FileSignature,
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

  const clearFilters = () => {
    setSearchQuery('');
    setScoreFilter('all');
    setVersionsFilter('all');
    setDateFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-indigo-600" />
            Painel de Otimizações
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus relatórios de otimização de currículos gerados nesta sessão de recrutamento.
          </p>
        </div>

        <Link
          to="/generate"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-100 transition-all shrink-0"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase block">Currículos Enviados</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-indigo-600">{cvsCount}</span>
            <span className="text-xs text-gray-400">arquivos na sessão</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase block">Relatórios Salvos</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-indigo-600">{reportsList.length}</span>
            <span className="text-xs text-gray-400">cargos otimizados</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-50 bg-indigo-50/10 shadow-sm">
          <span className="text-xs font-semibold text-indigo-700 uppercase block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Relatórios desta Sessão
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            {reportsList.length === 0 ? (
              <span className="text-sm text-gray-400 font-medium">Nenhum relatório ainda</span>
            ) : (
              <>
                <span className="text-3xl font-black text-indigo-600">{reportsList.length}</span>
                <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                  {reportsList.length === 1 ? 'vaga otimizada' : 'vagas otimizadas'}
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
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-gray-500" />
            Histórico de Relatórios
          </h2>
        </div>

        {!loading && reportsList.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <label className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-gray-600">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300"
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
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <span className="text-sm text-gray-500 font-medium">Buscando seus relatórios salvos...</span>
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
                className="block bg-white hover:bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/35 transition-all p-5 sm:p-6"
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
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
