'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Radio, 
  FileText, 
  Printer, 
  ArrowLeft, 
  ShieldAlert,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '@/components/Navbar';
import StampBadge from '@/components/StampBadge';

interface EndingData {
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
  };
  choices: {
    level: number;
    option: string;
    auto_penalized: number;
  }[];
}

export default function CompletePage() {
  const router = useRouter();
  const [data, setData] = useState<EndingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnding = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const json = await res.json();
        setData(json);

        // Trigger celebratory fireworks/confetti
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#22c55e', '#ef4444', '#ffffff'],
        });
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchEnding();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-mono text-amber-500">
        <Radio className="w-6 h-6 animate-pulse mr-2" />
        <span>PROCESSING FINAL UNIT 404 DEBRIEFING...</span>
      </div>
    );
  }

  if (!data) return null;

  const { team, progress, choices } = data;
  const endingCode = progress.ending || 'X';

  const endings: Record<
    string,
    {
      title: string;
      subtitle: string;
      badge: string;
      narrative: string;
      consequence: string;
      verdict: string;
    }
  > = {
    X: {
      title: 'THE MARTYR’S BROADCAST',
      subtitle: 'OPERATION JANUS: COMPLETE (CAPTURED HEROES)',
      badge: 'UNSUNG MARTYRS',
      narrative:
        'You chose Option X on Black Saturday. You flooded open maritime VHF frequencies with the decrypted Soviet abort codes. Both the US Navy destroyer squadron and Captain Savitsky on submarine B-59 heard the confirmation and stood down torpedo tubes. Nuclear World War III was averted. Within forty minutes, British Special Branch and American military police surrounded Hut 99. You were led out in handcuffs into the freezing drizzle—unsung saviors whose names will remain redacted forever.',
      consequence:
        'World War III averted. 100 million lives preserved. Unit 404 imprisoned in secret military detention.',
      verdict: 'HEROIC DECLASSIFICATION',
    },
    Y: {
      title: 'PROTOCOL PHANTOM',
      subtitle: 'OPERATION JANUS: COMPLETE (GHOST EXODUS)',
      badge: 'PHANTOM SURVIVORS',
      narrative:
        'You chose Option Y. While the fleets tangled in electromagnetic confusion off Cuba, Unit 404 executed the emergency incinerator protocol. Thermite grenades melted the teletype machines and rotor cages into slag. Equipped with blank Panamanian passports, forged diplomatic credentials, and Swiss gold bars stashed during the Vienna crisis, your team slipped through the North Sea fog onto an outbound cargo vessel bound for Valparaíso. You survived the Cold War without masters.',
      consequence:
        'Unit 404 vanished without a trace. CIA and KGB spend twenty years hunting shadows.',
      verdict: 'TACTICAL EXFILTRATION',
    },
    Z: {
      title: 'DEAD MAN’S SWITCH',
      subtitle: 'OPERATION JANUS: COMPLETE (THE PURGE)',
      badge: 'REVELATION ARCHIVISTS',
      narrative:
        'You chose Option Z. The moment the Master Key cracked the central vault, a multi-frequency radio burst triggered automated teletypes across forty international press agencies. Every double-cross since 1943—the doctored Kursk dispatches, the Cambridge Five moles, the Berlin tunnel betrayals—printed in screaming headlines on the front pages of the New York Times, Le Monde, and Pravda. Superpower intelligence services fell into immediate internal purges and global reckoning.',
      consequence:
        'Superpower espionage empires exposed. Total geopolitical turmoil. Unit 404 immortalized as rogue truth-tellers.',
      verdict: 'SYSTEMIC DISMANTLEMENT',
    },
  };

  const endingInfo = endings[endingCode] || endings['X'];

  const startTime = progress.started_at;
  const finishTime = progress.finished_at || Date.now();
  const rawElapsed = finishTime - startTime;
  const penaltySeconds = progress.burn_level >= 3 ? (progress.burn_level - 2) * 120 : 0;
  const adjustedElapsed = rawElapsed + penaltySeconds * 1000;

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-transparent font-mono text-stone-200 pb-20">
      <Navbar
        teamName={team.team_name}
        members={team.members}
        currentLevel={progress.current_level}
        burnLevel={progress.burn_level}
        keyFragments={progress.key_fragments}
        branch={progress.branch}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div className="flex justify-center">
          <StampBadge type="DECRYPTED" className="text-xl sm:text-3xl" rotate="-2deg" />
        </div>

        {/* Cinematic Declassification Folder */}
        <div className="aged-paper rounded-lg p-6 sm:p-10 shadow-2xl relative border-2 border-stone-500 text-stone-900 space-y-6">
          <div className="border-b-2 border-stone-400 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-stone-600">
                FINAL INTELLIGENCE BRIEFING // {endingInfo.verdict}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
                {endingInfo.title}
              </h1>
              <p className="text-xs font-bold text-amber-800 tracking-wider mt-0.5">
                {endingInfo.subtitle}
              </p>
            </div>

            <div className="px-3 py-1.5 rounded bg-stone-900 text-amber-400 font-bold text-xs uppercase text-center border border-stone-700">
              {endingInfo.badge}
            </div>
          </div>

          {/* Narrative Debriefing */}
          <div className="text-sm sm:text-base leading-relaxed text-stone-800 font-mono bg-stone-100/70 p-5 rounded border border-stone-300">
            {endingInfo.narrative}
          </div>

          <div className="p-4 rounded bg-stone-200/90 border border-stone-300 text-xs text-stone-800 space-y-1">
            <strong>Historical Consequence:</strong>
            <p>{endingInfo.consequence}</p>
          </div>

          {/* Stats Card */}
          <div className="border-t-2 border-stone-400 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-600 mb-3">
              UNIT 404 FIELD STATISTICS & RECORD
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-stone-200 p-3 rounded border border-stone-300">
                <div className="text-[10px] text-stone-600 uppercase">Rounds Cleared</div>
                <div className="text-xl font-black text-stone-900 mt-1">15 / 15</div>
              </div>

              <div className="bg-stone-200 p-3 rounded border border-stone-300">
                <div className="text-[10px] text-stone-600 uppercase">Burn Suspicion</div>
                <div className="text-xl font-black text-red-700 mt-1">
                  LVL {progress.burn_level}
                </div>
              </div>

              <div className="bg-stone-200 p-3 rounded border border-stone-300">
                <div className="text-[10px] text-stone-600 uppercase">Master Key</div>
                <div className="text-xl font-black text-amber-700 mt-1">7-3-9-5</div>
              </div>

              <div className="bg-stone-200 p-3 rounded border border-stone-300">
                <div className="text-[10px] text-stone-600 uppercase">Adjusted Time</div>
                <div className="text-xl font-black text-stone-900 mt-1">
                  {formatElapsed(adjustedElapsed)}
                </div>
              </div>
            </div>
          </div>

          {/* Roster & Choices Log */}
          <div className="border-t border-stone-300 pt-4 flex flex-col sm:flex-row justify-between text-xs text-stone-700 gap-3">
            <div>
              <span className="font-bold">Cryptanalysis Roster:</span> {team.members.join(', ')}
            </div>
            <div>
              <span className="font-bold">Fateful Allegiance:</span>{' '}
              {progress.branch === 'A' ? 'The Langley Pact (CIA)' : 'The Lubyanka Gambit (KGB)'}
            </div>
          </div>

          {/* Print / Navigation Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-stone-400 gap-4">
            <Link
              href="/leaderboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Inspect Event Leaderboard</span>
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-2.5 rounded bg-stone-300 hover:bg-stone-400 text-stone-900 font-bold text-xs uppercase tracking-wider border border-stone-500 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Declassified Certificate</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
