import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

// Common Portuguese stopwords to ignore for keyword intersection
const PORTUGUESE_STOPWORDS = new Set([
  'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo', 'as', 'ate', 'ao',
  'com', 'como', 'da', 'das', 'de', 'dela', 'delas', 'dele', 'deles', 'depois', 'do', 'dos',
  'e', 'ela', 'elas', 'ele', 'eles', 'em', 'entre', 'era', 'erais', 'eram', 'eramos', 'essa',
  'essas', 'esse', 'esses', 'esta', 'estamos', 'estao', 'estas', 'este', 'estes', 'estou',
  'eu', 'foi', 'fomos', 'foram', 'fosse', 'fossem', 'fui', 'ha', 'haja', 'hajam', 'houve',
  'houvemos', 'houveram', 'isso', 'isto', 'ja', 'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo',
  'meu', 'meus', 'minha', 'minhas', 'muito', 'na', 'nao', 'nas', 'nem', 'no', 'nos', 'nossa',
  'nossas', 'nosso', 'nossos', 'num', 'numa', 'o', 'os', 'ou', 'para', 'pela', 'pelas',
  'pelo', 'pelos', 'por', 'qual', 'quando', 'que', 'quem', 'se', 'seja', 'sejam', 'sem',
  'seu', 'seus', 'so', 'sob', 'sobre', 'sua', 'suas', 'tambem', 'te', 'tem', 'temos', 'tenho',
  'tenhao', 'teu', 'teus', 'tu', 'tua', 'tuas', 'um', 'uma', 'umas', 'uns', 'voce', 'voces', 'vos'
]);

// Helper to normalize text (remove accents, lowercase, remove punctuation)
const normalizeText = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ") // Remove punctuation
    .trim();
};

interface QualityChecklistProps {
  summary: string;
  jobContent: string;
}

export default function QualityChecklist({ summary = '', jobContent = '' }: QualityChecklistProps) {
  
  const evaluations = useMemo(() => {
    const normSummary = normalizeText(summary);
    const normJob = normalizeText(jobContent);

    // 1. Tamanho adequado: summary.length >= 800 && summary.length <= 1400
    const checkLength = summary.length >= 800 && summary.length <= 1400;

    // 2. Contém verbo de ação: "desenvolvi", "implementei", "criei", "liderei"
    const actionVerbs = ['desenvolvi', 'implementei', 'criei', 'liderei', 'otimizei', 'gerenciei', 'estruturei', 'liderando', 'desenvolvendo', 'construi', 'coordenei'];
    const hasActionVerb = actionVerbs.some(verb => normSummary.includes(verb));

    // 3. Contém termo da vaga: Interseção de palavras entre summary e jobContent (ignorando stopwords)
    const summaryWords = new Set(normSummary.split(/\s+/).filter(w => w.length > 2 && !PORTUGUESE_STOPWORDS.has(w)));
    const jobWords = normJob.split(/\s+/).filter(w => w.length > 2 && !PORTUGUESE_STOPWORDS.has(w));
    
    // Find intersection
    const matchedTerms = jobWords.filter(word => summaryWords.has(word));
    const uniqueMatchedTerms = Array.from(new Set(matchedTerms));
    const hasJobTerms = uniqueMatchedTerms.length > 0;

    // 4. Sem clichês: Ausência de "proativo", "dedicado", "fora da caixa"
    const cliches = ['proativo', 'proativa', 'dedicado', 'dedicada', 'fora da caixa', 'perfeccionista', 'apaixonado', 'apaixonada', 'motivado', 'motivada'];
    const foundCliches = cliches.filter(cliche => normSummary.includes(cliche));
    const hasNoCliches = foundCliches.length === 0;

    return {
      length: {
        passed: checkLength,
        label: 'Tamanho recomendado da Gupy',
        desc: `O resumo deve ter entre 800 e 1.400 caracteres. (Atual: ${summary.length})`,
        value: `${summary.length} caracteres`
      },
      actionVerbs: {
        passed: hasActionVerb,
        label: 'Presença de verbos de ação',
        desc: 'Uso de termos como "desenvolvi", "implementei", "criei" ou "liderei" para denotar protagonismo.',
        value: hasActionVerb ? 'Detectado' : 'Nenhum verbo forte detectado'
      },
      jobTerms: {
        passed: hasJobTerms,
        label: 'Alinhamento com termos da vaga',
        desc: 'Presença de palavras-chave técnicas relevantes extraídas da descrição do cargo.',
        value: hasJobTerms 
          ? `Correspondências: ${uniqueMatchedTerms.slice(0, 4).join(', ')}${uniqueMatchedTerms.length > 4 ? '...' : ''}` 
          : 'Pouca correspondência de termos'
      },
      cliches: {
        passed: hasNoCliches,
        label: 'Sem clichês desgastados',
        desc: 'Evite palavras vazias como "proativo", "dedicado" ou "pensar fora da caixa". Mostre com fatos.',
        value: hasNoCliches ? 'Limpo de clichês' : `Encontrado: ${foundCliches.join(', ')}`
      },
      score: [checkLength, hasActionVerb, hasJobTerms, hasNoCliches].filter(Boolean).length
    };
  }, [summary, jobContent]);

  const { length, actionVerbs, jobTerms, cliches, score } = evaluations;
  const percentage = (score / 4) * 100;

  const checklistItems = [
    { key: 'length', ...length },
    { key: 'actionVerbs', ...actionVerbs },
    { key: 'jobTerms', ...jobTerms },
    { key: 'cliches', ...cliches }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
            Análise de Qualidade do Resumo
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Verificações automatizadas com base no comportamento do algoritmo da Gupy.
          </p>
        </div>
        
        {/* Score Ring / Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold">
            <span>Score Gupy: {percentage}%</span>
          </div>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-5">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${
            score === 4 
              ? 'bg-emerald-500' 
              : score === 3 
              ? 'bg-indigo-500' 
              : score === 2 
              ? 'bg-amber-500' 
              : 'bg-rose-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-3.5">
        {checklistItems.map((item) => (
          <div 
            key={item.key} 
            className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
              item.passed 
                ? 'bg-emerald-50/20 border-emerald-100' 
                : 'bg-amber-50/20 border-amber-100'
            }`}
          >
            <div className="flex gap-2.5 min-w-0">
              {item.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className="text-sm font-semibold text-gray-900 block">
                  {item.label}
                </span>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
                <span className={`inline-block text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded ${
                  item.passed 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Estes critérios não impedem o salvamento, mas melhoram muito suas chances no processo seletivo!</span>
      </div>
    </div>
  );
}
