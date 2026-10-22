import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { LEVELS, LEVEL_VARIANTS } from '../src/lib/ciphers';
import { SERVER_LEVEL_ANSWERS, SERVER_VARIANT_ANSWERS } from '../src/lib/server-ciphers';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf-8');
    const lines = raw.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

function normalizeSupabaseUrl(url?: string | null): string {
  if (!url) return '';
  let cleaned = url.trim();

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  while (cleaned.endsWith('/') || cleaned.endsWith('/rest/v1')) {
    if (cleaned.endsWith('/rest/v1')) {
      cleaned = cleaned.slice(0, -'/rest/v1'.length).trim();
    } else if (cleaned.endsWith('/')) {
      cleaned = cleaned.slice(0, -1).trim();
    }
  }

  return cleaned;
}

async function runSeed() {
  console.log('[SEED] Reading environment configuration...');
  loadEnvLocal();

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!rawUrl || !serviceKey) {
    console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local.');
    process.exit(1);
  }

  if (
    (serviceKey.startsWith('"') && serviceKey.endsWith('"')) ||
    (serviceKey.startsWith("'") && serviceKey.endsWith("'"))
  ) {
    serviceKey = serviceKey.slice(1, -1).trim();
  }

  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  if (!supabaseUrl) {
    console.error('ERROR: Invalid NEXT_PUBLIC_SUPABASE_URL after normalization.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('[SEED] Preparing 17 rounds from cipher repository files...');

  const roundsToSeed: any[] = [];

  // Levels 1 through 5 (Base)
  for (let i = 1; i <= 5; i++) {
    const lvl = LEVELS.find((l) => l.number === i);
    const ans = SERVER_LEVEL_ANSWERS.find((a) => a.number === i);
    if (!lvl || !ans) {
      console.error(`ERROR: Missing cipher definition or answer for level ${i}`);
      process.exit(1);
    }
    roundsToSeed.push({
      id: `round-${i}`,
      round_number: i,
      branch: 'MAIN',
      act: lvl.act,
      year: lvl.year,
      title: lvl.title,
      agency: lvl.agency,
      cipher_type: lvl.cipherType,
      story_text: lvl.storyText,
      ciphertext: lvl.ciphertext,
      clue: lvl.clue,
      hint: lvl.hint || null,
      pamphlet_key: lvl.pamphletKey || null,
      is_dilemma: Boolean(lvl.isDilemma),
      timer_seconds: lvl.timerSeconds ?? null,
      key_fragment: lvl.keyFragment ?? null,
      options: lvl.options ?? [],
      answer_hash: ans.answerHash,
      accepted_variants: ans.acceptedVariants ?? [],
    });
  }

  // Level 6: Variant A and Variant B
  const base6 = LEVELS.find((l) => l.number === 6);
  const var6A = LEVEL_VARIANTS.find((v) => v.levelNumber === 6 && v.branch === 'A');
  const var6B = LEVEL_VARIANTS.find((v) => v.levelNumber === 6 && v.branch === 'B');
  const ans6A = SERVER_VARIANT_ANSWERS.find((v) => v.levelNumber === 6 && v.branch === 'A');
  const ans6B = SERVER_VARIANT_ANSWERS.find((v) => v.levelNumber === 6 && v.branch === 'B');

  if (!base6 || !var6A || !var6B || !ans6A || !ans6B) {
    console.error('ERROR: Missing Level 6 variant definitions or answer hashes');
    process.exit(1);
  }

  roundsToSeed.push({
    id: 'round-6-A',
    round_number: 6,
    branch: 'A',
    act: base6.act,
    year: base6.year,
    title: `${base6.title} (Branch A - CIA Route)`,
    agency: base6.agency,
    cipher_type: base6.cipherType,
    story_text: var6A.storyText,
    ciphertext: var6A.ciphertext,
    clue: var6A.clue,
    hint: base6.hint || null,
    pamphlet_key: base6.pamphletKey || null,
    is_dilemma: Boolean(base6.isDilemma),
    timer_seconds: base6.timerSeconds ?? null,
    key_fragment: base6.keyFragment ?? null,
    options: base6.options ?? [],
    answer_hash: ans6A.answerHash,
    accepted_variants: ans6A.acceptedVariants ?? [],
  });

  roundsToSeed.push({
    id: 'round-6-B',
    round_number: 6,
    branch: 'B',
    act: base6.act,
    year: base6.year,
    title: `${base6.title} (Branch B - Soviet Sector Route)`,
    agency: base6.agency,
    cipher_type: base6.cipherType,
    story_text: var6B.storyText,
    ciphertext: var6B.ciphertext,
    clue: var6B.clue,
    hint: base6.hint || null,
    pamphlet_key: base6.pamphletKey || null,
    is_dilemma: Boolean(base6.isDilemma),
    timer_seconds: base6.timerSeconds ?? null,
    key_fragment: base6.keyFragment ?? null,
    options: base6.options ?? [],
    answer_hash: ans6B.answerHash,
    accepted_variants: ans6B.acceptedVariants ?? [],
  });

  // Level 7: Variant A and Variant B
  const base7 = LEVELS.find((l) => l.number === 7);
  const var7A = LEVEL_VARIANTS.find((v) => v.levelNumber === 7 && v.branch === 'A');
  const var7B = LEVEL_VARIANTS.find((v) => v.levelNumber === 7 && v.branch === 'B');
  const ans7A = SERVER_VARIANT_ANSWERS.find((v) => v.levelNumber === 7 && v.branch === 'A');
  const ans7B = SERVER_VARIANT_ANSWERS.find((v) => v.levelNumber === 7 && v.branch === 'B');

  if (!base7 || !var7A || !var7B || !ans7A || !ans7B) {
    console.error('ERROR: Missing Level 7 variant definitions or answer hashes');
    process.exit(1);
  }

  roundsToSeed.push({
    id: 'round-7-A',
    round_number: 7,
    branch: 'A',
    act: base7.act,
    year: base7.year,
    title: `${base7.title} (Branch A - CIA Intercept)`,
    agency: base7.agency,
    cipher_type: base7.cipherType,
    story_text: var7A.storyText,
    ciphertext: var7A.ciphertext,
    clue: var7A.clue,
    hint: base7.hint || null,
    pamphlet_key: base7.pamphletKey || null,
    is_dilemma: Boolean(base7.isDilemma),
    timer_seconds: base7.timerSeconds ?? null,
    key_fragment: base7.keyFragment ?? null,
    options: base7.options ?? [],
    answer_hash: ans7A.answerHash,
    accepted_variants: ans7A.acceptedVariants ?? [],
  });

  roundsToSeed.push({
    id: 'round-7-B',
    round_number: 7,
    branch: 'B',
    act: base7.act,
    year: base7.year,
    title: `${base7.title} (Branch B - KGB Moscow Liaison)`,
    agency: base7.agency,
    cipher_type: base7.cipherType,
    story_text: var7B.storyText,
    ciphertext: var7B.ciphertext,
    clue: var7B.clue,
    hint: base7.hint || null,
    pamphlet_key: base7.pamphletKey || null,
    is_dilemma: Boolean(base7.isDilemma),
    timer_seconds: base7.timerSeconds ?? null,
    key_fragment: base7.keyFragment ?? null,
    options: base7.options ?? [],
    answer_hash: ans7B.answerHash,
    accepted_variants: ans7B.acceptedVariants ?? [],
  });

  // Levels 8 through 15 (Base)
  for (let i = 8; i <= 15; i++) {
    const lvl = LEVELS.find((l) => l.number === i);
    const ans = SERVER_LEVEL_ANSWERS.find((a) => a.number === i);
    if (!lvl || !ans) {
      console.error(`ERROR: Missing cipher definition or answer for level ${i}`);
      process.exit(1);
    }
    roundsToSeed.push({
      id: `round-${i}`,
      round_number: i,
      branch: 'MAIN',
      act: lvl.act,
      year: lvl.year,
      title: lvl.title,
      agency: lvl.agency,
      cipher_type: lvl.cipherType,
      story_text: lvl.storyText,
      ciphertext: lvl.ciphertext,
      clue: lvl.clue,
      hint: lvl.hint || null,
      pamphlet_key: lvl.pamphletKey || null,
      is_dilemma: Boolean(lvl.isDilemma),
      timer_seconds: lvl.timerSeconds ?? null,
      key_fragment: lvl.keyFragment ?? null,
      options: lvl.options ?? [],
      answer_hash: ans.answerHash,
      accepted_variants: ans.acceptedVariants ?? [],
    });
  }

  if (roundsToSeed.length !== 17) {
    console.error(`ERROR: Expected exactly 17 rounds to seed, but found ${roundsToSeed.length}`);
    process.exit(1);
  }

  console.log(`[SEED] Upserting ${roundsToSeed.length} rounds into Supabase 'rounds' table...`);

  for (const round of roundsToSeed) {
    const { error } = await supabase.from('rounds').upsert(round, { onConflict: 'id' });
    if (error) {
      console.error(`ERROR seeding round ${round.id}:`, error.message);
      process.exit(1);
    }
    console.log(`[SEED] Loaded ${round.id}: ${round.title}`);
  }

  console.log(`\n[SEED SUCCESS] Successfully seeded all 17 rounds into Supabase.`);
}

runSeed().catch((err) => {
  console.error('Fatal seed failure:', err?.message || err);
  process.exit(1);
});
