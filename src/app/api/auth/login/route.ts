import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { setSessionCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, password } = body;

    if (!teamName || !password) {
      return NextResponse.json({ error: 'Team name and password required.' }, { status: 400 });
    }

    const team = db.getTeamByName(teamName.trim());
    if (!team) {
      return NextResponse.json({ error: 'Team credentials not found in Hut 99 index.' }, { status: 401 });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (team.password_hash !== passwordHash) {
      return NextResponse.json({ error: 'Invalid authentication pass-phrase.' }, { status: 401 });
    }

    const progress = db.getProgress(team.id);

    setSessionCookie({
      teamId: team.id,
      teamName: team.team_name,
      createdAt: team.created_at,
    });

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        team_name: team.team_name,
        members: team.members,
      },
      progress,
    });
  } catch (err: unknown) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error during authentication.' }, { status: 500 });
  }
}
