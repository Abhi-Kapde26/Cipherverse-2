'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, Key, AlertCircle, ArrowRight, UserPlus, Trash2 } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import StampBadge from '@/components/StampBadge';

export default function RegisterPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [eventPasscode, setEventPasscode] = useState('JANUS-1943');
  const [members, setMembers] = useState(['', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMemberChange = (index: number, val: string) => {
    const updated = [...members];
    updated[index] = val;
    setMembers(updated);
  };

  const addMemberField = () => {
    if (members.length < 5) {
      setMembers([...members, '']);
    }
  };

  const removeMemberField = (index: number) => {
    if (members.length > 3) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    soundEngine.playTypewriter();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          password,
          eventPasscode,
          members: members.filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        soundEngine.playAccessDenied();
        setError(data.error || 'Failed to enlist team.');
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
      <div className="w-full max-w-lg bg-bunker-900 border-2 border-stone-600 rounded-lg p-6 sm:p-8 shadow-2xl relative text-stone-200">
        <div className="flex justify-between items-start mb-6 border-b border-bunker-700 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-500 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>ENROLLMENT DOSSIER</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-1">
              ENLIST UNIT 404 TEAM
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
              Cryptanalysis Unit / Team Name
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
              placeholder="Min 4 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bunker-950 border border-bunker-700 rounded px-3 py-2 text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-stone-400 mb-1">
              Event Passcode (from Tech Fest HQ)
            </label>
            <input
              type="text"
              required
              placeholder="Default: JANUS-1943"
              value={eventPasscode}
              onChange={(e) => setEventPasscode(e.target.value)}
              className="w-full bg-bunker-950 border border-bunker-700 rounded px-3 py-2 text-stone-100 placeholder-stone-600 text-sm font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs uppercase font-bold text-stone-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Station Cryptanalysts (3 to 5 Members)</span>
              </label>
              {members.length < 5 && (
                <button
                  type="button"
                  onClick={addMemberField}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                >
                  <UserPlus className="w-3 h-3" /> Add Analyst
                </button>
              )}
            </div>

            <div className="space-y-2">
              {members.map((member, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Analyst #${i + 1} Full Name`}
                    value={member}
                    onChange={(e) => handleMemberChange(i, e.target.value)}
                    className="flex-1 bg-bunker-950 border border-bunker-700 rounded px-3 py-1.5 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                  />
                  {members.length > 3 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(i)}
                      className="p-1.5 rounded text-stone-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded bg-amber-600 hover:bg-amber-500 text-bunker-950 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Encrypting Credentials...</span>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Submit Clearance Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-bunker-800 text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link href="/login" className="text-amber-400 hover:underline font-bold">
            Log in to your station
          </Link>
        </div>
      </div>
    </div>
  );
}
