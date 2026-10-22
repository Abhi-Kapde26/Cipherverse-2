-- ================================================================
-- OPERATION JANUS: THE TRUST PARADOX
-- Supabase / PostgreSQL Database Schema & Security Rules
-- Production Deployment Schema
-- ================================================================

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY,
    team_name TEXT UNIQUE NOT NULL,
    members JSONB NOT NULL DEFAULT '[]'::jsonb,
    password_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- 2. PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.progress (
    team_id TEXT PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
    current_level INT NOT NULL DEFAULT 1,
    branch TEXT NOT NULL DEFAULT 'UNALIGNED', -- 'UNALIGNED' | 'A' | 'B'
    sub_branch TEXT NOT NULL DEFAULT 'NONE',   -- 'NONE' | 'A1' | 'A2' | 'B1' | 'B2'
    burn_level INT NOT NULL DEFAULT 0,
    key_fragments JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    finished_at BIGINT,
    ending TEXT,                             -- 'X' | 'Y' | 'Z'
    wrong_attempts_current INT NOT NULL DEFAULT 0
);

-- 3. CHOICES TABLE (Dilemmas)
CREATE TABLE IF NOT EXISTS public.choices (
    id BIGSERIAL PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    level INT NOT NULL,
    option TEXT NOT NULL,
    chosen_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    auto_penalized BOOLEAN NOT NULL DEFAULT FALSE
);

-- 4. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id BIGSERIAL PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    level INT NOT NULL,
    answer_given TEXT NOT NULL,
    correct INT NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- 5. DILEMMA SESSIONS TABLE (Server timer truth)
CREATE TABLE IF NOT EXISTS public.dilemma_sessions (
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    level INT NOT NULL,
    started_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    PRIMARY KEY(team_id, level)
);

-- 6. EVENT STATE TABLE (Global freeze switch)
CREATE TABLE IF NOT EXISTS public.event_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO public.event_state (key, value)
VALUES ('is_paused', 'false')
ON CONFLICT (key) DO NOTHING;

-- 7. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO public.settings (key, value)
VALUES ('is_paused', 'false')
ON CONFLICT (key) DO NOTHING;

-- 8. RATE LIMITS TABLE (Persistent distributed rate limiting)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    last_attempt_at BIGINT NOT NULL
);

-- 9. ROUNDS TABLE (Static cipher repository seeded from repository files)
CREATE TABLE IF NOT EXISTS public.rounds (
    id TEXT PRIMARY KEY,
    round_number INT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'MAIN',
    act INT NOT NULL,
    year INT NOT NULL,
    title TEXT NOT NULL,
    agency TEXT NOT NULL,
    cipher_type TEXT NOT NULL,
    story_text TEXT NOT NULL,
    ciphertext TEXT NOT NULL,
    clue TEXT NOT NULL,
    hint TEXT,
    pamphlet_key TEXT,
    is_dilemma BOOLEAN NOT NULL DEFAULT FALSE,
    timer_seconds INT,
    key_fragment INT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    answer_hash TEXT NOT NULL,
    accepted_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    CONSTRAINT unique_round_branch UNIQUE(round_number, branch)
);

-- ================================================================
-- INDEXES: Lightning fast queries under concurrent load
-- ================================================================

-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_progress_team_id ON public.progress(team_id);
CREATE INDEX IF NOT EXISTS idx_choices_team_id ON public.choices(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON public.submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_dilemma_sessions_team_id ON public.dilemma_sessions(team_id);

-- Leaderboard & Progression Indexes
CREATE INDEX IF NOT EXISTS idx_progress_current_level ON public.progress(current_level);
CREATE INDEX IF NOT EXISTS idx_progress_finished_at ON public.progress(finished_at);
CREATE INDEX IF NOT EXISTS idx_progress_burn_level ON public.progress(burn_level);
CREATE INDEX IF NOT EXISTS idx_progress_started_at ON public.progress(started_at);
CREATE INDEX IF NOT EXISTS idx_progress_leaderboard_sort ON public.progress(finished_at, current_level DESC, burn_level ASC);

-- Telemetry & Rate Limiting Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_team_id_created ON public.submissions(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rounds_number ON public.rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_rounds_number_branch ON public.rounds(round_number, branch);

-- ================================================================
-- ATOMIC ADVANCEMENT RPC FUNCTION (Requirement 5)
-- Prevents double-advances on double clicks / parallel requests
-- ================================================================
CREATE OR REPLACE FUNCTION public.advance_team_level(
    p_team_id TEXT,
    p_expected_level INT,
    p_next_level INT,
    p_key_fragments JSONB,
    p_finished_at BIGINT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rows INT;
BEGIN
    UPDATE public.progress
    SET current_level = p_next_level,
        wrong_attempts_current = 0,
        key_fragments = p_key_fragments,
        finished_at = COALESCE(p_finished_at, finished_at)
    WHERE team_id = p_team_id AND current_level = p_expected_level;

    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN v_rows > 0;
END;
$$;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enabled on all tables with no public policies.
-- Direct client/anon access is blocked; server access using
-- SUPABASE_SERVICE_ROLE_KEY bypasses RLS securely.
-- ================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dilemma_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
