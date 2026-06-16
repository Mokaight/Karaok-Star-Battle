import { cn } from '@/lib/utils'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
  className?: string
  gradient?: boolean
  showNav?: boolean
}

export function AppShell({ children, className, gradient = false, showNav = true }: AppShellProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div
        className={cn(
          'relative w-full max-w-[390px] h-full max-h-[844px] overflow-hidden',
          gradient ? 'gradient-brand' : 'bg-brand-bg',
          className
        )}
      >
        {children}
        {showNav && <BottomNav />}
      </div>
    </div>
  )
}
