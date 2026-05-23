import { cn } from '@/lib/utils';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn(
      'px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl',
      className
    )}>
      {children}
    </div>
  );
}