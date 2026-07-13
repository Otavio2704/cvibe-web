import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
  X,
} from 'lucide-react';

type HiredFeedbackModalProps = {
  open: boolean;
  onClose: () => void;
};

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function HiredFeedbackModal({ open, onClose }: HiredFeedbackModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobInfo, setJobInfo] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = Boolean(
    EMAILJS_SERVICE_ID &&
    EMAILJS_TEMPLATE_ID &&
    EMAILJS_PUBLIC_KEY,
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
      setError('EmailJS ainda não foi configurado. Confira as variáveis VITE_EMAILJS_* no .env.');
      return;
    }

    if (!name.trim() || !jobInfo.trim() || !message.trim()) {
      setError('Preencha nome, vaga/empresa e relato antes de enviar.');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            from_name: name.trim(),
            from_email: email.trim() || 'Não informado',
            job_info: jobInfo.trim(),
            message: message.trim(),
            source: 'CVibe Web',
            sent_at: new Date().toLocaleString('pt-BR'),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`EmailJS request failed: ${response.status}`);
      }

      setSent(true);
      setName('');
      setEmail('');
      setJobInfo('');
      setMessage('');
    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Não consegui enviar agora. Tente novamente em alguns instantes.');
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Fechar modal"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600 mb-1">
              Relato de contratação
            </p>
            <h2 className="text-xl font-black text-slate-950">Conseguiu a vaga?</h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Me conta rapidinho. Esses relatos ajudam a atualizar a landing page com provas reais da plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-950">Mensagem enviada!</h3>

            <p className="text-sm text-slate-500 mt-1 mb-5">
              Valeu por compartilhar. Boa sorte nessa nova etapa! 🚀
            </p>

            <button
              type="button"
              onClick={() => {
                setSent(false);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isConfigured && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Configure o EmailJS no arquivo .env para ativar o envio real das mensagens.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Nome
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-300"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  E-mail opcional
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-300"
                />
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Vaga e empresa
              </span>
              <input
                value={jobInfo}
                onChange={(e) => setJobInfo(e.target.value)}
                placeholder="Ex: Analista de Operações na Empresa X"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-300"
              />
            </label>

            <label className="space-y-1.5 block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Relato curto
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conte como o CVibe ajudou no processo..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-300 resize-none leading-relaxed"
              />
            </label>

            <button
              type="submit"
              disabled={sending || !isConfigured}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:hover:bg-emerald-600 text-white text-sm font-black transition-colors"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar relato
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
