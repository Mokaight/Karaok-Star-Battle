import { cn } from '@/lib/utils'

const AVATAR_EMOJIS = ['🦊', '🐱', '🐼', '🦁', '🐸', '🐧', '🦄', '🐯', '🐻']
const AVATAR_COLORS = [
  'bg-purple-200', 'bg-pink-200', 'bg-blue-200',
  'bg-green-200', 'bg-yellow-200', 'bg-red-200',
  'bg-indigo-200', 'bg-orange-200', 'bg-teal-200',
]

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-20 h-20 text-4xl',
}

interface AvatarDisplayProps {
  avatarId: number
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

export function AvatarDisplay({ avatarId, size = 'md', className }: AvatarDisplayProps) {
  const index = (avatarId - 1) % 9
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center flex-shrink-0',
      SIZE_CLASSES[size],
      AVATAR_COLORS[index],
      className
    )}>
      {AVATAR_EMOJIS[index]}
    </div>
  )
}
