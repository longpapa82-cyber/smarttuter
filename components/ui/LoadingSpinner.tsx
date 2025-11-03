/**
 * Loading Spinner Components
 * Provides various loading indicators
 */

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

/**
 * Circular Loading Spinner
 */
export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-gray-300 border-t-primary-600',
          sizeClasses[size]
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="text-sm text-gray-600">{label}</p>}
    </div>
  );
}

/**
 * Dots Loading Indicator
 */
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)} role="status">
      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Progress Bar Loading
 */
export function LoadingProgress({
  progress,
  label,
  className,
}: {
  progress?: number;
  label?: string;
  className?: string;
}) {
  const isIndeterminate = progress === undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && <p className="text-sm text-gray-600 mb-2">{label}</p>}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300',
            isIndeterminate && 'animate-pulse'
          )}
          style={{
            width: isIndeterminate ? '100%' : `${progress}%`,
          }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {!isIndeterminate && (
        <p className="text-xs text-gray-500 mt-1 text-right">{progress}%</p>
      )}
    </div>
  );
}

/**
 * Pulse Loading
 */
export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)} role="status">
      <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
      <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.2s]" />
      <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.4s]" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full Page Loading Overlay
 */
export function LoadingOverlay({
  isLoading,
  label,
  children,
}: {
  isLoading: boolean;
  label?: string;
  children?: React.ReactNode;
}) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          {label && <p className="text-gray-700 font-medium">{label}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Loading
 */
export function InlineLoading({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
}

/**
 * Button Loading State
 */
export function ButtonLoading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span>{children}</span>
    </div>
  );
}
