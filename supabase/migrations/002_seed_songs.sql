-- Données de test avec vidéos YouTube réelles
-- Remplacer les IDs par les vrais IDs de chansons choisies

INSERT INTO public.songs (title, artist, duration_sec, youtube_video_id, difficulty) VALUES
  ('Parisien', 'Artiste Test', 180, 'dQw4w9WgXcQ', 1),
  ('Fade Up',  'Artiste Test', 200, 'dQw4w9WgXcQ', 2),
  ('Midnight Sun', 'Artiste Test', 220, 'dQw4w9WgXcQ', 3)
ON CONFLICT DO NOTHING;
