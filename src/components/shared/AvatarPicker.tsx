import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-purple-300', 'bg-pink-300', 'bg-blue-300',
  'bg-green-300', 'bg-yellow-300', 'bg-red-300',
  'bg-indigo-300', 'bg-orange-300', 'bg-teal-300',
]

const AVATAR_EMOJIS = ['🦊', '🐱', '🐼', '🦁', '🐸', '🐧', '🦄', '🐯', '🐻']

interface AvatarPickerProps {
  selectedId: number
  onChange: (id: number) => void
}

export function AvatarPicker({ selectedId, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AVATAR_EMOJIS.map((emoji, i) => {
        const id = i + 1
        const isSelected = selectedId === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all',
              AVATAR_COLORS[i],
              isSelected
                ? 'ring-4 ring-brand-violet ring-offset-2 scale-105 shadow-glow'
                : 'opacity-70 hover:opacity-100 hover:scale-102'
            )}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
