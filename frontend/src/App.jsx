import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import PlaygroundView from './components/PlaygroundView.jsx';
import ConceptosView from './components/ConceptosView.jsx';
import RetosView from './components/RetosView.jsx';
import { checkHealth, fetchLevels } from './services/api.js';
import { useGameSound } from './hooks/useGameSound.js';

const FALLBACK_LEVELS = [
  {
    id: 1,
    name: 'First Contact',
    subtitle: 'How Machine Learning Learns Patterns',
    description:
      'Aprende cómo los ángulos de las compuertas cuánticas (Ry, Rz) ajustan la frontera de decisión.',
    initial_coherence: 50,
    target_accuracy: 0.85,
    allowed_upgrades: ['layers'],
  },
  {
    id: 2,
    name: 'The Pattern Gets Weird',
    subtitle: 'Quantum Feature Re-Uploading & Depth',
    description:
      'Los datos forman anillos concéntricos. Desbloquea más capas variacionales para curvar la frontera.',
    initial_coherence: 75,
    target_accuracy: 0.85,
    allowed_upgrades: ['layers'],
  },
  {
    id: 3,
    name: 'Entanglement Unlocked',
    subtitle: 'Quantum Correlations & CNOT Gates',
    description: 'Patrón XOR cuántico. Activa la compuerta CNOT para entrelazar q0 y q1.',
    initial_coherence: 100,
    target_accuracy: 0.85,
    allowed_upgrades: ['layers', 'entanglement'],
  },
];

const LEVEL_DIFFICULTY_LABEL = {
  1: 'Frontera simple',
  2: 'Patrón no lineal',
  3: 'Entrelazamiento',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('playground');
  const [levels, setLevels] = useState(FALLBACK_LEVELS);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [backendOnline, setBackendOnline] = useState(false);
  const [levelScores, setLevelScores] = useState({ 1: 0, 2: 0, 3: 0 });
  const [levelStars, setLevelStars] = useState({ 1: 0, 2: 0, 3: 0 });
  const [streak, setStreak] = useState(0);

  const { soundEnabled, setSoundEnabled, playPulse, playVictory } = useGameSound();

  const totalXP = useMemo(
    () => Math.round(Object.values(levelScores).reduce((acc, s) => acc + s, 0) / 10),
    [levelScores]
  );

  useEffect(() => {
    let mounted = true;
    checkHealth()
      .then(() => mounted && setBackendOnline(true))
      .catch(() => mounted && setBackendOnline(false));

    fetchLevels()
      .then((res) => {
        if (mounted && res.levels && res.levels.length > 0) {
          setLevels(res.levels);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleLevelComplete = (levelId, score, stars) => {
    setLevelScores((prev) => ({ ...prev, [levelId]: Math.max(prev[levelId] || 0, score) }));
    setLevelStars((prev) => ({ ...prev, [levelId]: Math.max(prev[levelId] || 0, stars) }));
  };

  const handleTrainingPulse = () => setStreak((s) => s + 1);

  return (
    <div className="min-h-screen bg-qq-bg">
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        currentLevelId={currentLevelId}
        totalLevels={levels.length}
        levelLabel={LEVEL_DIFFICULTY_LABEL[currentLevelId] || levels.find((l) => l.id === currentLevelId)?.name}
        totalXP={totalXP}
        streak={streak}
        backendOnline={backendOnline}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
      />

      <main className="max-w-7xl mx-auto px-4 py-5">
        {activeTab === 'playground' && (
          <PlaygroundView onTrainingPulse={handleTrainingPulse} />
        )}
        {activeTab === 'conceptos' && <ConceptosView />}
        {activeTab === 'retos' && (
          <RetosView
            levels={levels}
            currentLevelId={currentLevelId}
            onSelectLevel={setCurrentLevelId}
            levelStars={levelStars}
            onLevelComplete={handleLevelComplete}
            onTrainingPulse={handleTrainingPulse}
            playPulse={playPulse}
            playVictory={playVictory}
          />
        )}
      </main>
    </div>
  );
}
