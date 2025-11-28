# Product Requirements Document: RLdojo (Neural Nexus)

## 1. Executive Summary
**Product Name:** RLdojo (Internal Code: Neural Nexus)  
**Version:** 1.0 (Terminal Interface)  
**Description:** A browser-based "Dojo" interface designed to democratize Reinforcement Learning (RL). It allows users—ranging from absolute beginners to experienced engineers—to configure, train, visualize, and analyze AI agents in a "StickFight" combat environment. The interface utilizes a retro-futuristic "Terminal" aesthetic to gamify the technical aspects of ML experimentation.

---

## 2. Product Goals & User Personas

### 2.1 Goals
1.  **Democratize RL:** Make complex RL concepts (DQN, PPO, Hyperparameters) accessible via a "Wizard" onboarding flow and gamified visuals.
2.  **Visual Feedback Loop:** Provide immediate visual gratification through real-time fighting simulations and live telemetry charts.
3.  **Educational Insight:** Leverage GenAI to act as a "Sensei," translating raw numerical metrics into plain-English tactical analysis.

### 2.2 User Personas
*   **The Rookie (Beginner):** Wants to see a robot fight. intimidated by math. Uses the "Wizard" and "Quick Demo" presets. Relies on the AI Analysis report to understand what happened.
*   **The Engineer (Advanced):** Wants to test specific algorithms (PPO vs DQN) or custom episode counts. Skips the wizard to access the main console directly. Looks at specific reward curves and win rates.

---

## 3. Functional Requirements

### 3.1 Onboarding & Creation
*   **Wizard Mode:** A 3-step modal for beginners.
    *   *Identity:* Name the agent.
    *   *Challenge:* Select difficulty (Rookie, Pro, Elite).
    *   *Confirm:* Review settings before initialization.
*   **Manual Mode:** Advanced users can skip the wizard to land on the main console with a default setup.

### 3.2 Main Workspace (The Console)
The primary UI is divided into three sections:
1.  **Fighter Logs (Sidebar):**
    *   List of all agents (Runs).
    *   Status indicators (Queued, Training, Completed).
    *   Comparison tool to view multiple agents side-by-side.
2.  **Command Center (Center):**
    *   **Top Bar:** Training Controls (Algorithm selector, Presets, Episodes, Seed).
    *   **Status Log:** Narrative text feedback describing the agent's current state.
    *   **Action Button:** Context-aware main button (Start Training / Stop / Watch Demo).
3.  **Visualization Deck (Right):**
    *   **Telemetry Mode:** Live updating charts (Win Rate, Reward).
    *   **Visuals Mode:** The Arena Viewer (StickFight simulation).

### 3.3 Training Configuration
*   **Algorithms:**
    *   *DQN (Deep Q-Network):* Fast, value-based. Good for simple tasks.
    *   *PPO (Proximal Policy Optimization):* Stable, policy-based. Good for complex movement.
*   **Presets:**
    *   *Quick:* 50 Episodes.
    *   *Standard:* 200 Episodes.
    *   *Deep:* 1000 Episodes.
    *   *Custom:* User-defined integer.
*   **Seed:** Display and explanation of the random seed for reproducibility.

### 3.4 The Arena (Simulation)
*   **Visuals:** 2D Stick figure combat.
    *   Agent (Amber) vs Opponent (Red).
    *   Thick retro outlines, 40% taller sprites for visibility.
    *   Health bars with numeric HP indicators.
*   **Mechanics:**
    *   Move Left/Right, Punch, Kick, Block.
    *   Distance management logic.
*   **Commentary:** Real-time text generation based on combat events (Critical hits, blocks, knockouts).
*   **End of Episode:**
    *   "ASCII-style" summary box.
    *   Options: Watch Replay, Choose Opponent (Random/Aggressive/Defensive/Mirror), Choose Brain.

### 3.5 Analytics & AI Reporting
*   **Telemetry Charts:**
    *   *Skill Level:* Win rate percentage over time.
    *   *Learning Progress:* Mean reward per episode.
*   **AI Analysis Dashboard:** A dedicated modal overlay.
    *   *Insight Summary:* GenAI-generated text in "Paul Graham" style (Simple, bulleted, clear headers).
    *   *Radar Chart:* 5-axis metric comparison (Random, Aggressive, Defensive, Efficiency, Reward).
    *   *Anomaly Report:* Visual grid representing memory buffer states.
    *   *Event Log:* Timestamped training milestones.

---

## 4. Technical Specifications

### 4.1 Tech Stack
*   **Framework:** React 18+ (Vite).
*   **Styling:** Tailwind CSS with custom animations (Scanlines, CRT glow, Retro borders).
*   **Typography:** 'VT323' (Google Fonts) for terminal aesthetic.
*   **Charts:** Recharts for telemetry and radar visualization.
*   **Icons:** Lucide-React.
*   **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash) for textual analysis.

### 4.2 Data Models
*   **Run (Agent):** Stores config, status, and telemetry.
*   **EpisodeTrajectory:** Stores frame-by-frame simulation data (positions, HP, actions) for playback.
*   **ModelArtifact:** Represents the trained policy and its evaluation metrics.

### 4.3 Simulation Logic (`rlService.ts`)
*   Frontend-based mock simulation to emulate RL environment behavior without a Python backend.
*   Heuristic-based opponent logic (Random, Aggressive, Defensive, Mirror).
*   Reward function calculation logic mirrored from standard Gym environments.

---

## 5. UI/UX Design System
*   **Theme:** "Dark Amber Terminal."
    *   Background: #050300 (Deep Black).
    *   Primary: #FFB000 (Amber).
    *   Alerts: Red / Green (Standard terminal colors).
*   **Interaction Principles:**
    *   **Haptic Visuals:** Buttons depress, borders glow, text flickers on load.
    *   **Tooltips:** Extensive use of hover-states to explain technical terms (Seed, Algorithm) to beginners.
    *   **Density:** High information density, using scrollable panels (custom scrollbars) to maintain a single-screen dashboard feel.

## 6. Future Roadmap
*   **Backend Integration:** Connect to a real Python/PyTorch backend for actual model training via WebSocket.
*   **Advanced Editor:** Allow users to edit reward weights visually.
*   **Multi-Agent:** Enable "Battle Royale" mode with >2 agents.
