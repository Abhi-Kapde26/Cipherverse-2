'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileLock2, 
  CheckCircle2, 
  Radio, 
  Lock, 
  ChevronRight, 
  Key, 
  AlertTriangle,
  Siren,
  Flag
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import BurnMeter from '@/components/BurnMeter';
import KeyringHud from '@/components/KeyringHud';
import StampBadge from '@/components/StampBadge';
import { LEVELS } from '@/lib/ciphers';
import { getSceneForDashboard } from '@/lib/scenes';
import { useAtmosphere } from '@/components/AtmosphereContext';

interface TeamData {
  team: {
    id: string;
    team_name: string;
    members: string[];
    created_at: number;
  };
  progress: {
    team_id: string;
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
  isPaused: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setScene } = useAtmosphere();

  useEffect(() => {
    if (data?.progress) {
      const activeAct = data.progress.current_level > 10 ? 3 : data.progress.current_level > 5 ? 2 : 1;
      const res = getSceneForDashboard(activeAct);
      setScene(res.scene, res.act);
    }
  }, [data?.progress?.current_level, setScene]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // High-concurrency optimization: poll every 20s and only when tab is active
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchSession();
      }
    }, 20000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-mono text-amber-500">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 animate-pulse" />
          <span>DECRYPTING HUT 99 CASE FILES...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { team, progress, isPaused } = data;
  const currentLvl = progress.current_level;
  const isAllComplete = progress.finished_at !== null || currentLvl > 15;

  const acts = [
    {
      act: 1,
      title: 'ACT I: THE ATOMIC SHADOW (1943 - 1945)',
      desc: 'Bletchley Park intercepts, Venona pads, and the Manhattan Project leaks.',
      levels: LEVELS.filter((l) => l.act === 1),
    },
    {
      act: 2,
      title: 'ACT II: THE IRON CURTAIN (1948 - 1956)',
      desc: 'Berlin Blockade, the Cambridge Five moles, and subterranean tunnel taps.',
      levels: LEVELS.filter((l) => l.act === 2),
    },
    {
      act: 3,
      title: 'ACT III: BRINK OF OBLIVION (1960 - 1962)',
      desc: 'High-altitude U-2 reconnaissance, Caribbean nuclear missile telemetry, and the Master Key Vault.',
      levels: LEVELS.filter((l) => l.act === 3),
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-stone-200 font-mono pb-16">
      <Navbar
        teamName={team.team_name}
        members={team.members}
        currentLevel={currentLvl}
        burnLevel={progress.burn_level}
        wrongAttemptsCurrent={progress.wrong_attempts_current}
        keyFragments={progress.key_fragments}
        branch={progress.branch}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Global Event Paused Warning */}
        {isPaused && (
          <div className="p-4 rounded-lg bg-red-950/80 border-2 border-red-600 text-red-200 text-sm flex items-center gap-3 animate-pulse shadow-lg">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <div className="font-bold uppercase tracking-wider text-red-400">
                EVENT TEMPORARILY FROZEN BY HIGH COMMAND
              </div>
              <p className="text-xs text-red-300">
                All cryptanalysis submissions are temporarily suspended. Standby for operational orders.
              </p>
            </div>
          </div>
        )}

        {/* Mission Complete Banner */}
        {isAllComplete && (
          <div className="p-5 rounded-lg bg-emerald-950/60 border-2 border-emerald-500 text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="font-black text-lg text-emerald-300">
                  OPERATION JANUS: COMPLETE
                </h3>
                <p className="text-xs text-emerald-400">
                  Unit 404 has decrypted all 15 Cold War intercepts. View your mission debriefing and final fate.
                </p>
              </div>
            </div>
            <Link
              href="/complete"
              className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-bunker-950 font-black text-xs uppercase tracking-wider transition-colors shadow"
            >
              View Mission Cinematic
            </Link>
          </div>
        )}

        {/* HUD Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BurnMeter
            burnLevel={progress.burn_level}
            wrongAttemptsCurrent={progress.wrong_attempts_current}
          />

          <KeyringHud fragments={progress.key_fragments} />

          {/* Allegiance & Faction Card */}
          <div className="p-4 rounded-lg bg-bunker-900 border border-bunker-700 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-500" />
                <span className="text-xs uppercase tracking-wider text-stone-300 font-bold">
                  AGENCY PACT
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  progress.branch === 'A'
                    ? 'bg-blue-950/60 border-blue-600 text-blue-400'
                    : progress.branch === 'B'
                    ? 'bg-red-950/60 border-red-600 text-red-400'
                    : 'bg-stone-800 border-stone-600 text-stone-400'
                }`}
              >
                {progress.branch === 'A'
                  ? 'CIA ALIGNED'
                  : progress.branch === 'B'
                  ? 'KGB ALIGNED'
                  : 'PENDING ROUND 5'}
              </span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed my-2">
              {progress.branch === 'A'
                ? 'Langley Pact active. Allied cipher suites unlocked for Berlin & Cambridge.'
                : progress.branch === 'B'
                ? 'Lubyanka Gambit active. Soviet Centre channels engaged for Berlin & Cambridge.'
                : 'Unaligned. Operating under neutral Hut 99 Bletchley mandate until Round 5.'}
            </p>

            <div className="text-[11px] text-stone-500 border-t border-bunker-800 pt-2 flex justify-between">
              <span>Unit 404 ID: <strong className="text-stone-300">{team.id}</strong></span>
              <span>Active Round: <strong className="text-amber-400">{Math.min(15, currentLvl)} / 15</strong></span>
            </div>
          </div>
        </div>

        {/* 15 Rounds Timeline organized into 3 Acts */}
        <div className="space-y-8">
          {acts.map((act) => (
            <div key={act.act} className="space-y-4">
              <div className="border-b border-bunker-700/80 pb-2">
                <h2 className="text-lg sm:text-xl font-black text-amber-500 tracking-tight">
                  {act.title}
                </h2>
                <p className="text-xs text-stone-400">{act.desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {act.levels.map((lvl) => {
                  const isCleared = currentLvl > lvl.number || isAllComplete;
                  const isCurrent = currentLvl === lvl.number && !isAllComplete;
                  const isLocked = currentLvl < lvl.number;

                  return (
                    <div
                      key={lvl.number}
                      className={`relative rounded-lg border-2 p-5 flex flex-col justify-between transition-all ${
                        isCleared
                          ? 'frosted-glass-card border-emerald-600/40 opacity-90'
                          : isCurrent
                          ? 'frosted-glass-card border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse-fast'
                          : 'frosted-glass-card border-bunker-800/80 opacity-60'
                      }`}
                    >
                      {/* Top Bar of Case File */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              isCleared
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : isCurrent
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-bunker-800 text-stone-500'
                            }`}
                          >
                            ROUND {String(lvl.number).padStart(2, '0')}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {lvl.year}
                          </span>
                        </div>

                        {/* Status Icon or Badge */}
                        {isCleared ? (
                          <StampBadge type="DECRYPTED" className="text-[10px] py-0.5 px-2" />
                        ) : isCurrent ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-600/70 px-2 py-0.5 rounded">
                            <Radio className="w-3 h-3 animate-ping" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-stone-600 text-xs">
                            <Lock className="w-3.5 h-3.5" />
                            <span>LOCKED</span>
                          </div>
                        )}
                      </div>

                      {/* Title & Agency */}
                      <div className="my-2">
                        <div className="text-[10px] uppercase font-bold text-stone-400 mb-1 flex items-center gap-2">
                          <span>{lvl.agency} DISPATCH</span>
                          {lvl.isDilemma && (
                            <span className="text-red-400 flex items-center gap-0.5 font-bold">
                              <Siren className="w-3 h-3 text-red-500" />
                              <span>180s DILEMMA</span>
                            </span>
                          )}
                          {lvl.keyFragment && (
                            <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                              <Key className="w-3 h-3" />
                              <span>FRAG {lvl.keyFragment}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-stone-100 mb-1">
                          {isLocked ? (
                            <span className="redaction-bar">CLASSIFIED INTERCEPT</span>
                          ) : (
                            lvl.title
                          )}
                        </h3>

                        <div className="text-xs text-stone-400">
                          {isLocked ? (
                            <span className="redaction-bar">Top Secret Encryption Standard</span>
                          ) : (
                            lvl.cipherType
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-bunker-800 flex items-center justify-between">
                        {isLocked ? (
                          <div className="text-[11px] text-stone-600 flex items-center gap-1">
                            <FileLock2 className="w-3.5 h-3.5" />
                            <span>Clear Round {lvl.number - 1} to unlock</span>
                          </div>
                        ) : (
                          <Link
                            href={`/round/${lvl.number}`}
                            className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              isCurrent
                                ? 'bg-amber-600 hover:bg-amber-500 text-bunker-950 shadow-md'
                                : 'bg-bunker-800 hover:bg-bunker-700 text-stone-200'
                            }`}
                          >
                            <span>{isCleared ? 'Review Archives' : 'Enter Decryption Bay'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
