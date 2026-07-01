export const CLICHES = ['proativo', 'dedicado', 'fora da caixa', 'perfeccionista', 'apaixonado', 'motivado'];
export const ACTION_VERBS = ['desenvolvi', 'implementei', 'criei', 'liderei', 'otimizei', 'gerenciei', 'estruturei', 'coordenei', 'construí'];

export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

export function computeAtsScore(summary: string, jobContent: string): number {
  if (!summary || summary.length < 10) return 0;

  const normalizedSummary = normalizeText(summary);
  const normalizedJob = normalizeText(jobContent || '');
  let score = 0;

  if (summary.length >= 800 && summary.length <= 1400) score += 25;
  else if (summary.length >= 500) score += 12;

  if (ACTION_VERBS.some((verb) => normalizedSummary.includes(normalizeText(verb)))) score += 25;
  if (!CLICHES.some((cliche) => normalizedSummary.includes(normalizeText(cliche)))) score += 25;

  if (jobContent && jobContent.length > 10) {
    const summaryWords = new Set(normalizedSummary.split(/\s+/).filter((word) => word.length > 3));
    const hits = normalizedJob.split(/\s+/).filter((word) => word.length > 3 && summaryWords.has(word)).length;

    if (hits >= 5) score += 25;
    else if (hits >= 2) score += 15;
  } else {
    score += 10;
  }

  return Math.min(score, 100);
}

/** Tenta obter o timezone do navegador, mas fallback para America/Sao_Paulo */
function resolveTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== 'UTC' && tz !== 'Etc/UTC' && tz !== 'Etc/GMT') {
      return tz;
    }
  } catch {
    // ignorado — fallback abaixo
  }
  return 'America/Sao_Paulo';
}

const DEFAULT_TZ = resolveTimezone();

export function formatReportDate(date?: string | null) {
  if (!date) return 'Data recente';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Data recente';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DEFAULT_TZ,
  }).format(parsedDate);
}

export function getReportUpdatedAt(report: any) {
  return report?.updatedAt || report?.lastUpdatedAt || report?.createdAt || null;
}

export function getVersionDate(version: any) {
  return version?.updatedAt || version?.createdAt || null;
}

