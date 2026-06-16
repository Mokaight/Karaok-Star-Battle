import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
}

export function BackButton({ to }: BackButtonProps) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => to ? navigate(to) : navigate(-1)}
      className="w-10 h-10 rounded-full bg-white/80 shadow-soft flex items-center justify-center text-brand-text text-lg active:scale-90 transition-transform"
    >
      ←
    </button>
  )
}
