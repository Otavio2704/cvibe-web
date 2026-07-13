import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { CVIBE_LOGO } from '../utils/assets';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  ShieldAlert,
  Loader2,
  SearchX,
  FileText,
  Target,
  ClipboardCheck,
} from 'lucide-react';

type DemoProfile = {
  fileName: string;
  snippet: string;
};

const DEMO_PROFILES: DemoProfile[] = [
  {
    fileName: 'Curriculo_Analista_Financeiro_Pleno.pdf',
    snippet:
      'Analista financeiro com experiência em orçamento, fluxo de caixa, DRE e indicadores de desempenho. Atuei na consolidação de relatórios gerenciais, automação de rotinas em Excel e Power BI e suporte à tomada de decisão com foco em redução de custos e previsibilidade financeira.',
  },
  {
    fileName: 'CV_Designer_UX_UI_Senior.pdf',
    snippet:
      'Designer UX/UI com atuação em pesquisa com usuários, prototipação em Figma, testes de usabilidade e construção de interfaces orientadas à conversão. Liderei melhorias em jornadas digitais e colaborei com produto e desenvolvimento para evoluir experiências centradas no usuário.',
  },
  {
    fileName: 'Perfil_Analista_de_RH_BP.docx',
    snippet:
      'Profissional de RH com experiência em recrutamento, business partnering, treinamento e acompanhamento de indicadores de pessoas. Estruturei processos de atração e seleção, onboarding e ações de desenvolvimento organizacional alinhadas às metas do negócio.',
  },
  {
    fileName: 'Curriculo_Enfermeira_Assistencial.pdf',
    snippet:
      'Enfermeira assistencial com vivência em acolhimento, administração de medicamentos, evolução de prontuários e suporte multidisciplinar ao paciente. Atuei com foco em segurança, humanização do atendimento e cumprimento rigoroso de protocolos clínicos.',
  },
  {
    fileName: 'Candidato_Executivo_de_Vendas_B2B.pdf',
    snippet:
      'Executivo de vendas com histórico em prospecção consultiva, negociação, gestão de carteira e fechamento de contratos B2B. Desenvolvi estratégias comerciais, fortaleci relacionamento com clientes e contribui para expansão de receita com previsibilidade no funil.',
  },
  {
    fileName: 'Curriculo_Coordenadora_de_Marketing.pdf',
    snippet:
      'Profissional de marketing com experiência em campanhas multicanais, planejamento estratégico, branding e análise de performance. Coordenei ações com foco em geração de demanda, posicionamento de marca e otimização contínua dos resultados.',
  },
  {
    fileName: 'Perfil_Professor_de_Ingles_Online.pdf',
    snippet:
      'Professor de inglês com experiência em planejamento de aulas, acompanhamento de evolução, adaptação de conteúdo e desenvolvimento de fluência. Atuei com metodologia comunicativa e foco em engajamento, retenção e progresso consistente dos alunos.',
  },
  {
    fileName: 'CV_Analista_de_Dados_Junior.pdf',
    snippet:
      'Analista de dados com prática em limpeza de bases, construção de dashboards, análise exploratória e acompanhamento de KPIs. Apoiei áreas de negócio com insights orientados por dados e organização de informações para tomada de decisão.',
  },
  {
    fileName: 'Curriculo_Arquiteta_de_Interiores.pdf',
    snippet:
      'Arquiteta de interiores com experiência em briefing, detalhamento técnico, compatibilização de projetos e acompanhamento de obras. Desenvolvi soluções funcionais e estéticas alinhadas às necessidades do cliente, prazo e orçamento.',
  },
  {
    fileName: 'Perfil_Coordenador_Logistica.pdf',
    snippet:
      'Coordenador de logística com atuação em controle de estoque, roteirização, gestão de transportes e acompanhamento de indicadores operacionais. Estruturei processos para melhorar nível de serviço, acuracidade e eficiência na cadeia de distribuição.',
  },
];

