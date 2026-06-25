import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';

const STOPWORDS = new Set([
  'a','ao','aos','as','ate','com','como','da','das','de','dela','delas','dele',
  'deles','depois','do','dos','e','ela','elas','ele','eles','em','entre','essa',
  'essas','esse','esses','esta','estas','este','estes','eu','foi','ha','isso',
  'isto','ja','mais','mas','me','mesmo','muito','na','nao','nas','nem','no',
  'nos','num','numa','o','os','ou','para','pela','pelas','pelo','pelos','por',
  'qual','quando','que','quem','se','sem','seu','seus','so','sob','sobre','sua',
  'suas','tambem','te','tem','temos','tenho','um','uma','umas','uns','voce',
]);

const norm = (t: string) =>
  t.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,\/#!$%^&*;:{}=\-_`~()?]/g, ' ')
    .trim();

const ACTION_VERBS = [
  'desenvolvi','implementei','criei','liderei','otimizei',
  'gerenciei','estruturei','liderando','desenvolvendo','construi','coordenei',
];
const CLICHES = [
  'proativo','proativa','dedicado','dedicada','fora da caixa',
  'perfeccionista','apaixonado','apaixonada','motivado','motivada',
];

interface Props {
  summary:    string;
  jobContent: string;
}

export default function QualityChecklist({ summary = '', jobContent = '' }: Props) {
  const checks = useMemo(() => {
    const ns = norm(summary);
    const nj = norm(jobContent);

    /* 1. Tamanho */
    const lengthOk = summary.length >= 800 && summary.length <= 1400;

    /* 2. Verbos de ação */
    const hasVerb = ACTION_VERBS.some((v) => ns.includes(norm(v)));

    /* 3. Interseção com termos da vaga */
    const sw       = new Set(ns.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w)));
    const jWords   = nj.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
    const matches  = Array.from(new Set(jWords.filter((w) => sw.has(w))));
    const hasTerms = matches.length > 0;

    /* 4. Sem clichês */
    const found      = CLICHES.filter((c) => ns.includes(norm(c)));
    const noCliches  = found.length === 0;

    const score = [lengthOk, hasVerb, hasTerms, noCliches].filter(Boolean).length;
    const pct   = (score / 4) * 100;

    return {
      score,
      pct,
      items: [
        {
          key:    'length',
          ok:     lengthOk,
          label:  'Tamanho recomendado (800–1.400 chars)',
          detail: `${summary.length} caracteres`,
        },
        {
          key:    'verbs',
          ok:     hasVerb,
          label:  'Verbos de ação presentes',
          detail: hasVerb ? 'Detectados' : 'Nenhum verbo forte detectado',
        },
        {
          key:    'terms',
          ok:     hasTerms,
          label:  'Alinhamento com termos da vaga',
          detail: hasTerms
            ? `Matches: ${matches.slice(0, 4).join(', ')}${matches.length > 4 ? '…' : ''}`
            : 'Pouca sobreposição de termos',
        },
        {
          key:    'cliches',
          ok:     noCliches,
          label:  'Sem clichês desgastados',
          detail: noCliches ? 'Texto limpo' : `Encontrados: ${found.join(', ')}`,
        },
      ],
    };
  }, [summary, jobContent]);

  const barColor =
    checks.score === 4 ? 'bg-emerald-500' :
    checks.score === 3 ? 'bg-indigo-500'  :
    checks.score === 2 ? 'bg-amber-500'   : 'bg-red-500';

  return (
    <div className="card bg-white border border-slate-100 rounded-xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Análise de qualidade
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Critérios baseados no comportamento do algoritmo da Gupy.
          </p>
        </div>
        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
          {checks.pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${checks.pct}%` }}
        />
      </div>

      {/* Checks */}
      <div className="space-y-2">
        {checks.items.map((item) => (
          <div
            key={item.key}
            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border text-xs transition-colors ${
              item.ok
                ? 'bg-emerald-50/40 border-emerald-100'
                : 'bg-amber-50/40 border-amber-100'
            }`}
          >
            <span className={`mt-0.5 text-sm font-bold shrink-0 ${item.ok ? 'text-emerald-500' : 'text-amber-400'}`}>
              {item.ok ? '✓' : '○'}
            </span>
            <div className="min-w-0">
              <p className={`font-semibold ${item.ok ? 'text-emerald-800' : 'text-amber-800'}`}>
                {item.label}
              </p>
              <p className={`text-[10px] mt-0.5 truncate ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-4">
        Estes critérios não bloqueiam o salvamento, mas impactam diretamente seu ranqueamento.
      </p>
    </div>
  );
}
