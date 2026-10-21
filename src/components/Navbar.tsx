'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Radio, Trophy, BookOpen, LogOut, Terminal, Users } from 'lucide-react';
import AudioControls from './AudioControls';
import DefconClock from './DefconClock';
import BurnMeter from './BurnMeter';
import KeyringHud from './KeyringHud';
import PamphletModal from './PamphletModal';

interface NavbarProps {
  teamName?: string;
  members?: string[];
  currentLevel?: number;
  burnLevel?: number;
  wrongAttemptsCurrent?: number;
  keyFragments?: number[];
  branch?: string;
}

export default function Navbar({
  teamName,
  members = [],
  currentLevel = 1,
  burnLevel = 0,
  wrongAttemptsCurrent = 0,
  keyFragments = [],
  branch = 'UNALIGNED',
}: NavbarProps) {
  const router = useRouter();
  const [pamphletOpen, setPamphletOpen] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-bunker-700/80 bg-bunker-950/80 backdrop-blur-md font-mono select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-black tracking-widest text-stone-100">OPERATION JANUS</div>
                <div className="text-[10px] text-stone-400">HUT 99 CRYPTANALYSIS</div>
              </div>
            </Link>

            <DefconClock currentLevel={currentLevel} burnLevel={burnLevel} />
          </div>

          {/* Middle HUD Badges (if authenticated) */}
          {teamName && (
            <div className="hidden lg:flex items-center gap-2">
              <BurnMeter burnLevel={burnLevel} wrongAttemptsCurrent={wrongAttemptsCurrent} compact />
              <KeyringHud fragments={keyFragments} compact />

              {/* Faction Badge */}
              <div
                className={`px-2 py-1 rounded border text-[11px] font-bold ${
                  branch === 'A'
                    ? 'bg-blue-950/50 border-blue-600 text-blue-400'
                    : branch === 'B'
                    ? 'bg-red-950/50 border-red-600 text-red-400'
                    : 'bg-stone-900 border-stone-700 text-stone-400'
                }`}
              >
                {branch === 'A' ? 'CIA PACT' : branch === 'B' ? 'KGB GAMBIT' : 'UNALIGNED'}
              </div>
            </div>
          )}

          {/* Right Navigation & Audio */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPamphletOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-bunker-900 border border-bunker-700 hover:border-amber-500/60 text-xs text-stone-300 hover:text-stone-100 transition-colors"
              title="Open Hut 99 Field Pamphlet"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">PAMPHLET</span>
            </button>

            <Link
              href="/leaderboard"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-bunker-900 border border-bunker-700 hover:border-amber-500/60 text-xs text-stone-300 hover:text-stone-100 transition-colors"
              title="View Live Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">RANKS</span>
            </Link>

            <AudioControls />

            {teamName ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoster(!showRoster)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/40 text-xs text-amber-300 font-bold hover:bg-amber-500/20"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="max-w-[100px] truncate">{teamName}</span>
                </button>

                {showRoster && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-bunker-950 border border-bunker-700 p-3 shadow-xl z-50 text-xs space-y-2">
                    <div className="font-bold text-stone-200 border-b border-bunker-800 pb-1 flex justify-between">
                      <span>{teamName}</span>
                      <span className="text-amber-400 text-[10px]">RND {currentLevel}</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      <div className="text-stone-500 text-[10px] uppercase">Cryptanalysts:</div>
                      {members.map((m, i) => (
                        <div key={i} className="truncate">• {m}</div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-bunker-800 flex justify-between items-center">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowRoster(false)}
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Terminal className="w-3 h-3" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-red-400 hover:underline flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" /> Abort
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-bunker-950 font-bold text-xs transition-colors"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </header>

      <PamphletModal isOpen={pamphletOpen} onClose={() => setPamphletOpen(false)} />
    </>
  );
}
