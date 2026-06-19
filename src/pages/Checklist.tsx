import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  RotateCcw, 
  Award, 
  User, 
  Briefcase, 
  FileCheck, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  items: ChecklistItem[];
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'perfil',
    title: 'Fase 1: Cadastro e Perfil Geral na Gupy',
    icon: User,
    color: 'indigo',
    items: [
      { id: 'p1', text: 'Título profissional alinhado ao cargo pretendido (ex: "Desenvolvedor Frontend React" em vez de "Profissional de Tecnologia")' },
      { id: 'p2', text: 'Resumo "Sobre você" otimizado pelo Gupify (comprimento entre 800 e 1400 caracteres)' },
      { id: 'p3', text: 'Contato atualizado (telefone, e-mail) e links para LinkedIn/GitHub inseridos' },
      { id: 'p4', text: 'Tags de habilidades técnicas (Competências) selecionadas batendo exatamente com os requisitos da vaga' },
      { id: 'p5', text: 'Preenchimento completo de pretensão salarial e áreas de interesse' }
    ]
  },
  {
    id: 'experiencias',
    title: 'Fase 2: Experiências Profissionais Detalhadas',
    icon: Briefcase,
    color: 'emerald',
    items: [
      { id: 'e1', text: 'Pelo menos 2 ou 3 experiências passadas cadastradas com datas consistentes' },
      { id: 'e2', text: 'Descrições das atividades contêm verbos de ação na primeira pessoa do singular ("desenvolvi", "liderei", "estruturei")' },
      { id: 'e3', text: 'Integração orgânica das palavras-chave da vaga no corpo das atividades descritas' },
      { id: 'e4', text: 'Inclusão de resultados quantificáveis e conquistas reais (ex: "redução de 30% no tempo de carregamento", "otimização de 15% em custos")' }
    ]
  },
  {
    id: 'anexo',
    title: 'Fase 3: O Currículo Anexo (PDF/Word)',
    icon: FileCheck,
    color: 'amber',
    items: [
      { id: 'a1', text: 'Arquivo de currículo gerado em PDF com texto pesquisável e selecionável (nunca salve como imagem/foto)' },
      { id: 'a2', text: 'Nome do arquivo PDF limpo e profissional (ex: "Curriculo_SeuNome_Desenvolvedor.pdf")' },
      { id: 'a3', text: 'Layout de coluna única simples e limpo (sistemas ATS leem melhor texto de cima para baixo, sem tabelas complexas ou barras laterais decoradas)' }
    ]
  },
  {
    id: 'testes',
    title: 'Fase 4: Testes de Perfil, Fit Cultural e Envio',
    icon: CheckCircle2,
    color: 'purple',
    items: [
      { id: 't1', text: 'Testes de perfil comportamental respondidos com calma, foco e honestidade técnica' },
      { id: 't2', text: 'Testes de conhecimentos específicos (lógica, inglês ou técnicos) feitos em local silencioso e sem interrupções' },
      { id: 't3', text: 'Questionários específicos criados pela empresa respondidos em detalhes, demonstrando interesse real pela vaga' }
    ]
  }
];

export default function Checklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gupify_checklist');
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Erro ao carregar checklist do localStorage", e);
    }
  }, []);

  // Handle checkbox toggle
  const handleToggle = (id: string) => {
    const updated = {
      ...checkedItems,
      [id]: !checkedItems[id]
    };
    
    // Remove the key if it's false to keep storage clean
    if (!updated[id]) {
      delete updated[id];
    }

    setCheckedItems(updated);
    localStorage.setItem('gupify_checklist', JSON.stringify(updated));
  };

  // Clear checklist
  const handleClear = () => {
    if (confirm("Tem certeza que deseja marcar todos os itens como pendentes? Isso limpará seus dados salvos localmente.")) {
      setCheckedItems({});
      localStorage.removeItem('gupify_checklist');
    }
  };

  // Calculate stats
  const allItems = CHECKLIST_SECTIONS.flatMap(section => section.items);
  const totalItemsCount = allItems.length;
  const completedCount = allItems.filter(item => checkedItems[item.id]).length;
  const percentage = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-7 h-7 text-indigo-600" />
              Checklist do Candidato
            </h1>
            <p className="text-sm text-gray-500 max-w-md">
              Acompanhe seu progresso de otimização em cada etapa. Marque as ações conforme for revisando seu perfil na Gupy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Progresso Geral</span>
              <span className="text-2xl font-black text-indigo-600">{completedCount} <span className="text-gray-400 font-medium text-sm">de {totalItemsCount}</span></span>
            </div>

            <div className="w-24 h-24 relative flex items-center justify-center">
              <div className="text-center">
                <span className="text-xl font-black text-indigo-700">{percentage}%</span>
                <span className="text-[9px] text-gray-400 block font-semibold">PRONTO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real progress bar */}
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mt-6">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Clear control */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Seu progresso é mantido automaticamente no seu navegador.
          </span>
          
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-100 hover:bg-red-50/20 transition-all"
            title="Reseta todas as caixas de seleção"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Checklist
          </button>
        </div>
      </div>

      {/* Main Checklist Sections */}
      <div className="space-y-6">
        {CHECKLIST_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const sectionCheckedCount = section.items.filter(item => checkedItems[item.id]).length;
          
          return (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              
              {/* Section Title */}
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <SectionIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-950">
                    {section.title}
                  </h3>
                </div>
                
                <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                  {sectionCheckedCount} / {section.items.length} concluídos
                </span>
              </div>

              {/* Section Items */}
              <div className="space-y-3">
                {section.items.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-100 bg-indigo-50/15 text-gray-700'
                          : 'border-gray-100 bg-white hover:bg-gray-50/50 hover:border-gray-200'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      <span className={`text-sm leading-relaxed font-normal ${
                        isChecked 
                          ? 'line-through text-gray-400 font-medium' 
                          : 'text-gray-700'
                      }`}>
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* Finishing Banner */}
      {percentage === 100 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl text-white text-center shadow-lg animate-bounce">
          <Award className="w-10 h-10 mx-auto mb-2" />
          <h3 className="text-lg font-black">Parabéns! Checklist Completo!</h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-md mx-auto">
            Você seguiu todas as boas práticas estruturais, contextuais e técnicas recomendadas para se destacar no ranqueamento da Gupy. Boa sorte no seu processo seletivo!
          </p>
        </div>
      )}

    </div>
  );
}
