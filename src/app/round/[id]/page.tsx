'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Terminal, 
  BookOpen, 
  Lightbulb, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Key, 
  Clock,
  Shield,
  Siren,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '@/components/Navbar';
import StampBadge from '@/components/StampBadge';
import PamphletModal from '@/components/PamphletModal';
import DilemmaOverlay from '@/components/DilemmaOverlay';
import { soundEngine } from '@/lib/audio';
import { LEVELS, LEVEL_VARIANTS } from '@/lib/ciphers';
import { getSceneForRound } from '@/lib/scenes';
import { useAtmosphere } from '@/components/AtmosphereContext';

interface UserSessionData {
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
  choices: {
    level: number;
    option: string;
    auto_penalized: number;
  }[];
  isPaused: boolean;
}

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = Number(params.id);

  const [session, setSession] = useState<UserSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerInput, setAnswerInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [showHint, setShowHint] = useState(false);
  const [pamphletOpen, setPamphletOpen] = useState(false);
  const [dilemmaOpen, setDilemmaOpen] = useState(false);
  const [copiedCipher, setCopiedCipher] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [newFragmentEarned, setNewFragmentEarned] = useState<number | null>(null);

  const { setScene, setDilemmaActive } = useAtmosphere();

  // Sync background scene per round and branch
  useEffect(() => {
    if (levelId) {
      const res = getSceneForRound(
        levelId,
        session?.progress?.branch,
        session?.progress?.sub_branch
      );
      setScene(res.scene, res.act);
    }
  }, [levelId, session?.progress?.branch, session?.progress?.sub_branch, setScene]);

  // Sync dilemma alert atmosphere
  useEffect(() => {
    setDilemmaActive(dilemmaOpen);
    return () => setDilemmaActive(false);
  }, [dilemmaOpen, setDilemmaActive]);

  // Fetch session & verify permissions
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data: UserSessionData = await res.json();
      setSession(data);

      // Verify level access
      if (levelId > data.progress.current_level && !data.progress.finished_at) {
        // Locked level attempted!
        router.push('/dashboard');
        return;
      }

      // Check if this round is an uncompleted dilemma round
      const levelDef = LEVELS.find((l) => l.number === levelId);
      if (levelDef?.isDilemma && levelId === data.progress.current_level) {
        const hasChoice = data.choices.some((c) => c.level === levelId);
        if (!hasChoice) {
          setDilemmaOpen(true);
        }
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [levelId]);

  const levelDef = LEVELS.find((l) => l.number === levelId);
  if (!levelDef) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center font-mono text-stone-200">
        <p>CASE FILE NOT FOUND</p>
        <Link href="/dashboard" className="text-amber-500 hover:underline mt-2">Return to Dashboard</Link>
      </div>
    );
  }

  // Branch variants for R6 and R7
  let activeStory = levelDef.storyText;
  let activeCiphertext = levelDef.ciphertext;
  let activeClue = levelDef.clue;

  if (session && (levelId === 6 || levelId === 7) && session.progress.branch !== 'UNALIGNED') {
    const variant = LEVEL_VARIANTS.find(
      (v) => v.levelNumber === levelId && v.branch === session.progress.branch
    );
    if (variant) {
      activeStory = variant.storyText;
      activeCiphertext = variant.ciphertext;
      activeClue = variant.clue;
    }
  }

  const isCurrentActive = session ? session.progress.current_level === levelId && !session.progress.finished_at : false;
  const isAlreadyCleared = session ? session.progress.current_level > levelId || Boolean(session.progress.finished_at) : false;

  const handleCopyCipher = () => {
    navigator.clipboard.writeText(activeCiphertext);
    setCopiedCipher(true);
    soundEngine.playTypewriter();
    setTimeout(() => setCopiedCipher(false), 2000);
  };

  const handleDilemmaDecisionMade = (option: string, autoPenalized: boolean) => {
    setDilemmaOpen(false);
    setStatusMessage({
      type: autoPenalized ? 'error' : 'info',
      text: autoPenalized
        ? `TIMER EXPIRED! High Command auto-applied Option ${option} and logged +1 Burn Level.`
        : `OPERATIONAL DIRECTIVE COMMITTED: Option ${option} enacted. Decrypt the tactical cipher below.`,
    });
    fetchSession();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    soundEngine.playTypewriter();

    try {
      const res = await fetch('/api/round/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: levelId,
          answer: answerInput,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        soundEngine.playAccessDenied();
        setShakeCard(true);
        setTimeout(() => setShakeCard(false), 600);

        setStatusMessage({
          type: 'error',
          text: data.error || data.message || 'ACCESS DENIED: Decryption rejected.',
        });

        // Optimistically update session in-memory instead of hammering server with /api/auth/me
        if (typeof data.wrongAttempts === 'number' || typeof data.burnLevel === 'number') {
          setSession((prev) => prev ? {
            ...prev,
            progress: {
              ...prev.progress,
              wrong_attempts_current: data.wrongAttempts ?? prev.progress.wrong_attempts_current,
              burn_level: data.burnLevel ?? prev.progress.burn_level,
            }
          } : null);
        }
      } else {
        // Correct answer!
        soundEngine.playStampThud();
        setShowStamp(true);

        if (data.newFragment) {
          setNewFragmentEarned(data.newFragment);
          soundEngine.playRadarPing();
        }

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#f59e0b', '#3b82f6'],
        });

        setStatusMessage({
          type: 'success',
          text: data.message || 'DECRYPTED: Clearance Granted.',
        });

        if (data.isComplete) {
          // Optimistically update session in-memory on success
          setSession((prev) => prev ? {
            ...prev,
            progress: {
              ...prev.progress,
              current_level: data.nextLevel ?? prev.progress.current_level + 1,
              wrong_attempts_current: 0,
              key_fragments: data.keyFragments ?? prev.progress.key_fragments,
              finished_at: Date.now(),
            }
          } : null);
          setTimeout(() => {
            router.push('/complete');
          }, 2500);
        } else {
          setTimeout(() => {
            setSession((prev) => prev ? {
              ...prev,
              progress: {
                ...prev.progress,
                current_level: data.nextLevel ?? prev.progress.current_level + 1,
                wrong_attempts_current: 0,
                key_fragments: data.keyFragments ?? prev.progress.key_fragments,
              }
            } : null);
            if (data.nextLevel && data.nextLevel <= 15) {
              router.push(`/round/${data.nextLevel}`);
            }
          }, 1500);
        }
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Teletype connection lost. Retrying...',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-200 font-mono pb-20">
      <Navbar
        teamName={session?.team.team_name}
        members={session?.team.members}
        currentLevel={session?.progress.current_level}
        burnLevel={session?.progress.burn_level}
        wrongAttemptsCurrent={session?.progress.wrong_attempts_current}
        keyFragments={session?.progress.key_fragments}
        branch={session?.progress.branch}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-bunker-800 pb-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Case Files Timeline</span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-stone-500">
              ACT {levelDef.act} // {levelDef.year}
            </span>
            {isAlreadyCleared && (
              <StampBadge type="DECRYPTED" className="text-[10px] py-0.5 px-2" />
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-4 rounded-lg border text-xs sm:text-sm flex items-start gap-3 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-950/80 border-red-600 text-red-300 animate-pulse'
                : 'bg-amber-950/60 border-amber-500 text-amber-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : (
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <div className="flex-1 font-bold">{statusMessage.text}</div>
          </div>
        )}

        {/* Master Key Fragment Earned Alert Banner */}
        {newFragmentEarned && (
          <div className="p-4 rounded-lg bg-amber-950/80 border-2 border-amber-500 text-amber-200 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-bounce">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-amber-400 animate-spin" />
              <div>
                <div className="font-black text-sm uppercase tracking-wider text-amber-300">
                  MASTER KEY FRAGMENT [{newFragmentEarned}] SECURED
                </div>
                <div className="text-xs text-amber-400">
                  Added to your Keyring HUD. 4 fragments required for Round 15 Master Vault.
                </div>
              </div>
            </div>
            <span className="font-black text-2xl text-amber-400">+{newFragmentEarned}</span>
          </div>
        )}

        {/* Case File Workstation Container */}
        <div
          className={`frosted-glass-card border-2 rounded-lg p-6 sm:p-8 shadow-2xl relative transition-all duration-300 ${
            shakeCard ? 'border-red-600 translate-x-1 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'border-bunker-700/80'
          }`}
        >
          {/* Top Dossier Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-bunker-700 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-500 font-bold mb-1">
                <span>ROUND {String(levelDef.number).padStart(2, '0')}</span>
                <span>•</span>
                <span>{levelDef.agency} ENCRYPTED TRANSMISSION</span>
                {levelDef.isDilemma && (
                  <span className="text-red-400 flex items-center gap-0.5 ml-2 font-bold">
                    <Siren className="w-3.5 h-3.5" /> DILEMMA
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
                {levelDef.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPamphletOpen(true)}
                className="px-3 py-1.5 rounded bg-bunker-950 border border-bunker-700 hover:border-amber-500 text-xs text-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Field Pamphlet</span>
              </button>
            </div>
          </div>

          {/* Stamp visual on cleared */}
          {(isAlreadyCleared || showStamp) && (
            <div className="absolute right-8 top-20 z-10 pointer-events-none">
              <StampBadge type="DECRYPTED" className="text-lg sm:text-2xl" rotate="8deg" />
            </div>
          )}

          {/* Historical Narrative Briefing */}
          <div className="my-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              <span>Declassified Wire Briefing</span>
            </div>
            <div className="p-4 rounded-lg bg-bunker-950 border border-bunker-800 text-stone-300 text-xs sm:text-sm leading-relaxed">
              {activeStory}
            </div>
          </div>

          {/* Cipher Block */}
          <div className="my-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
              <span className="text-amber-400">Cipher: {levelDef.cipherType}</span>
              <button
                onClick={handleCopyCipher}
                className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCipher ? 'COPIED TO BUFFER' : 'COPY CIPHERTEXT'}</span>
              </button>
            </div>

            <div className="p-5 rounded-lg bg-black/90 border border-bunker-700 relative overflow-x-auto">
              <pre className="font-mono text-base sm:text-lg font-bold text-emerald-400 tracking-wider whitespace-pre-wrap break-words break-all select-all">
                {activeCiphertext}
              </pre>
            </div>

            {/* Clue Dispatch */}
            <div className="text-xs text-stone-400 bg-bunker-950/60 p-3 rounded border border-bunker-800">
              <strong className="text-stone-300">Operational Clue:</strong> {activeClue}
            </div>
          </div>

          {/* Field Hint Expander */}
          <div className="my-4">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Request Cryptanalyst Hint</span>
              </button>
            ) : (
              <div className="p-3 rounded bg-amber-950/30 border border-amber-600/50 text-xs text-amber-300 space-y-1">
                <div className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Bletchley Analyst Tip:</span>
                </div>
                <p>{levelDef.hint}</p>
              </div>
            )}
          </div>

          {/* Decryption Submission Console */}
          {isCurrentActive ? (
            <form onSubmit={handleSubmit} className="mt-8 pt-6 border-t border-bunker-700 space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-stone-300 mb-2">
                  Transmit Decrypted Plaintext
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    disabled={isSubmitting || session?.isPaused}
                    placeholder="Enter decrypted message..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="flex-1 bg-bunker-950 border-2 border-bunker-700 rounded px-4 py-3 text-stone-100 placeholder-stone-600 text-sm sm:text-base font-mono uppercase tracking-wider focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || session?.isPaused || !answerInput.trim()}
                    className="px-6 py-3 rounded bg-amber-600 hover:bg-amber-500 text-bunker-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
                  >
                    {isSubmitting ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Decipher</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 flex items-center justify-between">
                <span>Answers are case-insensitive and ignore punctuation.</span>
                <span>Rate limit: 1 submission per 3 seconds.</span>
              </div>
            </form>
          ) : isAlreadyCleared ? (
            <div className="mt-8 pt-6 border-t border-bunker-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-bunker-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Round {levelDef.number} Cleared and Stored in Archives.</span>
              </div>

              {levelDef.number < 15 ? (
                <Link
                  href={`/round/${levelDef.number + 1}`}
                  className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-bunker-950 font-bold text-xs uppercase tracking-wider"
                >
                  Proceed to Round {levelDef.number + 1} →
                </Link>
              ) : (
                <Link
                  href="/complete"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-bunker-950 font-bold text-xs uppercase tracking-wider"
                >
                  View Final Debriefing →
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </main>

      {/* Field Pamphlet Modal */}
      <PamphletModal
        isOpen={pamphletOpen}
        onClose={() => setPamphletOpen(false)}
        initialKey={levelDef.pamphletKey}
      />

      {/* 180s Dilemma Overlay */}
      {levelDef.isDilemma && levelDef.options && (
        <DilemmaOverlay
          levelNumber={levelDef.number}
          options={levelDef.options}
          isOpen={dilemmaOpen}
          onDecisionMade={handleDilemmaDecisionMade}
        />
      )}
    </div>
  );
}
