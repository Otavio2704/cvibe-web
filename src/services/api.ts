// Centralized API communication for Gupify Web
// Uses VITE_API_BASE_URL and credentials: 'include' as required by the docs.
// Includes an automatic fallback to local simulation if the backend is offline/unreachable.

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://gupify.onrender.com';

// State to track whether we are currently falling back to mock mode
let useMock = false;
let onMockStateChange: ((val: boolean) => void) | null = null;

export const setMockStateListener = (callback: (val: boolean) => void) => {
  onMockStateChange = callback;
};

export const isUsingMock = () => useMock;

// Simple helper to trigger mock mode state change
const triggerMockMode = () => {
  if (!useMock) {
    useMock = true;
    console.warn(`[Gupify API] Conexão com ${API_BASE_URL} falhou. Ativando Modo Simulador Local (localStorage) para fins de demonstração.`);
    if (onMockStateChange) onMockStateChange(true);
  }
};

// Interceptor for fetch that falls back to Mock logic if server is offline
const apiFetch = async (path: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json', 
        ...options.headers 
      }
    });
    
    // If we succeeded, ensure mock mode is false
    if (useMock) {
      useMock = false;
      if (onMockStateChange) onMockStateChange(false);
    }
    
    return response;
  } catch (error) {
    triggerMockMode();
    throw error;
  }
};

// --- SIMULATION DATABASE (localStorage) ---
const getLocalData = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocalData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize default mock data if empty
const initMockDB = () => {
  if (!localStorage.getItem('gupify_mock_cvs')) {
    setLocalData('gupify_mock_cvs', [
      { 
        id: 'cv-1', 
        name: 'Curriculo_Frontend_React.pdf', 
        content: 'Desenvolvedor Frontend com 3 anos de experiência em React, Tailwind CSS e TypeScript. Experiência em desenvolvimento de dashboards interativos e otimização de performance.',
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() 
      },
      { 
        id: 'cv-2', 
        name: 'Curriculo_Fullstack_Pleno.docx', 
        content: 'Desenvolvedor Full Stack especializado em Node.js, Express, PostgreSQL e React. Habilidade em criar APIs seguras, integração de microsserviços e liderança técnica de projetos ágeis.',
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString() 
      }
    ]);
  }

  if (!localStorage.getItem('gupify_mock_reports')) {
    setLocalData('gupify_mock_reports', [
      {
        id: 'rep-1',
        cvId: 'cv-1',
        cvName: 'Curriculo_Frontend_React.pdf',
        jobTitle: 'Desenvolvedor React Pleno',
        jobContent: 'Procuramos pessoa desenvolvedora React com forte conhecimento em Tailwind CSS e criação de interfaces responsivas. Diferencial: conhecimento de Next.js e TypeScript.',
        summary: 'Como Desenvolvedor Frontend especialista em React e Tailwind CSS, desenvolvi e implementei interfaces web responsivas e de alta fidelidade visual. Tenho sólida experiência no ecossistema moderno do React, integrando APIs RESTful eficientemente e otimizando a performance de aplicações SPA. Criei soluções que reduziram o tempo de carregamento em 30% e liderei a migração de sistemas legados. Meu foco é entregar códigos limpos, escaláveis e com ótima experiência do usuário.',
        keywords: ['React', 'Tailwind CSS', 'Performance'],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        versions: [
          {
            version: 1,
            summary: 'Como Desenvolvedor Frontend especialista em React e Tailwind CSS, desenvolvi e implementei interfaces web responsivas e de alta fidelidade visual. Tenho sólida experiência no ecossistema moderno do React, integrando APIs RESTful eficientemente e otimizando a performance de aplicações SPA. Criei soluções que reduziram o tempo de carregamento em 30% e liderei a migração de sistemas legados. Meu foco é entregar códigos limpos, escaláveis e com ótima experiência do usuário.',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
          }
        ]
      }
    ]);
  }
};

initMockDB();

