import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  AlertOctagon, 
  Compass, 
  ArrowRight, 
  Award
} from 'lucide-react';

export default function Guia() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Banner / Hero */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-20 -translate-y-20"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guia de Sobrevivência para Candidatos</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
            Desvendando o Robô da Gupy
          </h1>
          
          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed mb-8">
            Compreender como a inteligência artificial analisa o seu perfil é a chave para deixar de ser descartado e começar a ser chamado para entrevistas.
          </p>

          <button
            onClick={() => navigate('/generate')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            Começar Otimização do Currículo
            <ArrowRight className="w-4 h-4 text-indigo-950" />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-gray-50 rounded-2xl p-5 border border-gray-200/50 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sumário do Guia
            </h3>
            <nav className="flex flex-col gap-2 text-xs">
              <a href="#como-funciona" className="py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-950 transition-all font-semibold block">
                1. Como a Gupy pensa?
              </a>
              <a href="#campos-peso" className="py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-950 transition-all font-semibold block">
                2. Os campos de maior peso
              </a>
              <a href="#erros-criticos" className="py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-950 transition-all font-semibold block">
                3. 5 Erros que rebaixam score
              </a>
              <a href="#dicas-ouro" className="py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-950 transition-all font-semibold block">
                4. Dicas de Ouro
              </a>
            </nav>
            
            <div className="pt-4 border-t border-gray-200">
              <span className="text-[10px] text-gray-400 block font-medium">
                Precisa otimizar agora?
              </span>
              <p className="text-xs text-gray-500 mt-1 mb-3 font-normal leading-relaxed">
                Nossa IA faz a formatação estrutural e de termos chave automaticamente.
              </p>
              <button
                onClick={() => navigate('/generate')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors"
              >
                Otimizar de Graça
              </button>
            </div>
          </div>
        </div>

        {/* Reading Body */}
        <div className="lg:col-span-3 space-y-12 leading-relaxed text-gray-600">
          
          {/* Section 1 */}
          <section id="como-funciona" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
              <Compass className="w-6 h-6 text-indigo-600 shrink-0" />
              1. Como o Algoritmo da Gupy de fato funciona?
            </h2>
            <p className="mb-4">
              Diferente dos processos seletivos analógicos, onde o recrutador folheia cada folha de papel, a Gupy utiliza uma <span className="font-semibold text-gray-950">Inteligência Artificial Semântica</span> de triagem e ordenação (apelidada internamente de Gaia).
            </p>
            <p className="mb-4">
              O sistema não faz apenas buscas literais por palavras. Ele tenta compreender o contexto das frases e dos cargos. Ele funciona calculando um <span className="font-semibold text-gray-950">índice de similaridade de cosseno</span> entre dois grandes blocos de texto:
            </p>
            <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl my-5 text-sm">
              <span className="font-bold text-indigo-950 block mb-1">A Fórmula da Similaridade</span>
              O algoritmo vetoriza todas as palavras descritas na <span className="font-semibold text-indigo-800">Vaga Alvo</span> e faz o mesmo com os textos preenchidos no seu <span className="font-semibold text-indigo-800">Perfil de Candidato</span>. Quanto maior a sobreposição contextual e densidade de palavras-chave correlatas, maior o seu Score Geral, empurrando você para as primeiras posições da lista que o recrutador visualiza.
            </div>
            <p>
              Candidatos com scores baixos são relegados ao final de uma lista de centenas de inscritos. Na prática, recrutadores humanos costumam olhar apenas os primeiros <span className="font-semibold text-gray-900">10% a 15% ranqueados</span>. Portanto, vencer o filtro inicial é indispensável para ter qualquer chance.
            </p>
          </section>

          {/* Section 2 */}
          <section id="campos-peso" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
              <Target className="w-6 h-6 text-indigo-600 shrink-0" />
              2. Os Campos de Maior Peso no Ranqueamento
            </h2>
            <p className="mb-4">
              Nem todas as caixas de texto no formulário da Gupy possuem o mesmo valor para a IA. Três seções principais concentram cerca de 80% do peso do score algorítmico de triagem:
            </p>

            <div className="space-y-4 my-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm shrink-0">
                  01
                </div>
                <div>
                  <h4 className="font-bold text-gray-950">O Resumo &quot;Sobre você&quot;</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    É a porta de entrada da triagem semântica. Esse campo de texto corrido aceita até 1.500 caracteres e é intensamente lido pela IA. Ele deve reunir seus anos de experiência, conquistas, o cargo principal e as palavras-chave vitais do nicho em poucas linhas.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm shrink-0">
                  02
                </div>
                <div>
                  <h4 className="font-bold text-gray-950">Descrição de Experiências Profissionais</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Cada cargo anterior preenchido deve conter uma descrição detalhada de atividades, ferramentas e conquistas, e não apenas o título da função. A IA cruza estas descrições anteriores com a descrição da nova vaga.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm shrink-0">
                  03
                </div>
                <div>
                  <h4 className="font-bold text-gray-950">Habilidades / Tags Técnicas</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    A seção onde você escolhe tags pré-definidas (ex: React, Node.js, Metodologias Ágeis) funciona como um filtro indexador complementar direto. Garanta que as habilidades pedidas na vaga estejam selecionadas no seu cadastro.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="erros-criticos" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
              <AlertOctagon className="w-6 h-6 text-indigo-600 shrink-0" />
              3. 5 Erros Críticos que Destroem o seu Score
            </h2>
            <p className="mb-4">
              Muitos candidatos competentes cometem falhas na formatação que fazem o algoritmo classificar seu perfil como de baixa compatibilidade:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs">
                <span className="font-bold text-rose-700 shrink-0">Erro 1:</span>
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-950">Resumo muito curto (Ex: &quot;Buscando novos desafios&quot;)</span>. Textos curtíssimos dão pouca matéria-prima para a IA processar a similaridade semântica. Mantenha o resumo acima de 800 caracteres.
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs">
                <span className="font-bold text-rose-700 shrink-0">Erro 2:</span>
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-950">Usar clichês desgastados</span>. Termos genéricos como &quot;profissional proativo, focado, dedicado, motivado, que pensa fora da caixa&quot; não possuem valor semântico diferenciado na IA. Substitua-os por realizações e metodologias reais (ex: &quot;desenvolvi interfaces&quot;, &quot;liderei equipes ágeis&quot;).
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs">
                <span className="font-bold text-rose-700 shrink-0">Erro 3:</span>
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-950">Enviar currículos diagramados em formato de imagem</span>. Se você criar o currículo no Canva e salvá-lo como imagem (ou se o PDF exportado não permitir a seleção de texto por ser rasterizado), os algoritmos de leitura OCR da Gupy podem falhar ao indexá-lo. Use sempre PDFs exportados como texto pesquisável.
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs">
                <span className="font-bold text-rose-700 shrink-0">Erro 4:</span>
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-950">Divergência de Cargo Alvo</span>. Se você está concorrendo a uma vaga de &quot;Desenvolvedor React&quot; mas o título principal no seu currículo e perfil está como &quot;Suporte Técnico&quot; ou apenas &quot;Estudante de Engenharia&quot;, seu peso semântico cai abruptamente. Alinhe seu título profissional ao da vaga.
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs">
                <span className="font-bold text-rose-700 shrink-0">Erro 5:</span>
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-950">Ignorar os Testes Comportamentais / Culturais</span>. Embora a triagem de currículos seja crucial, a pontuação de fit cultural ou testes específicos compõe a nota final. Não responder a estes testes ou fazê-los com desatenção impede sua evolução de etapa.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="dicas-ouro" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
              <Award className="w-6 h-6 text-indigo-600 shrink-0" />
              4. Dicas de Ouro para Subir no Ranking da Gupy
            </h2>
            <p className="mb-4">
              Siga estes passos recomendados por especialistas em recrutamento técnico para obter notas elevadas:
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Integre Verbos de Ação Fortes</h5>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Escreva na primeira pessoa do singular no passado: &quot;Desenvolvi&quot;, &quot;Implementei&quot;, &quot;Criei&quot;, &quot;Liderei&quot;, &quot;Estruturei&quot;. Isso indica protagonismo e propriedade técnica nas suas entregas passadas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Use Palavras-Chave de Forma Orgânica</h5>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Não faça apenas um &quot;keyword stuffing&quot; (uma lista desconexa de palavras). O algoritmo semântico pontua melhor palavras integradas a frases fluidas, ex: &quot;Utilizei a biblioteca Tailwind CSS para garantir design responsivo...&quot;.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Calibre o Limite de Tamanho</h5>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Resumos ideais no algoritmo de contagem da Gupy possuem entre <span className="font-semibold text-gray-950">900 e 1.300 caracteres</span>. É o tamanho perfeito para dar robustez à IA e prender a atenção do recrutador em menos de 1 minuto de leitura física.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Box */}
          <div className="p-6 sm:p-8 bg-indigo-50 border border-indigo-100 rounded-3xl text-center space-y-4">
            <h3 className="text-lg font-bold text-indigo-950">
              Pronto para aplicar a teoria na prática?
            </h3>
            <p className="text-sm text-indigo-900 max-w-lg mx-auto">
              Nossa ferramenta de otimização foi desenhada exatamente com base nestas regras de ranqueamento de IA. Crie seu resumo otimizado agora em menos de 2 minutos.
            </p>
            <button
              onClick={() => navigate('/generate')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              Começar Otimização Inteligente
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
