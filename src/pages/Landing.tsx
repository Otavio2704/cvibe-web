import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CVIBE_LOGO } from '../utils/assets';
import {
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  BookOpenCheck,
  SearchX,
  FileText,
  Target,
  ClipboardCheck,
  X,
  Sparkle,
} from 'lucide-react';

type Segment = { text: string; highlight?: boolean };

const BEFORE_TEXTS = [
  'Profissional dedicado e proativo, em busca de novos desafios e oportunidades de crescimento na área.',
  'Colaborador comprometido e comunicativo, com facilidade para trabalhar em equipe e sob pressão.',
  'Busco uma oportunidade para colocar em prática meus conhecimentos e evoluir profissionalmente.',
];

const AFTER_SEGMENTS: Segment[][] = [
  [
    { text: 'Analista de ' },
    { text: 'atendimento ao cliente', highlight: true },
    { text: ' com 3 anos de experiência em ' },
    { text: 'CRM', highlight: true },
    { text: ' e resolução de chamados, com histórico de ' },
    { text: 'redução de 30% no tempo de resposta', highlight: true },
    { text: '.' },
  ],
  [
    { text: 'Assistente administrativo com foco em ' },
    { text: 'rotinas financeiras', highlight: true },
    { text: ' e ' },
    { text: 'conciliação bancária', highlight: true },
    { text: ', responsável pela ' },
    { text: 'redução de 20% em glosas mensais', highlight: true },
    { text: '.' },
  ],
  [
    { text: 'Auxiliar de RH com experiência em ' },
    { text: 'recrutamento e seleção', highlight: true },
    { text: ' e ' },
    { text: 'onboarding', highlight: true },
    { text: ', apoiando a contratação de ' },
    { text: '40+ profissionais no último ano', highlight: true },
    { text: '.' },
  ],
];

/** Divide os segmentos em unidades de palavra, preservando qual segmento é destaque. */
function flattenToWords(segments: Segment[]) {
  const words: { word: string; highlight: boolean }[] = [];
  segments.forEach((seg) => {
    seg.text.split(/(\s+)/).forEach((chunk) => {
      if (chunk.length > 0) words.push({ word: chunk, highlight: !!seg.highlight });
    });
  });
  return words;
}

