import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-[#5a6b5a] mb-1">{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f]',
          error ? 'border-[#b34545]' : 'border-[#c9d6c9]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#b34545] mt-1">{error}</p>}
    </div>
  )
}
