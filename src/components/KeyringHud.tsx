'use client';

import React from 'react';
import { Key, Lock } from 'lucide-react';

interface KeyringHudProps {
  fragments: number[];
  compact?: boolean;
}

export default function KeyringHud({ fragments = [], compact = false }: KeyringHudProps) {
  const masterFragments = [
    { round: 1, value: 7, label: 'R1' },
    { round: 5, value: 3, label: 'R5' },
    { round: 10, value: 9, label: 'R10' },
    { round: 14, value: 5, label: 'R14' },
  ];

  const totalAcquired = fragments.length;
  const isComplete = masterFragments.every((mf) => fragments.includes(mf.value));

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-bunker-700 bg-bunker-900 text-xs font-mono">
        <Key className={`w-3.5 h-3.5 ${isComplete ? 'text-amber-400 animate-bounce' : 'text-stone-400'}`} />
        <span className="text-stone-300">KEY:</span>
        <div className="flex items-center gap-1">
          {masterFragments.map((mf) => {
            const has = fragments.includes(mf.value);
            return (
              <span
                key={mf.label}
                className={`px-1 py-0.2 rounded font-bold text-[11px] ${
                  has
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-bunker-800 text-stone-600'
                }`}
              >
                {has ? mf.value : '?'}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg border font-mono ${
      isComplete 
        ? 'bg-amber-950/30 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
        : 'bg-bunker-900/90 border-bunker-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Key className={`w-4 h-4 ${isComplete ? 'text-amber-400 animate-spin' : 'text-amber-500'}`} />
          <span className="text-xs uppercase tracking-wider text-stone-300 font-bold">MASTER KEYRING</span>
        </div>
        <span className={`text-xs font-bold ${isComplete ? 'text-amber-300' : 'text-stone-400'}`}>
          {totalAcquired} / 4 FRAGMENTS
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {masterFragments.map((mf) => {
          const has = fragments.includes(mf.value);
          return (
            <div
              key={mf.label}
              className={`flex flex-col items-center justify-center p-2 rounded border transition-all duration-300 ${
                has
                  ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'bg-bunker-950 border-bunker-800 text-stone-600'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-75">{mf.label}</div>
              <div className="text-lg font-black mt-0.5">
                {has ? mf.value : <Lock className="w-4 h-4 my-1 opacity-50" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-stone-500 mt-2 text-center">
        {isComplete ? (
          <span className="text-amber-400 font-bold">VAULT READY: Master Key Complete (7-3-9-5)</span>
        ) : (
          <span>Required for Round 15 Master Vault purge</span>
        )}
      </div>
    </div>
  );
}
