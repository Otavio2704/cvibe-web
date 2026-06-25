import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reports as reportsApi, cv as cvApi } from '../services/api';
import { useSession } from '../context/SessionContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  ChevronRight, 
  Trash2, 
  Calendar, 
  FileSignature, 
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
  Info
} from 'lucide-react';

export default function Dashboard() {
  const { isMockMode } = useSession();
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [cvsCount, setCvsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reportsData, cvsData] = await Promise.all([
        reportsApi.list(),
        cvApi.list()
      ]);
      
      setReportsList(reportsData || []);
      setCvsCount(cvsData ? cvsData.length : 0);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Ocorreu um erro ao carregar seus relatórios. Certifique-se de que a sessão está ativa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation if clicking card
    if (!confirm("Tem certeza que deseja excluir este relatório permanentemente?")) {
      return;
    }

    try {
      setDeleteLoading(id);
      await reportsApi.remove(id);
      setReportsList(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Não foi possível excluir o relatório selecionado.");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
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

      {/* Connection Mode Warning */}
      {isMockMode && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200/40 text-amber-800 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Modo de Demonstração Local Ativo</span>
            Seus relatórios e currículos estão sendo processados localmente no seu navegador porque o servidor de nuvem está inativo ou em repouso. Toda a inteligência de triagem continua 100% funcional!
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports List Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-gray-500" />
          Histórico de Relatórios
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <span className="text-sm text-gray-500 font-medium">Buscando seus relatórios salvos...</span>
          </div>
        ) : reportsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 sm:p-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Nenhum relatório gerado</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1.5 mb-6">
              Você ainda não tem relatórios de otimização de currículo salvos nesta sessão. Cole os dados da vaga e comece o ranqueamento automatizado.
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
            {reportsList.map((report) => (
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
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Data recente'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-950 truncate" title={report.jobTitle}>
                      {report.jobTitle}
                    </h3>

                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="font-semibold text-gray-700">Currículo:</span>
                      <span className="truncate max-w-xs">{report.cvName || 'Currículo da Sessão'}</span>
                    </p>

                    {/* Summary text snippet */}
                    {report.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 leading-relaxed font-normal">
                        {report.summary}
                      </p>
                    )}
                    
                    {/* Keyword previews */}
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
                    {/* Number of versions history */}
                    {report.versions && report.versions.length > 1 && (
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
                        {deleteLoading === report.id ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-4.5 h-4.5" />
                        )}
                      </button>

                      <div className="p-2 text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white rounded-xl transition-all">
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
