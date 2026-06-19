import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SummaryResultProps {
  summary: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
}

export default function SummaryResult({ summary, onChange, readOnly = false }: SummaryResultProps) {
  const [copied, setCopied] = useState(false);

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
  const isLengthShort = summary.length < 500;
  const isLengthOptimal = summary.length >= 800 && summary.length <= 1400;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Resumo Profissional Otimizado
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {readOnly 
              ? 'Visualize o resumo otimizado para o algoritmo da Gupy.' 
              : 'Você pode editar este texto para fazer ajustes manuais finos.'
            }
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!summary}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Resumo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor/Viewer container simulating Gupy's field */}
      <div className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <textarea
          value={summary}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          rows={7}
          placeholder="Nenhum resumo gerado ou o resumo está vazio..."
          className={`w-full bg-transparent p-3 text-sm text-gray-800 outline-none resize-y leading-relaxed font-normal ${
            readOnly ? 'cursor-default' : 'cursor-text'
          }`}
          maxLength={1800} // Allow typing a bit over to show Gupy limit warnings
        />
        
        {/* Real-time character counter */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white rounded-b-lg px-3.5 py-2 text-xs">
          <span className="text-gray-400 font-medium">
            Campo &quot;Sobre você&quot; da Gupy
          </span>
          <span 
            className={`font-semibold transition-colors ${
              isLengthWarning 
                ? 'text-rose-600' 
                : isLengthOptimal 
                ? 'text-emerald-600'
                : isLengthShort
                ? 'text-amber-500'
                : 'text-gray-500'
            }`}
          >
            {summary.length.toLocaleString()} / 1.500 caracteres
          </span>
        </div>
      </div>

      {/* Length alert/recommendation badges */}
      <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
        {isLengthWarning && (
          <div className="w-full p-2.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg flex items-start gap-1.5">
            <span className="font-bold">⚠️ Atenção:</span>
            <span>O texto passou de 1.500 caracteres! A Gupy cortará o excedente ou impedirá o salvamento. Reduza o texto.</span>
          </div>
        )}
        {isLengthOptimal && (
          <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium border border-emerald-100">
            ✨ Tamanho perfeito! (Entre 800 e 1400 caracteres para máxima legibilidade)
          </div>
        )}
        {!isLengthOptimal && !isLengthWarning && (
          <div className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-100">
            💡 Dica: Tente manter o resumo entre 800 e 1400 caracteres para atrair tanto a IA da Gupy quanto o recrutador humano.
          </div>
        )}
      </div>
    </div>
  );
}
