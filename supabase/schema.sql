-- ================================================================
-- OPERATION JANUS: THE TRUST PARADOX
-- Supabase / PostgreSQL Database Schema & Security Rules
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
    correct BOOLEAN NOT NULL,
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

-- Indexes for lightning fast queries under 250 concurrent users
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON public.submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_choices_team_id ON public.choices(team_id);
CREATE INDEX IF NOT EXISTS idx_progress_current_level ON public.progress(current_level);
