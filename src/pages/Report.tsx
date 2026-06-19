import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reports as reportsApi } from '../services/api';
import SummaryResult from '../components/SummaryResult';
import KeywordBadges from '../components/KeywordBadges';
import QualityChecklist from '../components/QualityChecklist';
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
  Briefcase
} from 'lucide-react';

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit & Action states
  const [editedSummary, setEditedSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Load report data
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
        throw new Error("Relatório não encontrado");
      }
    } catch (err) {
      console.error("Error loading report:", err);
      setError("Não foi possível carregar o relatório. Ele pode ter sido excluído ou a sessão expirou.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  // Save manual edit: calls PUT /api/reports/:id
  const handleSaveChanges = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      setActionSuccess('');

      const updated = await reportsApi.update(id, {
        summary: editedSummary
      });

      setReport(updated);
      setEditedSummary(updated.summary);
      
      setActionSuccess('Alterações salvas com sucesso!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error("Error updating report:", err);
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  // Regenerate summary: calls POST /api/reports/:id/regenerate
  const handleRegenerate = async () => {
    if (!id) return;
    if (!confirm("Deseja mesmo gerar uma nova versão com IA? A versão atual será arquivada no histórico de versões abaixo.")) {
      return;
    }

    try {
      setRegenerating(true);
      setError(null);
      setActionSuccess('');

      const regenerated = await reportsApi.regenerate(id);
      
      setReport(regenerated);
      setEditedSummary(regenerated.summary);

      setActionSuccess('Novo resumo gerado com sucesso!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error("Error regenerating report:", err);
      setError("Falha ao regenerar o resumo profissional.");
    } finally {
      setRegenerating(false);
    }
  };

  // Delete report
  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Tem certeza que deseja excluir este relatório definitivamente?")) {
      return;
    }

    try {
      setError(null);
      await reportsApi.remove(id);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error deleting report:", err);
      setError("Não foi possível excluir o relatório.");
    }
  };

  // Restore an old version from the history
  const handleRestoreVersion = (versionSummary: string) => {
    if (confirm("Deseja restaurar esta versão do resumo para a área de edição?")) {
      setEditedSummary(versionSummary);
      setActionSuccess('Versão carregada no editor! Clique em "Salvar Alterações" para fixá-la.');
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  // Export report to PDF (triggers a beautiful printable popup window)
  const handleExportPDF = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permita pop-ups para exportar o PDF.");
      return;
    }

    const reportTitle = report.jobTitle;
    const cvName = report.cvName || 'Currículo Selecionado';
    const dateStr = new Date(report.createdAt).toLocaleDateString('pt-BR');
    const summaryText = editedSummary.replace(/\n/g, '<br />');
    const keywordsList = (report.keywords || []).map((kw: string) => `<li>#${kw}</li>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Gupify - ${reportTitle}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.6;
            }
            .header {
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
            }
            .subtitle {
              font-size: 12px;
              color: #64748b;
              margin-top: 5px;
            }
            .title {
              font-size: 22px;
              font-weight: 700;
              margin: 20px 0 10px 0;
            }
            .meta-info {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 15px;
              font-size: 13px;
              color: #475569;
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #4f46e5;
              margin-top: 30px;
              margin-bottom: 10px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
            }
            .summary-box {
              background-color: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 20px;
              font-size: 14px;
              white-space: pre-wrap;
              color: #0f172a;
              line-height: 1.7;
            }
            .keywords-list {
              list-style-type: none;
              padding: 0;
              display: flex;
              gap: 15px;
              font-weight: 600;
              font-size: 14px;
              color: #4f46e5;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
              padding-top: 15px;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Gupify Web</div>
            <div class="subtitle">Otimizador de Perfil e Currículo para a Gupy</div>
          </div>
          
          <div class="title">Relatório de Otimização Profissional</div>
          
          <div class="meta-info">
            <strong>Vaga Alvo:</strong> ${reportTitle}<br />
            <strong>Currículo de Origem:</strong> ${cvName}<br />
            <strong>Gerado em:</strong> ${dateStr}<br />
            <strong>Tamanho do Resumo:</strong> ${editedSummary.length} caracteres
          </div>

          <div class="section-title">Resumo Otimizado (Cole no campo &quot;Sobre você&quot;)</div>
          <div class="summary-box">${summaryText}</div>

          <div class="section-title">Palavras-Chave de Alto Impacto</div>
          <ul class="keywords-list">
            ${keywordsList || '<li>#React</li><li>#Tailwind</li><li>#TypeScript</li>'}
          </ul>

          <div class="section-title">Verificação de Qualidade Gupify</div>
          <div style="font-size: 13px; color: #475569;">
            ✓ Tamanho Ideal para Algoritmo ATS Gupy (800-1400 caracteres)<br />
            ✓ Verbos de Ação e Impacto Inseridos<br />
            ✓ Palavras-chave Recomendadas Presentes
          </div>

          <div class="footer">
            Documento gerado pelo Gupify Web. Uso pessoal e educacional.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-semibold">Carregando detalhes do relatório...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Erro ao carregar</h2>
        <p className="text-sm text-gray-500 mt-2">{error || "Relatório não encontrado."}</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const isSummaryModified = editedSummary !== report.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Back button and breadcrumb */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
      </div>

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
              Relatório ID: {report.id}
            </span>
            <span className="bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(report.createdAt).toLocaleDateString('pt-BR')} às {new Date(report.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 truncate" title={report.jobTitle}>
            {report.jobTitle}
          </h1>
          
          <p className="text-xs text-gray-500">
            Baseado no currículo: <span className="font-semibold text-gray-700">{report.cvName || 'Currículo da Sessão'}</span>
          </p>
        </div>

        {/* Top actions */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4.5 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            title="Exporta o resumo profissional e termos chave em um documento PDF formatado pronto para impressão"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Exportar PDF
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-red-100 text-red-600 bg-red-50/50 hover:bg-red-50 hover:border-red-200 text-xs font-bold rounded-xl transition-all active:scale-95"
            title="Excluir relatório"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Summary, Keywords, Checklist) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SummaryResult: displays text & real-time counter & handles change */}
          <SummaryResult 
            summary={editedSummary} 
            onChange={setEditedSummary} 
            readOnly={saving || regenerating}
          />

          {/* Keywords */}
          <KeywordBadges keywords={report.keywords} />

          {/* Quality check updates dynamically as user edits the summary */}
          <QualityChecklist 
            summary={editedSummary} 
            jobContent={report.jobContent || ''} 
          />

        </div>

        {/* Right Column (Controls, Version history, Job Details) */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3.5">
              Controles do Relatório
            </h3>

            <div className="space-y-3">
              {/* Save manual edits button */}
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={!isSummaryModified || saving || regenerating}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isSummaryModified
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Salvar Alterações</span>
              </button>

              {/* AI Regenerate button */}
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={saving || regenerating}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-80"
              >
                {regenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Regenerando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerar com IA</span>
                  </>
                )}
              </button>
            </div>

            {isSummaryModified && (
              <p className="text-[10px] text-amber-600 font-semibold mt-2.5 text-center">
                ⚠️ Você fez alterações manuais. Não se esqueça de salvar antes de sair!
              </p>
            )}
          </div>

          {/* Version History */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Clock className="w-4.5 h-4.5 text-gray-500" />
              Histórico de Versões
            </h3>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              Cada geração por IA ou salvamento manual cria um ponto de restauração. Clique para carregar de volta no editor.
            </p>

            {(!report.versions || report.versions.length === 0) ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl text-center">
                Apenas a versão inicial está disponível.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {report.versions.map((ver: any, index: number) => {
                  const isCurrentInEditor = editedSummary === ver.summary;
                  return (
                    <div
                      key={index}
                      onClick={() => handleRestoreVersion(ver.summary)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-indigo-50/30 ${
                        isCurrentInEditor
                          ? 'border-indigo-600 bg-indigo-50/30 font-semibold'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Versão {ver.version || index + 1}
                        </span>
                        <span>
                          {ver.createdAt ? new Date(ver.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Salva'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {ver.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Job description info box */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Briefcase className="w-4.5 h-4.5 text-gray-500" />
              Dados da Vaga
            </h3>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
              Título
            </span>
            <p className="text-xs font-bold text-gray-800 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
              {report.jobTitle}
            </p>

            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
              Descrição completa analisada
            </span>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-[160px] overflow-y-auto text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
              {report.jobContent || "Nenhuma descrição fornecida."}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
