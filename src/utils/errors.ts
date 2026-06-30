// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ErrorKind =
  | 'unavailable'   // 503 / 502 — serviço de IA fora
  | 'timeout'       // 408 / network timeout
  | 'rate_limit'    // 429
  | 'offline'       // sem conexão
  | 'not_found'     // 404 — recurso não existe mais
  | 'upload_type'   // tipo de arquivo inválido (validação local)
  | 'upload_size'   // arquivo muito grande (validação local)
  | 'generic';

export interface GupifyError {
  kind: ErrorKind;
  message: string;
  detail?: string;
}

// ─── Classificação ────────────────────────────────────────────────────────────

export function classifyError(err: unknown, context?: 'upload' | 'generate' | 'save' | 'delete' | 'load'): GupifyError {
  const msg = err instanceof Error ? err.message : String(err);

  if (!navigator.onLine) {
    return {
      kind: 'offline',
      message: 'Sem conexão com a internet.',
      detail: 'Verifique sua rede e tente novamente.',
    };
  }

  if (msg.includes('503') || msg.includes('502')) {
    return {
      kind: 'unavailable',
      message: 'O serviço de IA está temporariamente indisponível.',
      detail: 'A API da NVIDIA NIM pode estar sobrecarregada ou fora do ar. Isso costuma se resolver em alguns minutos.',
    };
  }

  if (msg.includes('429')) {
    return {
      kind: 'rate_limit',
      message: 'Limite de gerações atingido.',
      detail: 'Você atingiu o limite de gerações por hora. Aguarde alguns minutos e tente novamente.',
    };
  }

  if (msg.includes('408') || msg.includes('timeout') || msg.includes('network')) {
    return {
      kind: 'timeout',
      message: 'A requisição demorou demais e foi cancelada.',
      detail: 'A IA pode estar lenta no momento. Tente novamente em instantes.',
    };
  }

  if (msg.includes('404') || msg.includes('não encontrado') || msg.includes('not found')) {
    return {
      kind: 'not_found',
      message: context === 'load'
        ? 'Relatório não encontrado. Ele pode ter sido excluído ou a sessão expirou.'
        : 'Recurso não encontrado.',
    };
  }

  // Contextos específicos melhoram a mensagem genérica
  const contextMessages: Record<string, string> = {
    upload: 'Não foi possível enviar o arquivo. Verifique sua conexão e tente novamente.',
    generate: 'Erro ao gerar o resumo. Verifique sua conexão e tente novamente.',
    save: 'Não foi possível salvar as alterações. Tente novamente.',
    delete: 'Não foi possível excluir. Tente novamente.',
    load: 'Não foi possível carregar os dados. Tente novamente.',
  };

  return {
    kind: 'generic',
    message: context ? contextMessages[context] : 'Ocorreu um erro inesperado.',
    detail: msg.length < 200 && msg !== '[object Object]' ? msg : undefined,
  };
}
