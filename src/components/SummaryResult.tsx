import { useState } from 'react';
import { Copy, Check, Pencil, Eye } from 'lucide-react';

interface SummaryResultProps {
  summary: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
}

export default function SummaryResult({
  summary,
  onChange,
  readOnly = false,
}: SummaryResultProps) {
  const [copied, setCopied] = useState(false);
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
  const isLengthShort = summary.length < 500;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-gray-100 bg-slate-50/60">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-snug">
            Resumo "Sobre Você" Prontinho
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            Texto reescrito organicamente com os termos de maior peso semântico da vaga.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            disabled={readOnly}
            title={isEditing ? 'Voltar ao modo IA' : 'Editar manualmente'}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border ${
              isEditing
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
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
                <span>Copiar texto</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-5 pb-4 pt-4">
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

          <div className="flex items-center justify-between border-t border-gray-100 bg-white/60 rounded-b-xl px-3.5 py-2 text-[11px]">
            <span className="text-gray-400 font-medium">
              Campo "Apresente-se" da plataforma de vagas
            </span>
            <span className={`font-semibold transition-colors ${
              isLengthWarning ? 'text-rose-600' : isLengthOptimal ? 'text-emerald-600' : isLengthShort ? 'text-amber-500' : 'text-gray-500'
            }`}>
              {summary.length.toLocaleString()} / 1.500 caracteres
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex flex-col gap-1.5">
          {isLengthWarning && (
            <p className="text-[11px] px-3 py-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg font-medium">
              ⚠️ Passou de 1.500 caracteres — o sistema pode cortar o excedente. Reduza o texto.
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
