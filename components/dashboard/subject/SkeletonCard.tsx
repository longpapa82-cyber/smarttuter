export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full" />
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTutorCTA() {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/40" />
            <div className="space-y-2">
              <div className="h-6 sm:h-7 bg-white/40 rounded w-48 sm:w-64" />
              <div className="h-4 bg-white/30 rounded w-32 sm:w-40" />
            </div>
          </div>
          <div className="space-y-2 ml-0 sm:ml-16 md:ml-20">
            <div className="h-4 bg-white/30 rounded w-48" />
            <div className="h-4 bg-white/30 rounded w-40" />
          </div>
        </div>
        <div className="h-10 w-32 bg-white/40 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonProgressCard() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full" />
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-40 sm:w-48" />
      </div>

      {/* Progress bars */}
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-3 bg-gray-200 rounded-full w-full" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-3 bg-gray-200 rounded-full w-full" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonSupplementaryCard() {
  return (
    <div className="rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse min-h-[160px] sm:min-h-[180px] flex flex-col">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/40 mb-3 sm:mb-4" />
      <div className="h-5 bg-white/40 rounded w-32 mb-2" />
      <div className="h-4 bg-white/30 rounded w-40 mb-3 sm:mb-4" />
      <div className="h-6 bg-white/40 rounded-full w-20 mt-auto" />
    </div>
  );
}

export function SkeletonAnalysisCard() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 animate-pulse">
      <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40 mb-3 sm:mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-4/6" />
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton({
  gradientFrom = "purple-50",
  gradientVia = "pink-50",
  gradientTo = "rose-50"
}: {
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-${gradientFrom} via-${gradientVia} to-${gradientTo}`}>
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 lg:py-10">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8 animate-pulse">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full" />
              <div className="h-7 sm:h-8 bg-gray-200 rounded w-40 sm:w-48" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-48 sm:w-64" />
        </div>

        <div className="space-y-8">
          {/* Tutor CTA Skeleton */}
          <SkeletonTutorCTA />

          {/* Progress Card Skeleton */}
          <SkeletonProgressCard />

          {/* Supplementary Learning Skeleton */}
          <div className="animate-pulse">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full" />
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <SkeletonSupplementaryCard />
              <SkeletonSupplementaryCard />
              <SkeletonSupplementaryCard />
              <SkeletonSupplementaryCard />
            </div>
          </div>

          {/* Analysis Card Skeleton */}
          <SkeletonAnalysisCard />
        </div>
      </div>
    </div>
  );
}
