import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-[#3d7a4f] text-white hover:bg-[#356b44]',
    outline: 'border border-[#e0e8de] bg-white hover:bg-[#f4f7f4]',
    danger: 'bg-[#3d7a4f] text-white hover:bg-[#356b44]',
  }

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
