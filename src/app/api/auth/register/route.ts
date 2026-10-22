import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { setSessionCookie } from '@/lib/session';

const VALID_EVENT_PASSCODE = process.env.EVENT_PASSCODE || 'JANUS-1943';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, members, eventPasscode, password } = body;

    if (!teamName || typeof teamName !== 'string' || teamName.trim().length < 2) {
      return NextResponse.json({ error: 'Team name must be at least 2 characters.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json({ error: 'Passcode must be at least 4 characters.' }, { status: 400 });
    }

    if (!Array.isArray(members) || members.length < 3 || members.length > 5) {
      return NextResponse.json({ error: 'Unit 404 requires 3 to 5 cryptanalysts per team.' }, { status: 400 });
    }

    const cleanMembers = members.map((m: unknown) => String(m).trim()).filter(Boolean);
    if (cleanMembers.length < 3) {
      return NextResponse.json({ error: 'Please specify at least 3 valid member names.' }, { status: 400 });
    }

    if (eventPasscode?.trim().toUpperCase() !== VALID_EVENT_PASSCODE.toUpperCase()) {
      return NextResponse.json({ error: 'Invalid Event Passcode. Obtain authorization from HQ.' }, { status: 403 });
    }

    const cleanTeamName = teamName.trim();
    const existing = await db.getTeamByName(cleanTeamName);
    if (existing) {
      return NextResponse.json({ error: 'Team name already registered with Hut 99.' }, { status: 409 });
    }

    const teamId = 'u404-' + crypto.randomUUID().slice(0, 8);
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const newTeam = await db.createTeam(teamId, cleanTeamName, cleanMembers, passwordHash);
    const progress = await db.getProgress(teamId);

    setSessionCookie({
      teamId: newTeam.id,
      teamName: newTeam.team_name,
      createdAt: newTeam.created_at,
    });

    return NextResponse.json({
      success: true,
      team: {
        id: newTeam.id,
        team_name: newTeam.team_name,
        members: newTeam.members,
      },
      progress,
    });
  } catch (err: unknown) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Server error registering team.' }, { status: 500 });
  }
}
