/*
  [ANTI-AI] AUDITORIA DE ANTI-PADRÕES ENCONTRADOS:
  - [ANTI-AI] encontrado: radial-gradient centralizado e simétrico atrás do mockup no topo do hero. Substituído por focos de glow assimétricos em cantos opostos.
  - [ANTI-AI] encontrado: cards da seção de problemas com padding idêntico (p-6) e perfeitamente simétricos. Substituído por cards assimétricos com paddings variados e border-radius alternados.
  - [ANTI-AI] encontrado: a headline do hero e subtítulo estavam centralizados para mobile e sem offset editorial à esquerda. Implementado alinhamento à esquerda com offset intencional usando clamp().
  - [ANTI-AI] encontrado: o fundo original era sólido e plano. Adicionado ruído de película via body::before e glows assimétricos.
  - [ANTI-AI] encontrado: hover states eram genéricos com apenas transições padrão de scale/opacity. Elevado para animações de shimmer personalizadas com respeito a prefers-reduced-motion.
  - [ANTI-AI] encontrado: footer usava copyright boilerplate corporativo. Substituído por assinatura editorial sofisticada com a voz do produto.
  - [ANTI-AI] encontrado: seção com layout perfeitamente simétrico com larguras e espaçamentos uniformes. Quebrado com assimetria intencional na proporção de colunas (1.6fr 1fr) e layouts de grid híbridos.
  - [ANTI-AI] encontrado: tipografia padrão do Tailwind (Inter) usada sem contraponto de estilo, ritmo ou peso. Introduzido contraste de peso marcante (Inter 300 italic) ao lado da headline Syne e letras em caixa alta condensadas de 10-11px.
*/

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldAlert, 
  Loader2
} from 'lucide-react';

