import crypto from 'node:crypto';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EVENT_PASSCODE = 'NIRVANA_CIPHERVERSE_2026';
const TOTAL_BOTS = 40;
const SUBMIT_COOLDOWN_MS = 3100; // 3000ms rate limit per team + 100ms safety buffer

// Level answers and choices
const LEVEL_ANSWERS = {
  1: { base: 'WITHHOLD PANZER ROUTES FROM STALIN' },
  2: { base: 'ENORMOZ' },
  3: { base: 'UNTHINKABLE JULY FIRST' },
  4: { base: 'ALPINE REDOUBT' },
  5: {
    dilemma: (botIndex) => (botIndex % 2 === 0 ? 'A' : 'B'),
    base: 'ATOMIC SHADOW',
  },
  6: {
    branchA: 'AIRLIFT1',
    branchB: 'BLOCKADE',
  },
  7: {
    branchA: 'STANLEY',
    branchB: 'CAMBRIDGE',
  },
  8: {
    dilemma: (botIndex) => (botIndex % 2 === 0 ? 'A' : 'B'),
    base: 'BLAKE MOLE',
  },
  9: { base: 'JANUS' },
  10: {
    dilemma: (botIndex, branch) => (branch === 'B' ? 'B1' : 'A1'),
    base: 'DANUBE',
  },
  11: { base: 'POWERS' },
  12: { base: 'OMEGA' },
  13: { base: '01101000' },
  14: {
    dilemma: (botIndex) => (botIndex % 3 === 0 ? 'X' : botIndex % 3 === 1 ? 'Y' : 'Z'),
    base: 'ABORT',
  },
  15: { base: 'GHOST FREEDOM' },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateStats(numbers) {
  if (!numbers.length) return { min: 0, max: 0, avg: 0, p95: 0 };
  const sorted = [...numbers].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = Math.round(sorted.reduce((sum, n) => sum + n, 0) / sorted.length);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || max;
  return { min, max, avg, p95 };
}

async function runScaleTest() {
  console.log('='.repeat(70));
  console.log(`🚀 OPERATION JANUS: SCALE TEST RUNNER - ${TOTAL_BOTS} BOTS`);
  console.log(`   Target Server: ${BASE_URL}`);
  console.log(`   Passcode:      ${EVENT_PASSCODE}`);
  console.log(`   Timestamp:     ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  const runId = Math.random().toString(36).substring(2, 7);
  const metrics = {
    registrationTimes: [],
    loginTimes: [],
    dilemmaTimes: [],
    submitTimes: [],
    leaderboardTimes: [],
    errors: [],
  };

  const botStates = Array.from({ length: TOTAL_BOTS }, (_, i) => ({
    botIndex: i + 1,
    teamName: `Squad_${runId}_${String(i + 1).padStart(2, '0')}`,
    password: `BotPass_${runId}_${i + 1}`,
    members: [`Agent_${i + 1}_A`, `Agent_${i + 1}_B`, `Agent_${i + 1}_C`],
    cookie: null,
    teamId: null,
    branch: 'UNALIGNED',
    currentLevel: 1,
    completedLevels: 0,
    isFinished: false,
  }));

  // -------------------------------------------------------------
  // PHASE 1: MASS CONCURRENT TEAM REGISTRATION
  // -------------------------------------------------------------
  console.log(`\n[PHASE 1] Registering ${TOTAL_BOTS} teams concurrently...`);
  const regStartTime = Date.now();

  await Promise.all(
    botStates.map(async (bot) => {
      const start = Date.now();
      try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName: bot.teamName,
            password: bot.password,
            members: bot.members,
            eventPasscode: EVENT_PASSCODE,
          }),
        });
        const elapsed = Date.now() - start;
        metrics.registrationTimes.push(elapsed);

        if (!res.ok) {
          const errText = await res.text();
          metrics.errors.push(`Bot ${bot.botIndex} register failed [${res.status}]: ${errText}`);
          return;
        }

        const data = await res.json();
        bot.teamId = data.team.id;
        bot.cookie = res.headers.get('set-cookie');
      } catch (err) {
        metrics.errors.push(`Bot ${bot.botIndex} register network error: ${err.message}`);
      }
    })
  );

  const regTotalElapsed = Date.now() - regStartTime;
  const regStats = calculateStats(metrics.registrationTimes);
  const regSuccessCount = botStates.filter((b) => b.teamId).length;
  console.log(`✅ Registration Complete: ${regSuccessCount}/${TOTAL_BOTS} succeeded in ${regTotalElapsed}ms`);
  console.log(`   Latency: min=${regStats.min}ms, avg=${regStats.avg}ms, p95=${regStats.p95}ms, max=${regStats.max}ms`);

  if (regSuccessCount < TOTAL_BOTS) {
    console.error(`⚠️ Some bots failed registration:`, metrics.errors);
  }

  // -------------------------------------------------------------
  // PHASE 2: MASS CONCURRENT AUTHENTICATION / LOGIN
  // -------------------------------------------------------------
  console.log(`\n[PHASE 2] Authenticating (logging in) all ${TOTAL_BOTS} teams concurrently...`);
  const loginStartTime = Date.now();

  await Promise.all(
    botStates.map(async (bot) => {
      if (!bot.teamId) return;
      const start = Date.now();
      try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName: bot.teamName,
            password: bot.password,
          }),
        });
        const elapsed = Date.now() - start;
        metrics.loginTimes.push(elapsed);

        if (!res.ok) {
          const errText = await res.text();
          metrics.errors.push(`Bot ${bot.botIndex} login failed [${res.status}]: ${errText}`);
          return;
        }

        bot.cookie = res.headers.get('set-cookie');
      } catch (err) {
        metrics.errors.push(`Bot ${bot.botIndex} login network error: ${err.message}`);
      }
    })
  );

  const loginTotalElapsed = Date.now() - loginStartTime;
  const loginStats = calculateStats(metrics.loginTimes);
  console.log(`✅ Authentication Complete in ${loginTotalElapsed}ms`);
  console.log(`   Latency: min=${loginStats.min}ms, avg=${loginStats.avg}ms, p95=${loginStats.p95}ms, max=${loginStats.max}ms`);

  // -------------------------------------------------------------
  // PHASE 3: CONCURRENT GAMEPLAY (ROUNDS 1 THROUGH 15)
  // -------------------------------------------------------------
  console.log(`\n[PHASE 3] Simulating concurrent gameplay for ${TOTAL_BOTS} teams across all 15 rounds...`);
  console.log(`   (Rate limiter allows 1 submission per 3.0s per team. Staggered concurrency enabled)`);

  // Periodic background leaderboard poller to test concurrent reads during heavy write load
  let pollerActive = true;
  const leaderboardPoller = (async () => {
    while (pollerActive) {
      const start = Date.now();
      try {
        const res = await fetch(`${BASE_URL}/api/leaderboard`);
        const elapsed = Date.now() - start;
        metrics.leaderboardTimes.push(elapsed);
      } catch (err) {
        metrics.errors.push(`Leaderboard poll error: ${err.message}`);
      }
      await sleep(1000);
    }
  })();

  const playStartTime = Date.now();

  // Run each bot player loop
  async function runBotPlayLoop(bot) {
    if (!bot.teamId || !bot.cookie) return;

    // Jitter bot start slightly (0-400ms) to simulate real human spread
    await sleep(Math.floor(Math.random() * 400));

    for (let level = 1; level <= 15; level++) {
      const levelDef = LEVEL_ANSWERS[level];

      // Handle Dilemma if round has one
      if (levelDef.dilemma) {
        const option = levelDef.dilemma(bot.botIndex, bot.branch);
        const dilemmaStart = Date.now();
        try {
          const dRes = await fetch(`${BASE_URL}/api/round/dilemma`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: bot.cookie,
            },
            body: JSON.stringify({
              action: 'choose',
              level: level,
              option: option,
            }),
          });
          const dElapsed = Date.now() - dilemmaStart;
          metrics.dilemmaTimes.push(dElapsed);

          if (dRes.ok) {
            const dData = await dRes.json();
            if (level === 5) {
              bot.branch = option === 'B' ? 'B' : 'A';
            }
          } else {
            const errTxt = await dRes.text();
            metrics.errors.push(`Bot ${bot.botIndex} R${level} dilemma error [${dRes.status}]: ${errTxt}`);
          }
        } catch (err) {
          metrics.errors.push(`Bot ${bot.botIndex} R${level} dilemma network error: ${err.message}`);
        }
      }

      // Determine correct answer
      let answerToSubmit = levelDef.base;
      if (level === 6 || level === 7) {
        answerToSubmit = bot.branch === 'B' ? levelDef.branchB : levelDef.branchA;
      }

      // Submit answer
      const submitStart = Date.now();
      try {
        const subRes = await fetch(`${BASE_URL}/api/round/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: bot.cookie,
          },
          body: JSON.stringify({
            level: level,
            answer: answerToSubmit,
          }),
        });
        const subElapsed = Date.now() - submitStart;
        metrics.submitTimes.push(subElapsed);

        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success) {
            bot.completedLevels = level;
            bot.currentLevel = subData.nextLevel;
            if (subData.isComplete) {
              bot.isFinished = true;
            }
          } else {
            metrics.errors.push(`Bot ${bot.botIndex} R${level} rejected: ${subData.message}`);
          }
        } else {
          const errTxt = await subRes.text();
          metrics.errors.push(`Bot ${bot.botIndex} R${level} submit error [${subRes.status}]: ${errTxt}`);
        }
      } catch (err) {
        metrics.errors.push(`Bot ${bot.botIndex} R${level} submit network error: ${err.message}`);
      }

      // If not the final level, wait for rate limiter cooldown before next level submission
      if (level < 15) {
        await sleep(SUBMIT_COOLDOWN_MS);
      }
    }
  }

  // Execute all 40 bots in parallel
  console.log(`   Running 40 bots concurrently... Progress will report every 10 seconds.`);
  const progressInterval = setInterval(() => {
    const finishedCount = botStates.filter((b) => b.isFinished).length;
    const avgLevel = (
      botStates.reduce((acc, b) => acc + b.completedLevels, 0) / TOTAL_BOTS
    ).toFixed(1);
    console.log(`   ⏱️ Elapsed: ${Math.round((Date.now() - playStartTime) / 1000)}s | Avg Level: ${avgLevel}/15 | Finished: ${finishedCount}/${TOTAL_BOTS}`);
  }, 10000);

  await Promise.all(botStates.map((bot) => runBotPlayLoop(bot)));
  clearInterval(progressInterval);
  pollerActive = false;
  await leaderboardPoller;

  const playTotalElapsed = Date.now() - playStartTime;
  console.log(`\n🏁 All bots finished playing in ${Math.round(playTotalElapsed / 1000)}s`);

  // -------------------------------------------------------------
  // PHASE 4: LEADERBOARD INTEGRITY & VALIDATION
  // -------------------------------------------------------------
  console.log(`\n[PHASE 4] Verifying Final Leaderboard...`);
  const finalLbRes = await fetch(`${BASE_URL}/api/leaderboard`);
  const finalLbData = await finalLbRes.json();
  const lbEntries = finalLbData.leaderboard || [];

  const registeredBotNames = new Set(botStates.map((b) => b.teamName));
  const botsOnLeaderboard = lbEntries.filter((entry) => registeredBotNames.has(entry.team_name));

  const fullyFinishedBots = botsOnLeaderboard.filter((b) => b.cleared_levels === 15);

  // -------------------------------------------------------------
  // REPORT GENERATION
  // -------------------------------------------------------------
  const submitStats = calculateStats(metrics.submitTimes);
  const dilemmaStats = calculateStats(metrics.dilemmaTimes);
  const lbStats = calculateStats(metrics.leaderboardTimes);

  console.log('\n' + '='.repeat(70));
  console.log('📊 SCALING & PERFORMANCE BENCHMARK REPORT');
  console.log('='.repeat(70));
  console.log(`Total Bots Spawned:           ${TOTAL_BOTS}`);
  console.log(`Successful Registrations:     ${regSuccessCount} / ${TOTAL_BOTS}`);
  console.log(`Teams on Leaderboard:         ${botsOnLeaderboard.length} / ${TOTAL_BOTS}`);
  console.log(`Teams Completed all 15 Rounds: ${fullyFinishedBots.length} / ${TOTAL_BOTS}`);
  console.log(`Total Level Submissions Made: ${metrics.submitTimes.length}`);
  console.log(`Total Dilemma Choices Made:   ${metrics.dilemmaTimes.length}`);
  console.log(`Total Concurrent Errors:      ${metrics.errors.length}`);

  console.log('\n⏱️ LATENCY BREAKDOWN (ms):');
  console.log(`Endpoint                Min       Avg       p95       Max`);
  console.log(`POST /api/auth/register  ${String(regStats.min).padEnd(9)} ${String(regStats.avg).padEnd(9)} ${String(regStats.p95).padEnd(9)} ${regStats.max}`);
  console.log(`POST /api/auth/login     ${String(loginStats.min).padEnd(9)} ${String(loginStats.avg).padEnd(9)} ${String(loginStats.p95).padEnd(9)} ${loginStats.max}`);
  console.log(`POST /api/round/dilemma  ${String(dilemmaStats.min).padEnd(9)} ${String(dilemmaStats.avg).padEnd(9)} ${String(dilemmaStats.p95).padEnd(9)} ${dilemmaStats.max}`);
  console.log(`POST /api/round/submit   ${String(submitStats.min).padEnd(9)} ${String(submitStats.avg).padEnd(9)} ${String(submitStats.p95).padEnd(9)} ${submitStats.max}`);
  console.log(`GET  /api/leaderboard    ${String(lbStats.min).padEnd(9)} ${String(lbStats.avg).padEnd(9)} ${String(lbStats.p95).padEnd(9)} ${lbStats.max}`);

  if (metrics.errors.length > 0) {
    console.log('\n⚠️ ERRORS ENCOUNTERED:');
    metrics.errors.slice(0, 10).forEach((err) => console.log(' - ' + err));
    if (metrics.errors.length > 10) {
      console.log(` ... and ${metrics.errors.length - 10} more.`);
    }
  } else {
    console.log('\n🎉 ZERO ERRORS! 100% SUCCESS UNDER 40-BOT CONCURRENCY.');
  }

  console.log('='.repeat(70));
}

runScaleTest().catch((err) => {
  console.error('Scale test runner failed:', err);
  process.exit(1);
});
