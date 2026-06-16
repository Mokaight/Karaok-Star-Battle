import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  stars: number
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }

export function StarRating({ stars, animated = false, size = 'md' }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < stars
        const star = (
          <span key={i} className={cn(SIZE_MAP[size], filled ? 'text-brand-star' : 'text-gray-200')}>
            ★
          </span>
        )
        if (!animated) return star
        return (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}
            className={cn(SIZE_MAP[size], filled ? 'text-brand-star' : 'text-gray-200')}
          >
            ★
          </motion.span>
        )
      })}
    </div>
  )
}
