'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  Tv,
  ArrowLeft,
  RefreshCw,
  Shield,
  Flag,
  Users,
  Search,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import StampBadge from '@/components/StampBadge';

interface LeaderboardEntry {
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

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(15);
  const [searchFilter, setSearchFilter] = useState('');
  const [bigScreenMode, setBigScreenMode] = useState(false);

  const fetchLeaderboard = useCallback(async (isManual = false) => {
    if (isManual) {
      setSyncing(true);
    }
    try {
      // Force cache-busting on client & server to guarantee latest state for all 50+ teams
      const url = `/api/leaderboard?t=${Date.now()}${isManual ? '&sync=true' : ''}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!res.ok) {
        throw new Error(`Leaderboard fetch returned status ${res.status}`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        setLastRefreshed(new Date());
        setCountdown(15);
      }
    } catch (e) {
      console.error('Failed to sync leaderboard:', e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Auto-sync interval: exactly every 15 seconds countdown, unconditional
  useEffect(() => {
    fetchLeaderboard(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLeaderboard(false);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLeaderboard(false);
        setCountdown(15);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchLeaderboard]);

  const handleManualSync = () => {
    setCountdown(15);
    fetchLeaderboard(true);
  };

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  const filteredLeaderboard = leaderboard.filter((team) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      team.team_name.toLowerCase().includes(q) ||
      (Array.isArray(team.members) && team.members.some((m) => m.toLowerCase().includes(q)))
    );
  });

  return (
    <div
      className={`min-h-screen font-mono text-stone-200 transition-colors ${
        bigScreenMode ? 'bg-black text-amber-400 p-6 sm:p-10' : 'bg-transparent pb-20'
      }`}
    >
      {!bigScreenMode && <Navbar />}

      <main className={`mx-auto ${bigScreenMode ? 'max-w-7xl' : 'max-w-6xl px-4 sm:px-6 pt-6'} space-y-6`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-bunker-800 pb-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Club Insignia Logo */}
            <img
              src="/club_logo.png"
              alt="Club Insignia"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg border border-amber-500/40 bg-black/60 p-1 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-500 font-bold mb-1">
                <Trophy className="w-4 h-4" />
                <span>HUT 99 OFFICIAL CLASSIFICATION</span>
              </div>
              <h1 className={`font-black tracking-tight ${bigScreenMode ? 'text-3xl sm:text-4xl text-stone-100' : 'text-2xl sm:text-3xl'}`}>
                OPERATION JANUS LEADERBOARD
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Ranked by: 1. Rounds Cleared (desc) → 2. Finish Time (+Burn Penalties) → 3. Lowest Burn Level.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBigScreenMode(!bigScreenMode)}
              className={`px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                bigScreenMode
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-bunker-900 border-bunker-700 text-stone-300 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{bigScreenMode ? 'Exit Projector Mode' : 'Projector Mode'}</span>
            </button>

            {/* Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-3.5 py-1.5 rounded bg-bunker-900 border border-bunker-700 hover:border-amber-500 text-xs text-stone-200 hover:text-amber-400 flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              title="Force sync leaderboard now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing || loading ? 'animate-spin text-amber-400' : 'text-amber-500'}`} />
              <span className="font-bold">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Live Status Row & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 border-b border-bunker-800 pb-3">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Active Units: <strong className="text-stone-300">{leaderboard.length}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Auto-sync in: <strong className="text-amber-400 font-mono font-bold">{countdown}s</strong>
            </span>
            <span>
              Last Sync: <strong className="text-stone-300">{lastRefreshed.toLocaleTimeString()}</strong>
            </span>
          </div>

          {/* Quick Filter for 50 teams */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search team or member..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-bunker-950 border border-bunker-700 rounded pl-8 pr-3 py-1 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 w-full sm:w-56"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-bunker-900 border border-bunker-700 rounded-lg overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-bunker-950 border-b border-bunker-700 text-stone-400 uppercase text-[11px] tracking-wider font-bold">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Cryptanalysis Team</th>
                  <th className="py-3 px-4 text-center">Rounds Cleared</th>
                  <th className="py-3 px-4 text-center">Agency Branch</th>
                  <th className="py-3 px-4 text-center">Burn Meter</th>
                  <th className="py-3 px-4 text-right">Elapsed Clock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bunker-800">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">
                      {leaderboard.length === 0
                        ? 'No cryptanalysis stations registered yet.'
                        : 'No teams match your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((team, index) => {
                    // Overall rank from entire sorted leaderboard
                    const rank = leaderboard.findIndex((t) => t.team_id === team.team_id) + 1;
                    return (
                      <tr
                        key={team.team_id}
                        className={`transition-colors ${
                          team.is_finished
                            ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                            : index % 2 === 0
                            ? 'bg-bunker-900 hover:bg-bunker-850'
                            : 'bg-bunker-950/60 hover:bg-bunker-850'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 font-black">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded ${
                              rank === 1
                                ? 'bg-amber-500 text-black font-black'
                                : rank === 2
                                ? 'bg-stone-300 text-black font-bold'
                                : rank === 3
                                ? 'bg-amber-800 text-stone-100 font-bold'
                                : 'text-stone-400'
                            }`}
                          >
                            {rank}
                          </span>
                        </td>

                        {/* Team & Members */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-100 flex items-center gap-2">
                            <span>{team.team_name}</span>
                            {team.is_finished && (
                              <StampBadge type="DECRYPTED" className="text-[9px] py-0 px-1.5" />
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate max-w-xs mt-0.5">
                            {Array.isArray(team.members) ? team.members.join(', ') : ''}
                          </div>
                        </td>

                        {/* Rounds Cleared */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-amber-400 bg-bunker-950 px-2 py-0.5 rounded border border-bunker-800">
                            <span>{team.cleared_levels} / 15</span>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              team.branch === 'A'
                                ? 'bg-blue-950/70 border-blue-600 text-blue-400'
                                : team.branch === 'B'
                                ? 'bg-red-950/70 border-red-600 text-red-400'
                                : 'bg-stone-900 border-stone-700 text-stone-400'
                            }`}
                          >
                            {team.branch === 'A' ? 'CIA' : team.branch === 'B' ? 'KGB' : 'UNALIGNED'}
                          </span>
                        </td>

                        {/* Burn Meter */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                              team.burn_level >= 3
                                ? 'bg-red-950 border border-red-600 text-red-400 animate-pulse'
                                : team.burn_level === 2
                                ? 'text-orange-400 bg-orange-950/40 border border-orange-800'
                                : team.burn_level === 1
                                ? 'text-amber-400 bg-amber-950/40 border border-amber-800'
                                : 'text-emerald-400 bg-emerald-950/40 border border-emerald-800'
                            }`}
                          >
                            <Flame className="w-3 h-3" />
                            <span>
                              {team.burn_level >= 3
                                ? `BURNED (${team.burn_level})`
                                : team.burn_level === 2
                                ? 'HUNTED'
                                : team.burn_level === 1
                                ? 'WATCHED'
                                : 'INTACT'}
                            </span>
                          </span>
                        </td>

                        {/* Elapsed Time */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className="font-bold text-stone-200">
                            {formatElapsed(team.adjusted_elapsed_ms)}
                          </div>
                          {team.penalty_seconds > 0 && (
                            <div className="text-[10px] text-red-400 font-bold">
                              +{team.penalty_seconds / 60}m penalty
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
