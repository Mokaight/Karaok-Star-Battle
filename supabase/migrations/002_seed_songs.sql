-- ============================================
-- Données de test — 3 chansons exemple
-- À remplacer par les vraies chansons
-- Les fichiers MP3 doivent être uploadés dans
-- le bucket "songs" de Supabase Storage
-- ============================================

INSERT INTO public.songs (title, artist, duration_sec, storage_path, difficulty) VALUES
  ('Parisien', 'Artiste Test', 180, 'songs/parisien.mp3', 1),
  ('Fade Up', 'Artiste Test', 200, 'songs/fade-up.mp3', 2),
  ('Midnight Sun', 'Artiste Test', 220, 'songs/midnight-sun.mp3', 3);
