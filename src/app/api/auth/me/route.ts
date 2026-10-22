import { NextResponse } from 'next/server';
import { getAuthenticatedTeam } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const auth = await getAuthenticatedTeam();
  if (!auth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const choices = await db.getChoices(auth.team.id);
  const isPaused = await db.isEventPaused();

  return NextResponse.json({
    authenticated: true,
    team: {
      id: auth.team.id,
      team_name: auth.team.team_name,
      members: auth.team.members,
      created_at: auth.team.created_at,
    },
    progress: auth.progress,
    choices,
    isPaused,
  });
}
