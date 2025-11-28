# RLdojo

RLdojo is a retro futuristic interface designed to democratize and visualize Reinforcement Learning. 
- It provides an educational terminal style environment where users can train AI agents to fight in a 2D combat simulation. 
- The application gamifies machine learning education, making complex processes like generic algorithms, hyperparameters, and reward functions accessible through visual feedback and AI-driven analysis.
The goal is to make RL feel simple, visual, and hands on.

# Screenshots

<div align="center">
  <img width="600" alt="image" src="https://github.com/user-attachments/assets/079dba7b-4620-497a-bd42-1540a454447e" />
</div>

<div align="center">
  <img width="600" alt="image" src="https://github.com/user-attachments/assets/599a31ab-d67e-4e8c-b3df-bb7905040276" />
</div>

<div align="center">
  <img width="600" alt="image" src="https://github.com/user-attachments/assets/ea879c37-073f-4285-872b-ff55f4ac6eeb" />
</div>

<div align="center">
  <img width="600" alt="image" src="https://github.com/user-attachments/assets/6991b4e5-930a-4282-813b-1fef5f52fc5d" />
</div>

# How It Works

1.  **Create a Fighter:** Use the **Wizard** to set up a beginner-friendly agent or access the **Console** directly for granular control.
2.  **Train:** Configure your training run (Algorithm: DQN/PPO, Duration: Quick/Deep) and watch real-time telemetry charts (Win Rate, Reward) as the agent learns.
3.  **Visualize:** Switch to the **Arena Viewer** to watch your agent fight in a 2D "StickFight" simulation. See exactly how it behaves against Random, Aggressive, or Defensive opponents.
4.  **Analyze:** Use the **AI Analysis** feature (powered by Google Gemini) to generate a "Sensei Report" that explains your agent's strategy, strengths, and weaknesses in plain English.

##  Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd rldojo
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_google_gemini_api_key
    ```

4.  **Run the Development Server**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

##  Tech Stack

*   **Frontend Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS (Custom Retro/CRT Theme)
*   **Visualization:** Recharts (Telemetry), Custom React Canvas (Arena)
*   **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash)
*   **Icons:** Lucide React
*   **Font:** 'VT323' (Google Fonts)

---
*Note: This version runs a heuristic-based simulation in the browser (`rlService.ts`) to demonstrate the UI/UX flow without requiring a Python/PyTorch backend.*
