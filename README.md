# Karaok Star Battle

PWA karaoké multijoueur pour enfants — chante, score, défie tes amis.

## Prérequis

- Node.js 18+
- Un projet [Supabase](https://supabase.com) (gratuit)

## Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/mokaight/karaok-star-battle.git
cd karaok-star-battle

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec tes clés Supabase (voir ci-dessous)

# 4. Lancer le serveur de développement
npm run dev
# → http://localhost:8080
```

## Configuration Supabase

1. Créer un projet sur https://supabase.com (gratuit)
2. Aller dans **Settings > API** et copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. Aller dans **SQL Editor** et exécuter dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_songs.sql`
4. Dans **Storage**, le bucket `songs` est créé automatiquement par la migration
5. Uploader les fichiers MP3 dans le bucket `songs`

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Scripts disponibles

```bash
npm run dev      # Développement → localhost:8080
npm run build    # Build production
npm run preview  # Prévisualiser le build
```

## Stack technique

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- Supabase (Auth + PostgreSQL + Storage)
- React Router v6 + Zustand
- PWA (installable sans store)

## Installer l'app sur mobile (via réseau local)

1. Lancer `npm run dev` — Vite affiche l'adresse réseau (ex: `http://192.168.x.x:8080`)
2. Ouvrir cette adresse sur le mobile (même réseau Wi-Fi)
3. **iOS** : partager → "Sur l'écran d'accueil"
4. **Android** : menu → "Ajouter à l'écran d'accueil"
