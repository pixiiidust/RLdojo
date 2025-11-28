

import { Run, RunStatus, MetricPoint, ModelArtifact, EpisodeTrajectory, StepState, Action, Difficulty, OpponentType, TrainingDuration, Algorithm, TrainingPreset } from '../types';

// Constants
const ARENA_SIZE = 11; // 0 to 10
const MAX_HP = 100;

// Helper to generate random ID
const uuid = () => Math.random().toString(36).substring(2, 9);

// --- Mock Data Generators ---

const BEGINNER_TEMPLATES = [
  { 
    name: "My First Fighter", 
    difficulty: Difficulty.EASY,
    duration: 'SHORT' as TrainingDuration,
    description: "A basic training session to learn movement."
  },
  { 
    name: "Aggressive Bot", 
    difficulty: Difficulty.NORMAL,
    duration: 'MEDIUM' as TrainingDuration,
    description: "Training to defeat aggressive opponents."
  }
];

export const generateMockRuns = (count: number): Run[] => {
  // Start with just 1 or 2 runs for a cleaner "new user" feel
  return Array.from({ length: 2 }).map((_, i) => {
    const template = BEGINNER_TEMPLATES[i % BEGINNER_TEMPLATES.length];
    const createdAt = new Date().toISOString(); 

    return {
      run_id: `run_${uuid()}`,
      name: template.name,
      description: template.description,
      category: "Beginner",
      created_at: createdAt,
      started_at: undefined,
      finished_at: undefined,
      status: RunStatus.QUEUED,
      best_mean_reward: 0,
      current_episode: 0,
      total_episodes: template.duration === 'SHORT' ? 50 : 200,
      tags: ['beginner'],
      mode: 'SIMPLE' as const,
      ui_config: {
        friendly_difficulty: template.difficulty === Difficulty.EASY ? "Rookie" : "Pro",
        training_duration: template.duration,
        goal_description: template.description
      },
      config: {
        env_name: 'StickFight-v0',
        env_version: 'v0',
        max_steps: 200,
        difficulty: template.difficulty,
        algo: Algorithm.DQN,
        training_preset: template.duration === 'SHORT' ? TrainingPreset.QUICK : TrainingPreset.STANDARD,
        hyperparams: {
          learning_rate: 0.0005,
          batch_size: 64,
          epsilon_start: 1.0,
          gamma: 0.99,
          buffer_size: 100000
        },
        reward_weights: {
          damage_dealt: 1.0,
          damage_taken: -1.0,
          win: 10.0
        },
        seed: 123 + i
      }
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateMetrics = (runId: string, episodes: number): MetricPoint[] => {
  const data: MetricPoint[] = [];
  if (episodes === 0) return data;
  
  let currentReward = -10;
  let winRate = 0;
  
  // Smoother curve for beginners
  for (let i = 0; i < episodes; i += 5) { 
    // Simulate learning curve
    currentReward += (Math.random() * 0.5); 
    if (currentReward > 15) currentReward = 15;
    
    // Win rate correlates with reward but with some noise
    const baseWinRate = (i / episodes) * 0.8; // Approaches 80%
    winRate = Math.min(0.95, Math.max(0, baseWinRate + (Math.random() * 0.1 - 0.05)));
    
    data.push({
      episode: i,
      reward: parseFloat(currentReward.toFixed(2)),
      win_rate: parseFloat(winRate.toFixed(2)),
      steps: Math.max(10, 200 - (winRate * 100) + (Math.random() * 20)),
      epsilon: Math.max(0.05, 1.0 - (i / episodes))
    });
  }
  return data;
};

export const generateModels = (runId: string): ModelArtifact[] => {
  return [
    {
      model_id: `mod_${uuid()}`,
      run_id: runId,
      env_name: 'StickFight-v0',
      env_version: 'v0',
      obs_dim: 13,
      action_dim: 6,
      framework: 'pytorch',
      created_at: new Date().toISOString(),
      is_best: true,
      export_status: 'ok',
      onnx_path: `artifacts/${runId}_policy.onnx`,
      checkpoint_path: `artifacts/${runId}_policy.pt`,
      evaluations: {
        [OpponentType.RANDOM]: 0.92,
        [OpponentType.AGGRESSIVE]: 0.78,
        [OpponentType.DEFENSIVE]: 0.85,
        [OpponentType.MIRROR]: 0.50
      }
    }
  ];
};

// --- Game Logic Simulator for Playback ---
export const simulateEpisode = (opponentType: OpponentType, seed: number = 42): EpisodeTrajectory => {
  const steps: StepState[] = [];
  let selfPos = 2;
  let oppPos = 8;
  let selfHp = MAX_HP;
  let oppHp = MAX_HP;
  let selfKickAvail = 0;
  let oppKickAvail = 0;
  const maxSteps = 200;
  let won = false;
  let totalReward = 0;

  for (let t = 0; t < maxSteps; t++) {
    const dist = Math.abs(selfPos - oppPos);
    let selfAction = Action.IDLE;
    
    // Simple scripted agent behavior
    if (dist > 2) {
         selfAction = selfPos < oppPos ? Action.MOVE_RIGHT : Action.MOVE_LEFT;
    } else if (dist === 2) {
         if (t >= selfKickAvail && Math.random() > 0.3) {
             selfAction = Action.KICK;
         } else {
             selfAction = Action.MOVE_RIGHT;
         }
    } else { // dist === 1
         if (Math.random() > 0.4) {
             selfAction = Action.PUNCH;
         } else {
             selfAction = Action.BLOCK;
         }
    }

    let oppAction = Action.IDLE;
    if (opponentType === OpponentType.RANDOM) {
        const actions = [0, 1, 2, 3, 5];
        if (t >= oppKickAvail) actions.push(4);
        const idx = Math.floor(Math.random() * actions.length);
        oppAction = actions[idx] as Action;
    } else if (opponentType === OpponentType.AGGRESSIVE) {
        if (dist > 2) oppAction = oppPos > selfPos ? Action.MOVE_LEFT : Action.MOVE_RIGHT;
        else if (dist === 2) t >= oppKickAvail ? oppAction = Action.KICK : (oppPos > selfPos ? oppAction = Action.MOVE_LEFT : oppAction = Action.MOVE_RIGHT);
        else oppAction = Action.PUNCH;
    } else if (opponentType === OpponentType.MIRROR) {
        // Mirror copies Agent logic with noise
         if (dist > 2) {
            oppAction = oppPos > selfPos ? Action.MOVE_LEFT : Action.MOVE_RIGHT;
       } else if (dist === 2) {
            if (t >= oppKickAvail && Math.random() > 0.3) {
                oppAction = Action.KICK;
            } else {
                oppAction = Action.MOVE_LEFT; // Move towards
            }
       } else {
            oppAction = Math.random() > 0.5 ? Action.PUNCH : Action.BLOCK;
       }
    } else {
        // Defensive
        if (dist < 3) {
            const awayDir = oppPos > selfPos ? Action.MOVE_RIGHT : Action.MOVE_LEFT;
            const atEdge = (oppPos === 0 && awayDir === Action.MOVE_LEFT) || (oppPos === ARENA_SIZE - 1 && awayDir === Action.MOVE_RIGHT);
            if (!atEdge && Math.random() > 0.3) oppAction = awayDir;
            else oppAction = Action.BLOCK;
        } else oppAction = Math.random() > 0.5 ? Action.IDLE : Action.BLOCK;
    }

    let desiredSelfPos = selfPos;
    if (selfAction === Action.MOVE_LEFT) desiredSelfPos--;
    if (selfAction === Action.MOVE_RIGHT) desiredSelfPos++;
    desiredSelfPos = Math.max(0, Math.min(ARENA_SIZE - 1, desiredSelfPos));
    if (desiredSelfPos !== oppPos) selfPos = desiredSelfPos;

    let desiredOppPos = oppPos;
    if (oppAction === Action.MOVE_LEFT) desiredOppPos--;
    if (oppAction === Action.MOVE_RIGHT) desiredOppPos++;
    desiredOppPos = Math.max(0, Math.min(ARENA_SIZE - 1, desiredOppPos));
    if (desiredOppPos !== selfPos) oppPos = desiredOppPos;

    const newDist = Math.abs(selfPos - oppPos);
    let selfPendingDmg = 0;
    let oppPendingDmg = 0;
    const selfIsBlocking = selfAction === Action.BLOCK;
    const oppIsBlocking = oppAction === Action.BLOCK;

    if (selfAction === Action.PUNCH && newDist <= 1) oppPendingDmg += oppIsBlocking ? 2 : 15;
    else if (selfAction === Action.KICK && newDist <= 2) {
      oppPendingDmg += oppIsBlocking ? 2 : 10;
      selfKickAvail = t + 2;
    }

    if (oppAction === Action.PUNCH && newDist <= 1) selfPendingDmg += selfIsBlocking ? 2 : 15;
    else if (oppAction === Action.KICK && newDist <= 2) {
      selfPendingDmg += selfIsBlocking ? 2 : 10;
      oppKickAvail = t + 2;
    }

    selfHp = Math.max(0, selfHp - selfPendingDmg);
    oppHp = Math.max(0, oppHp - oppPendingDmg);

    let stepReward = -0.01 + oppPendingDmg - selfPendingDmg;
    if (newDist >= 1 && newDist <= 2) stepReward += 0.01;
    if (oppHp <= 0) { stepReward += 10; won = true; } 
    if (selfHp <= 0) { stepReward -= 10; won = false; }
    if (oppHp <= 0) won = true; else if (selfHp <= 0) won = false;

    totalReward += stepReward;
    steps.push({
      t, self_pos: selfPos, opp_pos: oppPos, self_hp: selfHp, opp_hp: oppHp,
      self_action: selfAction, opp_action: oppAction, reward: parseFloat(stepReward.toFixed(2)),
      self_blocking: selfIsBlocking, opp_blocking: oppIsBlocking
    });
    if (selfHp <= 0 || oppHp <= 0) break;
  }

  return { episode_id: uuid(), won, total_reward: parseFloat(totalReward.toFixed(2)), steps };
};