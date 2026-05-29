/**
 * PresetCardsGrid Component
 * Responsive grid of PresetCard items.
 * Handles empty state and passes isActive detection down to each card.
 */

import PresetCard from './PresetCard'

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/8 overflow-hidden animate-pulse">
    {/* Color strip skeleton */}
    <div className="m-3 mb-2 h-14 rounded-xl bg-white/5 overflow-hidden relative">
      <div className="absolute bottom-0 left-0 right-0 h-4 flex">
        {[28, 20, 16, 14, 12, 10].map((w, i) => (
          <div key={i} style={{ flex: w }} className="bg-white/8" />
        ))}
      </div>
    </div>
    <div className="px-4 pb-4 pt-1 space-y-3">
      <div className="h-4 w-3/4 rounded-lg bg-white/8" />
      <div className="h-5 w-1/3 rounded-full bg-white/5" />
      <div className="h-3 w-full rounded bg-white/5" />
      {/* Mini dots skeleton */}
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="w-3 h-3 rounded-full bg-white/8" />
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <div className="flex-1 h-8 rounded-xl bg-white/5" />
        <div className="flex-1 h-8 rounded-xl bg-white/8" />
      </div>
    </div>
  </div>
)

const PresetCardsGrid = ({
  presets = [],
  loading = false,
  onPreview = () => {},
  onApply  = () => {},
  activePresetId = null,
}) => {
  /* Loading skeletons */
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  /* Empty state */
  if (!presets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-gray-400 text-sm font-medium">No presets in this category</p>
        <p className="text-gray-600 text-xs mt-1">Try selecting a different filter</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {presets.map((preset) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          isActive={activePresetId === preset.id}
          onPreview={onPreview}
          onApply={onApply}
        />
      ))}
    </div>
  )
}

export default PresetCardsGrid
