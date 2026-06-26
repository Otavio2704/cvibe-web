import { useState } from 'react';
import { Copy, Check, Pencil, Eye, Sparkles } from 'lucide-react';

interface SummaryResultProps {
  summary: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  aiModel?: string;
}

export default function SummaryResult({
  summary,
  onChange,
  readOnly = false,
  aiModel = 'IA',
}: SummaryResultProps) {
  const [copied, setCopied]     = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar texto: ', err);
    }
  };

  const isLengthWarning = summary.length > 1500;
  const isLengthOptimal = summary.length >= 800 && summary.length <= 1400;
  const isLengthShort   = summary.length < 500;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in overflow-hidden">

      {/* ── Banner "IA concluiu" ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-600 border-b border-indigo-700">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-white tracking-wide">
            {aiModel}
          </span>
          <span className="text-indigo-200 text-xs font-medium ml-1.5">
            · Resumo gerado e otimizado para o ATS da Gupy
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-semibold text-indigo-200 bg-white/10 px-2 py-0.5 rounded-full">
          Pronto para copiar
        </span>
      </div>

      {/* ── Cabeçalho com título e ações ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">

        {/* Título + subtítulo */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-snug">
            Resumo "Sobre Você" Prontinho
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            Texto reescrito organicamente com os termos de maior peso semântico da vaga.
          </p>
        </div>

        {/* Botões de ação — linha única, nunca quebra */}
        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
          {/* Modo IA / Editar toggle */}
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            disabled={readOnly}
            title={isEditing ? 'Voltar ao modo IA' : 'Editar manualmente'}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border ${
              isEditing
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isEditing ? (
              <>
                <Eye className="w-3 h-3 shrink-0" />
                <span>Modo IA</span>
              </>
            ) : (
              <>
                <Pencil className="w-3 h-3 shrink-0" />
                <span>Ajustar</span>
              </>
            )}
          </button>

          {/* Copiar para a Gupy */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!summary}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 shrink-0" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 shrink-0" />
                <span>Copiar para a Gupy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Editor / Viewer ───────────────────────────────────────────────── */}
      <div className="px-5 pb-4">
        <div className={`relative rounded-xl border transition-all ${
          isEditing
            ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
            : 'border-gray-200 bg-gray-50/40'
        } focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-300`}>
          <textarea
            value={summary}
            onChange={(e) => onChange && onChange(e.target.value)}
            readOnly={readOnly || !isEditing}
            rows={7}
            placeholder="Nenhum resumo gerado ainda..."
            className={`w-full bg-transparent p-3.5 text-sm text-gray-800 outline-none resize-y leading-relaxed ${
              isEditing ? 'cursor-text' : 'cursor-default'
            }`}
            maxLength={1800}
          />

          {/* Contador */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-white/60 rounded-b-xl px-3.5 py-2 text-[11px]">
            <span className="text-gray-400 font-medium">
              Campo "Apresente-se" na Gupy
            </span>
            <span className={`font-semibold transition-colors ${
              isLengthWarning  ? 'text-rose-600'   :
              isLengthOptimal  ? 'text-emerald-600' :
              isLengthShort    ? 'text-amber-500'   : 'text-gray-500'
            }`}>
              {summary.length.toLocaleString()} / 1.500 caracteres
            </span>
          </div>
        </div>

        {/* Alertas de tamanho */}
        <div className="mt-2.5 flex flex-col gap-1.5">
          {isLengthWarning && (
            <p className="text-[11px] px-3 py-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg font-medium">
              ⚠️ Passou de 1.500 caracteres — a Gupy cortará o excedente. Reduza o texto.
            </p>
          )}
          {isLengthOptimal && !isLengthWarning && (
            <p className="text-[11px] px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
              ✨ Tamanho ideal para maximizar a legibilidade e o ranqueamento.
            </p>
          )}
          {!isLengthOptimal && !isLengthWarning && (
            <p className="text-[11px] px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-medium border border-amber-100">
              💡 Mantenha entre 800–1.400 caracteres para melhor desempenho no ATS.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
