import { useMemo } from 'react';
import { Zap } from 'lucide-react';

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

    const lengthOk   = summary.length >= 800 && summary.length <= 1400;
    const hasVerb    = ACTION_VERBS.some((v) => ns.includes(norm(v)));
    const sw         = new Set(ns.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w)));
    const jWords     = nj.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
    const matches    = Array.from(new Set(jWords.filter((w) => sw.has(w))));
    const hasTerms   = matches.length > 0;
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

  const qualityLabel =
    checks.score === 4 ? 'Excelente'   :
    checks.score === 3 ? 'Boa'         :
    checks.score === 2 ? 'Regular'     : 'Fraca';

  return (
    <div className="card bg-white border border-slate-100 rounded-xl overflow-hidden">

      {/* ── Cabeçalho reframado: IA que entregou, não o usuário que submeteu ── */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 leading-none">
                Relatório de Otimização
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Critérios aplicados pela IA ao gerar o texto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">{qualityLabel}</span>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
              checks.score === 4
                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                : checks.score === 3
                ? 'text-indigo-700 bg-indigo-50 border-indigo-100'
                : 'text-amber-700 bg-amber-50 border-amber-100'
            }`}>
              {checks.pct}%
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${checks.pct}%` }}
          />
        </div>
      </div>

      {/* ── Itens do checklist ────────────────────────────────────────────── */}
      <div className="p-5 space-y-2">
        {checks.items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs transition-colors ${
              item.ok
                ? 'bg-emerald-50/50 border-emerald-100'
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            {/* Indicador */}
            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
              item.ok
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-400'
            }`}>
              {item.ok ? '✓' : '–'}
            </span>

            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <p className={`font-semibold leading-none ${
                item.ok ? 'text-emerald-800' : 'text-slate-500'
              }`}>
                {item.label}
              </p>
              <span className={`text-[10px] font-medium shrink-0 ${
                item.ok ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {item.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Rodapé neutro ─────────────────────────────────────────────────── */}
      <p className="text-[10px] text-slate-400 text-center pb-4 px-5">
        Estes critérios não bloqueiam o salvamento, mas impactam diretamente seu ranqueamento.
      </p>
    </div>
  );
}
