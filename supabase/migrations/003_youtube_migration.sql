-- Remplace storage_path par youtube_video_id dans songs
ALTER TABLE public.songs
  ADD COLUMN youtube_video_id TEXT,
  DROP COLUMN IF EXISTS storage_path;

-- Rendre obligatoire après migration des données existantes
-- (fait en deux étapes pour éviter les erreurs sur données existantes)
UPDATE public.songs SET youtube_video_id = 'dQw4w9WgXcQ' WHERE youtube_video_id IS NULL;
ALTER TABLE public.songs ALTER COLUMN youtube_video_id SET NOT NULL;

-- Supprimer le bucket songs (plus nécessaire)
-- À faire manuellement dans le dashboard Supabase si déjà créé
-- DELETE FROM storage.buckets WHERE id = 'songs';
-- DROP POLICY IF EXISTS "songs_storage_read_authenticated" ON storage.objects;
