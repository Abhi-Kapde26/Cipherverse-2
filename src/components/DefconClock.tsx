'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

interface DefconClockProps {
  currentLevel?: number;
  burnLevel?: number;
}

export default function DefconClock({ currentLevel = 1, burnLevel = 0 }: DefconClockProps) {
  const [timeStr, setTimeStr] = useState<string>('00:00:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute DEFCON based on current round and burn
  // DEFCON 5: Peacetime (Rounds 1-4)
  // DEFCON 4: Guard (Rounds 5-7)
  // DEFCON 3: Air Force Ready (Rounds 8-10)
  // DEFCON 2: Armed Forces Ready (Rounds 11-13)
  // DEFCON 1: Nuclear War Imminent (Rounds 14-15 or Burn Level >= 3)
  let defcon = 5;
  if (burnLevel >= 3 || currentLevel >= 14) {
    defcon = 1;
  } else if (currentLevel >= 11 || burnLevel >= 2) {
    defcon = 2;
  } else if (currentLevel >= 8 || burnLevel >= 1) {
    defcon = 3;
  } else if (currentLevel >= 5) {
    defcon = 4;
  }

  const defconColors: Record<number, string> = {
    5: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30',
    4: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/30',
    3: 'border-amber-500/50 text-amber-400 bg-amber-950/30',
    2: 'border-orange-500/60 text-orange-400 bg-orange-950/40 animate-pulse',
    1: 'border-red-600 text-red-500 bg-red-950/60 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  };

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${defconColors[defcon] || defconColors[5]}`}>
        <ShieldAlert className="w-3.5 h-3.5" />
        <span className="font-bold tracking-wider">DEFCON {defcon}</span>
      </div>

      <div className="hidden md:flex items-center gap-1.5 bg-bunker-900 border border-bunker-700/80 px-2.5 py-1 rounded text-stone-400">
        <Clock className="w-3.5 h-3.5 text-stone-500" />
        <span className="text-stone-300 tracking-widest">{timeStr} GMT</span>
      </div>
    </div>
  );
}
