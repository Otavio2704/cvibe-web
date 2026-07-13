import { useState, useEffect } from 'react';
import { RotateCcw, Award } from 'lucide-react';
import ScoreRing from '../components/ScoreRing';

interface Item    { id: string; text: string }
interface Section { id: string; title: string; items: Item[] }

const SECTIONS: Section[] = [
  {
    id: 'perfil',
    title: 'Fase 1 — Cadastro e Perfil Geral',
    items: [
      { id: 'p1', text: 'Título profissional alinhado ao cargo pretendido (ex: "Analista Financeiro Pleno" em vez de "Profissional Administrativo")' },
      { id: 'p2', text: 'Resumo "Sobre você" otimizado pelo CVibe (800–1.400 caracteres)' },
      { id: 'p3', text: 'Contato atualizado — telefone, e-mail, LinkedIn e portfólio quando fizer sentido' },
      { id: 'p4', text: 'Tags de competências, ferramentas e conhecimentos selecionadas batem com os requisitos da vaga' },
      { id: 'p5', text: 'Pretensão salarial e áreas de interesse preenchidos corretamente' },
    ],
  },
  {
    id: 'experiencias',
    title: 'Fase 2 — Experiências Profissionais',
    items: [
      { id: 'e1', text: 'Pelo menos 2–3 experiências cadastradas com datas consistentes' },
      { id: 'e2', text: 'Descrições com verbos de ação ("desenvolvi", "liderei", "estruturei")' },
      { id: 'e3', text: 'Palavras-chave da vaga integradas organicamente nas descrições' },
      { id: 'e4', text: 'Resultados quantificáveis incluídos (ex: "reduzi 30% no tempo de carregamento")' },
    ],
  },
  {
    id: 'pdf',
    title: 'Fase 3 — Currículo em PDF',
    items: [
      { id: 'a1', text: 'PDF gerado com texto pesquisável e selecionável (nunca salve como imagem)' },
      { id: 'a2', text: 'Nome do arquivo limpo e profissional (ex: "Curriculo_SeuNome_Area.pdf")' },
      { id: 'a3', text: 'Layout de coluna única — ATS lê melhor texto de cima para baixo, sem colunas ou tabelas decorativas' },
    ],
  },
  {
    id: 'testes',
    title: 'Fase 4 — Testes e Envio Final',
    items: [
      { id: 't1', text: 'Testes comportamentais respondidos com calma e honestidade' },
      { id: 't2', text: 'Testes de conhecimento, lógica, idiomas ou ferramentas feitos em local silencioso' },
      { id: 't3', text: 'Questionários da empresa respondidos em detalhes, demonstrando interesse real' },
    ],
  },
];

const LS_KEY = 'cvibe_checklist_v2';

export default function Checklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  /* Persiste no sessionStorage */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LS_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) delete next[id];
      sessionStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleClear = () => {
    if (!confirm('Limpar todos os itens marcados?')) return;
    setChecked({});
    sessionStorage.removeItem(LS_KEY);
  };

  const allItems  = SECTIONS.flatMap((s) => s.items);
  const total     = allItems.length;
  const done      = allItems.filter((i) => checked[i.id]).length;
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checklist</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe cada etapa da otimização do seu perfil para o processo seletivo.
          </p>
        </div>
        <div className="text-center shrink-0">
          <ScoreRing score={pct} size={64} stroke={6} />
          <p className="text-[10px] text-slate-400 mt-1">{done}/{total} itens</p>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width:      `${pct}%`,
            background: pct === 100 ? '#10b981' : pct >= 70 ? '#6366f1' : '#f59e0b',
          }}
        />
      </div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-[10px] text-slate-400">Progresso salvo automaticamente enquanto a aba estiver aberta.</p>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar
        </button>
      </div>

      {/* ── Sections ────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const secDone  = section.items.filter((i) => checked[i.id]).length;
          const secTotal = section.items.length;

          return (
            <div key={section.id}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {section.title}
                </p>
                <span className="text-[10px] font-semibold text-slate-400">
                  {secDone}/{secTotal}
                </span>
              </div>

              {/* Items */}
              <div
                className="card bg-white border border-slate-100 rounded-xl overflow-hidden"
              >
                {section.items.map((item, idx) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                        idx !== 0 ? 'border-t border-slate-50' : ''
                      } ${isChecked ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={`text-[12.5px] leading-relaxed ${
                          isChecked
                            ? 'line-through text-slate-400'
                            : 'text-slate-700 font-medium'
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Completion banner ───────────────────────────────────────────── */}
      {pct === 100 && (
        <div
          className="mt-8 p-6 rounded-2xl text-white text-center animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
        >
          <Award className="w-10 h-10 mx-auto mb-2" />
          <h3 className="text-lg font-black">Checklist completo!</h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Você aplicou todas as boas práticas para se destacar no ranqueamento dos sistemas de triagem. Boa sorte no processo seletivo!
          </p>
        </div>
      )}
    </div>
  );
}
