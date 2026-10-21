'use client';

import React from 'react';
import { Flame, AlertTriangle, ShieldCheck, Eye, Crosshair } from 'lucide-react';

interface BurnMeterProps {
  burnLevel: number;
  wrongAttemptsCurrent?: number;
  compact?: boolean;
}

export default function BurnMeter({ burnLevel, wrongAttemptsCurrent = 0, compact = false }: BurnMeterProps) {
  // Stages:
  // 0: Cover Intact
  // 1: Watched
  // 2: Hunted
  // 3+: Burned

  const stages = [
    { label: 'Cover Intact', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { label: 'Watched', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500' },
    { label: 'Hunted', icon: Crosshair, color: 'text-orange-500', bg: 'bg-orange-500' },
    { label: 'Burned', icon: Flame, color: 'text-red-500', bg: 'bg-red-500' },
  ];

  const currentStageIndex = Math.min(burnLevel, 3);
  const currentStage = stages[currentStageIndex];
  const Icon = currentStage.icon;
  const isBurned = burnLevel >= 3;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono font-medium ${
          isBurned
            ? 'bg-red-950/80 border-red-600 text-red-400 animate-pulse'
            : burnLevel === 2
            ? 'bg-orange-950/50 border-orange-600/70 text-orange-400'
            : burnLevel === 1
            ? 'bg-amber-950/50 border-amber-600/70 text-amber-400'
            : 'bg-emerald-950/40 border-emerald-600/50 text-emerald-400'
        }`}
        title={`Burn Level ${burnLevel}: ${currentStage.label}. Wrong attempts in current round: ${wrongAttemptsCurrent}/3`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{currentStage.label}</span>
        {burnLevel > 0 && <span className="opacity-75">({burnLevel})</span>}
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg border font-mono ${
      isBurned 
        ? 'bg-red-950/40 border-red-600/80 shadow-[0_0_20px_rgba(220,38,38,0.25)]' 
        : 'bg-bunker-900/90 border-bunker-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${isBurned ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} />
          <span className="text-xs uppercase tracking-wider text-stone-300 font-bold">BURN METER</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${currentStage.color}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{currentStage.label.toUpperCase()}</span>
          {burnLevel >= 3 && <span className="text-red-400">LVL {burnLevel}</span>}
        </div>
      </div>

      {/* Progress Bars for 4 stages */}
      <div className="grid grid-cols-4 gap-1.5 h-2 my-2">
        {stages.map((st, i) => {
          const filled = burnLevel >= i;
          const active = burnLevel === i || (i === 3 && burnLevel >= 3);
          return (
            <div
              key={st.label}
              className={`rounded-sm transition-all duration-300 ${
                filled
                  ? active && isBurned
                    ? 'bg-red-600 shadow-[0_0_8px_#ef4444] animate-pulse'
                    : st.bg
                  : 'bg-bunker-800'
              }`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-stone-500" />
          Suspicion attempts: <strong className="text-stone-200">{wrongAttemptsCurrent} / 3</strong>
        </span>
        {isBurned ? (
          <span className="text-red-400 font-bold animate-pulse">
            +{(burnLevel - 2) * 2}m Leaderboard Penalty
          </span>
        ) : (
          <span className="text-stone-500">3 failed attempts = +1 Burn</span>
        )}
      </div>
    </div>
  );
}
