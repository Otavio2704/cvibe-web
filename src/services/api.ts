// Centralized API communication for Gupify Web
// Uses VITE_API_BASE_URL and credentials: 'include' as required by the docs.
// Includes an automatic fallback to local simulation if the backend is offline/unreachable.

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://gupify.onrender.com';

let useMock = false;
let onMockStateChange: ((val: boolean) => void) | null = null;

// Guarda a Promise de inicialização de sessão para que nenhuma chamada
// autenticada seja disparada antes de o cookie estar disponível.
let sessionInitPromise: Promise<any> | null = null;

export const setMockStateListener = (callback: (val: boolean) => void) => {
  onMockStateChange = callback;
};

export const isUsingMock = () => useMock;

const triggerMockMode = () => {
  if (!useMock) {
    useMock = true;
    console.warn(`[Gupify API] Conexão com ${API_BASE_URL} falhou. Ativando Modo Simulador Local (localStorage) para fins de demonstração.`);
    if (onMockStateChange) onMockStateChange(true);
  }
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  // Garante que a sessão foi inicializada antes de qualquer chamada autenticada.
  const isPublicRoute = path === '/api/session' && (!options.method || options.method === 'POST');
  if (!isPublicRoute && sessionInitPromise) {
    await sessionInitPromise;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // 401/403: tenta renovar a sessão uma vez antes de ativar o mock.
    // Evita que uma sessão expirada derrube o app inteiro desnecessariamente.
    if (response.status === 401 || response.status === 403) {
      if (!isPublicRoute) {
        try {
          await session.init();
          const retry = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });
          if (retry.ok) return retry;
        } catch {
          // retry falhou — cai no mock abaixo
        }
      }
      triggerMockMode();
      throw new Error(`Auth error: ${response.status}`);
    }

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

