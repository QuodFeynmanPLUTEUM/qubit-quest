# qubit-quest
Reto 3 for Qiskit Global Hackaton - Train a Variational Quantum Classifier (VQC)

What is Qubit Quest?
A game where players teach a tiny quantum AI to recognize patterns, experimenting with how quantum circuits learn and how their design affects the result.

A screen showing blue and orange dots scattered across a grid. Each color represents a different class. The player trains the ML model to separate them.

The interesting part is that the AI isn't a conventional neural network. It uses a variational quantum classifier, a machine-learning model built from a parameterized quantum circuit.

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

qubit-quest/
├── app.py                 # Teammate: Streamlit interface
├── qml_model.py           # You: quantum model and training
├── game_logic.py          # Shared: scoring and level rules
├── requirements.txt       # Shared dependencies
├── README.md              # Setup and project pitch
└── .gitignore

TO DO FOR NOW:

[ ] Create app.py with the title and game layout
[ ] Build a level selector and circuit configuration controls
[ ] Display the dataset and decision-boundary plot using placeholder data
[ ] Add Train and Reset buttons with loading feedback
[ ] Display accuracy, loss, score, and remaining training budget
[ ] Add level completion, retry, and a basic upgrade mechanic

[ ] Create qml_model.py with the agreed function signatures
[ ] Generate a small two-class training and test dataset
[ ] Implement a parameterized Qiskit circuit and classifier
[ ] Train it and record loss and test accuracy
[ ] Implement prediction over a grid for the decision-boundary plot
[ ] Test with the actual Streamlit app and document the model outputs
