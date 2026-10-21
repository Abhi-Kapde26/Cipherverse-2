import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LEVELS, LEVEL_VARIANTS } from '@/lib/ciphers';
import { SERVER_LEVEL_ANSWERS } from '@/lib/server-ciphers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'janus-admin-hq-1943';

function checkAdminAuth(req: NextRequest, bodyPassword?: string): boolean {
  const authHeader = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  if (authHeader && authHeader === ADMIN_PASSWORD) return true;
  if (bodyPassword && bodyPassword === ADMIN_PASSWORD) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminPassword, action, teamId, level, burnLevel, branch, paused } = body;

    if (!checkAdminAuth(req, adminPassword)) {
      return NextResponse.json({ error: 'UNAUTHORIZED: High Command clearance code rejected.' }, { status: 401 });
    }

    if (action === 'toggle_pause') {
      const targetState = paused !== undefined ? Boolean(paused) : !db.isEventPaused();
      db.setEventPaused(targetState);
      return NextResponse.json({ success: true, isPaused: targetState });
    }

    if (action === 'reset_team') {
      if (!teamId) return NextResponse.json({ error: 'Team ID required.' }, { status: 400 });
      db.resetTeam(teamId);
      return NextResponse.json({ success: true, message: `Team ${teamId} reset to Round 1.` });
    }

    if (action === 'update_team_level') {
      if (!teamId || level === undefined) return NextResponse.json({ error: 'Team ID and level required.' }, { status: 400 });
      const lvl = Number(level);
      db.updateProgress(teamId, { current_level: lvl });
      return NextResponse.json({ success: true, message: `Team ${teamId} set to Round ${lvl}.` });
    }

    if (action === 'update_burn_level') {
      if (!teamId || burnLevel === undefined) return NextResponse.json({ error: 'Team ID and burn level required.' }, { status: 400 });
      const bLvl = Number(burnLevel);
      db.updateProgress(teamId, { burn_level: bLvl });
      return NextResponse.json({ success: true, message: `Team ${teamId} Burn level set to ${bLvl}.` });
    }

    if (action === 'force_branch') {
      if (!teamId || !branch) return NextResponse.json({ error: 'Team ID and branch required.' }, { status: 400 });
      db.updateProgress(teamId, { branch });
      return NextResponse.json({ success: true, message: `Team ${teamId} branch set to ${branch}.` });
    }

    if (action === 'get_overview') {
      const teams = db.getAllTeams();
      const submissions = db.getAllSubmissions(150);
      const isPaused = db.isEventPaused();
      return NextResponse.json({
        teams,
        submissions,
        isPaused,
        levelCount: LEVELS.length,
        variantsCount: LEVEL_VARIANTS.length,
        answers: SERVER_LEVEL_ANSWERS,
      });
    }

    return NextResponse.json({ error: 'Unknown admin action.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Server error handling admin request.' }, { status: 500 });
  }
}
