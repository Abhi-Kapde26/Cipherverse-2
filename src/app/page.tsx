'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Key, AlertTriangle, Terminal, ChevronRight, Trophy, Lock } from 'lucide-react';
import TypewriterTitle from '@/components/TypewriterTitle';
import StampBadge from '@/components/StampBadge';
import AudioControls from '@/components/AudioControls';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-bunker-700/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs uppercase font-bold tracking-widest text-stone-400">
            HUT 99 // CLASSIFIED DISPATCH // 1943-1962
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AudioControls />
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-bunker-900 border border-bunker-700 text-xs text-amber-400 hover:text-amber-300 hover:border-amber-500/60 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-bunker-900 border border-bunker-700 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>HQ</span>
          </Link>
        </div>
      </header>

      {/* Main Dossier Content */}
      <div className="my-10 space-y-10">
        <div className="flex justify-center">
          <StampBadge type="TOP_SECRET" rotate="-2deg" className="text-sm sm:text-base" />
        </div>

        {/* Decrypting Title */}
        <TypewriterTitle
          targetText="OPERATION JANUS: THE TRUST PARADOX"
          subText="A Stateless Cold War Cryptanalytic Campaign"
        />

        {/* Dossier Card */}
        <div className="aged-paper rounded-lg p-6 sm:p-10 shadow-2xl relative border-2 border-stone-500/40 max-w-4xl mx-auto text-stone-900">
          <div className="flex justify-between items-start border-b border-stone-400/80 pb-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-stone-600">
                CASE FILE: U404-JANUS // 15 ROUNDS // 3 SUPERPOWERS
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-1">
                UNIT 404 OPERATIONAL MANDATE
              </h2>
            </div>
            <span className="text-xs font-mono bg-stone-300 text-stone-800 px-2 py-1 rounded border border-stone-400 font-bold">
              EST. 1943
            </span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-stone-800 mb-6 font-mono">
            You are a stateless cryptanalyst embedded in <strong>Hut 99</strong>. From the muddy trenches
            of Kursk in 1943 to the razor-edge nuclear showdown of the Cuban Missile Crisis in 1962, you
            will intercept, falsify, and decipher top-secret dispatches for MI6, the CIA, and the KGB.
            Every cipher is verified. Every betrayal has consequences.
          </p>

          {/* Three Core Mechanics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stone-300/80 pt-6 my-6 text-stone-800">
            <div className="bg-stone-200/70 p-4 rounded border border-stone-300">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>THE BURN METER</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Cover Intact → Watched → Hunted → Burned. 3 failed attempts or timer expiration increases
                suspicion. At Burned level, time penalties accumulate on the leaderboard clock.
              </p>
            </div>

            <div className="bg-stone-200/70 p-4 rounded border border-stone-300">
              <div className="flex items-center gap-2 font-bold text-red-800 text-sm mb-1">
                <Shield className="w-4 h-4 text-red-700" />
                <span>180s DILEMMAS</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                At Rounds 5, 8, 10, and 14, the terminal locks into a pulsing 180s siren countdown. Choose
                The Langley Pact (CIA) or Lubyanka Gambit (KGB). Timer expiration forces the dangerous route.
              </p>
            </div>

            <div className="bg-stone-200/70 p-4 rounded border border-stone-300">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-1">
                <Key className="w-4 h-4 text-stone-800" />
                <span>MASTER KEYRING</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Assemble fragments across your mission (R1=7, R5=3, R10=9, R14=5). You cannot crack the
                Round 15 Master Vault without holding all four key fragments (7-3-9-5).
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-stone-950 hover:bg-stone-900 text-amber-400 font-bold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Enlist Unit 404 (Register)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-stone-300 hover:bg-stone-400 text-stone-950 font-bold text-sm sm:text-base tracking-wider uppercase border border-stone-500 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Resume Station (Login)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Dispatch */}
      <footer className="border-t border-bunker-800 pt-4 text-center text-xs text-stone-500 font-mono">
        <p>BLETCHLEY PARK REVISION 1962 // AUTHORIZED BY UNIT 404 CRYPTOGRAPHIC OVERSIGHT</p>
      </footer>
    </main>
  );
}
