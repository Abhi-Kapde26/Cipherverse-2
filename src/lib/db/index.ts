import { isSupabaseConfigured } from './config';
import { supabaseDb } from './supabase';
import { DatabaseAdapter } from './types';
import { memoryRateLimiter } from '../rate-limiter';

let cachedPaused: boolean | null = null;
let lastPausedCheck = 0;
const PAUSED_CACHE_TTL = 5000; // 5 seconds in-memory cache

async function getAdapter(): Promise<DatabaseAdapter> {
  if (isSupabaseConfigured()) {
    return supabaseDb;
  }
  // In local mode without Supabase environment variables, lazily import sqlite adapter
  const { sqliteDb } = await import('./sqlite');
  return sqliteDb;
}

export const db: DatabaseAdapter = {
  async isEventPaused() {
    const now = Date.now();
    if (cachedPaused !== null && now - lastPausedCheck < PAUSED_CACHE_TTL) {
      return cachedPaused;
    }
    const adapter = await getAdapter();
    const paused = await adapter.isEventPaused();
    cachedPaused = paused;
    lastPausedCheck = now;
    return paused;
  },
  async setEventPaused(paused: boolean) {
    cachedPaused = paused;
    lastPausedCheck = Date.now();
    const adapter = await getAdapter();
    return adapter.setEventPaused(paused);
  },
  async createTeam(id: string, teamName: string, members: string[], passwordHash: string) {
    const adapter = await getAdapter();
    return adapter.createTeam(id, teamName, members, passwordHash);
  },
  async getTeamByName(teamName: string) {
    const adapter = await getAdapter();
    return adapter.getTeamByName(teamName);
  },
  async getTeamById(id: string) {
    const adapter = await getAdapter();
    return adapter.getTeamById(id);
  },
  async getAllTeams() {
    const adapter = await getAdapter();
    return adapter.getAllTeams();
  },
  async getProgress(teamId: string) {
    const adapter = await getAdapter();
    return adapter.getProgress(teamId);
  },
  async updateProgress(teamId: string, updates: any) {
    const adapter = await getAdapter();
    return adapter.updateProgress(teamId, updates);
  },
  async advanceTeamLevel(
    teamId: string,
    expectedLevel: number,
    nextLevel: number,
    keyFragments: number[],
    finishedAt?: number | null
  ) {
    const adapter = await getAdapter();
    return adapter.advanceTeamLevel(teamId, expectedLevel, nextLevel, keyFragments, finishedAt);
  },
  async recordSubmission(teamId: string, level: number, answerGiven: string, correct: boolean) {
    const adapter = await getAdapter();
    return adapter.recordSubmission(teamId, level, answerGiven, correct);
  },
  async getLastSubmissionTime(teamId: string) {
    const adapter = await getAdapter();
    return adapter.getLastSubmissionTime(teamId);
  },
  async checkRateLimit(key: string, minIntervalMs: number) {
    // Ultra-fast in-memory check to prevent database lock contention under 100+ concurrent teams
    return memoryRateLimiter.check(key, minIntervalMs);
  },
  async getAllSubmissions(limit?: number) {
    const adapter = await getAdapter();
    return adapter.getAllSubmissions(limit);
  },
  async startDilemmaSession(teamId: string, level: number, durationSeconds: number) {
    const adapter = await getAdapter();
    return adapter.startDilemmaSession(teamId, level, durationSeconds);
  },
  async getDilemmaSession(teamId: string, level: number) {
    const adapter = await getAdapter();
    return adapter.getDilemmaSession(teamId, level);
  },
  async recordChoice(teamId: string, level: number, option: string, autoPenalized: boolean) {
    const adapter = await getAdapter();
    return adapter.recordChoice(teamId, level, option, autoPenalized);
  },
  async getChoices(teamId: string) {
    const adapter = await getAdapter();
    return adapter.getChoices(teamId);
  },
  async resetTeam(teamId: string) {
    memoryRateLimiter.reset(`submit:${teamId}`);
    const adapter = await getAdapter();
    return adapter.resetTeam(teamId);
  },
  async resetAllTournamentData() {
    memoryRateLimiter.resetAll();
    const adapter = await getAdapter();
    return adapter.resetAllTournamentData();
  },
  async getLeaderboard() {
    const adapter = await getAdapter();
    return adapter.getLeaderboard();
  },
  async getRounds() {
    const adapter = await getAdapter();
    if (adapter.getRounds) return adapter.getRounds();
    return [];
  },
  async getRound(levelNumber: number, branch?: string) {
    const adapter = await getAdapter();
    if (adapter.getRound) return adapter.getRound(levelNumber, branch);
    return null;
  },
};

export * from './types';
export * from './config';
export { supabaseDb } from './supabase';
