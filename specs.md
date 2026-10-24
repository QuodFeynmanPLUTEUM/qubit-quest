# SPECS: Qubit Quest (Quantum Machine Learning Educational Game)

> **Documento de especificaciones técnicas y funcionales para el agente de IA.**  
> Diseñado para cumplir con los requerimientos del Reto **5.3 EdTech** del *IBM Quantum Hackathon - Qiskit Fall Fest 2026* y el [README.md](file:///home/juan/h/pdu/qubit-quest/README.md).

---

## 1. Visión del Producto y Objetivos

**Qubit Quest** es un videojuego interactivo web que introduce a los jugadores al Quantum Machine Learning (QML) a través de un **Variational Quantum Classifier (VQC)** construido con **Qiskit**. El jugador entrena una pequeña IA cuántica para clasificar puntos 2D en una cuadrícula, visualizando cómo la rotación de compuertas y el entrelazamiento cuántico modifican la **frontera de decisión (decision boundary)** en tiempo real.

### Criterios de Evaluación Cubiertos (Bases de Hackathon)
- **Innovación y Potencial (25%):** Visualización interactiva instantánea de estados cuánticos y fronteras de decisión sin abstracciones opacas.
- **Uso riguroso de Qiskit (25%):** Implementación real de `ZZFeatureMap` / `AngleEncoding`, `RealAmplitudes` / ansatz parametrizado y simuladores de Qiskit (`StatevectorEstimator` o `AerSimulator`).
- **Reto EdTech & Adicción (20%):** Mecánicas de arcade (presupuesto de coherencia cuántica, medalla de 1 a 3 estrellas, sonido/efectos visuales cyberpunk/sci-fi, rejugabilidad).
- **Rigor técnico (15%):** Mapeo 1:1 entre conceptos de ML clásico y QML.
- **Calidad de solución y arquitectura (15%):** Arquitectura desacoplada, moderna y veloz (FastAPI + React/Vite).

---

## 2. Arquitectura General y Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (React + Vite)                     │
│  - Cyberpunk/Quantum Dark Theme (Tailwind CSS)              │
│  - Interactive HTML5 2D Canvas (Decision Boundary & Dots)   │
│  - Motion & FX (Canvas Particles / SFX sintéticos)          │
│  - Game HUD (Coherence Budget, Score, Level Upgrades)       │
│  - Quantum Inspector (Circuit diagram visual, Parameters)   │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP / REST JSON
┌──────────────────────────────▼──────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│  - Endpoints: /api/levels, /api/train, /api/predict_grid    │
│  - Fast Qiskit Simulation Engine (< 1.5s per training run)  │
│  - Dataset Generator (2D Blobs, Concentric Circles, Moons)  │
│  - Scoring & Budget Rules Engine                            │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologías Clave:
- **Backend:** Python 3.12, `fastapi`, `uvicorn`, `qiskit>=1.0.0`, `qiskit-machine-learning`, `qiskit-aer`, `numpy`, `scikit-learn`.
- **Frontend:** React 18+ con Vite, Tailwind CSS o CSS Modules con estética Cyberpunk/Neon, Lucide React (iconos), Canvas API / Confetti.
- **Rendimiento crítico:** La simulación cuántica y el cálculo del grid 2D (ej. $25 \times 25$ o $30 \times 30$ puntos) deben resolverse en el backend en **menos de 2 segundos** para mantener la experiencia de juego fluida y adictiva.

---

## 3. Estructura de Directorios

```
qubit-quest/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # Instancia FastAPI, rutas y CORS
│   │   ├── qml_engine.py       # Lógica Qiskit VQC, FeatureMap, Ansatz, optimizador
│   │   ├── datasets.py         # Generador de datos sintéticos 2D para cada nivel
│   │   └── game_rules.py       # Cálculo de scores, presupuestos y validación
│   ├── requirements.txt
│   └── run.py                  # Script para arrancar servidor backend
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Header.jsx           # Título, selector de nivel, status de conexión
│   │   │   ├── GameCanvas.jsx       # Canvas 2D interactivo con decision boundary y puntos
│   │   │   ├── ControlPanel.jsx     # Botones de entrenamiento, epochs slider, reset
│   │   │   ├── CircuitViewer.jsx    # Visualización visual del circuito cuántico actual
│   │   │   ├── UpgradesModal.jsx    # Desbloqueo de capas y compuerta CNOT
│   │   │   ├── PedagogicalDrawer.jsx# Comparativa didáctica ML Clásico vs QML
│   │   │   └── VictoryModal.jsx     # Pantalla de nivel completado con estrellas y score
│   │   ├── services/
│   │   │   └── api.js               # Cliente Fetch para endpoints del backend
│   │   └── hooks/
│   │       └── useGameSound.js      # Efectos de audio retro sfx sintéticos (Web Audio API)
├── README.md
└── specs.md
```

---

## 4. Especificaciones del Modelo Cuántico (QML Engine)

### 4.1. Codificación de Datos (Feature Map)
- Usar **2 qubits** para mapear las coordenadas 2D $(x_0, x_1)$ normalizadas en $[-\pi, \pi]$ o $[0, \pi]$.
- Circuito base:
  - $q_0: R_y(x_0)$
  - $q_1: R_y(x_1)$
  - Para niveles avanzados: compuerta opcional $ZZ$ de entrelazamiento de datos: $R_z(x_0 \cdot x_1)$ o `ZZFeatureMap(2, reps=1)`.

### 4.2. Ansatz Parametrizado (Variational Circuit)
- **Capa Base (Level 1):**
  - Rotaciones independientes: $R_y(\theta_0)$ en $q_0$ y $R_y(\theta_1)$ en $q_1$, seguidas de $R_z(\theta_2)$ y $R_z(\theta_3)$.
  - Sin compuertas de entrelazamiento.
- **Capa Avanzada (Level 2 - Upgraded Layers):**
  - Posibilidad de añadir hasta $L=2$ o $L=3$ capas de rotaciones parametrizadas.
- **Entrelazamiento Cuántico (Level 3 - Entanglement Unlocked):**
  - Compuerta $CNOT(q_0, q_1)$ intercalada entre capas de rotación.
  - Permite crear correlaciones cuánticas no lineales necesarias para resolver datasets tipo XOR o Moons.

### 4.3. Medición y Clasificación
- Medir el valor esperado del operador Pauli $\langle Z_0 \rangle$ o probabilidades de base computacional:
  $$P(\text{Clase 1}) = \frac{1 + \langle Z_0 \rangle}{2}$$
- Regla de decisión: $\hat{y} = 1$ si $P(\text{Clase 1}) \ge 0.5$, sino $0$.
- Función de pérdida: Binary Cross-Entropy o Mean Squared Error con optimizador rápido (ej. COBYLA o SPSA con iteraciones controladas: 10 a 25 pasos por click de "Train").

### 4.4. Malla de Predicción para la Frontera de Decisión
- Generar una cuadrícula regular en el plano $x \in [-1.5, 1.5], y \in [-1.5, 1.5]$ de resolución $25 \times 25$.
- El backend evalúa la probabilidad de clase en la malla y devuelve una matriz $25 \times 25$ de probabilidades continuas $[0.0, 1.0]$.
- El frontend dibuja esta matriz como un mapa de calor suave/isocontornos en el canvas detrás de los puntos del dataset.

---

## 5. Diseño de Niveles y Gamificación

| Nivel | Nombre | Dataset | Restricción / Desafío | Upgrade Clave | Condición Victoria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **First Contact** | 2 Clusters linealmente separables (Blobs) | Entender el entrenamiento. Presupuesto: 50 unidades de Coherencia. | 1 capa básica ($R_y, R_z$) | Accuracy $\ge 85\%$ |
| **2** | **The Pattern Gets Weird** | Círculos concéntricos o Moons entrelazadas | Un modelo lineal falla ($\approx 50\%$). Presupuesto: 75 Coherencia. | Desbloquear **Capa Adicional (Depth = 2)** | Accuracy $\ge 85\%$ |
| **3** | **Entanglement Unlocked** | XOR Cuántico / Espirales entrelazadas | Requiere correlación no clásica. Presupuesto: 100 Coherencia. | Desbloquear **Compuerta CNOT (Entanglement)** | Accuracy $\ge 85\%$ |

### Sistema de Puntuación y Recursos:
- **Quantum Coherence Budget (Energía/Disparos):**
  - Cada paso/época de entrenamiento consume entre 2 y 5 unidades de coherencia.
  - Resetear parámetros cuesta 0 coherencia, pero reinicia el progreso del intento actual.
- **Score Final por Nivel:**
  $$\text{Score} = (\text{Test Accuracy} \times 1000) + (\text{Coherencia Restante} \times 15) - (\text{Capas Extra} \times 50)$$
- **Estrellas:**
  - ★☆☆: Superar el target de Accuracy ($85\%$).
  - ★★☆: Superar target con más del $30\%$ de Coherencia restante.
  - ★★★: Accuracy $\ge 92\%$ con más del $50\%$ de Coherencia restante.

---

## 6. Contrato de la API REST (FastAPI)

### `GET /api/levels`
Devuelve la lista de niveles disponibles y sus configuraciones.
```json
{
  "levels": [
    {
      "id": 1,
      "name": "First Contact",
      "description": "Aprende cómo los ángulos de las compuertas cuánticas ajustan la frontera de decisión.",
      "initial_coherence": 50,
      "target_accuracy": 0.85,
      "allowed_upgrades": ["layers"],
      "dataset_type": "linear_separable"
    }
  ]
}
```

### `GET /api/levels/{level_id}/data`
Obtiene los puntos de entrenamiento y prueba del nivel.
```json
{
  "level_id": 1,
  "train_points": [
    {"x": 0.5, "y": -0.2, "label": 0},
    {"x": -0.8, "y": 0.7, "label": 1}
  ],
  "test_points": [...]
}
```

### `POST /api/train`
Ejecuta $N$ pasos de optimización variacional del circuito.
**Request Body:**
```json
{
  "level_id": 1,
  "current_parameters": [0.12, -0.45, 1.2, 0.0],
  "layers": 1,
  "use_entanglement": false,
  "epochs": 10,
  "learning_rate": 0.1
}
```
**Response:**
```json
{
  "updated_parameters": [0.35, -0.21, 0.98, 0.15],
  "loss_history": [0.68, 0.54, 0.42, 0.31],
  "train_accuracy": 0.90,
  "test_accuracy": 0.88,
  "coherence_consumed": 10,
  "grid_resolution": 25,
  "decision_grid": [
    [0.05, 0.12, 0.45],
    ...
  ],
  "circuit_ascii": "     ┌─────────┐┌───────────┐ ...\nq_0: ┤ Ry(x[0]) ├┤ Ry(θ[0]) ├ ..."
}
```

### `POST /api/predict_grid`
Permite predecir la frontera para un conjunto dado de parámetros sin consumir presupuesto de entrenamiento (utilizado para inspección o slider manual de ángulos).

---

## 7. Especificaciones de UI/UX (Frontend React + Vite)

### 7.1. Estética Visual: "Quantum Cyberpunk Arcade"
- Fondo oscuro `#0a0e17` con degradados sutiles cian y violeta (`#00f0ff`, `#a855f7`).
- Tarjetas con efecto glassmorphism (`backdrop-blur-md bg-white/5 border border-white/10`).
- Tipografía moderna monoespaciada para valores cuánticos y sans-serif elegante (Inter/Outfit).

### 7.2. Layout de Pantalla Principal
1. **Top Bar:** Logotipo de Qubit Quest, Nivel actual (Selector 1, 2, 3), Medidor de Coherencia con barra de energía brillante, y Score acumulado.
2. **Columna Izquierda (Quantum Lab):**
   - Canvas 2D interactivo ($500 \times 500$ px): muestra el decision boundary coloreado (azul vs naranja) con los puntos del dataset flotando sobre él.
   - Puntos con efecto glow suave según su clase.
3. **Columna Derecha (Cockpit de Control & Circuito):**
   - Panel de Control: Botón grande "PULSE QUANTUM TRAIN" (animado con pulso de luz), selector de épocas por pulso (5, 10, 15), y botón "Reset Circuit".
   - Mini visor del circuito cuántico (muestra los qubits $q_0, q_1$, compuertas con sus ángulos $\theta_i$, y compuerta CNOT si está activa).
   - Métricas en vivo: Loss, Train Accuracy, Test Accuracy (con barra comparativa respecto a la meta).
   - Botón "Upgrades / Hardware Lab": abre modal para añadir capas o activar entrelazamiento.
4. **Bottom Bar / Pedagogical Drawer:**
   - Sección colapsable "Quantum vs Classical": Muestra claramente la analogía pedagógica:
     - *Datos Clásicos* $\rightarrow$ *Quantum State ($R_y$)*
     - *Pesos de Red Neuronal* $\rightarrow$ *Ángulos variacionales ($\theta$)*
     - *Capa Densa No Lineal* $\rightarrow$ *Entrelazamiento CNOT*

---

## 8. Plan de Implementación Paso a Paso para el Agente de IA

### Fase 1: Setup del Entorno y Backend (FastAPI + Qiskit)
1. Configurar entorno con Python 3.12 y crear `backend/requirements.txt` (`fastapi`, `uvicorn`, `qiskit`, `qiskit-machine-learning`, `qiskit-aer`, `scikit-learn`, `numpy`).
2. Implementar `backend/app/datasets.py` con generadores reproducibles para los 3 niveles.
3. Implementar `backend/app/qml_engine.py` optimizado:
   - Crear circuito parametrizado con Qiskit.
   - Entrenador rápido con `COBYLA` o evaluación directa de función de coste con NumPy / Statevector para máxima velocidad.
   - Generador de matriz de frontera de decisión 2D.
4. Implementar `backend/app/main.py` exponiendo los endpoints `/api/levels`, `/api/levels/{id}/data`, `/api/train`.
5. Probar backend con `pytest` o script de verificación (`test_backend.py`).

### Fase 2: Setup del Frontend (React + Vite)
1. Inicializar proyecto con `npx -y create-vite@latest frontend --template react`.
2. Instalar dependencias: `lucide-react`, `canvas-confetti`, `clsx`, `tailwind` (o estilos CSS arcade con tokens dedicados).
3. Construir `GameCanvas.jsx` con renderizado de:
   - Fondo de cuadrícula estilo radar cuántico.
   - Mapa de calor de frontera de decisión interpolado a partir de la matriz del backend.
   - Puntos de datos renderizados con borde y sombra brillante.
4. Construir `CircuitViewer.jsx` renderizando las compuertas de forma gráfica y reactiva.
5. Construir paneles de control, medidor de coherencia y modales de victoria/game over.

### Fase 3: Integración, Pulido y Gamificación
1. Conectar frontend con backend mediante `frontend/src/services/api.js`.
2. Integrar efectos de sonido sutiles con Web Audio API (bip cuántico en cada pulso de entrenamiento, fanfarria de victoria al completar nivel).
3. Añadir modal de Upgrades para desbloquear la Capa 2 y la compuerta CNOT cuando se avanza a Niveles 2 y 3.
4. Implementar el "Quantum vs Classical Inspector" para garantizar la máxima puntuación en la rúbrica EdTech del jurado.

### Fase 4: Validación y Entregables
1. Verificar que el backend responda en $< 1.5$s para 10 épocas.
2. Comprobar que los tres niveles sean jugables y ganables con las decisiones correctas.
3. Documentar en `README.md` instrucciones precisas de ejecución:
   - **Modo Desarrollo:** `docker compose up -d --build` (levanta solo `backend` en `127.0.0.1:4285`) + `cd frontend && npm run dev` (escucha en `0.0.0.0:4286`).
   - **Modo Producción (`prod`):** `docker compose --profile prod up -d --build` (levanta `backend` en `127.0.0.1:4285` y `frontend` compilado en Nginx en `0.0.0.0:4286` con proxy `/api/` hacia el backend).
4. Dejar el repositorio listo para la presentación/pitch del evento.

---

## 9. Criterios de Aceptación (Definition of Done)
- [x] El backend inicia sin errores en Docker (`127.0.0.1:4285`) o con `python backend/run.py` en el puerto 4285.
- [x] El frontend inicia en `http://0.0.0.0:4286` (tanto con `npm run dev` como con `docker compose --profile prod up`) y se comunica vía proxy `/api` sin errores de CORS con el backend.
- [x] Al presionar "PULSE QUANTUM TRAIN", los puntos y la frontera de decisión se actualizan visualmente en el canvas.
- [x] El presupuesto de coherencia se reduce por cada entrenamiento.
- [x] Al alcanzar $\ge 85\%$ de precisión en el Nivel 1, aparece la pantalla de victoria con estrellas calculadas.
- [x] Los Niveles 2 y 3 demuestran pedagógicamente la necesidad de mayor profundidad y de entrelazamiento cuántico (CNOT).
- [x] El código está completamente documentado y listo para ser evaluado por el jurado.
