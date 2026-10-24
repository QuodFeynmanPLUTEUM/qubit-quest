import React from 'react';
import { ArrowRight, Award, RotateCcw, Star, Zap } from 'lucide-react';

export default function VictoryModal({
  isOpen,
  onClose,
  levelInfo,
  testAccuracy,
  coherenceRemaining,
  initialCoherence,
  layers,
  score,
  stars,
  onRetry,
  onNextLevel,
  hasNextLevel,
}) {
  if (!isOpen || !levelInfo) return null;

  const accPct = Math.round((testAccuracy || 0) * 100);
  const extraLayersPenalty = Math.max(0, layers - 1) * 50;

  return (
    <div className="fixed inset-0 z-50 bg-qq-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-qq-surface border border-violet-200 shadow-2xl p-6 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
          <Award className="w-8 h-8 text-green-600" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-green-600">
            ¡Convergencia cuántica lograda!
          </span>
          <h2 className="text-xl font-extrabold text-qq-ink mt-0.5">
            Nivel {levelInfo.id}: {levelInfo.name}
          </h2>
        </div>

        {/* Stars Rating */}
        <div className="flex items-center justify-center gap-3 py-1">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-10 h-10 transition-transform duration-300 ${
                s <= stars ? 'text-amber-500 fill-amber-500 scale-110' : 'text-qq-border'
              }`}
            />
          ))}
        </div>

        {/* Score Breakdown */}
        <div className="w-full bg-qq-bg border border-qq-border rounded-xl p-4 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-qq-subtle">
            <span>Test Accuracy ({accPct}%)</span>
            <span className="font-mono text-qq-primary">+{Math.round(testAccuracy * 1000)} pts</span>
          </div>
          <div className="flex items-center justify-between text-qq-subtle">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Coherencia Restante ({coherenceRemaining}/{initialCoherence})
            </span>
            <span className="font-mono text-green-600">+{coherenceRemaining * 15} pts</span>
          </div>
          {extraLayersPenalty > 0 && (
            <div className="flex items-center justify-between text-qq-faint">
              <span>Complejidad Extra ({layers - 1} capas extra)</span>
              <span className="font-mono text-rose-600">-{extraLayersPenalty} pts</span>
            </div>
          )}
          <div className="border-t border-qq-border pt-2 mt-1 flex items-center justify-between text-sm font-extrabold">
            <span className="text-qq-ink">SCORE FINAL</span>
            <span className="font-mono text-amber-600 text-base">{score} pts</span>
          </div>
        </div>

        <p className="text-xs text-qq-subtle leading-relaxed">{levelInfo.pedagogical_goal}</p>

        {/* Actions */}
        <div className="w-full flex items-center gap-2.5 pt-2">
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 px-3 rounded-xl bg-qq-bg hover:bg-violet-50 border border-qq-border text-qq-ink text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-qq-bg border border-qq-border text-qq-subtle text-xs font-semibold transition"
          >
            Seguir explorando
          </button>

          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 py-2.5 px-3 rounded-xl bg-qq-primary text-white text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-qq-primaryDark transition"
            >
              <span>Siguiente Nivel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
