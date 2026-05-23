import { cn } from '@/lib/utils';

const variants = {
  default:   'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
  outline:   'border border-brand-500 text-brand-600 hover:bg-brand-50',
  ghost:     'text-brand-600 hover:bg-brand-50',
  danger:    'bg-red-500 text-white hover:bg-red-600',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

const sizes = {
  sm:   'px-3 py-1.5 text-sm',
  md:   'px-4 py-2 text-sm',
  lg:   'px-6 py-3 text-base',
  icon: 'p-2',
};

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}