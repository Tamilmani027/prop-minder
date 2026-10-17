import { cn } from '../../lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'ended' | 'paid' | 'partial' | 'overdue' | 'pending'
}

export function Badge({ variant = 'active', className, ...props }: BadgeProps) {
  const variants = {
    active: 'bg-green-100 text-green-700',
    ended: 'bg-gray-100 text-gray-700',
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    pending: 'bg-blue-100 text-blue-700',
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
