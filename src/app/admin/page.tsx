'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  Pause, 
  Play, 
  RotateCcw, 
  Users, 
  Key, 
  RefreshCw, 
  ArrowLeft, 
  Flame, 
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  LogOut,
  Trash2
} from 'lucide-react';
import { LEVELS } from '@/lib/ciphers';

interface AdminTeam {
  id: string;
  team_name: string;
  members: string[];
  created_at: number;
  progress: {
    current_level: number;
    branch: string;
    sub_branch: string;
    burn_level: number;
    key_fragments: number[];
    started_at: number;
    finished_at: number | null;
    ending: string | null;
    wrong_attempts_current: number;
  };
}

interface SubmissionLog {
  id: number;
  team_id: string;
  team_name: string;
  level: number;
  answer_given: string;
  correct: number;
  created_at: number;
}

interface ServerAnswerItem {
  number: number;
  answerHash: string;
  acceptedVariants: string[];
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionLog[]>([]);
  const [answers, setAnswers] = useState<ServerAnswerItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmWord, setResetConfirmWord] = useState('');
  const [resettingAll, setResettingAll] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [countdown, setCountdown] = useState(15);

  // Check if an admin session cookie is already active
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const res = await fetch('/api/admin', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setAuthenticated(true);
          setTeams(data.teams || []);
          setSubmissions(data.submissions || []);
          setAnswers(data.answers || []);
          setIsPaused(Boolean(data.isPaused));
        }
      } catch {
        // Not authenticated, stay on login view
      }
    };
    checkActiveSession();
  }, []);

  const loginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          key: adminKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication denied.');
      } else {
        setAuthenticated(true);
        setAdminKey(''); // Wipe input state from memory immediately
        setTeams(data.teams || []);
        setSubmissions(data.submissions || []);
        setAnswers(data.answers || []);
        setIsPaused(Boolean(data.isPaused));
      }
    } catch {
      setAuthError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // ignore
    } finally {
      setAuthenticated(false);
      setTeams([]);
      setSubmissions([]);
      setAnswers([]);
      setAdminKey('');
    }
  };

  const refreshOverview = useCallback(async (isManual = true) => {
    if (isManual) {
      setSyncing(true);
      setCountdown(15);
    }
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_overview',
        }),
      });
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
        setSubmissions(data.submissions || []);
        setAnswers(data.answers || []);
        setIsPaused(Boolean(data.isPaused));
      } else if (res.status === 401) {
        setAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, []);

  // Auto-sync every 15 seconds when authenticated
  useEffect(() => {
    if (!authenticated) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshOverview(false);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && authenticated) {
        refreshOverview(false);
        setCountdown(15);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [authenticated, refreshOverview]);

  const handleTogglePause = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_pause',
          paused: !isPaused,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaused(data.isPaused);
        setActionNotice(`Event state updated: ${data.isPaused ? 'PAUSED' : 'ACTIVE'}`);
      } else if (res.status === 401) {
        setAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetTournament = async () => {
    if (resetConfirmWord.trim().toUpperCase() !== 'RESET') return;
    setResettingAll(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_all',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setShowResetModal(false);
        setResetConfirmWord('');
        refreshOverview();
      } else if (res.status === 401) {
        setAuthenticated(false);
      } else {
        alert(data.error || 'Failed to reset tournament.');
      }
    } catch (e) {
      console.error(e);
      alert('Error triggering tournament reset.');
    } finally {
      setResettingAll(false);
    }
  };

  const handleResetTeam = async (teamId: string) => {
    if (!confirm(`Are you sure you want to reset all progress for team ${teamId}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_team',
          teamId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
      } else if (res.status === 401) {
        setAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLevel = async (teamId: string, level: number) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_team_level',
          teamId,
          level,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
      } else if (res.status === 401) {
        setAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBurn = async (teamId: string, burnLevel: number) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_burn_level',
          teamId,
          burnLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
      } else if (res.status === 401) {
        setAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleForceBranch = async (teamId: string, branch: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'force_branch',
          teamId,
          branch,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
      } else if (res.status === 401) {
        setAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center p-4 font-mono text-stone-200">
        <div className="w-full max-w-md bg-bunker-900 border-2 border-red-600 rounded-lg p-6 sm:p-8 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-2 text-red-500 font-bold mb-4">
            <ShieldAlert className="w-6 h-6" />
            <h1 className="text-lg uppercase tracking-wider">HIGH COMMAND TERMINAL</h1>
          </div>

          <p className="text-xs text-stone-400 mb-6">
            Enter administrator clearance key to oversee and control the Operation Janus event.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded bg-red-950 border border-red-600 text-red-300 text-xs font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={loginAdmin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-stone-400 mb-1">
                HQ Master Clearance Key
              </label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder=""
                autoComplete="current-password"
                className="w-full bg-bunker-950 border border-bunker-700 rounded px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Authorize Terminal'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-bunker-800 text-center text-xs text-stone-500">
            <Link href="/" className="text-stone-400 hover:text-white underline">
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredTeams = teams.filter((t) =>
    t.team_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bunker-950 text-stone-200 font-mono pb-20">
      {/* Top Bar */}
      <header className="border-b border-bunker-800 bg-bunker-950/90 sticky top-0 z-40 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h1 className="text-sm sm:text-base font-black text-stone-100 uppercase tracking-wider">
              HIGH COMMAND CONTROL PANEL
            </h1>
          </div>
        </div>

        {/* Global Event Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePause}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-black'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Global Event' : 'Emergency Freeze'}</span>
          </button>

          <button
            onClick={() => {
              setResetConfirmWord('');
              setShowResetModal(true);
            }}
            className="px-3 py-1.5 rounded bg-red-950/80 border border-red-700/80 hover:bg-red-900 text-xs text-red-300 hover:text-red-100 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            title="Purge all teams and reset leaderboard for a brand new game"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Reset Tournament</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Auto-sync: <strong className="text-amber-400">{countdown}s</strong>
            </span>

            <button
              onClick={() => refreshOverview(true)}
              disabled={syncing}
              className="px-3 py-1.5 rounded bg-bunker-900 border border-bunker-700 hover:border-amber-500 text-xs text-stone-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Force sync teams roster now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-amber-400' : 'text-amber-500'}`} />
              <span>{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-bunker-900 border border-bunker-700 hover:border-red-500/60 text-xs text-stone-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Notice Banner */}
        {actionNotice && (
          <div className="p-3 rounded bg-amber-950/60 border border-amber-500 text-amber-300 text-xs font-bold flex justify-between items-center">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-stone-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Emergency State Card */}
        {isPaused && (
          <div className="p-4 rounded-lg bg-red-950/80 border-2 border-red-600 text-red-300 text-xs font-bold flex items-center gap-3 animate-pulse">
            <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <div className="text-sm uppercase text-red-400">EVENT CURRENTLY FROZEN</div>
              <p className="text-red-300 font-normal">
                All team answers submissions are rejected. High Command has halted the clock.
              </p>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-bunker-900 border border-bunker-700">
            <div className="text-xs text-stone-500 uppercase">Enrolled Units</div>
            <div className="text-2xl font-black text-stone-100 mt-1">{teams.length}</div>
          </div>

          <div className="p-4 rounded-lg bg-bunker-900 border border-bunker-700">
            <div className="text-xs text-stone-500 uppercase">Total Submissions</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{submissions.length}</div>
          </div>

          <div className="p-4 rounded-lg bg-bunker-900 border border-bunker-700">
            <div className="text-xs text-stone-500 uppercase">Active Rounds</div>
            <div className="text-2xl font-black text-stone-100 mt-1">{LEVELS.length}</div>
          </div>

          <div className="p-4 rounded-lg bg-bunker-900 border border-bunker-700">
            <div className="text-xs text-stone-500 uppercase">Network Status</div>
            <div className={`text-2xl font-black mt-1 ${isPaused ? 'text-red-500' : 'text-emerald-400'}`}>
              {isPaused ? 'SUSPENDED' : 'OPERATIONAL'}
            </div>
          </div>
        </div>

        {/* Unit Management Table */}
        <div className="bg-bunker-900 border border-bunker-700 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <span>FIELD OPERATIVES ROSTER ({filteredTeams.length})</span>
              </h2>
              <p className="text-xs text-stone-400">
                Override rounds, adjust suspicion burn levels, force superpower allegiances, or reset units.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Filter by Unit or ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-bunker-950 border border-bunker-700 rounded pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bunker-950 border-b border-bunker-800 text-stone-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Callsign / ID</th>
                  <th className="py-2.5 px-3">Cryptanalysts</th>
                  <th className="py-2.5 px-3">Round</th>
                  <th className="py-2.5 px-3">Suspicion Burn</th>
                  <th className="py-2.5 px-3">Allegiance</th>
                  <th className="py-2.5 px-3 text-right">Emergency Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bunker-800 font-mono">
                {filteredTeams.map((team) => {
                  const p = team.progress;
                  return (
                    <tr key={team.id} className="hover:bg-bunker-850">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-100">{team.team_name}</div>
                        <div className="text-[10px] text-stone-500">{team.id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-stone-300 truncate max-w-[200px]">
                          {team.members.join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-400">Rnd {p.current_level}</span>
                          <select
                            value={p.current_level}
                            onChange={(e) => handleUpdateLevel(team.id, Number(e.target.value))}
                            className="bg-bunker-950 border border-bunker-700 text-[10px] text-stone-300 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            {LEVELS.map((l) => (
                              <option key={l.number} value={l.number}>
                                Lv {l.number}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${p.burn_level >= 3 ? 'text-red-500' : 'text-stone-300'}`}>
                            {p.burn_level}/4
                          </span>
                          <select
                            value={p.burn_level}
                            onChange={(e) => handleUpdateBurn(team.id, Number(e.target.value))}
                            className="bg-bunker-950 border border-bunker-700 text-[10px] text-stone-300 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            {[0, 1, 2, 3, 4, 5].map((lvl) => (
                              <option key={lvl} value={lvl}>
                                BL {lvl}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${
                            p.branch === 'A' ? 'text-blue-400' : p.branch === 'B' ? 'text-red-400' : 'text-stone-400'
                          }`}>
                            {p.branch}
                          </span>
                          <select
                            value={p.branch}
                            onChange={(e) => handleForceBranch(team.id, e.target.value)}
                            className="bg-bunker-950 border border-bunker-700 text-[10px] text-stone-300 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            <option value="UNALIGNED">UNALIGNED</option>
                            <option value="A">Branch A (CIA)</option>
                            <option value="B">Branch B (KGB)</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleResetTeam(team.id)}
                          className="px-2.5 py-1 rounded bg-red-950/80 border border-red-700 hover:bg-red-900 text-red-300 text-[10px] font-bold uppercase transition-colors"
                        >
                          Reset Unit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Submissions Stream */}
        <div className="bg-bunker-900 border border-bunker-700 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-100 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              <span>LIVE TELETYPE TRANSMISSION STREAM</span>
            </h2>
            <span className="text-xs text-stone-400">Latest 50 intercepts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bunker-950 border-b border-bunker-800 text-stone-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Team</th>
                  <th className="py-2 px-3">Round</th>
                  <th className="py-2 px-3">Answer Given</th>
                  <th className="py-2 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bunker-800 font-mono">
                {submissions.slice(0, 50).map((sub) => (
                  <tr key={sub.id} className="hover:bg-bunker-850">
                    <td className="py-2 px-3 text-stone-500">
                      {new Date(sub.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 font-bold text-stone-200">{sub.team_name}</td>
                    <td className="py-2 px-3 text-amber-400">Rnd {sub.level}</td>
                    <td className="py-2 px-3 text-stone-300 font-bold max-w-xs truncate">
                      {sub.answer_given}
                    </td>
                    <td className="py-2 px-3">
                      {sub.correct ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> DECRYPTED
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> DENIED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Solution Key & Verification Toggle */}
        <div className="bg-bunker-900 border border-bunker-700 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wider">
                VERIFIED CRYPTOGRAPHIC SOLUTION HASHES
              </h2>
              <p className="text-xs text-stone-400">
                Answers are validated using SHA-256 hashes on the server.
              </p>
            </div>
            <button
              onClick={() => setShowAnswerKeys(!showAnswerKeys)}
              className="px-3 py-1.5 rounded bg-bunker-950 border border-bunker-700 text-xs text-amber-400 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAnswerKeys ? 'Hide Hash Index' : 'Inspect Hash Index'}</span>
            </button>
          </div>

          {showAnswerKeys && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-bunker-800 text-xs">
              {LEVELS.map((lvl) => {
                const ansObj = answers.find((a) => a.number === lvl.number);
                return (
                  <div key={lvl.number} className="p-3 rounded bg-bunker-950 border border-bunker-800 space-y-1">
                    <div className="flex justify-between font-bold text-stone-200">
                      <span>Round {lvl.number}: {lvl.title}</span>
                      <span className="text-amber-500">{lvl.cipherType}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      Ciphertext: {lvl.ciphertext}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono truncate">
                      SHA-256 Hash: {ansObj?.answerHash || 'Protected on Server'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Tournament Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-bunker-950 border-2 border-red-600 rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.4)] p-6 space-y-5 text-stone-100">
            <div className="flex items-center gap-3 border-b border-red-800/60 pb-3">
              <div className="p-2 rounded bg-red-950 border border-red-600 text-red-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-red-400 tracking-wider">
                  CONFIRM TOURNAMENT FACTORY RESET
                </h3>
                <p className="text-xs text-stone-400">Purge All Teams & Start Clean Campaign</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-300 leading-relaxed bg-bunker-900/60 p-3.5 rounded border border-bunker-800">
              <p className="text-red-300 font-bold">
                ⚠️ WARNING: THIS WILL PERMANENTLY ERASE ALL GAME DATA!
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-400">
                <li>All registered teams will be permanently deleted.</li>
                <li>All cipher submissions, choices, and timers will be purged.</li>
                <li>The live leaderboard will be wiped completely clean (0 teams).</li>
                <li>New teams will be able to register immediately from Round 1.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-stone-400">
                Type <span className="text-red-400 font-mono tracking-widest font-black">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmWord}
                onChange={(e) => setResetConfirmWord(e.target.value)}
                placeholder="RESET"
                className="w-full bg-bunker-900 border border-red-600/60 rounded px-3 py-2 text-stone-100 text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-red-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={resettingAll}
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmWord('');
                }}
                className="px-4 py-2 rounded bg-bunker-900 border border-bunker-700 hover:border-stone-500 text-xs text-stone-300 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetConfirmWord.trim().toUpperCase() !== 'RESET' || resettingAll}
                onClick={handleResetTournament}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {resettingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging Tournament...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Reset All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
