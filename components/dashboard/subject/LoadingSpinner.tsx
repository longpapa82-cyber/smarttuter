interface LoadingSpinnerProps {
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

export function LoadingSpinner({
  gradientFrom = "purple-50",
  gradientVia = "pink-50",
  gradientTo = "rose-50",
}: LoadingSpinnerProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-${gradientFrom} via-${gradientVia} to-${gradientTo}`}>
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
    </div>
  );
}
