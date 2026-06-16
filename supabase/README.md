# Supabase — Karaok Star Battle

## Setup

1. Créer un projet sur https://supabase.com
2. Copier l'URL et la clé anon dans `.env.local`
3. Aller dans l'éditeur SQL du dashboard
4. Exécuter dans l'ordre :
   - `migrations/001_initial_schema.sql`
   - `migrations/002_seed_songs.sql`

## Bucket Storage

Dans Storage > New bucket :
- Nom : `songs`
- Public : NON
- Uploader les fichiers MP3 des chansons

## Variables d'environnement

Copier `.env.example` en `.env.local` et remplir :
- `VITE_SUPABASE_URL` : Settings > API > Project URL
- `VITE_SUPABASE_ANON_KEY` : Settings > API > anon public key
