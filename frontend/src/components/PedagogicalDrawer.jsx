import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const MAPPINGS = [
  {
    classical: 'Datos de Entrada (x₀, x₁)',
    quantum: 'Feature Map: Compuertas Ry(ω·xᵢ)',
    explanation:
      'Codifica coordenadas clásicas 2D en estados cuánticos sobre la esfera de Bloch (Angle Encoding).',
  },
  {
    classical: 'Pesos de Red Neuronal (W, b)',
    quantum: 'Ángulos Variacionales θ de Ry(θ), Rz(θ)',
    explanation:
      'El optimizador ajusta iterativamente los ángulos de rotación θ para minimizar la función de pérdida.',
  },
  {
    classical: 'Capas Ocultas / Polinomios',
    quantum: 'Data Re-Uploading (Depth = 2, 3)',
    explanation:
      'Repetir la codificación de datos intercalada con rotaciones genera series de Fourier cuánticas no lineales.',
  },
  {
    classical: 'Interacción de Features (x₀·x₁)',
    quantum: 'Entrelazamiento CNOT(q₀, q₁)',
    explanation:
      'Mediante CNOT†(I⊗Z)CNOT = Z⊗Z, la medición combina las fases de ambos qubits para resolver XOR.',
  },
  {
    classical: 'Activación Sigmoid P(y=1)',
    quantum: 'Valor Esperado Pauli-Z: (1 + ⟨Z⟩)/2',
    explanation:
      'La proyección del estado cuántico final sobre el eje Z determina la probabilidad continua de Clase 1.',
  },
];

export default function PedagogicalDrawer() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="max-w-7xl mx-auto px-4 pb-8">
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shadow-lg">
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold tracking-wide text-slate-100">
              QUANTUM VS CLASSICAL ML INSPECTOR (Guía Pedagógica 1:1)
            </span>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
              EdTech Reference
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>{isOpen ? 'Ocultar' : 'Desplegar'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-white/10 grid grid-cols-1 md:grid-cols-5 gap-3">
            {MAPPINGS.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/75 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-2"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-400/20 rounded px-2 py-1">
                    ML Clásico: {item.classical}
                  </div>
                  <div className="flex items-center justify-center text-slate-500">
                    <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                  <div className="text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 rounded px-2 py-1">
                    QML (Qiskit): {item.quantum}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
