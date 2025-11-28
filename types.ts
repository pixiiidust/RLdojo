

export enum RunStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED'
}

export enum OpponentType {
  RANDOM = 'random',
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  MIRROR = 'mirror'
}

export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

export enum Algorithm {
  DQN = 'DQN',
  PPO = 'PPO'
}

export enum TrainingPreset {
  QUICK = 'QUICK',
  STANDARD = 'STANDARD',
  DEEP = 'DEEP',
  CUSTOM = 'CUSTOM'
}

export type TrainingDuration = 'SHORT' | 'MEDIUM' | 'LONG';

export interface BeginnerConfig {
  friendly_difficulty: string; // "Rookie", "Pro", "Elite"
  training_duration: TrainingDuration;
  goal_description: string;
}

export interface RunConfig {
  env_name: string;
  max_steps: number;
  difficulty: Difficulty | string; 
  algo: Algorithm | string;
  training_preset?: TrainingPreset;
  episodes_count?: number;
  hyperparams: {
    learning_rate: number;
    batch_size: number;
    epsilon_start: number;
    epsilon_end?: number;
    epsilon_decay_episodes?: number;
    gamma?: number;
    buffer_size?: number;
  };
  reward_weights?: Record<string, number>;
  seed?: number;
  env_version?: string;
  code_version?: string;
}

export interface Run {
  run_id: string;
  name: string;      
  description: string; 
  category: string;  
  user_id?: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  status: RunStatus;
  best_mean_reward: number;
  config: RunConfig;
  ui_config?: BeginnerConfig; // New field for simple mode UI
  current_episode: number;
  total_episodes: number;
  tags?: string[];
  error_message?: string;
  mode: 'SIMPLE' | 'ADVANCED'; // Track if this was created via wizard or manual
}

export interface MetricPoint {
  episode: number;
  reward: number;
  win_rate: number;
  steps: number;
  epsilon: number;
}

export interface ModelArtifact {
  model_id: string;
  run_id: string;
  env_name: string;
  env_version: string;
  obs_dim: number;
  action_dim: number;
  framework: string;
  created_at: string;
  is_best: boolean;
  export_status: 'ok' | 'failed';
  evaluations: Record<OpponentType, number>; // Win rates
  checkpoint_path?: string;
  onnx_path?: string;
}

export enum Action {
  IDLE = 0,
  MOVE_LEFT = 1,
  MOVE_RIGHT = 2,
  PUNCH = 3,
  KICK = 4,
  BLOCK = 5
}

export interface StepState {
  t: number;
  self_pos: number;
  opp_pos: number;
  self_hp: number;
  opp_hp: number;
  self_action: Action;
  opp_action: Action;
  reward: number;
  self_blocking: boolean;
  opp_blocking: boolean;
}

export interface EpisodeTrajectory {
  episode_id: string;
  won: boolean;
  total_reward: number;
  steps: StepState[];
}