// Simulated AI generation engine to generate summaries and perform checklist logic
const simulateAIGeneration = (cvText: string, jobTitle: string, jobContent: string) => {
  const sampleKeywords = ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git', 'API REST', 'Scrum', 'Figma', 'AWS', 'Docker', 'PostgreSQL', 'SQL'];
  
  const words = (jobTitle + ' ' + jobContent).toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').split(/\s+/);
  
  const matchedKeywords = sampleKeywords.filter(kw => 
    words.includes(kw.toLowerCase()) || 
    jobTitle.toLowerCase().includes(kw.toLowerCase()) ||
    jobContent.toLowerCase().includes(kw.toLowerCase())
  );
  
  while (matchedKeywords.length < 3) {
    const defaultKws = ['Metodologias Ágeis', 'Resolução de Problemas', 'Arquitetura de Softwares', 'Boas Práticas'];
    const nextKw = defaultKws.find(k => !matchedKeywords.includes(k));
    matchedKeywords.push(nextKw || 'Clean Code');
  }
  
  const selectedKeywords = matchedKeywords.slice(0, 3);

  let candidateName = "Profissional Técnico";
  if (cvText.toLowerCase().includes("desenvolvedor")) {
    candidateName = "Desenvolvedor";
  }

  const summaryTemplates = [
    `Como ${candidateName} especializado em ${jobTitle}, desenvolvi e criei soluções robustas focadas em alto desempenho e escalabilidade. Com ampla experiência prática na utilização de ${selectedKeywords.join(', ')} e tecnologias correlatas, liderei a arquitetura e implementação de novos módulos de sistemas altamente dinâmicos. Minha trajetória inclui a otimização de processos de entrega contínua e a colaboração ativa em equipes multidisciplinares sob metodologias ágeis. Implementei rotinas automatizadas que aumentaram a cobertura de testes e garantiram a qualidade do código entregue. Estou totalmente preparado para aplicar minhas habilidades técnicas e analíticas para agregar valor imediato aos desafios de engenharia e negócios da equipe, superando as metas de entrega com foco em eficiência.`,
    
    `Com sólida experiência na área de tecnologia e atuação direta como ${candidateName}, atuei na linha de frente na implementação de sistemas modernos focados na experiência do usuário e eficiência de dados. Utilizando intensamente ferramentas como ${selectedKeywords.join(' e ')}, estruturei novos fluxos de trabalho e criei componentes reutilizáveis que aceleraram o tempo de desenvolvimento interno em mais de 25%. Desenvolvi integrações complexas de APIs e atuei ativamente na resolução de gargalos de performance técnica. Meu trabalho é pautado pela escrita de código limpo, documentação precisa e colaboração contínua. Busco integrar a equipe trazendo sólida proficiência técnica e capacidade de traduzir requisitos complexos de negócios em soluções tecnológicas robustas e sustentáveis.`,
    
    `Atuando há anos no setor como ${candidateName}, especializei-me na criação de soluções escaláveis e arquitetura moderna de software. Tenho ampla experiência no desenvolvimento ponta a ponta com foco em ${selectedKeywords.join(', ')}. Desenvolvi interfaces altamente responsivas e implementei APIs seguras e rápidas que garantiram excelente performance operacional. Liderei iniciativas de refatoração que simplificaram a manutenção do código e reduziram custos de infraestrutura. Trabalho com foco em metodologias ágeis, garantindo entregas frequentes e alinhadas com as expectativas do cliente. Estou entusiasmado para trazer este histórico de inovação prática, domínio técnico e orientação a resultados para impulsionar os novos projetos da empresa.`
  ];

  const templateIndex = jobTitle.length % summaryTemplates.length;
  const summary = summaryTemplates[templateIndex];

  return {
    summary,
    keywords: selectedKeywords
  };
};

// --- EXPORTED API CALLS ---

