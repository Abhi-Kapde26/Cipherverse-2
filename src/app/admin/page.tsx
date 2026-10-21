'use client';

import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { LEVELS, LEVEL_VARIANTS } from '@/lib/ciphers';

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
  const [adminPassword, setAdminPassword] = useState('janus-admin-hq-1943');
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

  const loginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword,
          action: 'get_overview',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication denied.');
      } else {
        setAuthenticated(true);
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

  const refreshOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword,
          action: 'get_overview',
        }),
      });
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
        setSubmissions(data.submissions || []);
        setAnswers(data.answers || []);
        setIsPaused(Boolean(data.isPaused));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword,
          action: 'toggle_pause',
          paused: !isPaused,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaused(data.isPaused);
        setActionNotice(`Event state updated: ${data.isPaused ? 'PAUSED' : 'ACTIVE'}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetTeam = async (teamId: string) => {
    if (!confirm(`Are you sure you want to reset all progress for team ${teamId}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword,
          action: 'reset_team',
          teamId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
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
          adminPassword,
          action: 'update_team_level',
          teamId,
          level,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
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
          adminPassword,
          action: 'update_burn_level',
          teamId,
          burnLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
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
          adminPassword,
          action: 'force_branch',
          teamId,
          branch,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        refreshOverview();
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
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
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
            onClick={refreshOverview}
            className="px-3 py-1.5 rounded bg-bunker-900 border border-bunker-700 hover:border-stone-500 text-xs text-stone-300 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
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
            <div className="text-xs text-stone-500 uppercase">Total Levels</div>
            <div className="text-2xl font-black text-stone-100 mt-1">{LEVELS.length}</div>
          </div>

          <div className="p-4 rounded-lg bg-bunker-900 border border-bunker-700">
            <div className="text-xs text-stone-500 uppercase">Global Status</div>
            <div className={`text-2xl font-black mt-1 ${isPaused ? 'text-red-500' : 'text-emerald-400'}`}>
              {isPaused ? 'FROZEN' : 'ACTIVE'}
            </div>
          </div>
        </div>

        {/* Teams Management */}
        <div className="bg-bunker-900 border border-bunker-700 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wider">
                CRYPTANALYSIS STATIONS ROSTER
              </h2>
              <p className="text-xs text-stone-400">
                Override rounds, adjust suspicion burn levels, force superpower allegiances, or reset units.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-500" />
              <input
                type="text"
                placeholder="Filter teams..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-bunker-950 border border-bunker-700 rounded pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-bunker-950 border-b border-bunker-800 text-stone-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Team Name / ID</th>
                  <th className="py-2.5 px-3">Members</th>
                  <th className="py-2.5 px-3 text-center">Current Round</th>
                  <th className="py-2.5 px-3 text-center">Burn Meter</th>
                  <th className="py-2.5 px-3 text-center">Branch</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bunker-800">
                {filteredTeams.map((t) => (
                  <tr key={t.id} className="hover:bg-bunker-850">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-100">{t.team_name}</div>
                      <div className="text-[10px] text-stone-500">{t.id}</div>
                    </td>

                    <td className="py-3 px-3 text-stone-400 max-w-xs truncate">
                      {t.members.join(', ')}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <select
                          value={t.progress.current_level}
                          onChange={(e) => handleUpdateLevel(t.id, Number(e.target.value))}
                          className="bg-bunker-950 border border-bunker-700 rounded px-2 py-1 text-xs text-amber-400 font-bold"
                        >
                          {LEVELS.map((l) => (
                            <option key={l.number} value={l.number}>
                              Rnd {l.number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <select
                        value={t.progress.burn_level}
                        onChange={(e) => handleUpdateBurn(t.id, Number(e.target.value))}
                        className={`bg-bunker-950 border border-bunker-700 rounded px-2 py-1 text-xs font-bold ${
                          t.progress.burn_level >= 3 ? 'text-red-400' : 'text-stone-300'
                        }`}
                      >
                        <option value={0}>0 (Intact)</option>
                        <option value={1}>1 (Watched)</option>
                        <option value={2}>2 (Hunted)</option>
                        <option value={3}>3 (Burned)</option>
                        <option value={4}>4 (Burned+)</option>
                        <option value={5}>5 (Burned++)</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <select
                        value={t.progress.branch}
                        onChange={(e) => handleForceBranch(t.id, e.target.value)}
                        className="bg-bunker-950 border border-bunker-700 rounded px-2 py-1 text-xs font-bold text-stone-300"
                      >
                        <option value="UNALIGNED">Unaligned</option>
                        <option value="A">CIA (Branch A)</option>
                        <option value="B">KGB (Branch B)</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleResetTeam(t.id)}
                        className="px-2.5 py-1 rounded bg-red-950/60 border border-red-800 text-red-400 hover:bg-red-900/80 text-[11px] font-bold transition-colors"
                      >
                        Reset Unit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions Wire Monitor */}
        <div className="bg-bunker-900 border border-bunker-700 rounded-lg p-5 space-y-4">
          <h2 className="text-lg font-black text-stone-100 uppercase tracking-wider">
            RECENT TELETYPE SUBMISSIONS STREAM
          </h2>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
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
    </div>
  );
}
