import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldAlert, 
  Loader2
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { sessionReady } = useSession();

  // Typewriter: usa ref pro index pra não capturar valor stale no closure
  const typedRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const phaseRef = useRef<'typing' | 'waiting' | 'clearing'>('typing');
  const fullSnippet = 'Desenvolvedor back-end com experiência em Java, Spring Boot e APIs RESTful. Atuei na construção de microsserviços escaláveis, integrações assíncronas com filas de mensagem e implementação de pipelines de CI/CD. Contribuí para a redução de latência em 40% em um sistema de alto volume...';

  useEffect(() => {
    const el = typedRef.current;
    if (!el) return;

    const tick = () => {
      if (phaseRef.current === 'typing') {
        indexRef.current++;
        el.textContent = fullSnippet.slice(0, indexRef.current);
        if (indexRef.current >= fullSnippet.length) {
          phaseRef.current = 'waiting';
        }
      } else if (phaseRef.current === 'waiting') {
        phaseRef.current = 'clearing';
      } else {
        indexRef.current = Math.max(0, indexRef.current - 4);
        el.textContent = fullSnippet.slice(0, indexRef.current);
        if (indexRef.current === 0) {
          phaseRef.current = 'typing';
        }
      }
    };

    // Velocidades diferentes por fase
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay =
        phaseRef.current === 'typing'
          ? 30
          : phaseRef.current === 'waiting'
          ? 8000
          : 12;
      timeout = setTimeout(() => {
        tick();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  // Comprimento atual pra exibir no contador
  const handleStart = () => navigate('/generate');

  return (
    <div className="heroBackground min-h-screen relative overflow-hidden flex flex-col justify-between">
      
      {/* Hero Section */}
      <div className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Text Column */}
            <div className="sm:text-left md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left lg:pl-4">
              
              <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Otimização Estratégica · ATS Engine</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-none text-left lg:ml-[clamp(0px,4vw,60px)]">
                Não seja descartado pelo 
                <span className="block text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-500 tracking-normal mt-1">
                  Algoritmo da Gupy.
                </span>
                <span className="block mt-2 text-5xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tighter font-extrabold leading-none">
                  Otimizar.
                </span>
              </h1>
              
              <p className="mt-6 text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg lg:ml-[clamp(0px,4vw,60px)] font-normal">
                A IA da Gupy filtra a maioria dos candidatos automaticamente. Nossa ferramenta reestrutura seu perfil usando inteligência semântica no limite ideal de 1.500 caracteres.
              </p>

              <p className="mt-3 text-xs text-indigo-700 italic font-light lg:ml-[clamp(0px,4vw,60px)]">
                * Desenvolvido para reverter o funil silencioso dos sistemas de triagem semântica.
              </p>

              <div className="mt-8 sm:flex sm:justify-start gap-4 lg:ml-[clamp(0px,4vw,60px)]">
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

              <div className="mt-5 flex items-center text-[10px] tracking-wider uppercase font-bold text-gray-400 gap-1.5 lg:ml-[clamp(0px,4vw,60px)]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sessão temporária segura — nada é armazenado de forma permanente</span>
              </div>
            </div>

            {/* Visual Column — CRT Terminal */}
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                
                <div className="absolute -top-6 -left-6 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="terminalCrt relative bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                  <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase font-bold">Gupify-Engine v2.6 // Active</span>
                  </div>

                  <div className="p-5 space-y-4 font-mono text-[11px] text-gray-300">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">INPUT_RAW_CV</span>
                      <div className="p-2 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-between">
                        <span className="text-gray-400 truncate">Curriculo_Candidato.pdf</span>
                        <span className="text-[9px] text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">PARSED</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-indigo-500 tracking-wider">
                        <span>OUTPUT_GUPY_OPTIMIZED</span>
                      </div>
                      
                      <div className="p-3 bg-black/80 border border-gray-800 rounded-xl leading-relaxed text-gray-300 min-h-[96px]">
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

      {/* Divisória editorial */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="editorialDivider">
          <span className="editorialDividerLabel">
            — para candidatos que jogam com estratégia —
          </span>
        </div>
      </div>

      {/* Grid de problemas */}
      <div className="py-12 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block mb-2">Diagnóstico Prático</span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Como o algoritmo elimina perfis qualificados
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-xl font-normal">
              A triagem semântica lê e ranqueia textos automaticamente. Se a estrutura do seu perfil não estiver programada para isso, você nem entra na disputa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            <div className="gradientBorderCard-16 lg:col-span-7 p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 bg-rose-50 text-rose-600 rounded-bl-xl border-l border-b border-rose-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="max-w-md">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-rose-600 block mb-1">O Filtro de Cosseno</span>
                <h3 className="text-xl font-black text-gray-950">A Barreira das Palavras-Chave Técnicas</h3>
                <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                  O robô da Gupy compara a semântica da descrição do cargo com a do seu cadastro. Escrever de forma genérica impede que a IA identifique a aderência técnica da sua bagagem, resultando em exclusão imediata na primeira rodada de triagem.
                </p>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>IMPACTO NO SCORE GUPY: CRÍTICO</span>
                <span className="text-gray-400">01 / 03</span>
              </div>
            </div>

            <div className="gradientBorderCard-12 lg:col-span-5 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-600 block mb-1">Estratégia de Escrita</span>
                <h3 className="text-lg font-bold text-gray-950">A Tração do Campo &quot;Sobre você&quot;</h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  Este espaço de 1.500 caracteres na Gupy concentra os maiores pesos semânticos do motor. Candidatos que o deixam em branco ou resumem em duas linhas eliminam sua principal chance de ranqueamento automático.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Recomendado: 800 - 1.400 caracteres
              </div>
            </div>

            <div className="gradientBorderCard-8 lg:col-span-5 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-indigo-600 block mb-1">Engrenagem Estrutural</span>
                <h3 className="text-lg font-bold text-gray-950">Evite Clichês que Rebaixam Notas</h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  Palavras vazias como &quot;profissional proativo&quot;, &quot;dedicado&quot; ou &quot;pensar fora da caixa&quot; não carregam relevância semântica. O algoritmo valoriza fatos descritos com verbos de ação robustos.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-gray-100 text-[10px] text-indigo-600 font-bold">
                Solução: Substituir por conquistas tangíveis
              </div>
            </div>

            <div className="gradientBorderCard-16 lg:col-span-7 p-8 shadow-sm flex flex-col justify-between bg-indigo-50/10">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-600 block mb-1">Como Funciona</span>
                <h3 className="text-xl font-black text-gray-950">Simples, rápido, sem cadastro</h3>
                <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                  Cole seu currículo e a descrição da vaga. A IA analisa os requisitos, extrai as palavras-chave de maior peso semântico e gera um texto profissional pronto para colar no campo &quot;Sobre você&quot; da Gupy.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/30 text-xs text-indigo-700 font-semibold">
                    ✓ Sem cadastro necessário
                  </div>
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/30 text-xs text-indigo-700 font-semibold">
                    ✓ Sessão temporária segura
                  </div>
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/30 text-xs text-indigo-700 font-semibold">
                    ✓ Checklist de qualidade ATS
                  </div>
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/30 text-xs text-indigo-700 font-semibold">
                    ✓ Exportação em PDF
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Divisória editorial */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="editorialDivider">
          <span className="editorialDividerLabel">
            — metodologia de escrita para triagem —
          </span>
        </div>
      </div>

      {/* How it works */}
      <div className="py-16 bg-gray-50/30 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600">Simples &amp; Rápido</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">Como funciona o Gupify?</h2>
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
                Copie o texto pronto e cole diretamente no campo &quot;Sobre você&quot; da plataforma Gupy.
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

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div>
              <div className="flex items-center justify-start space-x-2">
                <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  G
                </div>
                <span className="font-extrabold text-white tracking-wider">Gupify Web</span>
              </div>
              <p className="mt-2 text-[10px] text-gray-500 max-w-sm font-normal">
                Ferramenta educacional e otimizadora independente. Sem afiliação oficial com a Gupy Inc.
              </p>
            </div>
            
            <div className="flex space-x-6 text-xs font-semibold">
              <a href="/guia" className="hover:text-white transition-colors">Guia de Sobrevivência</a>
              <a href="/checklist" className="hover:text-white transition-colors">Checklist do Candidato</a>
              <a href="/generate" className="hover:text-white transition-colors">Otimizador</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-900 text-center">
            <p className="font-mono text-[10px] tracking-widest text-gray-500">
              Gupify — Feito para quem joga o jogo com estratégia. &nbsp; &nbsp; São Paulo · 2026
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