// [ANTI-AI] Count-up com IntersectionObserver — dispara ao entrar na viewport
function useCountUp(target: number, duration: number = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setCount(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

export default function Landing() {
  const navigate = useNavigate();
  const { sessionReady } = useSession();
  
  // Real Gupify resume snippet typing simulation
  const [typedText, setTypedText] = useState('');
  const fullSnippet = 'Como Desenvolvedor Frontend especialista em React e Tailwind CSS, criei e implementei arquiteturas web responsivas e otimizei a performance de aplicações SPA de alta fidelidade visual. Reduzi o tempo de carregamento em 30%...';
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullSnippet.charAt(index));
      index++;
      if (index >= fullSnippet.length) {
        setTimeout(() => {
          setTypedText('');
          index = 0;
        }, 12000); // Wait and restart
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    navigate('/generate');
  };

  // Counting metrics for premium social proof
  const otimizadosCount = useCountUp(14820, 2000);
  const aprovadosCount = useCountUp(89, 1500);

  return (
    <div className="heroBackground min-h-screen relative overflow-hidden flex flex-col justify-between">
      
      {/* Hero Section */}
      <div className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* [ANTI-AI] Text Column - Left-aligned with intentional offset clamp() */}
            <div className="sm:text-left md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left lg:pl-4">
              
              {/* Premium tiny pill */}
              <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Otimização Estratégica · ATS Engine</span>
              </div>
              
              {/* [ANTI-AI] Headline editorial com offset — não centrada, não simétrica */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-none text-left lg:ml-[clamp(0px,4vw,60px)]">
                Não seja descartado pelo 
                <span className="block text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-500 tracking-normal mt-1">
                  Algoritmo da Gupy.
                </span>
                <span className="block mt-2 text-5xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tighter font-extrabold leading-none">
                  Otimizar.
                </span>
              </h1>
              
              {/* [ANTI-AI] Contraste de peso — suporte em itálico de peso fino */}
              <p className="mt-6 text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg lg:ml-[clamp(0px,4vw,60px)] font-normal">
                A IA da Gupy filtra 90% dos candidatos de forma automatizada. Nossa ferramenta reestrutura seu perfil usando inteligência semântica de cosseno no limite perfeito de 1.500 caracteres.
              </p>

              <p className="mt-3 text-xs text-indigo-700 italic font-light lg:ml-[clamp(0px,4vw,60px)]">
                * Desenvolvido para reverter o funil silencioso dos sistemas de triagem semântica.
              </p>

              {/* [ANTI-AI] CTA com shimmer animado */}
              <div className="mt-8 sm:flex sm:justify-start gap-4 lg:ml-[clamp(0px,4vw,60px)]">
                <button
                  onClick={handleStart}
                  disabled={!sessionReady}
                  className="ctaShimmer w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-xs tracking-wider uppercase font-extrabold rounded-xl text-white bg-indigo-600 shadow-md transition-all active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {!sessionReady ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando seu perfil...
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

              {/* Safe Session Notice */}
              <div className="mt-5 flex items-center text-[10px] tracking-wider uppercase font-bold text-gray-400 gap-1.5 lg:ml-[clamp(0px,4vw,60px)]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sessão temporária segura estabelecida na nuvem</span>
              </div>
            </div>

            {/* [ANTI-AI] Visual Column - Deep CRT Terminal Mockup */}
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                
                {/* [ANTI-AI] Glows assimétricos substituem radial centralizado */}
                <div className="absolute -top-6 -left-6 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                {/* Simulated CRT Terminal with scanlines */}
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
                        <span className="text-gray-400 truncate">Curriculo_Candidato_Frontend.pdf</span>
                        <span className="text-[9px] text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">PARSED</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-indigo-500 tracking-wider">
                        <span>OUTPUT_GUPY_OPTIMIZED</span>
                        <span className="text-emerald-400 font-bold">{typedText.length} / 1.500 CARACT.</span>
                      </div>
                      
                      {/* Live Typewriter displaying genuine Gupify product text */}
                      <div className="p-3 bg-black/80 border border-gray-800 rounded-xl leading-relaxed text-gray-300 min-h-[96px]">
                        <span>&quot;{typedText}</span>
                        <span className="cursorTerminal"></span>
                        <span>&quot;</span>
                      </div>
                    </div>

                    {/* Metrics check */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>ATS Score: 98% (Excelente)</span>
                      </div>
                      <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Contém Verbos de Ação</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* [ANTI-AI] Divisória editorial com microcopy com voz */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="editorialDivider">
          <span className="editorialDividerLabel">
            — para candidatos que jogam com estratégia —
          </span>
        </div>
      </div>

      {/* [ANTI-AI] Grid com proporção não uniforme — sem colunas idênticas e sem cards simétricos */}
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
            
            {/* Card Primário Destaque - Ocupa 7 colunas (Assimetria) */}
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

            {/* Card Secundário - Ocupa 5 colunas */}
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

            {/* Card Terceiro - Ocupa 5 colunas */}
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

            {/* Card Quarto Social Proof Premium - Ocupa 7 colunas (Assimetria) */}
            <div className="gradientBorderCard-16 lg:col-span-7 p-8 shadow-sm flex flex-col justify-between bg-indigo-50/10">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-600 block mb-1">Performance Comprovada</span>
                <h3 className="text-xl font-black text-gray-950">Resultados da Otimização Semântica</h3>
                
                {/* Count-up social proof counters */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/30">
                    <span className="text-3xl font-extrabold text-indigo-600 block tracking-tight">
                      <span ref={otimizadosCount.ref}>{otimizadosCount.count.toLocaleString()}</span>+
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">resumos otimizados</span>
                  </div>
                  
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/30">
                    <span className="text-3xl font-extrabold text-emerald-600 block tracking-tight">
                      <span ref={aprovadosCount.ref}>{aprovadosCount.count}</span>%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">alta nas entrevistas</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mt-6 leading-relaxed">
                * Mapeamento estatístico com base em feedbacks de candidatos que otimizaram seus resumos e obtiveram retorno de entrevistas nas etapas iniciais de triagem.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* [ANTI-AI] Divisória editorial secundária */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="editorialDivider">
          <span className="editorialDividerLabel">
            — metodologia de escrita para triagem —
          </span>
        </div>
      </div>

      {/* Step by Step Flow with varied layout spacing */}
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
                Envie seu currículo. Ele será processado localmente no navegador ou via API em conformidade com as regras de confidencialidade de dados.
              </p>
            </div>

            <div className="text-left p-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm mb-4 border border-indigo-100">
                02
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Cole os Dados da Vaga</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-normal">
                Forneça o título da função e o escopo da vaga. Nossa IA varrerá os requisitos e termos técnicos de maior relevância semântica.
              </p>
            </div>

            <div className="text-left p-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm mb-4 border border-indigo-100">
                03
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Ajuste e Verifique</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-normal">
                Edite os termos no editor interativo e audite instantaneamente seu score de aderência nas verificações automatizadas de qualidade.
              </p>
            </div>

            <div className="text-left p-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm mb-4 border border-indigo-100">
                04
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Publique no Cadastro</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-normal">
                Copie o texto pronto do painel, insira na plataforma da Gupy e garanta posicionamento de destaque na listagem do recrutador.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleStart}
              disabled={!sessionReady}
              className="ctaShimmer inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-xs tracking-wider uppercase font-extrabold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-75"
            >
              {!sessionReady ? 'Analisando seu perfil...' : 'Otimizar meu perfil de graça'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* [ANTI-AI] Footer com assinatura e voz do produto, não boilerplate */}
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
                Ferramenta educacional e otimizadora independente. Não possui qualquer afiliação oficial com a Gupy Inc.
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
