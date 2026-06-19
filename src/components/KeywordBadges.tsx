import { useState } from 'react';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';

interface KeywordBadgesProps {
  keywords?: string[];
}

export default function KeywordBadges({ keywords = [] }: KeywordBadgesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopySingle = async (keyword: string, index: number) => {
    try {
      await navigator.clipboard.writeText(keyword);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar termo:', err);
    }
  };

  const handleCopyAll = async () => {
    try {
      const keywordList = keywords.join(', ');
      await navigator.clipboard.writeText(keywordList);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar termos:', err);
    }
  };

  const displayKeywords = keywords.length > 0 ? keywords.slice(0, 3) : ['React', 'Tailwind CSS', 'TypeScript'];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-4.5 h-4.5 text-indigo-600" />
            Palavras-Chave de Alto Impacto
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Mapeadas pelo Gupify para garantir alta relevância no ranqueamento da triagem.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          disabled={displayKeywords.length === 0}
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            copiedAll
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copiadas!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span>Copiar Todas</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of keywords */}
      <div className="flex flex-wrap gap-2 mb-4">
        {displayKeywords.map((keyword, idx) => {
          const isSingleCopied = copiedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => handleCopySingle(keyword, idx)}
              className="group cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 text-indigo-800 rounded-xl transition-all"
              title="Clique para copiar esta palavra-chave individualmente"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <span className="text-sm font-semibold">{keyword}</span>
              <span className="text-gray-400 group-hover:text-indigo-600 transition-colors ml-1">
                {isSingleCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Strategic placement advice */}
      <div className="p-3 bg-indigo-50/30 border border-indigo-100/30 rounded-xl flex gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-900 leading-relaxed">
          <span className="font-bold">Onde usar?</span> Estas palavras-chave foram extraídas diretamente dos requisitos de maior peso da vaga. Certifique-se de que elas aparecem não apenas no seu resumo, mas também descritas nos detalhes de suas <span className="font-semibold">Experiências Profissionais</span> e na seção de <span className="font-semibold">Habilidades</span> da Gupy para impulsionar sua nota geral no ranqueamento.
        </p>
      </div>
    </div>
  );
}
