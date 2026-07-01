// ─── Notificações em segundo plano ────────────────────────────────────────────
//
// Avisa o usuário quando a geração de IA termina enquanto ele está em outra
// aba/janela: beep sonoro (Web Audio API), notificação nativa do navegador e
// título da aba piscando até ele voltar.
//
// Importante: a chamada de rede em si (fetch para /api/generate) NÃO é
// pausada nem fica mais lenta quando a aba vai pra segundo plano — os
// navegadores só throttlam timers (setInterval/setTimeout), não requisições
// de rede em andamento. Por isso o beep aqui é feito com Web Audio API em vez
// de <audio> + setTimeout, e o flash do título usa setInterval só pra UI,
// sem depender dele pra nada funcional.

let titleFlashInterval: ReturnType<typeof setInterval> | null = null;
let originalTitle: string | null = null;
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
};

/**
 * Toca um beep curto de dois tons gerado via osciladores (sem precisar de
 * arquivo .mp3, então não esbarra na CSP nem precisa de asset extra).
 */
export const playBeep = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const playTone = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + duration + 0.02);
    };

    playTone(880, 0, 0.12);
    playTone(1175, 0.14, 0.16);
  } catch {
    // Web Audio indisponível (navegador muito antigo/restrito) — ignora.
  }
};

/**
 * Pede permissão de notificação ao navegador. Deve ser chamada a partir de um
 * clique do usuário (ex: submit do formulário) pra não ser bloqueada pelo
 * navegador como "permissão pedida sem interação".
 */
export const ensureNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'default') {
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }
  return Notification.permission;
};

/** Faz o título da aba piscar até o usuário voltar a focar nela. */
const startTitleFlash = (flashText: string) => {
  if (titleFlashInterval) return; // já está piscando

  originalTitle = document.title;
  let showFlash = true;

  titleFlashInterval = setInterval(() => {
    document.title = showFlash ? flashText : originalTitle ?? document.title;
    showFlash = !showFlash;
  }, 1000);

  const stop = () => {
    if (titleFlashInterval) {
      clearInterval(titleFlashInterval);
      titleFlashInterval = null;
    }
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = null;
    }
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
  };

  const onVisible = () => {
    if (!document.hidden) stop();
  };

  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);
};

interface NotifyOptions {
  title: string;
  body: string;
}

/**
 * Avisa o usuário que algo terminou, mas só se a aba estiver em segundo
 * plano (oculta ou sem foco). Se a aba já está visível e em foco, não faz
 * nada — o resultado na tela já é feedback suficiente e tocar som ali seria
 * irritante.
 */
export const notifyIfInBackground = ({ title, body }: NotifyOptions) => {
  const isBackground = document.hidden || !document.hasFocus();
  if (!isBackground) return;

  playBeep();
  startTitleFlash(`🔔 ${title}`);

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/gupify-logo.png',
        tag: 'gupify-generate',
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Alguns navegadores recusam Notification fora de certas condições — ignora.
    }
  }
};
