export interface TeamRecord {
  id: string;
  team_name: string;
  members: string[];
  password_hash: string;
  created_at: number;
}

export interface ProgressRecord {
  team_id: string;
  current_level: number;
  branch: string; // 'UNALIGNED' | 'A' | 'B'
  sub_branch: string; // 'NONE' | 'A1' | 'A2' | 'B1' | 'B2'
  burn_level: number;
  key_fragments: number[];
  started_at: number;
  finished_at: number | null;
  ending: string | null; // 'X' | 'Y' | 'Z'
  wrong_attempts_current: number;
}

export interface SubmissionRecord {
  id: number;
  team_id: string;
  level: number;
  answer_given: string;
  correct: number;
  created_at: number;
  team_name?: string;
}

export interface ChoiceRecord {
  id?: number;
  team_id: string;
  level: number;
  option: string;
  chosen_at: number;
  auto_penalized: number | boolean;
}

export interface DilemmaSessionRecord {
  team_id: string;
  level: number;
  started_at: number;
  expires_at: number;
}

export interface LeaderboardEntry {
  team_id: string;
  team_name: string;
  members: string[];
  cleared_levels: number;
  current_level: number;
  branch: string;
  sub_branch: string;
  burn_level: number;
  key_fragments: number[];
  is_finished: boolean;
  ending: string | null;
  raw_elapsed_ms: number;
  adjusted_elapsed_ms: number;
  penalty_seconds: number;
  last_active_at: number;
}

export interface RoundRecord {
  id: string;
  round_number: number;
  branch: string;
  act: number;
  year: number;
  title: string;
  agency: string;
  cipher_type: string;
  story_text: string;
  ciphertext: string;
  clue: string;
  hint?: string | null;
  pamphlet_key?: string | null;
  is_dilemma: boolean;
  timer_seconds?: number | null;
  key_fragment?: number | null;
  options?: any[];
  answer_hash: string;
  accepted_variants?: string[];
  created_at?: number;
}

export interface DatabaseAdapter {
  isEventPaused(): Promise<boolean>;
  setEventPaused(paused: boolean): Promise<void>;
  createTeam(id: string, teamName: string, members: string[], passwordHash: string): Promise<TeamRecord>;
  getTeamByName(teamName: string): Promise<TeamRecord | null>;
  getTeamById(id: string): Promise<TeamRecord | null>;
  getAllTeams(): Promise<(TeamRecord & { progress: ProgressRecord })[]>;
  getProgress(teamId: string): Promise<ProgressRecord | null>;
  updateProgress(teamId: string, updates: Partial<ProgressRecord>): Promise<void>;
  advanceTeamLevel(
    teamId: string,
    expectedLevel: number,
    nextLevel: number,
    keyFragments: number[],
    finishedAt?: number | null
  ): Promise<{ advanced: boolean }>;
  recordSubmission(teamId: string, level: number, answerGiven: string, correct: boolean): Promise<SubmissionRecord>;
  getLastSubmissionTime(teamId: string): Promise<number | null>;
  checkRateLimit(key: string, minIntervalMs: number): Promise<{ allowed: boolean; waitRemainingSeconds?: number }>;
  getAllSubmissions(limit?: number): Promise<any[]>;
  startDilemmaSession(teamId: string, level: number, durationSeconds: number): Promise<DilemmaSessionRecord>;
  getDilemmaSession(teamId: string, level: number): Promise<DilemmaSessionRecord | null>;
  recordChoice(teamId: string, level: number, option: string, autoPenalized: boolean): Promise<void>;
  getChoices(teamId: string): Promise<ChoiceRecord[]>;
  resetTeam(teamId: string): Promise<void>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getRounds?(): Promise<RoundRecord[]>;
  getRound?(levelNumber: number, branch?: string): Promise<RoundRecord | null>;
}
