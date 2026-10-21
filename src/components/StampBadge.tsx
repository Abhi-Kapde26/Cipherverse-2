'use client';

import React from 'react';

interface StampBadgeProps {
  type: 'TOP_SECRET' | 'DECRYPTED' | 'ACCESS_DENIED' | 'CLASSIFIED' | 'BURNED' | 'PENDING';
  className?: string;
  rotate?: string;
}

export default function StampBadge({ type, className = '', rotate }: StampBadgeProps) {
  switch (type) {
    case 'DECRYPTED':
      return (
        <span
          className={`stamp-classified stamp-decrypted font-bold ${className}`}
          style={rotate ? { transform: `rotate(${rotate})` } : undefined}
        >
          [DECRYPTED]
        </span>
      );
    case 'ACCESS_DENIED':
      return (
        <span
          className={`stamp-classified stamp-denied font-bold ${className}`}
          style={rotate ? { transform: `rotate(${rotate})` } : undefined}
        >
          [ACCESS DENIED]
        </span>
      );
    case 'TOP_SECRET':
      return (
        <span
          className={`stamp-classified stamp-top-secret font-bold ${className}`}
          style={rotate ? { transform: `rotate(${rotate})` } : undefined}
        >
          TOP SECRET // HUT 99
        </span>
      );
    case 'BURNED':
      return (
        <span
          className={`stamp-classified border-red-500 text-red-500 bg-red-950/40 font-bold ${className}`}
          style={rotate ? { transform: `rotate(${rotate})` } : undefined}
        >
          [COVER BURNED]
        </span>
      );
    case 'CLASSIFIED':
      return (
        <span
          className={`stamp-classified border-amber-500 text-amber-500 font-bold ${className}`}
          style={rotate ? { transform: `rotate(${rotate})` } : undefined}
        >
          [CLASSIFIED]
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span
          className={`stamp-classified border-stone-600 text-stone-500 font-bold ${className}`}
          style={rotate ? { transform: `rotate(${rotate})` } : undefined}
        >
          [INFILTRATING]
        </span>
      );
  }
}
