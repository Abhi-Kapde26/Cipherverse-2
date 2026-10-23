'use client';

import React, { useState, useEffect } from 'react';
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
  Users
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
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [bigScreenMode, setBigScreenMode] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error('Failed to refresh leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // High-concurrency optimization: 10s for projector/big screen, 15s when active tab
    const interval = setInterval(() => {
      if (bigScreenMode || (typeof document !== 'undefined' && document.visibilityState === 'visible')) {
        fetchLeaderboard();
      }
    }, bigScreenMode ? 10000 : 15000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLeaderboard();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [bigScreenMode]);

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  return (
    <div className={`min-h-screen font-mono text-stone-200 transition-colors ${bigScreenMode ? 'bg-black text-amber-400 p-6 sm:p-10' : 'bg-transparent pb-20'
      }`}>
      {!bigScreenMode && <Navbar />}

      <main className={`mx-auto ${bigScreenMode ? 'max-w-7xl' : 'max-w-6xl px-4 sm:px-6 pt-6'} space-y-6`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-bunker-800 pb-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Club Insignia Logo */}
            <img
              src="/club_logo.png"
              alt="Club Insignia"
              className="w-24 h-24 sm:w-24 sm:h-24 object-contain rounded-lg border border-amber-500/40 bg-black/60 p-1 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex-shrink-0"
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
              className={`px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-1.5 transition-colors ${bigScreenMode
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-bunker-900 border-bunker-700 text-stone-300 hover:text-white'
                }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{bigScreenMode ? 'Exit Projector Mode' : 'Projector Mode'}</span>
            </button>

            <button
              onClick={fetchLeaderboard}
              className="px-3 py-1.5 rounded bg-bunker-900 border border-bunker-700 hover:border-amber-500 text-xs text-stone-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Status Row */}
        <div className="flex items-center justify-between text-xs text-stone-500 border-b border-bunker-800 pb-2">
          <span>Active Units: <strong className="text-stone-300">{leaderboard.length}</strong></span>
          <span>Last Telegraph Sync: <strong className="text-stone-300">{lastRefreshed.toLocaleTimeString()}</strong></span>
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
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">
                      No cryptanalysis stations registered yet.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((team, index) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    return (
                      <tr
                        key={team.team_id}
                        className={`transition-colors ${team.is_finished
                          ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                          : index % 2 === 0
                            ? 'bg-bunker-900 hover:bg-bunker-850'
                            : 'bg-bunker-950/60 hover:bg-bunker-850'
                          }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 font-black">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded ${rank === 1
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
                            {team.members.join(', ')}
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
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${team.branch === 'A'
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
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${team.burn_level >= 3
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
