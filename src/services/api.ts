const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://gupify.onrender.com';

let useMock = false;
let onMockStateChange: ((val: boolean) => void) | null = null;
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

const normalizeReport = (report: any) => ({
  ...report,
  id: report.id || report.reportId,
  jobTitle: report.jobDescriptionTitle || report.jobTitle || 'Vaga Alvo',
  jobContent: report.jobDescriptionContent || report.jobContent || '',
  cvName: report.cvName || report.cvFileName || 'Currículo Selecionado',
  createdAt: report.createdAt || report.generatedAt || new Date().toISOString(),
  updatedAt: report.updatedAt || report.lastUpdatedAt || report.createdAt || report.generatedAt || new Date().toISOString(),
  versions: Array.isArray(report.versions)
    ? report.versions.map((version: any, index: number) => ({
        ...version,
        version: version.version || index + 1,
        createdAt: version.createdAt || version.updatedAt || report.updatedAt || report.createdAt,
        updatedAt: version.updatedAt || version.createdAt || report.updatedAt || report.createdAt,
      }))
    : [],
});

const apiFetch = async (path: string, options: RequestInit = {}) => {
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

const simulateAIGeneration = (cvText: string, jobTitle: string, jobContent: string, previousVersionsCount = 0) => {
  const sampleKeywords = ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git', 'API REST', 'Scrum', 'SQL', 'Docker', 'Spring Boot', 'Java'];
  const words = (jobTitle + ' ' + jobContent)
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .split(/\s+/);

  const matchedKeywords = sampleKeywords.filter(
    (kw) => words.includes(kw.toLowerCase()) || jobTitle.toLowerCase().includes(kw.toLowerCase()),
  );

  while (matchedKeywords.length < 3) {
    const defaultKws = ['Metodologias Ágeis', 'Resolução de Problemas', 'Clean Code'];
    const nextKw = defaultKws.find((k) => !matchedKeywords.includes(k));
    matchedKeywords.push(nextKw || 'Boas Práticas');
  }

  const selectedKeywords = matchedKeywords.slice(0, 3);
  const summary = previousVersionsCount > 0
    ? `Na versão ${previousVersionsCount + 1} para ${jobTitle}, destaquei entregas com foco em resultados mensuráveis, aderência ao ATS e experiência prática com ${selectedKeywords.join(', ')}, conectando sua trajetória às exigências centrais da vaga.`
    : `Como profissional especializado em ${jobTitle}, desenvolvi e criei soluções focadas em alto desempenho. Com ampla experiência prática na utilização de ${selectedKeywords.join(', ')}, liderei a arquitetura e implementação de módulos dinâmicos alinhados aos objetivos estratégicos da empresa.`;

  return { summary, keywords: selectedKeywords };
};

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      return {
        reportId: data.reportId,
        id: data.reportId,
        summary: data.summary,
        keywords: data.keywords,
        fromCache: data.fromCache,
        cvId: body.cvId,
        jobTitle: body.jobTitle,
        jobContent: body.jobContent,
      };
    } catch (err) {
      triggerMockMode();
      const cvs = getLocalData('gupify_mock_cvs', []);
      const selectedCv = cvs.find((c: any) => c.id === body.cvId) || { content: 'vazio', name: 'Curriculo.pdf' };
      const aiResult = simulateAIGeneration(selectedCv.content, body.jobTitle, body.jobContent);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockId = 'rep-' + Math.random().toString(36).substring(2, 9);
      const now = new Date().toISOString();
      const mockReport = normalizeReport({
        id: mockId,
        cvId: body.cvId,
        cvName: selectedCv.name,
        jobTitle: body.jobTitle,
        jobContent: body.jobContent,
        summary: aiResult.summary,
        keywords: aiResult.keywords,
        createdAt: now,
        updatedAt: now,
        versions: [
          {
            version: 1,
            summary: aiResult.summary,
            createdAt: now,
            updatedAt: now,
          },
        ],
      });
      const reports = getLocalData('gupify_mock_reports', []);
      reports.unshift(mockReport);
      setLocalData('gupify_mock_reports', reports);
      return {
        reportId: mockId,
        id: mockId,
        summary: aiResult.summary,
        keywords: aiResult.keywords,
        fromCache: false,
        cvId: body.cvId,
        cvName: selectedCv.name,
        jobTitle: body.jobTitle,
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
      return (list || []).map(normalizeReport);
    } catch (err) {
      triggerMockMode();
      return getLocalData('gupify_mock_reports', []).map(normalizeReport);
    }
  },

  get: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`);
      const r = await res.json();
      const normalized = normalizeReport(r);
      const localList = getLocalData('gupify_mock_reports', []);
      const localFound = localList.find((item: any) => item.id === id);

      if (localFound) {
        return normalizeReport({
          ...localFound,
          ...normalized,
          jobTitle: normalized.jobTitle || localFound.jobTitle,
          jobContent: normalized.jobContent || localFound.jobContent,
          cvName: normalized.cvName || localFound.cvName,
          versions: normalized.versions?.length ? normalized.versions : localFound.versions,
        });
      }

      return normalized;
    } catch (err) {
      triggerMockMode();
      const list = getLocalData('gupify_mock_reports', []);
      const found = list.find((r: any) => r.id === id);
      if (!found) throw new Error('Não encontrado');
      return normalizeReport(found);
    }
  },

  update: async (id: string, body: { summary: string }) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      const normalized = normalizeReport(updated);

      if (normalized.jobTitle && normalized.jobContent && normalized.versions?.length) {
        return normalized;
      }

      const localList = getLocalData('gupify_mock_reports', []);
      const localFound = localList.find((r: any) => r.id === id);
      if (localFound) {
        return normalizeReport({ ...localFound, ...normalized });
      }

      return normalized;
    } catch (err) {
      triggerMockMode();
      const list = getLocalData('gupify_mock_reports', []);
      const index = list.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        const now = new Date().toISOString();
        const current = normalizeReport(list[index]);
        const versions = current.versions?.length
          ? [...current.versions]
          : [{ version: 1, summary: current.summary, createdAt: current.createdAt, updatedAt: current.updatedAt }];

        const lastVersion = versions[versions.length - 1];
        if (lastVersion?.summary !== body.summary) {
          versions.push({
            version: versions.length + 1,
            summary: body.summary,
            createdAt: now,
            updatedAt: now,
          });
        }

        list[index] = normalizeReport({
          ...current,
          ...body,
          updatedAt: now,
          versions,
        });
        setLocalData('gupify_mock_reports', list);
        return list[index];
      }
      throw new Error('Não encontrado');
    }
  },

  regenerate: async (id: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}/regenerate`, { method: 'POST' });
      const regenerated = await res.json();
      const normalized = normalizeReport(regenerated);

      const localList = getLocalData('gupify_mock_reports', []);
      const localIndex = localList.findIndex((r: any) => r.id === id);

      if (localIndex !== -1) {
        const localCurrent = normalizeReport(localList[localIndex]);
        const mergedVersions = normalized.versions?.length ? normalized.versions : localCurrent.versions;
        const mergedReport = normalizeReport({
          ...localCurrent,
          ...normalized,
          jobTitle: normalized.jobTitle || localCurrent.jobTitle,
          jobContent: normalized.jobContent || localCurrent.jobContent,
          cvName: normalized.cvName || localCurrent.cvName,
          versions: mergedVersions,
        });
        localList[localIndex] = mergedReport;
        setLocalData('gupify_mock_reports', localList);
        return mergedReport;
      }

      return normalized;
    } catch (err) {
      triggerMockMode();
      const list = getLocalData('gupify_mock_reports', []);
      const index = list.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        const current = normalizeReport(list[index]);
        const aiResult = simulateAIGeneration('', current.jobTitle, current.jobContent, current.versions?.length || 0);
        const now = new Date().toISOString();
        const versions = current.versions?.length
          ? [...current.versions]
          : [{ version: 1, summary: current.summary, createdAt: current.createdAt, updatedAt: current.updatedAt }];

        versions.push({
          version: versions.length + 1,
          summary: aiResult.summary,
          createdAt: now,
          updatedAt: now,
        });

        list[index] = normalizeReport({
          ...current,
          summary: aiResult.summary,
          keywords: aiResult.keywords,
          updatedAt: now,
          versions,
        });
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

