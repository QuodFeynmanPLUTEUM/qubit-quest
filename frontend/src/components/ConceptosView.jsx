import React from 'react';
import { ArrowRight, Atom, BookOpen } from 'lucide-react';

const MAPPINGS = [
  {
    classical: 'Datos de entrada (x₀, x₁)',
    quantum: 'Feature Map: compuertas Ry(ω·xᵢ)',
    explanation:
      'Codifica coordenadas clásicas 2D en estados cuánticos sobre la esfera de Bloch (Angle Encoding).',
  },
  {
    classical: 'Pesos de red neuronal (W, b)',
    quantum: 'Ángulos variacionales θ de Ry(θ), Rz(θ)',
    explanation:
      'El optimizador ajusta iterativamente los ángulos de rotación θ para minimizar la función de pérdida.',
  },
  {
    classical: 'Capas ocultas / arquitectura de red',
    quantum: 'Data Re-Uploading (profundidad L = 1, 2, 3)',
    explanation:
      'Repetir la codificación de datos intercalada con rotaciones genera series de Fourier cuánticas no lineales.',
  },
  {
    classical: 'Interacción entre features (x₀·x₁)',
    quantum: 'Entrelazamiento CNOT(q₀, q₁)',
    explanation:
      'Mediante CNOT†(I⊗Z)CNOT = Z⊗Z, la medición combina las fases de ambos qubits para resolver patrones tipo XOR.',
  },
  {
    classical: 'Activación sigmoide P(y = 1)',
    quantum: 'Valor esperado Pauli-Z: (1 + ⟨Z⟩) / 2',
    explanation:
      'La proyección del estado cuántico final sobre el eje Z determina la probabilidad continua de clase 1.',
  },
];

export default function ConceptosView() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-qq-primarySoft flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-qq-primary" />
          </div>
          <h2 className="text-xl font-extrabold text-qq-ink">
            Machine Learning clásico vs. Machine Learning cuántico
          </h2>
        </div>
        <p className="text-sm text-qq-subtle leading-relaxed">
          Qubit Quest entrena un <strong className="text-qq-ink">Variational Quantum Classifier (VQC)</strong> real
          construido con Qiskit: los mismos conceptos de un modelo clásico (datos de entrada, pesos entrenables,
          arquitectura y función de pérdida) tienen un equivalente directo en el circuito cuántico. Esta tabla
          muestra ese mapeo concepto a concepto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MAPPINGS.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-4 flex flex-col gap-2.5"
          >
            <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ML clásico: {item.classical}
            </div>
            <div className="flex items-center justify-center text-qq-faint">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>
            <div className="text-xs font-bold text-qq-primary bg-qq-primarySoft border border-violet-200 rounded-lg px-3 py-2">
              QML (Qiskit): {item.quantum}
            </div>
            <p className="text-xs text-qq-subtle leading-relaxed">{item.explanation}</p>
          </div>
        ))}

        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 flex flex-col gap-2 justify-center">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
            <Atom className="w-4 h-4" />
            Mensaje clave
          </div>
          <p className="text-xs text-sky-800 leading-relaxed">
            Los circuitos cuánticos ofrecen una forma distinta de representar y procesar información, pero los
            modelos cuánticos <strong>no son automáticamente más precisos o más rápidos</strong> que las
            alternativas clásicas. Lo interesante es experimentar cómo la estructura del circuito —profundidad,
            entrelazamiento— cambia lo que el modelo puede aprender.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-6">
        <h3 className="text-base font-extrabold text-qq-ink mb-3">Glosario rápido</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <GlossaryItem term="Feature encoding" def="Convertir cada coordenada (x₀, x₁) en un ángulo de rotación sobre un qubit, usando compuertas Ry." />
          <GlossaryItem term="Ángulos entrenables (θ)" def="Parámetros de las compuertas Ry/Rz que el optimizador clásico ajusta para reducir el error." />
          <GlossaryItem term="Entrelazamiento (CNOT)" def="Correlación cuántica entre qubits que permite al circuito aprender relaciones no lineales entre features." />
          <GlossaryItem term="Medición" def="Proyectar el estado cuántico final sobre el eje Z para obtener una probabilidad de clase." />
          <GlossaryItem term="Pérdida (loss)" def="Entropía cruzada binaria entre la probabilidad predicha y la etiqueta real; cuanto menor, mejor." />
          <GlossaryItem term="Optimización" def="COBYLA / descenso por gradiente con parameter-shift ajustan θ iteración a iteración para minimizar la pérdida." />
        </dl>
      </div>
    </div>
  );
}

function GlossaryItem({ term, def }) {
  return (
    <div>
      <dt className="font-bold text-qq-ink mb-0.5">{term}</dt>
      <dd className="text-qq-subtle leading-relaxed">{def}</dd>
    </div>
  );
}
