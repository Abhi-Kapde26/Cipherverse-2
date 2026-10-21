'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio } from 'lucide-react';
import { soundEngine } from '@/lib/audio';

export default function AudioControls() {
  const [muted, setMuted] = useState(false);
  const [ambient, setAmbient] = useState(false);

  useEffect(() => {
    setMuted(soundEngine.getMuted());
  }, []);

  const handleToggleMute = () => {
    const isMuted = soundEngine.toggleMute();
    setMuted(isMuted);
    if (isMuted && ambient) {
      soundEngine.stopAmbiance();
      setAmbient(false);
    }
  };

  const handleToggleAmbient = () => {
    const playing = soundEngine.toggleAmbiance();
    setAmbient(playing);
  };

  return (
    <div className="flex items-center gap-2 bg-bunker-900 border border-bunker-700/80 px-2.5 py-1 rounded text-xs text-stone-300">
      <button
        onClick={handleToggleMute}
        title={muted ? 'Unmute Hut 99 Audio' : 'Mute Hut 99 Audio'}
        className={`p-1 rounded transition-colors ${
          muted ? 'text-red-400 bg-red-950/40 hover:bg-red-900/60' : 'text-amber-400 hover:bg-amber-950/40'
        }`}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <button
        onClick={handleToggleAmbient}
        disabled={muted}
        title={ambient ? 'Disable Radio Static Hum' : 'Enable 50Hz Cold War Radio Static Hum'}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
          ambient
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'text-stone-400 hover:text-stone-200 opacity-60'
        }`}
      >
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        <span className="hidden sm:inline text-[10px] uppercase font-mono tracking-wider">HUT HUM</span>
      </button>
    </div>
  );
}
