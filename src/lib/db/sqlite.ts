import {
  DatabaseAdapter,
  TeamRecord,
  ProgressRecord,
  SubmissionRecord,
  ChoiceRecord,
  DilemmaSessionRecord,
  LeaderboardEntry,
  RoundRecord,
} from './types';

let dbInstance: any = null;

async function getDb(): Promise<any> {
  if (!dbInstance) {
    // Dynamic import with variable indirection and webpackIgnore so bundlers never bundle node:sqlite
    const moduleName = 'node:sqlite';
    const { DatabaseSync } = await import(/* webpackIgnore: true */ moduleName);
    const path = await import('node:path');
    const dbPath = path.join(process.cwd(), 'janus.db');

    dbInstance = new DatabaseSync(dbPath);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      team_name TEXT UNIQUE NOT NULL,
      members TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress (
      team_id TEXT PRIMARY KEY,
      current_level INTEGER NOT NULL DEFAULT 1,
      branch TEXT DEFAULT 'UNALIGNED',
      sub_branch TEXT DEFAULT 'NONE',
      burn_level INTEGER NOT NULL DEFAULT 0,
      key_fragments TEXT NOT NULL DEFAULT '[]',
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      ending TEXT,
      wrong_attempts_current INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS choices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id TEXT NOT NULL,
      level INTEGER NOT NULL,
      option TEXT NOT NULL,
      chosen_at INTEGER NOT NULL,
      auto_penalized INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id TEXT NOT NULL,
      level INTEGER NOT NULL,
      answer_given TEXT NOT NULL,
      correct INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS dilemma_sessions (
      team_id TEXT NOT NULL,
      level INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      PRIMARY KEY(team_id, level)
    );

    CREATE TABLE IF NOT EXISTS event_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      last_attempt_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      round_number INTEGER NOT NULL,
      branch TEXT NOT NULL DEFAULT 'MAIN',
      act INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      agency TEXT NOT NULL,
      cipher_type TEXT NOT NULL,
      story_text TEXT NOT NULL,
      ciphertext TEXT NOT NULL,
      clue TEXT NOT NULL,
      hint TEXT,
      pamphlet_key TEXT,
      is_dilemma INTEGER NOT NULL DEFAULT 0,
      timer_seconds INTEGER,
      key_fragment INTEGER,
      options TEXT NOT NULL DEFAULT '[]',
      answer_hash TEXT NOT NULL,
      accepted_variants TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      UNIQUE(round_number, branch)
    );
  `);

  const checkState = db.prepare("SELECT value FROM event_state WHERE key = 'is_paused'").get();
  if (!checkState) {
    db.prepare("INSERT INTO event_state (key, value) VALUES ('is_paused', 'false')").run();
  }

  const checkSettings = db.prepare("SELECT value FROM settings WHERE key = 'is_paused'").get();
  if (!checkSettings) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('is_paused', 'false')").run();
  }
}

export const sqliteDb: DatabaseAdapter = {
  async isEventPaused(): Promise<boolean> {
    const d = await getDb();
    const row = d.prepare("SELECT value FROM event_state WHERE key = 'is_paused'").get() as { value: string } | undefined;
    return row?.value === 'true';
  },

  async setEventPaused(paused: boolean): Promise<void> {
    const d = await getDb();
    const val = String(paused);
    d.prepare("INSERT OR REPLACE INTO event_state (key, value) VALUES ('is_paused', ?)").run(val);
    d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('is_paused', ?)").run(val);
  },

  async createTeam(
    id: string,
    teamName: string,
    members: string[],
    passwordHash: string
  ): Promise<TeamRecord> {
    const d = await getDb();
    const now = Date.now();
    const membersJson = JSON.stringify(members);

    d.prepare(
      'INSERT INTO teams (id, team_name, members, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(id, teamName, membersJson, passwordHash, now);

    d.prepare(
      "INSERT INTO progress (team_id, current_level, branch, sub_branch, burn_level, key_fragments, started_at, wrong_attempts_current) VALUES (?, 1, 'UNALIGNED', 'NONE', 0, '[]', ?, 0)"
    ).run(id, now);

    return {
      id,
      team_name: teamName,
      members,
      password_hash: passwordHash,
      created_at: now,
    };
  },

  async getTeamByName(teamName: string): Promise<TeamRecord | null> {
    const d = await getDb();
    const row = d.prepare('SELECT * FROM teams WHERE team_name = ? COLLATE NOCASE').get(teamName) as {
      id: string;
      team_name: string;
      members: string;
      password_hash: string;
      created_at: number;
    } | undefined;

    if (!row) return null;
    return {
      ...row,
      members: JSON.parse(row.members || '[]'),
    };
  },

  async getTeamById(id: string): Promise<TeamRecord | null> {
    const d = await getDb();
    const row = d.prepare('SELECT * FROM teams WHERE id = ?').get(id) as {
      id: string;
      team_name: string;
      members: string;
      password_hash: string;
      created_at: number;
    } | undefined;

    if (!row) return null;
    return {
      ...row,
      members: JSON.parse(row.members || '[]'),
    };
  },

  async getAllTeams(): Promise<(TeamRecord & { progress: ProgressRecord })[]> {
    const d = await getDb();
    const rows = d.prepare(`
      SELECT t.*, p.current_level, p.branch, p.sub_branch, p.burn_level, p.key_fragments, p.started_at, p.finished_at, p.ending, p.wrong_attempts_current
      FROM teams t
      LEFT JOIN progress p ON t.id = p.team_id
      ORDER BY t.created_at ASC
    `).all() as Array<{
      id: string;
      team_name: string;
      members: string;
      password_hash: string;
      created_at: number;
      current_level: number;
      branch: string;
      sub_branch: string;
      burn_level: number;
      key_fragments: string;
      started_at: number;
      finished_at: number | null;
      ending: string | null;
      wrong_attempts_current: number;
    }>;

    return rows.map((r) => ({
      id: r.id,
      team_name: r.team_name,
      members: JSON.parse(r.members || '[]'),
      password_hash: r.password_hash,
      created_at: r.created_at,
      progress: {
        team_id: r.id,
        current_level: r.current_level ?? 1,
        branch: r.branch ?? 'UNALIGNED',
        sub_branch: r.sub_branch ?? 'NONE',
        burn_level: r.burn_level ?? 0,
        key_fragments: JSON.parse(r.key_fragments || '[]'),
        started_at: r.started_at ?? r.created_at,
        finished_at: r.finished_at ?? null,
        ending: r.ending ?? null,
        wrong_attempts_current: r.wrong_attempts_current ?? 0,
      },
    }));
  },

  async getProgress(teamId: string): Promise<ProgressRecord | null> {
    const d = await getDb();
    const row = d.prepare('SELECT * FROM progress WHERE team_id = ?').get(teamId) as {
      team_id: string;
      current_level: number;
      branch: string;
      sub_branch: string;
      burn_level: number;
      key_fragments: string;
      started_at: number;
      finished_at: number | null;
      ending: string | null;
      wrong_attempts_current: number;
    } | undefined;

    if (!row) return null;
    return {
      ...row,
      key_fragments: JSON.parse(row.key_fragments || '[]'),
    };
  },

  async updateProgress(teamId: string, updates: Partial<ProgressRecord>): Promise<void> {
    const d = await getDb();
    const current = await this.getProgress(teamId);
    if (!current) return;

    const current_level = updates.current_level !== undefined ? updates.current_level : current.current_level;
    const branch = updates.branch !== undefined ? updates.branch : current.branch;
    const sub_branch = updates.sub_branch !== undefined ? updates.sub_branch : current.sub_branch;
    const burn_level = updates.burn_level !== undefined ? updates.burn_level : current.burn_level;
    const key_fragments = updates.key_fragments !== undefined ? JSON.stringify(updates.key_fragments) : JSON.stringify(current.key_fragments);
    const finished_at = updates.finished_at !== undefined ? updates.finished_at : current.finished_at;
    const ending = updates.ending !== undefined ? updates.ending : current.ending;
    const wrong_attempts_current = updates.wrong_attempts_current !== undefined ? updates.wrong_attempts_current : current.wrong_attempts_current;
    const started_at = updates.started_at !== undefined ? updates.started_at : current.started_at;

    d.prepare(`
      UPDATE progress
      SET current_level = ?, branch = ?, sub_branch = ?, burn_level = ?, key_fragments = ?, finished_at = ?, ending = ?, wrong_attempts_current = ?, started_at = ?
      WHERE team_id = ?
    `).run(current_level, branch, sub_branch, burn_level, key_fragments, finished_at, ending, wrong_attempts_current, started_at, teamId);
  },

  async advanceTeamLevel(
    teamId: string,
    expectedLevel: number,
    nextLevel: number,
    keyFragments: number[],
    finishedAt?: number | null
  ): Promise<{ advanced: boolean }> {
    const d = await getDb();
    const stmt = d.prepare(`
      UPDATE progress
      SET current_level = ?, wrong_attempts_current = 0, key_fragments = ?, finished_at = COALESCE(?, finished_at)
      WHERE team_id = ? AND current_level = ?
    `);

    const res = stmt.run(
      nextLevel,
      JSON.stringify(keyFragments),
      finishedAt ?? null,
      teamId,
      expectedLevel
    );

    return { advanced: Number(res.changes) > 0 };
  },

  async recordSubmission(
    teamId: string,
    level: number,
    answerGiven: string,
    correct: boolean
  ): Promise<SubmissionRecord> {
    const d = await getDb();
    const now = Date.now();
    const res = d.prepare(
      'INSERT INTO submissions (team_id, level, answer_given, correct, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(teamId, level, answerGiven, correct ? 1 : 0, now);

    return {
      id: Number(res.lastInsertRowid),
      team_id: teamId,
      level,
      answer_given: answerGiven,
      correct: correct ? 1 : 0,
      created_at: now,
    };
  },

  async getLastSubmissionTime(teamId: string): Promise<number | null> {
    const d = await getDb();
    const row = d.prepare('SELECT created_at FROM submissions WHERE team_id = ? ORDER BY created_at DESC LIMIT 1').get(teamId) as { created_at: number } | undefined;
    return row ? row.created_at : null;
  },

  async checkRateLimit(
    key: string,
    minIntervalMs: number
  ): Promise<{ allowed: boolean; waitRemainingSeconds?: number }> {
    const d = await getDb();
    const now = Date.now();
    const row = d.prepare('SELECT last_attempt_at FROM rate_limits WHERE key = ?').get(key) as { last_attempt_at: number } | undefined;

    if (row && now - row.last_attempt_at < minIntervalMs) {
      const wait = Math.ceil((minIntervalMs - (now - row.last_attempt_at)) / 1000);
      return { allowed: false, waitRemainingSeconds: wait };
    }

    d.prepare('INSERT INTO rate_limits (key, last_attempt_at) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET last_attempt_at = excluded.last_attempt_at').run(key, now);
    return { allowed: true };
  },

  async getAllSubmissions(limit: number = 200): Promise<any[]> {
    const d = await getDb();
    return d.prepare(`
      SELECT s.*, t.team_name
      FROM submissions s
      JOIN teams t ON s.team_id = t.id
      ORDER BY s.created_at DESC
      LIMIT ?
    `).all(limit);
  },

  async startDilemmaSession(
    teamId: string,
    level: number,
    durationSeconds: number
  ): Promise<DilemmaSessionRecord> {
    const d = await getDb();
    const now = Date.now();
    const expiresAt = now + durationSeconds * 1000;

    d.prepare(`
      INSERT OR REPLACE INTO dilemma_sessions (team_id, level, started_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(teamId, level, now, expiresAt);

    return { team_id: teamId, level, started_at: now, expires_at: expiresAt };
  },

  async getDilemmaSession(teamId: string, level: number): Promise<DilemmaSessionRecord | null> {
    const d = await getDb();
    return d.prepare('SELECT * FROM dilemma_sessions WHERE team_id = ? AND level = ?').get(teamId, level) as DilemmaSessionRecord | undefined || null;
  },

  async recordChoice(
    teamId: string,
    level: number,
    option: string,
    autoPenalized: boolean
  ): Promise<void> {
    const d = await getDb();
    const now = Date.now();
    d.prepare(
      'INSERT INTO choices (team_id, level, option, chosen_at, auto_penalized) VALUES (?, ?, ?, ?, ?)'
    ).run(teamId, level, option, now, autoPenalized ? 1 : 0);
  },

  async getChoices(teamId: string): Promise<ChoiceRecord[]> {
    const d = await getDb();
    return d.prepare('SELECT * FROM choices WHERE team_id = ? ORDER BY level ASC').all(teamId) as Array<{
      id: number;
      team_id: string;
      level: number;
      option: string;
      chosen_at: number;
      auto_penalized: number;
    }>;
  },

  async resetTeam(teamId: string): Promise<void> {
    const d = await getDb();
    const now = Date.now();
    d.prepare('DELETE FROM submissions WHERE team_id = ?').run(teamId);
    d.prepare('DELETE FROM choices WHERE team_id = ?').run(teamId);
    d.prepare('DELETE FROM dilemma_sessions WHERE team_id = ?').run(teamId);
    d.prepare('DELETE FROM rate_limits WHERE key = ?').run(`submit:${teamId}`);
    d.prepare(`
      UPDATE progress
      SET current_level = 1, branch = 'UNALIGNED', sub_branch = 'NONE', burn_level = 0, key_fragments = '[]', started_at = ?, finished_at = NULL, ending = NULL, wrong_attempts_current = 0
      WHERE team_id = ?
    `).run(now, teamId);
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const d = await getDb();
    const rows = d.prepare(`
      SELECT 
        t.id as team_id,
        t.team_name,
        t.members,
        p.current_level,
        p.branch,
        p.sub_branch,
        p.burn_level,
        p.key_fragments,
        p.started_at,
        p.finished_at,
        p.ending,
        (SELECT MAX(created_at) FROM submissions WHERE team_id = t.id) as last_active_at
      FROM teams t
      JOIN progress p ON t.id = p.team_id
    `).all() as Array<{
      team_id: string;
      team_name: string;
      members: string;
      current_level: number;
      branch: string;
      sub_branch: string;
      burn_level: number;
      key_fragments: string;
      started_at: number;
      finished_at: number | null;
      ending: string | null;
      last_active_at: number | null;
    }>;

    const now = Date.now();

    const formatted: LeaderboardEntry[] = rows.map((r) => {
      const isFinished = r.finished_at !== null;
      const clearedLevels = isFinished ? 15 : Math.max(0, r.current_level - 1);
      const rawElapsed = isFinished ? r.finished_at! - r.started_at : (r.last_active_at || now) - r.started_at;

      const penaltySeconds = r.burn_level >= 3 ? (r.burn_level - 2) * 120 : 0;
      const adjustedElapsed = rawElapsed + penaltySeconds * 1000;

      return {
        team_id: r.team_id,
        team_name: r.team_name,
        members: JSON.parse(r.members || '[]'),
        cleared_levels: clearedLevels,
        current_level: r.current_level,
        branch: r.branch,
        sub_branch: r.sub_branch,
        burn_level: r.burn_level,
        key_fragments: JSON.parse(r.key_fragments || '[]'),
        is_finished: isFinished,
        ending: r.ending,
        raw_elapsed_ms: Math.max(0, rawElapsed),
        adjusted_elapsed_ms: Math.max(0, adjustedElapsed),
        penalty_seconds: penaltySeconds,
        last_active_at: r.last_active_at || r.started_at,
      };
    });

    formatted.sort((a, b) => {
      if (b.cleared_levels !== a.cleared_levels) {
        return b.cleared_levels - a.cleared_levels;
      }
      if (a.adjusted_elapsed_ms !== b.adjusted_elapsed_ms) {
        return a.adjusted_elapsed_ms - b.adjusted_elapsed_ms;
      }
      return a.burn_level - b.burn_level;
    });

    return formatted;
  },

  async getRounds(): Promise<RoundRecord[]> {
    const d = await getDb();
    const rows = d.prepare('SELECT * FROM rounds ORDER BY round_number ASC').all() as any[];
    return rows.map((r) => ({
      ...r,
      is_dilemma: Boolean(r.is_dilemma),
      options: JSON.parse(r.options || '[]'),
      accepted_variants: JSON.parse(r.accepted_variants || '[]'),
    }));
  },

  async getRound(levelNumber: number, branch?: string): Promise<RoundRecord | null> {
    const d = await getDb();
    const targetBranch = branch && branch !== 'UNALIGNED' ? branch : 'MAIN';
    const row = d.prepare('SELECT * FROM rounds WHERE round_number = ? AND branch = ?').get(levelNumber, targetBranch) as any;
    if (!row) return null;
    return {
      ...row,
      is_dilemma: Boolean(row.is_dilemma),
      options: JSON.parse(row.options || '[]'),
      accepted_variants: JSON.parse(row.accepted_variants || '[]'),
    };
  },
};
