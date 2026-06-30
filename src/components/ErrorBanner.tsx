import { useState } from 'react';
import {
  AlertCircle,
  WifiOff,
  ServerCrash,
  Clock,
  FileX,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from 'lucide-react';
import type { GupifyError, ErrorKind } from '../utils/errors';

// ─── Configuração visual por tipo de erro ─────────────────────────────────────

const ERROR_CONFIG: Record<ErrorKind, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}> = {
  unavailable: {
    icon: <ServerCrash className="w-4.5 h-4.5" />,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  timeout: {
    icon: <Clock className="w-4.5 h-4.5" />,
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  rate_limit: {
    icon: <Clock className="w-4.5 h-4.5" />,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  offline: {
    icon: <WifiOff className="w-4.5 h-4.5" />,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  not_found: {
    icon: <FileX className="w-4.5 h-4.5" />,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  upload_type: {
    icon: <AlertCircle className="w-4.5 h-4.5" />,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  upload_size: {
    icon: <AlertCircle className="w-4.5 h-4.5" />,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  generic: {
    icon: <AlertCircle className="w-4.5 h-4.5" />,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

interface ErrorBannerProps {
  error: GupifyError;
  onRetry?: () => void;
  retrying?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorBanner({
  error,
  onRetry,
  retrying,
  onDismiss,
  className = '',
}: ErrorBannerProps) {
  const [showDetail, setShowDetail] = useState(false);
  const cfg = ERROR_CONFIG[error.kind];

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${cfg.bg} ${cfg.border} ${cfg.color} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{cfg.icon}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{error.message}</p>

          {error.detail && (
            <>
              <button
                type="button"
                onClick={() => setShowDetail((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-medium opacity-70 hover:opacity-100 mt-1 transition-opacity"
              >
                {showDetail
                  ? <><ChevronUp className="w-3 h-3" /> Ocultar detalhes</>
                  : <><ChevronDown className="w-3 h-3" /> Ver detalhes</>
                }
              </button>
              {showDetail && (
                <p className="text-[11px] mt-1.5 leading-relaxed opacity-80">{error.detail}</p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                ${cfg.border} ${cfg.color} bg-white/60 hover:bg-white/90 disabled:opacity-50`}
            >
              {retrying
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />
              }
              Tentar novamente
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
