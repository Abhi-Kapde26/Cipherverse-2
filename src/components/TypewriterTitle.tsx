'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTitleProps {
  targetText: string;
  subText?: string;
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#@*&!?/<>+=';

export default function TypewriterTitle({
  targetText,
  subText,
  className = '',
}: TypewriterTitleProps) {
  const [displayText, setDisplayText] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() => {
        return targetText
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === ':' || char === '-') return char;
            if (index < iteration) {
              return targetText[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
      });

      if (iteration >= targetText.length) {
        setCompleted(true);
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 35);

    return () => clearInterval(interval);
  }, [targetText]);

  return (
    <div className={`text-center font-mono select-none ${className}`}>
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-stone-100 drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]">
        <span className="text-amber-500 font-mono">{displayText}</span>
        {!completed && <span className="inline-block w-3 h-8 ml-1 bg-amber-500 animate-pulse" />}
      </h1>
      {subText && (
        <p className="mt-3 text-sm sm:text-base md:text-lg text-stone-400 font-mono tracking-widest uppercase">
          {subText}
        </p>
      )}
    </div>
  );
}
