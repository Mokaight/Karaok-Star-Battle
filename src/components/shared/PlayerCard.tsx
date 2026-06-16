import { cn } from '@/lib/utils'
import { AvatarDisplay } from './AvatarDisplay'
import { StarRating } from './StarRating'
import type { PlayerWithScore } from '@/types'

interface PlayerCardProps {
  player: PlayerWithScore
  isSelected: boolean
  onSelect: () => void
}

export function PlayerCard({ player, isSelected, onSelect }: PlayerCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-97',
        isSelected
          ? 'bg-brand-violet/20 border-2 border-brand-violet shadow-soft'
          : 'bg-white border-2 border-transparent shadow-soft'
      )}
    >
      <AvatarDisplay avatarId={player.avatar_id} size="md" />
      <div className="flex-1 text-left">
        <p className="font-semibold text-brand-text">{player.username}</p>
        {player.best_score !== null ? (
          <div className="flex items-center gap-2">
            <StarRating stars={(player.best_stars ?? 1) as 1|2|3|4|5} size="sm" />
            <span className="text-brand-muted text-xs">{player.best_score} pts</span>
          </div>
        ) : (
          <span className="text-brand-muted text-xs">Pas encore chanté</span>
        )}
      </div>
      {isSelected && <span className="text-brand-violet text-xl">✓</span>}
    </button>
  )
}
