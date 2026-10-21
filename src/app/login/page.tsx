'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Key, AlertCircle, ArrowRight } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import StampBadge from '@/components/StampBadge';

export default function LoginPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    soundEngine.playTypewriter();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        soundEngine.playAccessDenied();
        setError(data.error || 'Authentication rejected by Hut 99.');
      } else {
        soundEngine.playStampThud();
        router.push('/dashboard');
      }
    } catch {
      setError('Connection failure with Hut 99 teletype.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-mono">
      <div className="w-full max-w-md bg-bunker-900 border-2 border-stone-600 rounded-lg p-6 sm:p-8 shadow-2xl relative text-stone-200">
        <div className="flex justify-between items-start mb-6 border-b border-bunker-700 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-500 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>TERMINAL ACCESS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-1">
              AUTHENTICATE UNIT 404
            </h1>
          </div>
          <StampBadge type="TOP_SECRET" className="text-[10px]" rotate="-4deg" />
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-red-950/60 border border-red-600/80 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-stone-400 mb-1">
              Registered Team Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cambridge Phantoms"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-bunker-950 border border-bunker-700 rounded px-3 py-2 text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-stone-400 mb-1">
              Team Passcode / Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bunker-950 border border-bunker-700 rounded px-3 py-2 text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded bg-amber-600 hover:bg-amber-500 text-bunker-950 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Cryptographic Credentials...</span>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Access Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-bunker-800 text-center text-xs text-stone-500">
          New cryptanalysis unit?{' '}
          <Link href="/register" className="text-amber-400 hover:underline font-bold">
            Enlist your team
          </Link>
        </div>
      </div>
    </div>
  );
}
