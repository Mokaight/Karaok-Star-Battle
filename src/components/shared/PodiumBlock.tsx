import { motion } from 'framer-motion'
import { AvatarDisplay } from './AvatarDisplay'
import { StarRating } from './StarRating'
import type { LeaderboardEntry } from '@/types'

interface PodiumBlockProps {
  top3: LeaderboardEntry[]
}

const PODIUM_ORDER = [1, 0, 2] // indices : 2ème, 1er, 3ème
const PODIUM_HEIGHTS = ['h-16', 'h-24', 'h-12']
const PODIUM_COLORS = ['bg-gray-300', 'bg-brand-star', 'bg-orange-300']
const PODIUM_CROWNS = ['🥈', '🥇', '🥉']

export function PodiumBlock({ top3 }: PodiumBlockProps) {
  if (top3.length === 0) return null

  return (
    <div className="flex items-end justify-center gap-2 py-4">
      {PODIUM_ORDER.map((entryIndex, visualIndex) => {
        const entry = top3[entryIndex]
        if (!entry) return <div key={visualIndex} className="w-24" />
        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: visualIndex * 0.1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-xl">{PODIUM_CROWNS[visualIndex]}</span>
            <AvatarDisplay avatarId={entry.avatar_id} size="md" />
            <p className="font-display text-xs text-brand-text text-center max-w-[72px] truncate">
              {entry.username}
            </p>
            <StarRating stars={entry.stars} size="sm" />
            <div className={`w-20 ${PODIUM_HEIGHTS[visualIndex]} ${PODIUM_COLORS[visualIndex]} rounded-t-2xl flex items-center justify-center`}>
              <span className="font-display text-white text-sm">{entry.score}</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
