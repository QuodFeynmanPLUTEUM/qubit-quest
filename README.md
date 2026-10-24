# qubit-quest
Reto 3 for Qiskit Global Hackaton - Train a Variational Quantum Classifier (VQC)

What is Qubit Quest?
A game where players teach a tiny quantum AI to recognize patterns, experimenting with how quantum circuits learn and how their design affects the result.

It uses a variational quantum classifier, a machine-learning model built from a parameterized quantum circuit.

---
Qubit Quest is an interactive educational game that introduces players to quantum machine learning through pattern-recognition challenges.

Players train a Variational Quantum Classifier (VQC), a supervised machine-learning model built from a parameterized quantum circuit, to distinguish between different classes of data.

As they progress through increasingly difficult levels, players experiment with quantum circuit configurations, trainable parameters, and entangling gates. They observe how these choices affect training loss, classification accuracy, and generalization to unseen data.

The project maps classical supervised learning to quantum machine learning by connecting trainable model parameters to quantum gate angles, feature representations to quantum feature encoding, and model predictions to measurement outcomes.

Built with Qiskit and Qiskit Machine Learning, Qubit Quest makes quantum machine learning tangible through experimentation, resource management, and replayable challenges. Rather than assuming quantum models are always superior, the game encourages players to discover how they work and where their limitations lie.
---

3 levels:

Level 1: How machine learning learns patterns
The player sees examples with known labels, trains a model, and watches its decision boundary change. They learn that training adjusts parameters to reduce prediction error.

Level 2: How a quantum model represents and learns patterns
Instead of ordinary neurons and weights, the model uses quantum gates with adjustable angles. Input data is encoded into quantum states, gates transform those states, and measurements produce predictions.

Level 3: Why circuit design and training matter
Changing circuit parameters, adding an entangling gate, or changing the number of trainable layers can affect the model's predictions and its ability to learn. More complexity isn't automatically better.

What does the player do?
The player is trains an AI to recognize increasingly complicated patterns.

Level 1 — First Contact
The player trains a basic quantum circuit on a simple dataset. They see the accuracy improve and learn what training actually does.


Level 2 — The Pattern Gets Weird
The dataset becomes harder. The player can spend resources to add a trainable circuit layer or choose a different circuit configuration. They compare the results.

Level 3 — Entanglement Unlocked
The player unlocks an entangling gate and tests whether the new circuit can improve performance. The result is not guaranteed: they must experiment and evaluate.


The game rewards players for reaching a target test accuracy with a limited training budget. They can retry levels, compare circuit configurations, and try to beat their previous scores.
For the initial version, keep the upgrades limited to one or two meaningful choices. A circuit layer and an entangling-gate option are enough.

The game teaches players both how the quantum classifier works and how training choices affect its performance.

---

## Architecture & Directory Structure

```
qubit-quest/
├── docker-compose.yml          # Default: backend (127.0.0.1:4285) | Profile "prod": + frontend Nginx (0.0.0.0:4286)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py                  # Uvicorn server on port 4285
│   ├── test_backend.py         # Qiskit Statevector & level progression test suite
│   └── app/
│       ├── main.py             # FastAPI endpoints (/api/levels, /api/train, /api/predict_grid)
│       ├── qml_engine.py       # 2-Qubit Qiskit VQC, Data Re-Uploading, CNOT & Statevector simulator
│       ├── datasets.py         # Deterministic 2D datasets (Blobs, Concentric Circles, Quantum XOR)
│       └── game_rules.py       # Coherence budget, star medals, and scoring engine
├── frontend/
│   ├── Dockerfile              # Multi-stage Vite build + Nginx on 0.0.0.0:4286
│   ├── nginx.conf              # Reverse proxy /api/ -> http://backend:4285/api/
│   ├── vite.config.js          # Dev server on 0.0.0.0:4286 with /api proxy to 127.0.0.1:4285
│   └── src/                    # React 18 + Tailwind CSS Quantum Cyberpunk UI
├── README.md
└── specs.md
```

## Quick Start (Docker & Development)

### 1. Modo Desarrollo (Backend en Docker + Frontend manual con Vite)
Sin especificar perfil, Docker levanta únicamente el **backend** escuchando exclusivamente en `127.0.0.1:4285`:
```bash
docker compose up -d --build
```
Luego levanta manualmente el **frontend** en desarrollo (escucha en `0.0.0.0:4286` con proxy hacia `127.0.0.1:4285`):
```bash
cd frontend
npm install
npm run dev
```
Abre `http://localhost:4286` en tu navegador.

### 2. Modo Producción (Perfil `prod` con Nginx)
Con el perfil `prod`, Docker compila el frontend de React/Vite y lo sirve con **Nginx** en `0.0.0.0:4286` haciendo proxy inverso de `/api/` hacia el contenedor `backend` (`127.0.0.1:4285`):
```bash
docker compose --profile prod up -d --build
```
Abre `http://0.0.0.0:4286` en tu navegador.

