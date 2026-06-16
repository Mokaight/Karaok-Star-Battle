-- ============================================
-- Karaok Star Battle — Migration initiale
-- ============================================

-- ============================================
-- TABLE : profiles (extension de auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL UNIQUE,
  avatar_id   SMALLINT NOT NULL CHECK (avatar_id BETWEEN 1 AND 9),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles (username);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour créer un profil vide à l'inscription (optionnel — le front peut le faire)
-- Désactivé car le pseudo et avatar sont choisis par l'utilisateur
-- CREATE OR REPLACE FUNCTION handle_new_user() ...

-- ============================================
-- TABLE : songs
-- ============================================
CREATE TABLE public.songs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  artist       TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  cover_url    TEXT,
  difficulty   SMALLINT DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_songs_active ON public.songs (created_at DESC) WHERE is_active = TRUE;

-- ============================================
-- TABLE : scores
-- ============================================
CREATE TABLE public.scores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id      UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  score        SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  stars        SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  is_duel      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scores_song_score ON public.scores (song_id, score DESC);
CREATE INDEX idx_scores_user_song  ON public.scores (user_id, song_id, score DESC);

-- ============================================
-- TABLE : duels
-- ============================================
CREATE TABLE public.duels (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id             UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  challenger_score_id UUID REFERENCES public.scores(id),
  opponent_score      SMALLINT,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'completed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_duels_challenger ON public.duels (challenger_id, created_at DESC);
CREATE INDEX idx_duels_opponent   ON public.duels (opponent_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- SONGS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "songs_select_active"
  ON public.songs FOR SELECT
  USING (is_active = TRUE);

-- SCORES
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scores_select_all"
  ON public.scores FOR SELECT USING (true);

CREATE POLICY "scores_insert_own"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DUELS
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "duels_select_participants"
  ON public.duels FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE POLICY "duels_insert_as_challenger"
  ON public.duels FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "duels_update_own"
  ON public.duels FOR UPDATE
  USING (auth.uid() = challenger_id);

-- ============================================
-- STORAGE
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('songs', 'songs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "songs_storage_read_authenticated"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'songs' AND auth.role() = 'authenticated');
