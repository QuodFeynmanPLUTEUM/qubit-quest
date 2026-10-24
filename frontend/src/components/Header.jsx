import React from 'react';
import { Atom, Cpu, Sparkles, Star, Volume2, VolumeX, Zap } from 'lucide-react';

export default function Header({
  levels,
  currentLevelId,
  onSelectLevel,
  coherence,
  maxCoherence,
  totalScore,
  levelStars,
  backendOnline,
  soundEnabled,
  onToggleSound,
  onOpenUpgrades,
}) {
  const coherencePct = maxCoherence > 0 ? Math.max(0, Math.min(100, (coherence / maxCoherence) * 100)) : 0;
  const barColor =
    coherencePct > 50
      ? 'from-cyan-400 to-emerald-400'
      : coherencePct > 25
      ? 'from-amber-400 to-orange-500'
      : 'from-rose-500 to-red-600';

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Atom className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 via-white to-purple-400 bg-clip-text text-transparent">
                QUBIT QUEST
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Qiskit VQC
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Quantum Machine Learning Pattern Lab
            </p>
          </div>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10">
          {levels.map((lvl) => {
            const active = lvl.id === currentLevelId;
            const stars = levelStars[lvl.id] || 0;
            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="font-mono text-[11px] opacity-75">LVL {lvl.id}</span>
                <span className="hidden md:inline">{lvl.name}</span>
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* Coherence Energy Bar & Score */}
        <div className="flex items-center gap-4">
          {/* Coherence Meter */}
          <div className="w-40 sm:w-48">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                COHERENCE
              </span>
              <span className="font-mono text-slate-200">
                {coherence} <span className="text-slate-500">/ {maxCoherence}</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-300`}
                style={{ width: `${coherencePct}%` }}
              />
            </div>
          </div>

          {/* Hardware Upgrades Quick Button */}
          <button
            onClick={onOpenUpgrades}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-200 text-xs font-semibold transition"
            title="Configurar Capas y Compuerta CNOT"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-300" />
            <span>Hardware Lab</span>
          </button>

          {/* Total Score */}
          <div className="bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase leading-none">Score</div>
              <div className="font-mono text-sm font-bold text-amber-300 leading-tight">
                {totalScore}
              </div>
            </div>
          </div>

          {/* Sound + Connection Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-cyan-300 transition"
              title={soundEnabled ? 'Silenciar SFX' : 'Activar SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px]"
              title={backendOnline ? 'Qiskit Backend Online' : 'Backend Desconectado'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'
                }`}
              />
              <span className="hidden lg:inline font-mono text-slate-300">
                {backendOnline ? 'QPU READY' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
