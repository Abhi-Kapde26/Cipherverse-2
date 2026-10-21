import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedTeam } from '@/lib/session';
import { db } from '@/lib/db';
import { LEVELS } from '@/lib/ciphers';
import {
  SERVER_LEVEL_ANSWERS,
  SERVER_VARIANT_ANSWERS,
  normalizeAnswer,
  hashAnswer,
} from '@/lib/server-ciphers';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedTeam();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Session required.' }, { status: 401 });
    }

    if (db.isEventPaused()) {
      return NextResponse.json(
        { error: 'OPERATION FROZEN: High Command has temporarily halted cryptographic operations.' },
        { status: 423 }
      );
    }

    const { team, progress } = auth;
    const body = await req.json();
    const { level, answer } = body;

    const levelNum = Number(level);
    if (!levelNum || levelNum < 1 || levelNum > 15) {
      return NextResponse.json({ error: 'Invalid level number.' }, { status: 400 });
    }

    // Sequential Locking: Teams can only submit for their active level
    if (levelNum !== progress.current_level) {
      return NextResponse.json(
        { error: `Level ${levelNum} is locked or already cleared. Current active level is ${progress.current_level}.` },
        { status: 403 }
      );
    }

    // Rate Limiting: 1 attempt per 3 seconds per team
    const lastSubTime = db.getLastSubmissionTime(team.id);
    const now = Date.now();
    if (lastSubTime && now - lastSubTime < 3000) {
      const waitRemaining = Math.ceil((3000 - (now - lastSubTime)) / 1000);
      return NextResponse.json(
        { error: `Teletype buffer cooling down. Wait ${waitRemaining}s before next transmission.` },
        { status: 429 }
      );
    }

    if (!answer || typeof answer !== 'string' || answer.trim() === '') {
      return NextResponse.json({ error: 'Decrypted answer submission cannot be empty.' }, { status: 400 });
    }

    // Level 15 Master Key Requirement: Must hold all 4 key fragments [7, 3, 9, 5]
    if (levelNum === 15) {
      const frags = progress.key_fragments;
      const required = [7, 3, 9, 5];
      const hasAll = required.every((reqF) => frags.includes(reqF));
      if (!hasAll) {
        return NextResponse.json(
          {
            error: 'INCOMPLETE MASTER KEY: Unit 404 does not hold all four master key fragments (7, 3, 9, 5). Revisit prior dilemma vaults.',
          },
          { status: 403 }
        );
      }
    }

    const normalizedInput = normalizeAnswer(answer);
    const inputHash = hashAnswer(answer);

    // Find expected answers/hashes
    let isCorrect = false;
    const levelAnswer = SERVER_LEVEL_ANSWERS.find((l) => l.number === levelNum);
    const levelDef = LEVELS.find((l) => l.number === levelNum);
    if (!levelAnswer || !levelDef) {
      return NextResponse.json({ error: 'Level definition not found.' }, { status: 404 });
    }

    // Check branch variants for R6 and R7 if branch chosen
    if ((levelNum === 6 || levelNum === 7) && progress.branch && progress.branch !== 'UNALIGNED') {
      const variant = SERVER_VARIANT_ANSWERS.find(
        (v) => v.levelNumber === levelNum && v.branch === progress.branch
      );
      if (variant) {
        if (inputHash === variant.answerHash || (variant.acceptedVariants && variant.acceptedVariants.includes(normalizedInput))) {
          isCorrect = true;
        }
      }
    }

    // Check base level answer and accepted variants
    if (!isCorrect) {
      if (inputHash === levelAnswer.answerHash) {
        isCorrect = true;
      } else if (levelAnswer.acceptedVariants && levelAnswer.acceptedVariants.includes(normalizedInput)) {
        isCorrect = true;
      }
    }

    // Record submission attempt
    db.recordSubmission(team.id, levelNum, answer.slice(0, 100), isCorrect);

    if (!isCorrect) {
      const newWrongCount = progress.wrong_attempts_current + 1;
      let newBurnLevel = progress.burn_level;

      // 3 wrong attempts on a round = +1 Burn level
      if (newWrongCount % 3 === 0) {
        newBurnLevel += 1;
      }

      db.updateProgress(team.id, {
        wrong_attempts_current: newWrongCount,
        burn_level: newBurnLevel,
      });

      return NextResponse.json({
        success: false,
        message: 'ACCESS DENIED: Ciphertext Decryption Failed.',
        wrongAttempts: newWrongCount,
        burnLevel: newBurnLevel,
        burnIncreased: newBurnLevel > progress.burn_level,
      });
    }

    // Correct Answer Logic
    const nextLevel = levelNum + 1;
    let newFragment: number | null = null;
    const updatedFragments = [...progress.key_fragments];

    if (levelDef.keyFragment && !updatedFragments.includes(levelDef.keyFragment)) {
      newFragment = levelDef.keyFragment;
      updatedFragments.push(newFragment);
    }

    const isComplete = levelNum === 15;
    const finishedAt = isComplete ? now : null;

    db.updateProgress(team.id, {
      current_level: nextLevel,
      wrong_attempts_current: 0,
      key_fragments: updatedFragments,
      finished_at: finishedAt || progress.finished_at,
    });

    return NextResponse.json({
      success: true,
      message: isComplete ? 'OPERATION COMPLETE: Final cipher decrypted.' : 'DECRYPTED: Clearance Granted.',
      clearedLevel: levelNum,
      nextLevel: isComplete ? 15 : nextLevel,
      isComplete,
      keyFragments: updatedFragments,
      newFragment,
    });
  } catch (err: unknown) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Server error processing decryption submission.' }, { status: 500 });
  }
}
