import React from 'react';
import { Atom, Flame, Layers, Star, Target, Volume2, VolumeX } from 'lucide-react';

const TABS = [
  { id: 'playground', label: 'Playground' },
  { id: 'conceptos', label: 'Conceptos' },
  { id: 'retos', label: 'Retos' },
];

export default function Header({
  activeTab,
  onChangeTab,
  currentLevelId,
  totalLevels,
  levelLabel,
  totalXP,
  streak,
  backendOnline,
  soundEnabled,
  onToggleSound,
}) {
  return (
    <header className="w-full border-b border-qq-border bg-qq-surface sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-qq-primarySoft flex items-center justify-center">
            <Atom className="w-5 h-5 text-qq-primary" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-qq-ink">Qubit Quest</h1>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 bg-qq-bg p-1 rounded-xl border border-qq-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-qq-primary text-white shadow-sm'
                  : 'text-qq-subtle hover:text-qq-ink hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Progress badges */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-qq-bg border border-qq-border text-xs font-semibold text-qq-subtle"
            title="Nivel actual de dificultad"
          >
            <Layers className="w-3.5 h-3.5 text-qq-primary" />
            <span>Nivel {currentLevelId} · {levelLabel}</span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-qq-bg border border-qq-border text-xs font-semibold text-qq-subtle"
            title="Progreso de retos"
          >
            <Target className="w-3.5 h-3.5 text-qq-primary" />
            <span>Reto {currentLevelId} de {totalLevels}</span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-qq-amberSoft border border-amber-200 text-xs font-bold text-amber-700"
            title="Experiencia acumulada"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{totalXP} XP</span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-qq-orangeSoft border border-orange-200 text-xs font-bold text-orange-700"
            title="Pulsos de entrenamiento en esta sesión"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>{streak}</span>
          </div>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-qq-bg border border-qq-border text-qq-subtle hover:text-qq-primary transition"
            title={soundEnabled ? 'Silenciar SFX' : 'Activar SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: backendOnline ? '#16a34a' : '#e11d48' }}
            title={backendOnline ? 'Backend Qiskit conectado' : 'Backend desconectado'}
          />
        </div>
      </div>
    </header>
  );
}
