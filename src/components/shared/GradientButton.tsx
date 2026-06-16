import { cn } from '@/lib/utils'

interface GradientButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export function GradientButton({
  children,
  onClick,
  disabled,
  isLoading,
  className,
  type = 'button',
}: GradientButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'w-full py-4 px-6 rounded-3xl font-display text-lg text-white',
        'gradient-brand shadow-soft',
        'transition-all active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading ? '...' : children}
    </button>
  )
}
