import { cn } from '../../lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'ended' | 'paid' | 'partial' | 'overdue' | 'pending'
}

export function Badge({ variant = 'active', className, ...props }: BadgeProps) {
  const variants = {
    active: 'bg-[#eef2ec] text-[#3d7a4f]',
    ended: 'bg-[#f4f7f4] text-[#647c64]',
    paid: 'bg-[#eef2ec] text-[#3d7a4f]',
    partial: 'bg-[#fdf3e3] text-[#9a6a1e]',
    overdue: 'bg-[#fdecec] text-[#b34545]',
    pending: 'bg-[#eef4fb] text-[#2f6f9f]',
  }

  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 rounded text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
