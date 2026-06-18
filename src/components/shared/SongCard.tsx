import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES, songRoute } from '@/config/routes'
import { formatDuration } from '@/lib/formatters'
import { getYouTubeThumbnail } from '@/services/songs.service'
import { cn } from '@/lib/utils'
import type { Song } from '@/types'

const DIFFICULTY_COLORS = ['', 'text-green-400', 'text-brand-violet', 'text-brand-rose']

interface SongCardProps {
  song: Song
  index: number
}

const CARD_GRADIENTS = [
  'from-purple-100 to-pink-100',
  'from-pink-100 to-orange-100',
  'from-blue-100 to-purple-100',
  'from-green-100 to-blue-100',
  'from-yellow-100 to-pink-100',
]

export function SongCard({ song, index }: SongCardProps) {
  const navigate = useNavigate()
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => navigate(songRoute(ROUTES.SONG_DETAIL, song.id))}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r shadow-soft',
        'active:scale-98 transition-transform text-left',
        gradient
      )}
    >
      {/* Pochette / thumbnail YouTube */}
      <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm overflow-hidden">
        {song.cover_url || song.youtube_video_id ? (
          <img
            src={song.cover_url ?? getYouTubeThumbnail(song.youtube_video_id)}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          '🎵'
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-brand-text text-base truncate">{song.title}</p>
        <p className="text-brand-muted text-sm truncate">{song.artist}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('text-xs font-semibold', DIFFICULTY_COLORS[song.difficulty])}>
            {'★'.repeat(song.difficulty)}{'☆'.repeat(3 - song.difficulty)}
          </span>
          <span className="text-brand-muted text-xs">{formatDuration(song.duration_sec)}</span>
        </div>
      </div>

      {/* Flèche */}
      <span className="text-brand-muted text-lg flex-shrink-0">›</span>
    </motion.button>
  )
}