const initMockDB = () => {
  if (!localStorage.getItem('gupify_mock_cvs')) {
    setLocalData('gupify_mock_cvs', [
      {
        id: 'cv-1',
        name: 'Curriculo_Frontend_React.pdf',
        content: 'Desenvolvedor Frontend com 3 anos de experiência em React, Tailwind CSS e TypeScript.',
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
    ]);
  }
  if (!localStorage.getItem('gupify_mock_reports')) {
    setLocalData('gupify_mock_reports', []);
  }
};

initMockDB();

const simulateAIGeneration = (cvText: string, jobTitle: string, jobContent: string) => {
  const sampleKeywords = ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git', 'API REST', 'Scrum', 'SQL', 'Docker', 'Spring Boot', 'Java'];
  const words = (jobTitle + ' ' + jobContent)
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .split(/\s+/);

  const matchedKeywords = sampleKeywords.filter(
    kw => words.includes(kw.toLowerCase()) || jobTitle.toLowerCase().includes(kw.toLowerCase()),
  );

  while (matchedKeywords.length < 3) {
    const defaultKws = ['Metodologias Ágeis', 'Resolução de Problemas', 'Clean Code'];
    const nextKw = defaultKws.find(k => !matchedKeywords.includes(k));
    matchedKeywords.push(nextKw || 'Boas Práticas');
  }

  const selectedKeywords = matchedKeywords.slice(0, 3);
  const summary = `Como profissional especializado em ${jobTitle}, desenvolvi e criei soluções focadas em alto desempenho. Com ampla experiência prática na utilização de ${selectedKeywords.join(', ')}, liderei a arquitetura e implementação de módulos dinâmicos alinhados aos objetivos estratégicos da empresa.`;

  return { summary, keywords: selectedKeywords };
};

// --- EXPORTED API CALLS ---

export const session = {
  init: async () => {
    sessionInitPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/session`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        return await res.json();
      } catch (err) {
        triggerMockMode();
        return { success: true, sessionId: 'mock-sess-xyz' };
      }
    })();

    return sessionInitPromise;
  },

  check: async () => {
    try {
      const res = await apiFetch('/api/session');
      return await res.json();
    } catch (err) {
      triggerMockMode();
      return { valid: true, sessionId: 'mock-sess-xyz' };
    }
  },

  destroy: async () => {
    try {
      await apiFetch('/api/session', { method: 'DELETE' });
      return { success: true };
    } catch (err) {
      triggerMockMode();
      return { success: true };
    }
  },
};

export const cv = {
  upload: async (formData: FormData) => {
    if (sessionInitPromise) await sessionInitPromise;

    try {
      const res = await fetch(`${API_BASE_URL}/api/cv/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      return {
        ...data,
        name: data.fileName || data.name,
        uploadedAt: data.createdAt || data.uploadedAt,
      };
    } catch (err) {
      triggerMockMode();
      const file = formData.get('file') as File | null;
      const fileName = file ? file.name : 'Curriculo_Enviado.pdf';
      const newCv = {
        id: 'cv-' + Math.random().toString(36).substring(2, 9),
        name: fileName,
        content: `Conteúdo simulado extraído de ${fileName}.`,
        uploadedAt: new Date().toISOString(),
      };
      const cvs = getLocalData('gupify_mock_cvs', []);
      cvs.push(newCv);
      setLocalData('gupify_mock_cvs', cvs);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newCv;
    }
  },

  list: async () => {
    try {
      const res = await apiFetch('/api/cv');
      const list = await res.json();
      return (list || []).map((item: any) => ({
        ...item,
        name: item.fileName || item.name,
        uploadedAt: item.createdAt || item.uploadedAt,
      }));
    } catch (err) {
      triggerMockMode();
      return getLocalData('gupify_mock_cvs', []);
    }
  },

  remove: async (id: string) => {
    try {
      const res = await apiFetch(`/api/cv/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      return { success: true };
    } catch (err) {
      triggerMockMode();
      let cvs = getLocalData('gupify_mock_cvs', []);
      cvs = cvs.filter((item: any) => item.id !== id);
      setLocalData('gupify_mock_cvs', cvs);
      return { success: true };
    }
  },
};

export const generate = {
  run: async (body: { cvId: string; jobTitle: string; jobContent: string }) => {
    try {
      const res = await apiFetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
      const data = await res.json();
      // Backend retorna: { reportId, summary, keywords, fromCache }
      // Normalizamos para que o frontend sempre tenha reportId e id preenchidos.
      return {
        reportId:   data.reportId,
        id:         data.reportId,
        summary:    data.summary,
        keywords:   data.keywords,
        fromCache:  data.fromCache,
        cvId:       body.cvId,
        jobTitle:   body.jobTitle,
        jobContent: body.jobContent,
      };
    } catch (err) {
      triggerMockMode();
      const cvs = getLocalData('gupify_mock_cvs', []);
      const selectedCv = cvs.find((c: any) => c.id === body.cvId) || { content: 'vazio', name: 'Curriculo.pdf' };
      const aiResult = simulateAIGeneration(selectedCv.content, body.jobTitle, body.jobContent);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockId = 'rep-' + Math.random().toString(36).substring(2, 9);
      return {
        reportId:   mockId,
        id:         mockId,
        summary:    aiResult.summary,
        keywords:   aiResult.keywords,
        fromCache:  false,
        cvId:       body.cvId,
        cvName:     selectedCv.name,
        jobTitle:   body.jobTitle,
        jobContent: body.jobContent,
      };
    }
  },
};

export const reports = {
  list: async () => {
    try {
      const res = await apiFetch('/api/reports');
      const list = await res.json();
      return (list || []).map((r: any) => ({
        ...r,
        jobTitle:   r.jobDescriptionTitle   || r.jobTitle   || 'Vaga Alvo',
        jobContent: r.jobDescriptionContent || r.jobContent || '',
        cvName:     r.cvName                               || 'Currículo Selecionado',
      }));
    } catch (err) {
      triggerMockMode();
      return getLocalData('gupify_mock_reports', []);
    }
  },

  get: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`);
      const r = await res.json();
      return {
        ...r,
        jobTitle:   r.jobDescriptionTitle   || r.jobTitle   || 'Vaga Alvo',
        jobContent: r.jobDescriptionContent || r.jobContent || '',
        cvName:     r.cvName                               || 'Currículo Selecionado',
      };
    } catch (err) {
      triggerMockMode();
      const list = getLocalData('gupify_mock_reports', []);
      const found = list.find((r: any) => r.id === id);
      if (!found) throw new Error('Não encontrado');
      return found;
    }
  },

  // Atualiza o summary editado manualmente pelo usuário após a geração.
  // O relatório já é criado pelo backend durante o POST /api/generate,
  // por isso não existe mais um reports.create — só update.
  update: async (id: string, body: { summary: string }) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      const list = getLocalData('gupify_mock_reports', []);
      const index = list.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setLocalData('gupify_mock_reports', list);
        return list[index];
      }
      throw new Error('Não encontrado');
    }
  },

  regenerate: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}/regenerate`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      triggerMockMode();
      const list = getLocalData('gupify_mock_reports', []);
      const index = list.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        list[index].summary = `[Regerado] ${list[index].summary}`;
        setLocalData('gupify_mock_reports', list);
        return list[index];
      }
      throw new Error('Não encontrado');
    }
  },

  remove: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      return { success: true };
    } catch (err) {
      triggerMockMode();
      let list = getLocalData('gupify_mock_reports', []);
      list = list.filter((r: any) => r.id !== id);
      setLocalData('gupify_mock_reports', list);
      return { success: true };
    }
  },
};
