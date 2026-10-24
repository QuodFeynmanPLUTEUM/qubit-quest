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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-400/50 shadow-[0_0_60px_rgba(0,240,255,0.28)] p-6 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-emerald-500/25 border border-emerald-400/50 flex items-center justify-center">
          <Award className="w-8 h-8 text-emerald-400" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Quantum Convergence Achieved!
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Nivel {levelInfo.id}: {levelInfo.name}
          </h2>
        </div>

        {/* Stars Rating */}
        <div className="flex items-center justify-center gap-3 py-1">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-10 h-10 transition-transform duration-300 ${
                s <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)] scale-110'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Score Breakdown */}
        <div className="w-full bg-slate-950/90 border border-white/10 rounded-xl p-4 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Test Accuracy ({accPct}%)</span>
            <span className="font-mono text-cyan-300">+{Math.round(testAccuracy * 1000)} pts</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Coherencia Restante ({coherenceRemaining}/{initialCoherence})
            </span>
            <span className="font-mono text-emerald-300">+{coherenceRemaining * 15} pts</span>
          </div>
          {extraLayersPenalty > 0 && (
            <div className="flex items-center justify-between text-slate-400">
              <span>Complejidad Extra ({layers - 1} capas extra)</span>
              <span className="font-mono text-rose-400">-{extraLayersPenalty} pts</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 mt-1 flex items-center justify-between text-sm font-extrabold">
            <span className="text-white">SCORE FINAL</span>
            <span className="font-mono text-amber-300 text-base">{score} pts</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {levelInfo.pedagogical_goal}
        </p>

        {/* Actions */}
        <div className="w-full flex items-center gap-2.5 pt-2">
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
          >
            Seguir Explorando
          </button>

          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 hover:brightness-110 transition"
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
