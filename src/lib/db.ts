import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'janus.db');

let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
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
  `);

  // Initialize event pause state if not exists
  const checkState = db.prepare("SELECT value FROM event_state WHERE key = 'is_paused'").get();
  if (!checkState) {
    db.prepare("INSERT INTO event_state (key, value) VALUES ('is_paused', 'false')").run();
  }
}

export interface TeamRecord {
  id: string;
  team_name: string;
  members: string[]; // parsed from JSON
  password_hash: string;
  created_at: number;
}

export interface ProgressRecord {
  team_id: string;
  current_level: number;
  branch: string; // 'UNALIGNED' | 'A' | 'B'
  sub_branch: string; // 'NONE' | 'A1' | 'A2' | 'B1' | 'B2'
  burn_level: number;
  key_fragments: number[]; // parsed from JSON
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
}

export const db = {
  isEventPaused(): boolean {
    const d = getDb();
    const row = d.prepare("SELECT value FROM event_state WHERE key = 'is_paused'").get() as { value: string } | undefined;
    return row?.value === 'true';
  },

  setEventPaused(paused: boolean) {
    const d = getDb();
    d.prepare("INSERT OR REPLACE INTO event_state (key, value) VALUES ('is_paused', ?)").run(String(paused));
  },

  createTeam(id: string, teamName: string, members: string[], passwordHash: string): TeamRecord {
    const d = getDb();
    const now = Date.now();
    const membersJson = JSON.stringify(members);
    d.prepare(
      "INSERT INTO teams (id, team_name, members, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
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

  getTeamByName(teamName: string): TeamRecord | null {
    const d = getDb();
    const row = d.prepare("SELECT * FROM teams WHERE team_name = ? COLLATE NOCASE").get(teamName) as {
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

  getTeamById(id: string): TeamRecord | null {
    const d = getDb();
    const row = d.prepare("SELECT * FROM teams WHERE id = ?").get(id) as {
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

  getAllTeams(): (TeamRecord & { progress: ProgressRecord })[] {
    const d = getDb();
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

  getProgress(teamId: string): ProgressRecord | null {
    const d = getDb();
    const row = d.prepare("SELECT * FROM progress WHERE team_id = ?").get(teamId) as {
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

  updateProgress(teamId: string, updates: Partial<ProgressRecord>) {
    const d = getDb();
    const current = this.getProgress(teamId);
    if (!current) return;

    const current_level = updates.current_level !== undefined ? updates.current_level : current.current_level;
    const branch = updates.branch !== undefined ? updates.branch : current.branch;
    const sub_branch = updates.sub_branch !== undefined ? updates.sub_branch : current.sub_branch;
    const burn_level = updates.burn_level !== undefined ? updates.burn_level : current.burn_level;
    const key_fragments = updates.key_fragments !== undefined ? JSON.stringify(updates.key_fragments) : JSON.stringify(current.key_fragments);
    const finished_at = updates.finished_at !== undefined ? updates.finished_at : current.finished_at;
    const ending = updates.ending !== undefined ? updates.ending : current.ending;
    const wrong_attempts_current = updates.wrong_attempts_current !== undefined ? updates.wrong_attempts_current : current.wrong_attempts_current;

    d.prepare(`
      UPDATE progress
      SET current_level = ?, branch = ?, sub_branch = ?, burn_level = ?, key_fragments = ?, finished_at = ?, ending = ?, wrong_attempts_current = ?
      WHERE team_id = ?
    `).run(current_level, branch, sub_branch, burn_level, key_fragments, finished_at, ending, wrong_attempts_current, teamId);
  },

  recordSubmission(teamId: string, level: number, answerGiven: string, correct: boolean): SubmissionRecord {
    const d = getDb();
    const now = Date.now();
    const res = d.prepare(
      "INSERT INTO submissions (team_id, level, answer_given, correct, created_at) VALUES (?, ?, ?, ?, ?)"
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

  getLastSubmissionTime(teamId: string): number | null {
    const d = getDb();
    const row = d.prepare("SELECT created_at FROM submissions WHERE team_id = ? ORDER BY created_at DESC LIMIT 1").get(teamId) as { created_at: number } | undefined;
    return row ? row.created_at : null;
  },

  getAllSubmissions(limit: number = 200) {
    const d = getDb();
    return d.prepare(`
      SELECT s.*, t.team_name
      FROM submissions s
      JOIN teams t ON s.team_id = t.id
      ORDER BY s.created_at DESC
      LIMIT ?
    `).all(limit);
  },

  startDilemmaSession(teamId: string, level: number, durationSeconds: number) {
    const d = getDb();
    const now = Date.now();
    const expiresAt = now + durationSeconds * 1000;

    d.prepare(`
      INSERT OR REPLACE INTO dilemma_sessions (team_id, level, started_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(teamId, level, now, expiresAt);

    return { team_id: teamId, level, started_at: now, expires_at: expiresAt };
  },

  getDilemmaSession(teamId: string, level: number) {
    const d = getDb();
    return d.prepare("SELECT * FROM dilemma_sessions WHERE team_id = ? AND level = ?").get(teamId, level) as {
      team_id: string;
      level: number;
      started_at: number;
      expires_at: number;
    } | undefined;
  },

  recordChoice(teamId: string, level: number, option: string, autoPenalized: boolean) {
    const d = getDb();
    const now = Date.now();
    d.prepare(
      "INSERT INTO choices (team_id, level, option, chosen_at, auto_penalized) VALUES (?, ?, ?, ?, ?)"
    ).run(teamId, level, option, now, autoPenalized ? 1 : 0);
  },

  getChoices(teamId: string) {
    const d = getDb();
    return d.prepare("SELECT * FROM choices WHERE team_id = ? ORDER BY level ASC").all(teamId) as Array<{
      id: number;
      team_id: string;
      level: number;
      option: string;
      chosen_at: number;
      auto_penalized: number;
    }>;
  },

  resetTeam(teamId: string) {
    const d = getDb();
    const now = Date.now();
    d.prepare("DELETE FROM submissions WHERE team_id = ?").run(teamId);
    d.prepare("DELETE FROM choices WHERE team_id = ?").run(teamId);
    d.prepare("DELETE FROM dilemma_sessions WHERE team_id = ?").run(teamId);
    d.prepare(`
      UPDATE progress
      SET current_level = 1, branch = 'UNALIGNED', sub_branch = 'NONE', burn_level = 0, key_fragments = '[]', started_at = ?, finished_at = NULL, ending = NULL, wrong_attempts_current = 0
      WHERE team_id = ?
    `).run(now, teamId);
  },

  getLeaderboard() {
    const d = getDb();
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

    // Leaderboard ranking logic:
    // 1. Cleared levels (descending)
    //    If finished_at is set, cleared = 15. Otherwise cleared = current_level - 1.
    // 2. Adjusted finish time or elapsed time (ascending)
    //    Penalty: Burn Level 3 (Burned) adds +2 minutes (120,000ms) per burn level above 2.
    // 3. Burn level (ascending)
    const now = Date.now();

    const formatted = rows.map((r) => {
      const isFinished = r.finished_at !== null;
      const clearedLevels = isFinished ? 15 : Math.max(0, r.current_level - 1);
      const rawElapsed = isFinished ? r.finished_at! - r.started_at : (r.last_active_at || now) - r.started_at;
      
      // Calculate Burn penalty: +120s (120,000ms) for each burn level when at or above 3 ("Burned")
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
      // 1. Most rounds cleared
      if (b.cleared_levels !== a.cleared_levels) {
        return b.cleared_levels - a.cleared_levels;
      }
      // 2. Earliest finish / lowest adjusted time
      if (a.adjusted_elapsed_ms !== b.adjusted_elapsed_ms) {
        return a.adjusted_elapsed_ms - b.adjusted_elapsed_ms;
      }
      // 3. Lowest Burn level
      return a.burn_level - b.burn_level;
    });

    return formatted;
  },
};
