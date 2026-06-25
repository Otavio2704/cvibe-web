import { useState, useEffect } from 'react';

interface ScoreRingProps {
  score: number;       // 0–100
  size?: number;       // px, default 64
  stroke?: number;     // espessura, default 6
  showLabel?: boolean; // mostra "ATS" abaixo do número
}

export default function ScoreRing({
  score,
  size = 64,
  stroke = 6,
  showLabel = true,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);

  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (displayed / 100) * circ;

  // Cor muda conforme o score
  const color =
    displayed >= 90 ? '#10b981' : // emerald
    displayed >= 70 ? '#6366f1' : // indigo
    displayed >= 50 ? '#f59e0b' : // amber
                      '#ef4444';  // red

  // Anima de "displayed" até "score" sempre que score muda
  useEffect(() => {
    const start = displayed;
    const diff  = score - start;
    if (diff === 0) return;

    const STEPS    = 30;
    const INTERVAL = 16; // ~60fps
    let   step     = 0;

    const id = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / STEPS, 3); // cubic ease-out
      setDisplayed(Math.round(start + diff * ease));
      if (step >= STEPS) clearInterval(id);
    }, INTERVAL);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ATS: ${score}%`}
    >
      {/* SVG ring — rotacionado -90° para começar no topo */}
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Track (fundo) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        {/* Progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="score-ring-circle"
        />
      </svg>

      {/* Número central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="font-black tabular-nums"
          style={{
            color,
            fontSize: size < 56 ? '10px' : size < 72 ? '13px' : '15px',
          }}
        >
          {displayed}
        </span>
        {showLabel && (
          <span
            className="font-bold text-slate-400 uppercase tracking-wider"
            style={{ fontSize: size < 56 ? '6px' : '7px', marginTop: '1px' }}
          >
            ATS
          </span>
        )}
      </div>
    </div>
  );
}