function EvidencePanel() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const currentWords = flattenToWords(AFTER_SEGMENTS[exampleIndex]);
    let count = 0;
    let phase: 'typing' | 'waiting' = 'typing';
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    setVisibleCount(0);

    const schedule = () => {
      if (cancelled) return;
      const delay = phase === 'typing' ? 55 + Math.random() * 45 : 2600;

      timeout = setTimeout(() => {
        if (phase === 'typing') {
          count += 1;
          setVisibleCount(count);
          if (count >= currentWords.length) {
            phase = 'waiting';
          }
        } else {
          setExampleIndex((prev) => (prev + 1) % AFTER_SEGMENTS.length);
          return;
        }
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [exampleIndex]);

  const currentWords = flattenToWords(AFTER_SEGMENTS[exampleIndex]);
  const beforeText = BEFORE_TEXTS[exampleIndex % BEFORE_TEXTS.length];

  return (
    <div className="relative">
      <div className="absolute -inset-3 bg-indigo-500/10 rounded-2xl blur-2xl pointer-events-none" aria-hidden="true" />

      <div className="relative bg-white rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Sobre_voce.txt</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
            Antes / Depois
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-2">
            <X className="w-3.5 h-3.5 text-rose-400 shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Antes — genérico</span>
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed line-through decoration-rose-300/70 decoration-1 min-h-[54px]">
            {beforeText}
          </p>

          <div className="flex justify-center my-4">
            <span className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <Sparkle className="w-3.5 h-3.5 text-indigo-500 shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Depois — direcionado</span>
          </div>
          <p className="text-[13px] text-slate-700 leading-relaxed min-h-[72px]">
            {currentWords.slice(0, visibleCount).map((w, i) =>
              w.highlight ? (
                <mark key={i} className="bg-indigo-100 text-indigo-800 px-0.5 rounded font-medium">
                  {w.word}
                </mark>
              ) : (
                <span key={i}>{w.word}</span>
              ),
            )}
            <span className="inline-block w-[2px] h-[13px] bg-indigo-400 align-middle ml-0.5 animate-pulse" aria-hidden="true" />
          </p>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400">Aderência semântica à vaga</span>
          <span className="text-[11px] font-black text-emerald-600">92%</span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  const handleStart = () => navigate('/generate');

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between bg-white">
      {/* ── HERO institucional: navy sólido, sem terminal de dev ── */}
      <div className="relative bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />
        <div className="absolute -top-24 right-0 w-[520px] h-[520px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-indigo-300 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Metodologia de otimização para triagem por IA</span>
              </div>

              <h1 className="font-serif-editorial text-[2.5rem] sm:text-6xl lg:text-[3.4rem] font-medium text-white leading-[1.05] tracking-tight">
                Seu currículo é bom.
                <br />
                <span className="text-indigo-300">O algoritmo é que não sabe disso.</span>
              </h1>

              <p className="mt-7 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
                A maioria das plataformas de recrutamento filtra candidatos por similaridade semântica antes de qualquer humano ler o perfil. O CVibe reestrutura seu resumo profissional para conversar diretamente com esse sistema — com método, não com sorte.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-950 text-sm font-bold rounded-lg hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                >
                  Otimizar meu perfil agora
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/guia')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 border border-slate-700 text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:border-slate-600 transition-all"
                >
                  Entender a metodologia
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800 flex flex-wrap gap-x-10 gap-y-4">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-medium">Sessão anônima — nada fica salvo em servidor sem sua ação</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <BookOpenCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-medium">Metodologia documentada e aberta ao escrutínio</span>
                </div>
              </div>
            </div>

            <div className="mt-14 lg:mt-0 lg:col-span-5">
              <EvidencePanel />
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 sm:py-20 bg-white w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-rose-600 block mb-3">Primeiro, o problema</span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-slate-950 tracking-tight leading-[1.1]">
              Candidatos bons somem antes de alguém ler o currículo
            </h2>
            <p className="text-slate-500 text-sm mt-4 leading-relaxed">
              Em vagas com centenas ou milhares de inscrições, a primeira disputa não é com o recrutador: é com a triagem automática. Se o seu perfil não conversa com a descrição da vaga, você pode ficar invisível mesmo tendo experiência.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 border border-slate-200 mb-16">
            <div className="bg-white lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between relative">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600">Dor principal</span>
                  <SearchX className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Você se candidata, mas não recebe retorno</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-lg">
                  Muitas vezes o problema não é falta de capacidade. É falta de alinhamento entre o texto do seu cadastro, o currículo enviado e os termos que a vaga usa para descrever responsabilidades, ferramentas, competências e resultados esperados.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                <span>Risco: ser ranqueado no fim da lista</span>
                <span className="text-slate-300">01 / 03</span>
              </div>
            </div>

            <div className="bg-white lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block mb-3">Campo subestimado</span>
                <h3 className="text-lg font-bold text-slate-950">O "Sobre você" costuma ficar fraco</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Esse campo de até 1.500 caracteres é uma chance enorme de contextualizar sua trajetória. Quando ele fica vazio, genérico ou curto demais, a plataforma tem menos evidências para conectar seu perfil à vaga.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Recomendado: 800 – 1.400 caracteres
              </div>
            </div>

            <div className="bg-white lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block mb-3">Texto sem direção</span>
                <h3 className="text-lg font-bold text-slate-950">Clichês não provam aderência</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Frases como "sou proativo", "aprendo rápido" e "busco desafios" dizem pouco. O algoritmo e o recrutador precisam de evidências: atividades, ferramentas, indicadores, contexto de negócio e conquistas.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-indigo-600 font-bold">
                Solução: trocar adjetivos por fatos verificáveis
              </div>
            </div>

            <div className="bg-white lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 block mb-3">Desalinhamento semântico</span>
                <h3 className="text-xl font-black text-slate-950">A vaga fala uma língua, seu perfil fala outra</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  "Atendimento ao cliente", "customer success", "suporte ao usuário" e "relacionamento com contas" podem estar ligados, mas precisam aparecer de forma estratégica. O mesmo vale para finanças, marketing, RH, operações, saúde, vendas, produto e tecnologia.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                <span>Efeito: menos compatibilidade percebida</span>
                <span className="text-slate-300">03 / 03</span>
              </div>
            </div>
          </div>

          <div className="mb-10 max-w-2xl">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-indigo-700 block mb-3">Depois, o que a plataforma faz</span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-slate-950 tracking-tight leading-[1.1]">
              O CVibe transforma sua experiência em um resumo direcionado para a vaga
            </h2>
            <p className="text-slate-500 text-sm mt-4 leading-relaxed">
              Você informa o currículo e a descrição da vaga. A plataforma identifica o que mais importa, organiza seu texto e entrega um resumo pronto para revisar e colar no cadastro do processo seletivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
            <div className="bg-white p-6 sm:p-7">
              <FileText className="w-5 h-5 text-indigo-600 mb-5" strokeWidth={1.75} />
              <h3 className="text-sm font-black text-slate-950">Lê seu contexto</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Usa as informações do currículo para entender trajetória, senioridade, áreas de atuação e principais entregas.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7">
              <Target className="w-5 h-5 text-indigo-600 mb-5" strokeWidth={1.75} />
              <h3 className="text-sm font-black text-slate-950">Cruza com a vaga</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Extrai responsabilidades, competências e palavras-chave relevantes, sem limitar a ferramenta a uma área específica.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7">
              <ClipboardCheck className="w-5 h-5 text-indigo-600 mb-5" strokeWidth={1.75} />
              <h3 className="text-sm font-black text-slate-950">Gera e valida</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Cria um texto com verbos de ação, evidências e termos estratégicos, além de checklist e score para orientar ajustes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 sm:py-20 bg-slate-50 w-full border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-indigo-700 block mb-3">Metodologia de escrita para triagem</span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-slate-950 tracking-tight">Como funciona o CVibe</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {[
              {
                n: '01',
                title: 'Faça o upload do CV',
                desc: 'Envie seu currículo em PDF. Ele é processado de forma segura e temporária para extração de contexto.',
              },
              {
                n: '02',
                title: 'Cole os dados da vaga',
                desc: 'Informe o título do cargo e a descrição completa. A IA extrai os termos de maior relevância semântica.',
              },
              {
                n: '03',
                title: 'Revise e ajuste',
                desc: 'Edite o texto gerado no editor interativo e acompanhe o score de aderência em tempo real.',
              },
              {
                n: '04',
                title: 'Publique no cadastro',
                desc: 'Copie o texto pronto e cole diretamente no campo "Sobre você" da plataforma de vagas usada no processo seletivo.',
              },
            ].map((step, idx) => (
              <div key={step.n} className={`text-left lg:px-6 ${idx !== 0 ? 'lg:border-l lg:border-slate-200' : ''}`}>
                <span className="font-serif-editorial text-4xl font-semibold text-indigo-200 block mb-3">{step.n}</span>
                <h4 className="font-bold text-slate-950 text-sm">{step.title}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
            >
              Otimizar meu perfil agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-900 w-full mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8">
            <div>
              <div className="flex items-center gap-2.5">
                <img
                  src={CVIBE_LOGO}
                  alt="Logo do CVibe"
                  className="w-7 h-7 rounded object-contain"
                />
                <span className="font-serif-editorial font-semibold text-lg text-white tracking-tight">CVibe</span>
              </div>
              <p className="mt-3 text-xs text-slate-500 max-w-sm leading-relaxed">
                Ferramenta educacional e otimizadora independente. Sem afiliação oficial com nenhuma plataforma de recrutamento.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2.5 text-xs font-semibold">
              <Link to="/guia" className="hover:text-white transition-colors">Guia de Sobrevivência</Link>
              <Link to="/checklist" className="hover:text-white transition-colors">Checklist do Candidato</Link>
              <Link to="/generate" className="hover:text-white transition-colors">Otimizador</Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              CVibe · São Paulo, 2026
            </p>
            <p className="text-[11px] text-slate-600">
              Feito para quem se prepara com estratégia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
