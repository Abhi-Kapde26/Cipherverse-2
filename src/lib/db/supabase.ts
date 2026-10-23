import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from './config';
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

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    const creds = getSupabaseCredentials();
    if (!creds) {
      throw new Error(
        'Supabase credentials (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are missing or invalid.'
      );
    }
    clientInstance = createClient(creds.url, creds.serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return clientInstance;
}

function parseJsonArray<T>(val: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export const supabaseDb: DatabaseAdapter = {
  async isEventPaused(): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('event_state')
      .select('value')
      .eq('key', 'is_paused')
      .maybeSingle();

    if (error) {
      console.error('Error fetching event_state from Supabase:', error.message);
      return false;
    }
    return data?.value === 'true';
  },

  async setEventPaused(paused: boolean): Promise<void> {
    const supabase = getSupabaseClient();
    const val = String(paused);
    await Promise.all([
      supabase.from('event_state').upsert({ key: 'is_paused', value: val }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'is_paused', value: val }, { onConflict: 'key' }),
    ]);
  },

  async createTeam(
    id: string,
    teamName: string,
    members: string[],
    passwordHash: string
  ): Promise<TeamRecord> {
    const supabase = getSupabaseClient();
    const now = Date.now();

    const { error: teamErr } = await supabase.from('teams').insert({
      id,
      team_name: teamName,
      members,
      password_hash: passwordHash,
      created_at: now,
    });
    if (teamErr) throw teamErr;

    const { error: progErr } = await supabase.from('progress').insert({
      team_id: id,
      current_level: 1,
      branch: 'UNALIGNED',
      sub_branch: 'NONE',
      burn_level: 0,
      key_fragments: [],
      started_at: now,
      finished_at: null,
      ending: null,
      wrong_attempts_current: 0,
    });
    if (progErr) throw progErr;

    return {
      id,
      team_name: teamName,
      members,
      password_hash: passwordHash,
      created_at: now,
    };
  },

  async getTeamByName(teamName: string): Promise<TeamRecord | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .ilike('team_name', teamName)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      team_name: data.team_name,
      members: parseJsonArray<string>(data.members),
      password_hash: data.password_hash,
      created_at: Number(data.created_at),
    };
  },

  async getTeamById(id: string): Promise<TeamRecord | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      team_name: data.team_name,
      members: parseJsonArray<string>(data.members),
      password_hash: data.password_hash,
      created_at: Number(data.created_at),
    };
  },

  async getAllTeams(): Promise<(TeamRecord & { progress: ProgressRecord })[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('teams')
      .select('id, team_name, members, password_hash, created_at, progress(*)')
      .order('created_at', { ascending: true });

    if (error || !data) {
      if (error) console.error('Error in getAllTeams:', error.message);
      return [];
    }

    return data.map((t: any) => {
      const p = Array.isArray(t.progress) ? t.progress[0] : t.progress;
      return {
        id: t.id,
        team_name: t.team_name,
        members: parseJsonArray<string>(t.members),
        password_hash: t.password_hash,
        created_at: Number(t.created_at),
        progress: {
          team_id: t.id,
          current_level: p?.current_level ?? 1,
          branch: p?.branch ?? 'UNALIGNED',
          sub_branch: p?.sub_branch ?? 'NONE',
          burn_level: p?.burn_level ?? 0,
          key_fragments: parseJsonArray<number>(p?.key_fragments),
          started_at: Number(p?.started_at ?? t.created_at),
          finished_at: p?.finished_at ? Number(p.finished_at) : null,
          ending: p?.ending ?? null,
          wrong_attempts_current: p?.wrong_attempts_current ?? 0,
        },
      };
    });
  },

  async getProgress(teamId: string): Promise<ProgressRecord | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('team_id', teamId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      team_id: data.team_id,
      current_level: data.current_level,
      branch: data.branch,
      sub_branch: data.sub_branch,
      burn_level: data.burn_level,
      key_fragments: parseJsonArray<number>(data.key_fragments),
      started_at: Number(data.started_at),
      finished_at: data.finished_at ? Number(data.finished_at) : null,
      ending: data.ending,
      wrong_attempts_current: data.wrong_attempts_current,
    };
  },

  async updateProgress(teamId: string, updates: Partial<ProgressRecord>): Promise<void> {
    const supabase = getSupabaseClient();
    const payload: Record<string, any> = {};
    if (updates.current_level !== undefined) payload.current_level = updates.current_level;
    if (updates.branch !== undefined) payload.branch = updates.branch;
    if (updates.sub_branch !== undefined) payload.sub_branch = updates.sub_branch;
    if (updates.burn_level !== undefined) payload.burn_level = updates.burn_level;
    if (updates.key_fragments !== undefined) payload.key_fragments = updates.key_fragments;
    if (updates.finished_at !== undefined) payload.finished_at = updates.finished_at;
    if (updates.ending !== undefined) payload.ending = updates.ending;
    if (updates.wrong_attempts_current !== undefined) payload.wrong_attempts_current = updates.wrong_attempts_current;
    if (updates.started_at !== undefined) payload.started_at = updates.started_at;

    const { error } = await supabase.from('progress').update(payload).eq('team_id', teamId);
    if (error) console.error('Error updating progress:', error.message);
  },

  async advanceTeamLevel(
    teamId: string,
    expectedLevel: number,
    nextLevel: number,
    keyFragments: number[],
    finishedAt?: number | null
  ): Promise<{ advanced: boolean }> {
    const supabase = getSupabaseClient();

    // 1. Try PostgreSQL RPC stored procedure (defined in supabase/schema.sql)
    try {
      const { data, error } = await supabase.rpc('advance_team_level', {
        p_team_id: teamId,
        p_expected_level: expectedLevel,
        p_next_level: nextLevel,
        p_key_fragments: keyFragments,
        p_finished_at: finishedAt ?? null,
      });

      if (!error && typeof data === 'boolean') {
        return { advanced: data };
      }
    } catch {
      // Fall through to atomic conditional update
    }

    // 2. Fallback: Conditional UPDATE targeting only matching current_level
    const payload: Record<string, any> = {
      current_level: nextLevel,
      wrong_attempts_current: 0,
      key_fragments: keyFragments,
    };
    if (finishedAt) payload.finished_at = finishedAt;

    const { data: updatedRows, error: updateErr } = await supabase
      .from('progress')
      .update(payload)
      .eq('team_id', teamId)
      .eq('current_level', expectedLevel)
      .select('current_level');

    if (updateErr) {
      console.error('Error in conditional advanceTeamLevel:', updateErr.message);
      return { advanced: false };
    }

    return { advanced: (updatedRows?.length ?? 0) > 0 };
  },

  async recordSubmission(
    teamId: string,
    level: number,
    answerGiven: string,
    correct: boolean
  ): Promise<SubmissionRecord> {
    const supabase = getSupabaseClient();
    const now = Date.now();
    const correctVal = correct ? 1 : 0;

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        team_id: teamId,
        level,
        answer_given: answerGiven,
        correct: correctVal,
        created_at: now,
      })
      .select('id, team_id, level, answer_given, correct, created_at')
      .single();

    if (error) throw error;

    return {
      id: Number(data.id),
      team_id: data.team_id,
      level: data.level,
      answer_given: data.answer_given,
      correct: Number(data.correct),
      created_at: Number(data.created_at),
    };
  },

  async getLastSubmissionTime(teamId: string): Promise<number | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('submissions')
      .select('created_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return Number(data.created_at);
  },

  async checkRateLimit(
    key: string,
    minIntervalMs: number
  ): Promise<{ allowed: boolean; waitRemainingSeconds?: number }> {
    const supabase = getSupabaseClient();
    const now = Date.now();

    const { data } = await supabase
      .from('rate_limits')
      .select('last_attempt_at')
      .eq('key', key)
      .maybeSingle();

    if (data && now - Number(data.last_attempt_at) < minIntervalMs) {
      const wait = Math.ceil((minIntervalMs - (now - Number(data.last_attempt_at))) / 1000);
      return { allowed: false, waitRemainingSeconds: wait };
    }

    await supabase.from('rate_limits').upsert(
      {
        key,
        last_attempt_at: now,
      },
      { onConflict: 'key' }
    );

    return { allowed: true };
  },

  async getAllSubmissions(limit: number = 200): Promise<any[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('submissions')
      .select('id, team_id, level, answer_given, correct, created_at, teams(team_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((s: any) => ({
      id: Number(s.id),
      team_id: s.team_id,
      level: s.level,
      answer_given: s.answer_given,
      correct: Number(s.correct),
      created_at: Number(s.created_at),
      team_name: s.teams?.team_name || 'Unknown',
    }));
  },

  async startDilemmaSession(
    teamId: string,
    level: number,
    durationSeconds: number
  ): Promise<DilemmaSessionRecord> {
    const supabase = getSupabaseClient();
    const now = Date.now();
    const expiresAt = now + durationSeconds * 1000;

    const { error } = await supabase.from('dilemma_sessions').upsert(
      {
        team_id: teamId,
        level,
        started_at: now,
        expires_at: expiresAt,
      },
      { onConflict: 'team_id,level' }
    );
    if (error) console.error('Error starting dilemma session:', error.message);

    return { team_id: teamId, level, started_at: now, expires_at: expiresAt };
  },

  async getDilemmaSession(teamId: string, level: number): Promise<DilemmaSessionRecord | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('dilemma_sessions')
      .select('*')
      .eq('team_id', teamId)
      .eq('level', level)
      .maybeSingle();

    if (error || !data) return null;
    return {
      team_id: data.team_id,
      level: data.level,
      started_at: Number(data.started_at),
      expires_at: Number(data.expires_at),
    };
  },

  async recordChoice(
    teamId: string,
    level: number,
    option: string,
    autoPenalized: boolean
  ): Promise<void> {
    const supabase = getSupabaseClient();
    const now = Date.now();

    const { error } = await supabase.from('choices').insert({
      team_id: teamId,
      level,
      option,
      chosen_at: now,
      auto_penalized: autoPenalized,
    });
    if (error) console.error('Error recording choice in Supabase:', error.message);
  },

  async getChoices(teamId: string): Promise<ChoiceRecord[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('choices')
      .select('*')
      .eq('team_id', teamId)
      .order('level', { ascending: true });

    if (error || !data) return [];
    return data.map((c: any) => ({
      id: Number(c.id),
      team_id: c.team_id,
      level: c.level,
      option: c.option,
      chosen_at: Number(c.chosen_at),
      auto_penalized: Boolean(c.auto_penalized),
    }));
  },

  async resetTeam(teamId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const now = Date.now();

    await Promise.all([
      supabase.from('submissions').delete().eq('team_id', teamId),
      supabase.from('choices').delete().eq('team_id', teamId),
      supabase.from('dilemma_sessions').delete().eq('team_id', teamId),
      supabase.from('rate_limits').delete().eq('key', `submit:${teamId}`),
      supabase.from('progress').update({
        current_level: 1,
        branch: 'UNALIGNED',
        sub_branch: 'NONE',
        burn_level: 0,
        key_fragments: [],
        started_at: now,
        finished_at: null,
        ending: null,
        wrong_attempts_current: 0,
      }).eq('team_id', teamId),
    ]);
  },

  async resetAllTournamentData(): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase.from('submissions').delete().neq('id', -1);
    await supabase.from('choices').delete().neq('id', -1);
    await supabase.from('dilemma_sessions').delete().neq('level', -1);
    await supabase.from('rate_limits').delete().neq('key', '__placeholder__');
    await supabase.from('progress').delete().neq('current_level', -1);
    await supabase.from('teams').delete().neq('created_at', -1);
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const supabase = getSupabaseClient();
    const now = Date.now();

    const [teamsRes, subsRes] = await Promise.all([
      supabase.from('teams').select('id, team_name, members, progress(*)'),
      supabase.from('submissions').select('team_id, created_at').order('created_at', { ascending: false }).limit(500),
    ]);

    if (teamsRes.error || !teamsRes.data) {
      if (teamsRes.error) console.error('Error in getLeaderboard:', teamsRes.error.message);
      return [];
    }

    const lastActiveMap = new Map<string, number>();
    if (subsRes.data) {
      for (const s of subsRes.data) {
        if (!lastActiveMap.has(s.team_id)) {
          lastActiveMap.set(s.team_id, Number(s.created_at));
        }
      }
    }

    const formatted: LeaderboardEntry[] = teamsRes.data.map((t: any) => {
      const p = Array.isArray(t.progress) ? t.progress[0] : t.progress;
      const isFinished = p?.finished_at !== null && p?.finished_at !== undefined;
      const currentLevel = p?.current_level ?? 1;
      const clearedLevels = isFinished ? 15 : Math.max(0, currentLevel - 1);
      const startedAt = Number(p?.started_at ?? t.created_at ?? now);
      const finishedAt = p?.finished_at ? Number(p.finished_at) : null;
      const lastActiveAt = lastActiveMap.get(t.id) ?? null;

      const rawElapsed = isFinished
        ? (finishedAt ? finishedAt - startedAt : 0)
        : (lastActiveAt ? lastActiveAt - startedAt : (startedAt > 0 ? now - startedAt : 0));

      const burnLevel = p?.burn_level ?? 0;
      // Penalty: Burn Level 3 (Burned) adds +2 minutes (120,000ms) per burn level above 2
      const penaltySeconds = burnLevel >= 3 ? (burnLevel - 2) * 120 : 0;
      const adjustedElapsed = rawElapsed + penaltySeconds * 1000;

      return {
        team_id: t.id,
        team_name: t.team_name,
        members: parseJsonArray<string>(t.members),
        cleared_levels: clearedLevels,
        current_level: currentLevel,
        branch: p?.branch ?? 'UNALIGNED',
        sub_branch: p?.sub_branch ?? 'NONE',
        burn_level: burnLevel,
        key_fragments: parseJsonArray<number>(p?.key_fragments),
        is_finished: isFinished,
        ending: p?.ending ?? null,
        raw_elapsed_ms: Math.max(0, rawElapsed),
        adjusted_elapsed_ms: Math.max(0, adjustedElapsed),
        penalty_seconds: penaltySeconds,
        last_active_at: lastActiveAt || startedAt,
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

  async getRounds(): Promise<RoundRecord[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rounds')
      .select('*')
      .order('round_number', { ascending: true });

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      round_number: r.round_number,
      branch: r.branch,
      act: r.act,
      year: r.year,
      title: r.title,
      agency: r.agency,
      cipher_type: r.cipher_type,
      story_text: r.story_text,
      ciphertext: r.ciphertext,
      clue: r.clue,
      hint: r.hint,
      pamphlet_key: r.pamphlet_key,
      is_dilemma: Boolean(r.is_dilemma),
      timer_seconds: r.timer_seconds,
      key_fragment: r.key_fragment,
      options: parseJsonArray(r.options),
      answer_hash: r.answer_hash,
      accepted_variants: parseJsonArray(r.accepted_variants),
      created_at: Number(r.created_at),
    }));
  },

  async getRound(levelNumber: number, branch?: string): Promise<RoundRecord | null> {
    const supabase = getSupabaseClient();
    let query = supabase.from('rounds').select('*').eq('round_number', levelNumber);
    if (branch && branch !== 'UNALIGNED') {
      query = query.eq('branch', branch);
    } else {
      query = query.eq('branch', 'MAIN');
    }
    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;

    return {
      id: data.id,
      round_number: data.round_number,
      branch: data.branch,
      act: data.act,
      year: data.year,
      title: data.title,
      agency: data.agency,
      cipher_type: data.cipher_type,
      story_text: data.story_text,
      ciphertext: data.ciphertext,
      clue: data.clue,
      hint: data.hint,
      pamphlet_key: data.pamphlet_key,
      is_dilemma: Boolean(data.is_dilemma),
      timer_seconds: data.timer_seconds,
      key_fragment: data.key_fragment,
      options: parseJsonArray(data.options),
      answer_hash: data.answer_hash,
      accepted_variants: parseJsonArray(data.accepted_variants),
      created_at: Number(data.created_at),
    };
  },
};