export const session = {
  init: async () => {
    try {
      const res = await apiFetch('/api/session', { method: 'POST' });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      return { success: true, message: "Session initialized (Simulated)", sessionId: "mock-sess-xyz" };
    }
  },
  
  check: async () => {
    try {
      const res = await apiFetch('/api/session');
      return await res.json();
    } catch (err) {
      triggerMockMode();
      return { valid: true, sessionId: "mock-sess-xyz" };
    }
  },
  
  destroy: async () => {
    try {
      const res = await apiFetch('/api/session', { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      return { success: true, message: "Session destroyed (Simulated)" };
    }
  }
};

export const cv = {
  upload: async (formData: FormData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cv/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      return await res.json();
    } catch (err) {
      triggerMockMode();
      const file = formData.get('file') as File | null;
      const fileName = file ? file.name : 'Curriculo_Enviado.pdf';
      const fileContent = `Conteúdo simulado extraído do arquivo enviado (${fileName}). Candidato experiente com foco em desenvolvimento web, APIs, testes automatizados e tecnologias modernas de nuvem.`;
      
      const newCv = {
        id: 'cv-' + Math.random().toString(36).substring(2, 9),
        name: fileName,
        content: fileContent,
        uploadedAt: new Date().toISOString()
      };
      
      const cvs = getLocalData('gupify_mock_cvs', []);
      cvs.push(newCv);
      setLocalData('gupify_mock_cvs', cvs);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      return newCv;
    }
  },
  
  list: async () => {
    try {
      const res = await apiFetch('/api/cv');
      return await res.json();
    } catch (err) {
      triggerMockMode();
      return getLocalData('gupify_mock_cvs', []);
    }
  },
  
  remove: async (id: string) => {
    try {
      const res = await apiFetch(`/api/cv/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      let cvs = getLocalData('gupify_mock_cvs', []);
      cvs = cvs.filter((item: any) => item.id !== id);
      setLocalData('gupify_mock_cvs', cvs);
      return { success: true, message: "CV removed" };
    }
  }
};

export const generate = {
  run: async (body: { cvId: string; jobTitle: string; jobContent: string }) => {
    try {
      const res = await apiFetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      
      const cvs = getLocalData('gupify_mock_cvs', []);
      const selectedCv = cvs.find((c: any) => c.id === body.cvId) || (cvs.length > 0 ? cvs[0] : { content: "Currículo vazio" });
      
      const aiResult = simulateAIGeneration(selectedCv.content, body.jobTitle, body.jobContent);
      
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      return {
        success: true,
        summary: aiResult.summary,
        keywords: aiResult.keywords,
        cvId: body.cvId,
        cvName: selectedCv.name,
        jobTitle: body.jobTitle,
        jobContent: body.jobContent
      };
    }
  }
};

export const reports = {
  list: async () => {
    try {
      const res = await apiFetch('/api/reports');
      return await res.json();
    } catch (err) {
      triggerMockMode();
      return getLocalData('gupify_mock_reports', []);
    }
  },
  
  get: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`);
      return await res.json();
    } catch (err) {
      triggerMockMode();
      const reportsList = getLocalData('gupify_mock_reports', []);
      const report = reportsList.find((r: any) => r.id === id);
      if (!report) {
        throw new Error('Report not found');
      }
      return report;
    }
  },
  
  update: async (id: string, body: { summary: string }) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      const reportsList = getLocalData('gupify_mock_reports', []);
      const index = reportsList.findIndex((r: any) => r.id === id);
      if (index === -1) {
        throw new Error('Report not found');
      }
      
      const existingReport = reportsList[index];
      const updatedSummary = body.summary;
      const hasSummaryChanged = updatedSummary && updatedSummary !== existingReport.summary;
      
      const updatedReport = {
        ...existingReport,
        ...body,
        versions: hasSummaryChanged ? [
          ...(existingReport.versions || []),
          {
            version: (existingReport.versions?.length || 0) + 1,
            summary: updatedSummary,
            createdAt: new Date().toISOString()
          }
        ] : (existingReport.versions || [
          {
            version: 1,
            summary: existingReport.summary,
            createdAt: existingReport.createdAt || new Date().toISOString()
          }
        ])
      };
      
      reportsList[index] = updatedReport;
      setLocalData('gupify_mock_reports', reportsList);
      return updatedReport;
    }
  },
  
  create: async (body: { cvId: string; cvName?: string; jobTitle: string; jobContent: string; summary: string; keywords?: string[] }) => {
    try {
      const res = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      const reportsList = getLocalData('gupify_mock_reports', []);
      
      const newReport = {
        id: 'rep-' + Math.random().toString(36).substring(2, 9),
        cvId: body.cvId,
        cvName: body.cvName || 'Currículo Selecionado',
        jobTitle: body.jobTitle,
        jobContent: body.jobContent,
        summary: body.summary,
        keywords: body.keywords || [],
        createdAt: new Date().toISOString(),
        versions: [
          {
            version: 1,
            summary: body.summary,
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      reportsList.push(newReport);
      setLocalData('gupify_mock_reports', reportsList);
      return newReport;
    }
  },
  
  regenerate: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}/regenerate`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      const reportsList = getLocalData('gupify_mock_reports', []);
      const index = reportsList.findIndex((r: any) => r.id === id);
      if (index === -1) {
        throw new Error('Report not found');
      }
      
      const report = reportsList[index];
      const cvs = getLocalData('gupify_mock_cvs', []);
      const selectedCv = cvs.find((c: any) => c.id === report.cvId) || { content: "Currículo de suporte para regeneração" };
      
      const aiResult = simulateAIGeneration(selectedCv.content, report.jobTitle, report.jobContent);
      const newSummary = `[Regerado em ${new Date().toLocaleTimeString()}] ` + aiResult.summary.substring(0, 1300);
      
      const updatedReport = {
        ...report,
        summary: newSummary,
        keywords: aiResult.keywords,
        versions: [
          ...(report.versions || []),
          {
            version: (report.versions?.length || 0) + 1,
            summary: newSummary,
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      reportsList[index] = updatedReport;
      setLocalData('gupify_mock_reports', reportsList);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return updatedReport;
    }
  },
  
  remove: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      let reportsList = getLocalData('gupify_mock_reports', []);
      reportsList = reportsList.filter((r: any) => r.id !== id);
      setLocalData('gupify_mock_reports', reportsList);
      return { success: true, message: "Report removed" };
    }
  }
};
