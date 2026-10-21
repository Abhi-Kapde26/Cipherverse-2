'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Siren, Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '@/lib/audio';

interface DilemmaOption {
  id: string;
  title: string;
  description: string;
  faction?: 'CIA' | 'KGB' | 'NEUTRAL';
  riskText: string;
}

interface DilemmaOverlayProps {
  levelNumber: number;
  options: DilemmaOption[];
  onDecisionMade: (option: string, autoPenalized: boolean) => void;
  isOpen: boolean;
}

export default function DilemmaOverlay({
  levelNumber,
  options,
  onDecisionMade,
  isOpen,
}: DilemmaOverlayProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const startSession = useCallback(async () => {
    try {
      soundEngine.playSirenStrobe();
      const res = await fetch('/api/round/dilemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', level: levelNumber }),
      });
      const data = await res.json();
      if (data.success && data.remaining_seconds !== undefined) {
        setSecondsRemaining(data.remaining_seconds);
      }
    } catch (e) {
      console.error('Failed to sync dilemma timer:', e);
    }
  }, [levelNumber]);

  useEffect(() => {
    if (isOpen) {
      startSession();
    }
  }, [isOpen, startSession]);

  // Countdown clock effect
  useEffect(() => {
    if (!isOpen || isExpired) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          handleAutoPenalty();
          return 0;
        }
        if (prev === 60 || prev === 30 || prev === 10) {
          soundEngine.playSirenStrobe();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isExpired]);

  const handleAutoPenalty = async () => {
    setSubmitting(true);
    soundEngine.playAccessDenied();
    try {
      const res = await fetch('/api/round/dilemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'choose',
          level: levelNumber,
          option: options[options.length - 1].id, // riskier fallback
        }),
      });
      const data = await res.json();
      onDecisionMade(data.option, true);
    } catch {
      onDecisionMade(options[options.length - 1].id, true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOption = async (optionId: string) => {
    if (submitting || isExpired) return;
    setSelectedOption(optionId);
    setSubmitting(true);
    soundEngine.playStampThud();

    try {
      const res = await fetch('/api/round/dilemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'choose',
          level: levelNumber,
          option: optionId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onDecisionMade(data.option, data.autoPenalized);
      }
    } catch (e) {
      console.error('Error submitting choice:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      {/* Red Siren Strobe Border */}
      <div className="absolute inset-0 border-4 sm:border-8 border-red-600 animate-red-siren pointer-events-none" />

      <div className="relative w-full max-w-4xl bg-bunker-950 border-2 border-red-600 rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col p-6 sm:p-8 text-stone-100 font-mono max-h-[90vh] overflow-y-auto">
        {/* Urgent Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-red-800/80 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-red-600/20 border border-red-500 animate-pulse">
              <Siren className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-red-400 font-bold">
                CRITICAL DILEMMA // ROUND {levelNumber}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
                HIGH COMMAND FLASH ULTIMATUM
              </h2>
            </div>
          </div>

          {/* 180s Countdown Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-950/80 border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]">
            <Clock className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-2xl sm:text-3xl font-black tracking-widest text-red-400">
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* Warning text */}
        <div className="my-4 p-3 rounded bg-red-950/30 border border-red-900/60 flex items-center gap-2 text-xs text-red-300">
          <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>
            {secondsRemaining > 0
              ? 'Screen locked. Choose an operational doctrine before expiration. If the timer hits zero, High Command applies the dangerous penalty option and increases Burn Level (+1).'
              : 'CRITICAL FAILURE: Timer expired. Standby while High Command applies emergency contingency.'}
          </span>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={submitting || isExpired}
                className={`text-left p-5 rounded-lg border-2 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                    : 'border-bunker-700 bg-bunker-900/80 hover:border-red-500 hover:bg-bunker-850'
                } ${submitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-bunker-950 border border-bunker-700 text-stone-300">
                      OPTION {opt.id}
                    </span>
                    {opt.faction && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          opt.faction === 'CIA'
                            ? 'bg-blue-950/60 border-blue-600 text-blue-400'
                            : opt.faction === 'KGB'
                            ? 'bg-red-950/60 border-red-600 text-red-400'
                            : 'bg-stone-800 border-stone-600 text-stone-300'
                        }`}
                      >
                        {opt.faction} AFFILIATED
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-stone-100 mb-2">
                    {opt.title}
                  </h3>

                  <p className="text-xs text-stone-300 leading-relaxed mb-4">
                    {opt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-bunker-800 text-[11px] text-amber-400 font-mono flex items-center justify-between">
                  <span>Consequence: {opt.riskText}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-red-900/60 text-center text-xs text-stone-400">
          {submitting ? 'ENCRYPTING AND TRANSMITTING TELEMETRY...' : 'SELECT OPTION TO COMMIT ORDER'}
        </div>
      </div>
    </div>
  );
}
