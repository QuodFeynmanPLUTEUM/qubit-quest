import React from 'react';

// Fully responsive SVG rendering of the real 2-qubit Qiskit circuit (see
// backend/app/qml_engine.py:build_qiskit_circuit). Gate labels intentionally
// match that circuit exactly (Ry feature encoding, Ry+Rz variational
// rotations, a single CNOT once all variational layers are applied) rather
// than a generic textbook layout, so the diagram never shows a gate the
// model isn't actually running.
const VB_W = 392;
const VB_H = 168;
const WIRE_Q0_Y = 66;
const WIRE_Q1_Y = 128;
const WIRE_START_X = 22;
const WIRE_END_X = VB_W - 6;

const NAVY = '#1e2130';
const SUBTLE = '#6b7084';

const GROUP_A = { x: 26, w: 104 };
const GROUP_B = { x: GROUP_A.x + GROUP_A.w + 8, w: 168 };
const GROUP_C = { x: GROUP_B.x + GROUP_B.w + 8, w: VB_W - (GROUP_B.x + GROUP_B.w + 8) - 6 };

const ENC_CX = GROUP_A.x + GROUP_A.w / 2;
const RY_CX = GROUP_B.x + GROUP_B.w * 0.22;
const RZ_CX = GROUP_B.x + GROUP_B.w * 0.52;
const CNOT_CX = GROUP_B.x + GROUP_B.w * 0.82;
const MEAS_CX = GROUP_C.x + GROUP_C.w / 2;

function GroupBox({ x, w, stroke, fill, lines }) {
  return (
    <g>
      <rect
        x={x}
        y={8}
        width={w}
        height={VB_H - 16}
        rx={14}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray="4 3.5"
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + w / 2}
          y={20 + i * 11}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="700"
          fill={i === 0 ? NAVY : SUBTLE}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function GateChip({ cx, cy, label, fill, stroke, textColor }) {
  const width = 46;
  const height = 24;
  return (
    <g>
      <rect
        x={cx - width / 2}
        y={cy - height / 2}
        width={width}
        height={height}
        rx={6}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
      />
      <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={textColor}>
        {label}
      </text>
    </g>
  );
}

function MeasurementIcon({ cx, cy }) {
  const s = 13;
  return (
    <g>
      <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} rx={5} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
      <path d={`M ${cx - 8} ${cy + 5} A 8 8 0 0 1 ${cx + 8} ${cy + 5}`} fill="none" stroke="#475569" strokeWidth="1.3" />
      <line x1={cx} y1={cy + 5} x2={cx + 6.5} y2={cy - 5} stroke="#475569" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx={cx} cy={cy + 5} r="1.2" fill="#475569" />
    </g>
  );
}

export default function CircuitDiagram({ layers = 1, useEntanglement = false }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto block"
        role="img"
        aria-label={`Circuito cuántico de 2 qubits: codificación de datos, ${layers} capa${
          layers > 1 ? 's' : ''
        } variacional${layers > 1 ? 'es' : ''}${useEntanglement ? ' con entrelazamiento CNOT' : ''}, y medición.`}
      >
        {/* qubit wires */}
        <line x1={WIRE_START_X} y1={WIRE_Q0_Y} x2={WIRE_END_X} y2={WIRE_Q0_Y} stroke="#d4d7e5" strokeWidth="1.5" />
        <line x1={WIRE_START_X} y1={WIRE_Q1_Y} x2={WIRE_END_X} y2={WIRE_Q1_Y} stroke="#d4d7e5" strokeWidth="1.5" />

        {/* qubit initial state labels */}
        <text x={WIRE_START_X - 18} y={WIRE_Q0_Y + 4} fontSize="11" fontWeight="700" fill={NAVY}>
          |0⟩
        </text>
        <text x={WIRE_START_X - 18} y={WIRE_Q1_Y + 4} fontSize="11" fontWeight="700" fill={NAVY}>
          |0⟩
        </text>

        {/* Group A: data encoding */}
        <GroupBox
          x={GROUP_A.x}
          w={GROUP_A.w}
          stroke="#c4b5fd"
          fill="#faf5ff"
          lines={['Codificación', 'de datos C(x)']}
        />
        <GateChip cx={ENC_CX} cy={WIRE_Q0_Y} label="Ry(x₁)" fill="#ede9fe" stroke="#c4b5fd" textColor="#6d28d9" />
        <GateChip cx={ENC_CX} cy={WIRE_Q1_Y} label="Ry(x₂)" fill="#ede9fe" stroke="#c4b5fd" textColor="#6d28d9" />

        {/* Group B: variational layer (+ entangling CNOT) */}
        <GroupBox
          x={GROUP_B.x}
          w={GROUP_B.w}
          stroke="#5eead4"
          fill="#f0fdfa"
          lines={layers > 1 ? ['Capa variacional', `(×${layers})`] : ['Capa variacional']}
        />
        <GateChip cx={RY_CX} cy={WIRE_Q0_Y} label="Ry(θ₁)" fill="#ccfbf1" stroke="#5eead4" textColor="#0f766e" />
        <GateChip cx={RY_CX} cy={WIRE_Q1_Y} label="Ry(θ₂)" fill="#ccfbf1" stroke="#5eead4" textColor="#0f766e" />
        <GateChip cx={RZ_CX} cy={WIRE_Q0_Y} label="Rz(θ₃)" fill="#ccfbf1" stroke="#5eead4" textColor="#0f766e" />
        <GateChip cx={RZ_CX} cy={WIRE_Q1_Y} label="Rz(θ₄)" fill="#ccfbf1" stroke="#5eead4" textColor="#0f766e" />

        {useEntanglement && (
          <g>
            <line x1={CNOT_CX} y1={WIRE_Q0_Y} x2={CNOT_CX} y2={WIRE_Q1_Y} stroke="#0d9488" strokeWidth="1.6" />
            <circle cx={CNOT_CX} cy={WIRE_Q0_Y} r="4" fill="#0d9488" />
            <circle cx={CNOT_CX} cy={WIRE_Q1_Y} r="7.5" fill="#ffffff" stroke="#0d9488" strokeWidth="1.6" />
            <line
              x1={CNOT_CX - 5}
              y1={WIRE_Q1_Y}
              x2={CNOT_CX + 5}
              y2={WIRE_Q1_Y}
              stroke="#0d9488"
              strokeWidth="1.6"
            />
            <line
              x1={CNOT_CX}
              y1={WIRE_Q1_Y - 5}
              x2={CNOT_CX}
              y2={WIRE_Q1_Y + 5}
              stroke="#0d9488"
              strokeWidth="1.6"
            />
            <text x={CNOT_CX} y={VB_H - 14} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#0f766e">
              CNOT
            </text>
          </g>
        )}

        {/* Group C: measurement */}
        <GroupBox x={GROUP_C.x} w={GROUP_C.w} stroke="#cbd5e1" fill="#f8fafc" lines={['Medición']} />
        <MeasurementIcon cx={MEAS_CX} cy={WIRE_Q0_Y} />
        <MeasurementIcon cx={MEAS_CX} cy={WIRE_Q1_Y} />
      </svg>
    </div>
  );
}
