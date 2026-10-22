import { isSupabaseConfigured } from './config';
import { supabaseDb } from './supabase';
import { DatabaseAdapter } from './types';

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
    const adapter = await getAdapter();
    return adapter.isEventPaused();
  },
  async setEventPaused(paused: boolean) {
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
    const adapter = await getAdapter();
    return adapter.checkRateLimit(key, minIntervalMs);
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
    const adapter = await getAdapter();
    return adapter.resetTeam(teamId);
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
