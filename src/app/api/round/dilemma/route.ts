import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedTeam } from '@/lib/session';
import { db } from '@/lib/db';
import { LEVELS } from '@/lib/ciphers';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedTeam();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (db.isEventPaused()) {
      return NextResponse.json({ error: 'Event paused.' }, { status: 423 });
    }

    const { team, progress } = auth;
    const body = await req.json();
    const { action, level, option } = body;

    const levelNum = Number(level);
    const levelDef = LEVELS.find((l) => l.number === levelNum);
    if (!levelDef || !levelDef.isDilemma) {
      return NextResponse.json({ error: 'Not a dilemma level.' }, { status: 400 });
    }

    // Only allow for current active level or current dilemma
    if (levelNum !== progress.current_level) {
      return NextResponse.json({ error: 'Level mismatch.' }, { status: 403 });
    }

    // ACTION: 'start' -> Initialize or return existing countdown session
    if (action === 'start') {
      let session = db.getDilemmaSession(team.id, levelNum);
      const timerSecs = levelDef.timerSeconds || 180;
      if (!session) {
        session = db.startDilemmaSession(team.id, levelNum, timerSecs);
      }
      return NextResponse.json({
        success: true,
        started_at: session.started_at,
        expires_at: session.expires_at,
        server_now: Date.now(),
        remaining_seconds: Math.max(0, Math.floor((session.expires_at - Date.now()) / 1000)),
      });
    }

    // ACTION: 'choose' -> Register player option
    if (action === 'choose') {
      const session = db.getDilemmaSession(team.id, levelNum);
      const now = Date.now();
      let autoPenalized = false;
      let finalOption = option;

      // Check if session expired (with 3-second grace period for network latency)
      if (session && now > session.expires_at + 3000) {
        autoPenalized = true;
        // Auto-pick the riskier option on timeout:
        if (levelNum === 5) finalOption = 'B';
        else if (levelNum === 8) finalOption = 'B';
        else if (levelNum === 10) finalOption = progress.branch === 'B' ? 'B2' : 'A2';
        else if (levelNum === 14) finalOption = 'Z';
      }

      if (!finalOption) {
        return NextResponse.json({ error: 'Option required.' }, { status: 400 });
      }

      // Record choice in DB
      db.recordChoice(team.id, levelNum, finalOption, autoPenalized);

      let burnDelta = autoPenalized ? 1 : 0;
      const updates: {
        branch?: string;
        sub_branch?: string;
        ending?: string;
        burn_level?: number;
      } = {};

      if (levelNum === 5) {
        updates.branch = finalOption === 'B' ? 'B' : 'A';
      } else if (levelNum === 8) {
        if (finalOption === 'B') {
          burnDelta += 1; // High risk spoof wire
        }
      } else if (levelNum === 10) {
        updates.sub_branch = finalOption;
        burnDelta += 1;
      } else if (levelNum === 14) {
        updates.ending = finalOption;
      }

      if (burnDelta > 0) {
        updates.burn_level = progress.burn_level + burnDelta;
      }

      db.updateProgress(team.id, updates);

      const refreshedProgress = db.getProgress(team.id);

      return NextResponse.json({
        success: true,
        option: finalOption,
        autoPenalized,
        burnLevel: refreshedProgress?.burn_level ?? progress.burn_level,
        branch: refreshedProgress?.branch,
        sub_branch: refreshedProgress?.sub_branch,
        ending: refreshedProgress?.ending,
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Dilemma error:', err);
    return NextResponse.json({ error: 'Server error processing dilemma.' }, { status: 500 });
  }
}
