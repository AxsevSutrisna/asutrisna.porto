/**
 * PresetFilterTabs Component
 * Dark-mode pill tabs for filtering presets by category.
 * Categories are derived dynamically from the fetched preset list.
 */

const CATEGORY_ICONS = {
  all:          '✦',
  professional: '💼',
  creative:     '🎨',
  luxury:       '✨',
  tech:         '⚡',
  natural:      '🌿',
  energy:       '🔥',
}

const CATEGORY_LABELS = {
  all:          'All Presets',
  professional: 'Professional',
  creative:     'Creative',
  luxury:       'Luxury',
  tech:         'Tech',
  natural:      'Natural',
  energy:       'Energy',
}

const PresetFilterTabs = ({
  categories = [],
  selected = 'all',
  onSelect = () => {},
  counts = {},
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = selected === cat
        const icon    = CATEGORY_ICONS[cat] ?? '•'
        const label   = CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1)
        const count   = counts[cat]

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`
              inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
              border transition-all duration-200 select-none
              ${isActive
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-500/10'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-200'
              }
            `}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
            {count !== undefined && (
              <span
                className={`
                  text-xs px-1.5 py-0.5 rounded-full leading-none
                  ${isActive ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/10 text-gray-500'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default PresetFilterTabs