function shuffleProfiles(list: DemoProfile[]) {
  const cloned = [...list];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export default function Landing() {
  const navigate = useNavigate();
  const { sessionReady } = useSession();

  const typedRef = useRef<HTMLSpanElement>(null);
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);

  const randomizedProfiles = useMemo(() => shuffleProfiles(DEMO_PROFILES), []);
  const activeProfile = randomizedProfiles[activeProfileIndex];

  useEffect(() => {
    const el = typedRef.current;
    if (!el || !activeProfile) return;

    let charIndex = 0;
    let phase: 'typing' | 'waiting' | 'clearing' = 'typing';
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    el.textContent = '';

    const schedule = () => {
      if (cancelled) return;

      const delay =
        phase === 'typing'
          ? 18 + Math.floor(Math.random() * 28)
          : phase === 'waiting'
            ? 3000
            : 10;

      timeout = setTimeout(() => {
        if (!typedRef.current) return;

        if (phase === 'typing') {
          charIndex += 1;
          typedRef.current.textContent = activeProfile.snippet.slice(0, charIndex);

          if (charIndex >= activeProfile.snippet.length) {
            phase = 'waiting';
          }
        } else if (phase === 'waiting') {
          phase = 'clearing';
        } else {
          charIndex = Math.max(0, charIndex - 5);
          typedRef.current.textContent = activeProfile.snippet.slice(0, charIndex);

          if (charIndex === 0) {
            setActiveProfileIndex((prev) => (prev + 1) % randomizedProfiles.length);
            return;
          }
        }

        schedule();
      }, delay);
    };

    schedule();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [activeProfile, randomizedProfiles.length]);

  const handleStart = () => navigate('/generate');

  return (
    <div className="heroBackground min-h-screen relative overflow-x-hidden flex flex-col justify-between">
      <div className="relative pt-5 pb-10 sm:pt-8 sm:pb-14 lg:pt-12 lg:pb-16 xl:pt-14 xl:pb-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12 items-center">
            <div className="sm:text-left md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left lg:pl-2 xl:pl-4">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 lg:mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Otimização Estratégica · ATS Engine</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[4rem] xl:text-[4.5rem] font-black text-gray-900 tracking-tight leading-[0.92] text-left lg:ml-[clamp(0px,3vw,44px)]">
                Não seja descartado pelo
                <span className="block text-3xl sm:text-5xl lg:text-[3.15rem] xl:text-[3.55rem] font-normal text-gray-500 tracking-normal mt-1.5 leading-tight">
                  Algoritmo de Triagem.
                </span>
                <span className="block mt-2 text-5xl sm:text-7xl lg:text-[4.75rem] xl:text-[5.4rem] bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tighter font-extrabold leading-none">
                  Otimizar.
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg lg:ml-[clamp(0px,3vw,44px)] font-normal">
A IA das plataformas de recrutamento filtra a maioria dos candidatos automaticamente. Nossa ferramenta reestrutura seu perfil usando inteligência semântica no limite ideal de 1.500 caracteres.
              </p>

              <p className="mt-2 text-xs text-indigo-700 italic font-light lg:ml-[clamp(0px,3vw,44px)]">
                * Desenvolvido para reverter o funil silencioso dos sistemas de triagem semântica.
              </p>

              <div className="mt-6 sm:flex sm:justify-start gap-4 lg:ml-[clamp(0px,3vw,44px)]">
                <button
                  onClick={handleStart}
                  disabled={!sessionReady}
                  className="ctaShimmer w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-xs tracking-wider uppercase font-extrabold rounded-xl text-white bg-indigo-600 shadow-md transition-all active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {!sessionReady ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      Otimizar meu perfil agora
                      <ArrowRight className="ml-2 -mr-1 w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/guia')}
                  className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-6 py-4 border border-gray-200 text-xs tracking-wider uppercase font-extrabold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Estudar o Algoritmo
                </button>
              </div>

              <div className="mt-4 flex items-center text-[10px] tracking-wider uppercase font-bold text-gray-400 gap-1.5 lg:ml-[clamp(0px,3vw,44px)]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sessão anônima — seus dados ficam apenas no seu dispositivo</span>
              </div>
            </div>

            <div className="mt-10 sm:mt-14 lg:mt-0 lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="absolute -top-6 -left-6 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="terminalCrt relative bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                  <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase font-bold">CVibe-Engine v2.6 // Active</span>
                  </div>

                  <div className="p-5 space-y-4 font-mono text-[11px] text-gray-300">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">INPUT_RAW_CV</span>
                      <div className="p-2 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-between gap-3">
                        <span className="text-gray-400 truncate">{activeProfile.fileName}</span>
                        <span className="text-[9px] text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 shrink-0">PARSED</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-indigo-500 tracking-wider">
                        <span>OUTPUT_ATS_OPTIMIZED</span>
                      </div>

                      <div className="p-3 bg-black/80 border border-gray-800 rounded-xl leading-relaxed text-gray-300 min-h-[132px]">
                        <span ref={typedRef}></span>
                        <span className="cursorTerminal"></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Semântica ATS OK</span>
                      </div>
                      <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Verbos de Ação</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="sectionDivider">
          <span className="sectionDividerLabel">Para candidatos que jogam com estratégia</span>
        </div>
      </div>

      <div className="py-12 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 block mb-2">Primeiro: o problema</span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Candidatos bons somem antes de alguém ler o currículo
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-2xl font-normal leading-relaxed">
              Em vagas com centenas ou milhares de inscrições, a primeira disputa não é com o recrutador: é com a triagem automática. Se o seu perfil não conversa com a descrição da vaga, você pode ficar invisível mesmo tendo experiência.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-14">
            <div className="gradientBorderCard-16 lg:col-span-7 p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 bg-rose-50 text-rose-600 rounded-bl-xl border-l border-b border-rose-100">
                <SearchX className="w-5 h-5" />
              </div>
              <div className="max-w-lg">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-rose-600 block mb-1">Dor principal</span>
                <h3 className="text-xl font-black text-gray-950">Você se candidata, mas não recebe retorno</h3>
                <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                  Muitas vezes o problema não é falta de capacidade. É falta de alinhamento entre o texto do seu cadastro, o currículo enviado e os termos que a vaga usa para descrever responsabilidades, ferramentas, competências e resultados esperados.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                <span>RISCO: SER RANQUEADO NO FIM DA LISTA</span>
                <span className="text-gray-400">01 / 03</span>
              </div>
            </div>

            <div className="gradientBorderCard-12 lg:col-span-5 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-600 block mb-1">Campo subestimado</span>
                <h3 className="text-lg font-bold text-gray-950">O "Sobre você" costuma ficar fraco</h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  Esse campo de até 1.500 caracteres é uma chance enorme de contextualizar sua trajetória. Quando ele fica vazio, genérico ou curto demais, a plataforma tem menos evidências para conectar seu perfil à vaga.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Recomendado: 800 - 1.400 caracteres
              </div>
            </div>

            <div className="gradientBorderCard-8 lg:col-span-5 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-indigo-600 block mb-1">Texto sem direção</span>
                <h3 className="text-lg font-bold text-gray-950">Clichês não provam aderência</h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  Frases como "sou proativo", "aprendo rápido" e "busco desafios" dizem pouco. O algoritmo e o recrutador precisam de evidências: atividades, ferramentas, indicadores, contexto de negócio e conquistas.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-gray-100 text-[10px] text-indigo-600 font-bold">
                Solução: trocar adjetivos por fatos verificáveis
              </div>
            </div>

            <div className="gradientBorderCard-16 lg:col-span-7 p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-rose-600 block mb-1">Desalinhamento semântico</span>
                <h3 className="text-xl font-black text-gray-950">A vaga fala uma língua, seu perfil fala outra</h3>
                <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                  "Atendimento ao cliente", "customer success", "suporte ao usuário" e "relacionamento com contas" podem estar ligados, mas precisam aparecer de forma estratégica. O mesmo vale para finanças, marketing, RH, operações, saúde, vendas, produto e tecnologia.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                <span>EFEITO: MENOS COMPATIBILIDADE PERCEBIDA</span>
                <span className="text-gray-400">03 / 03</span>
              </div>
            </div>
          </div>

          <div className="mb-10 max-w-3xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block mb-2">Depois: o que a plataforma faz</span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              O CVibe transforma sua experiência em um resumo direcionado para a vaga
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-2xl font-normal leading-relaxed">
              Você informa o currículo e a descrição da vaga. A plataforma identifica o que mais importa, organiza seu texto e entrega um resumo pronto para revisar e colar no cadastro do processo seletivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-2xl p-5">
              <FileText className="w-6 h-6 text-indigo-600 mb-4" />
              <h3 className="text-sm font-black text-gray-950">Lê seu contexto</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Usa as informações do currículo para entender trajetória, senioridade, áreas de atuação e principais entregas.
              </p>
            </div>

            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-2xl p-5">
              <Target className="w-6 h-6 text-indigo-600 mb-4" />
              <h3 className="text-sm font-black text-gray-950">Cruza com a vaga</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Extrai responsabilidades, competências e palavras-chave relevantes, sem limitar a ferramenta a uma área específica.
              </p>
            </div>

            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-2xl p-5">
              <ClipboardCheck className="w-6 h-6 text-indigo-600 mb-4" />
              <h3 className="text-sm font-black text-gray-950">Gera e valida</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Cria um texto com verbos de ação, evidências e termos estratégicos, além de checklist e score para orientar ajustes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="sectionDivider sectionDividerCentered">
          <span className="sectionDividerLabel">Metodologia de escrita para triagem</span>
        </div>
      </div>

      <div className="py-16 bg-gray-50/30 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600">Simples &amp; Rápido</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">Como funciona o CVibe?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-left p-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm mb-4 border border-indigo-100">
                01
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Faça o Upload do CV</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-normal">
                Envie seu currículo em PDF. Ele é processado de forma segura e temporária para extração de contexto.
              </p>
            </div>

            <div className="text-left p-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm mb-4 border border-indigo-100">
                02
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Cole os Dados da Vaga</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-normal">
                Informe o título do cargo e a descrição completa. Nossa IA extrai os termos de maior relevância semântica.
              </p>
            </div>

            <div className="text-left p-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm mb-4 border border-indigo-100">
                03
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Revise e Ajuste</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-normal">
                Edite o texto gerado no editor interativo e acompanhe o score de aderência em tempo real.
              </p>
            </div>

            <div className="text-left p-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm mb-4 border border-indigo-100">
                04
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Publique no Cadastro</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-normal">
                Copie o texto pronto e cole diretamente no campo &quot;Sobre você&quot; da plataforma de vagas usada no processo seletivo.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleStart}
              disabled={!sessionReady}
              className="ctaShimmer inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-xs tracking-wider uppercase font-extrabold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-75"
            >
              {!sessionReady ? 'Conectando...' : 'Otimizar meu perfil agora'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div>
              <div className="flex items-center justify-start space-x-2">
                <img
                  src={CVIBE_LOGO}
                  alt="Logo do CVibe"
                  className="w-7 h-7 rounded object-contain"
                />
                <span className="font-extrabold text-white tracking-wider">CVibe Web</span>
              </div>
              <p className="mt-2 text-[10px] text-gray-500 max-w-sm font-normal">
                Ferramenta educacional e otimizadora independente. Sem afiliação oficial com nenhuma plataforma de recrutamento.
              </p>
            </div>

            <div className="flex space-x-6 text-xs font-semibold">
              <Link to="/guia" className="hover:text-white transition-colors">Guia de Sobrevivência</Link>
              <Link to="/checklist" className="hover:text-white transition-colors">Checklist do Candidato</Link>
              <Link to="/generate" className="hover:text-white transition-colors">Otimizador</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-900 text-center">
            <p className="font-mono text-[10px] tracking-widest text-gray-500">
              CVibe — Feito para quem joga o jogo com estratégia. &nbsp; &nbsp; São Paulo · 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
