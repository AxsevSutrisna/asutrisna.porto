/**
 * ColorBar Component
 * Visualizes all 6 colors in a preset as stacked swatches with labels
 * and proportional bar indicators.
 */

const COLOR_SLOTS = [
  { key: 'primary_dark',    label: 'Primary Dark',    flex: 28 },
  { key: 'primary_light',   label: 'Primary Light',   flex: 28 },
  { key: 'secondary_dark',  label: 'Secondary Dark',  flex: 14 },
  { key: 'secondary_light', label: 'Secondary Light', flex: 14 },
  { key: 'backdrop_base',   label: 'Backdrop Base',   flex: 8  },
  { key: 'backdrop_glow',   label: 'Backdrop Glow',   flex: 8  },
]

/**
 * Compact horizontal color strip — used inside preset cards.
 */
export const ColorStrip = ({ colors = {} }) => (
  <div className="flex w-full h-10 rounded-xl overflow-hidden border border-white/10 shadow-inner">
    {COLOR_SLOTS.map(({ key, label, flex }) => (
      <div
        key={key}
        style={{ backgroundColor: colors[key] || '#1a1a2e', flex }}
        title={`${label}: ${colors[key] || 'N/A'}`}
        className="transition-all duration-300"
      />
    ))}
  </div>
)

/**
 * Detailed vertical color list — used inside the preview modal.
 */
const ColorBar = ({ colors = {} }) => (
  <div className="space-y-2">
    {COLOR_SLOTS.map(({ key, label, flex }) => (
      <div key={key} className="flex items-center gap-3">
        {/* Swatch */}
        <div
          className="w-7 h-7 rounded-lg border border-white/10 shrink-0 shadow-md"
          style={{ backgroundColor: colors[key] || '#1a1a2e' }}
          title={colors[key]}
        />

        {/* Label & hex */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-gray-400 truncate">{label}</span>
            <span className="text-xs text-gray-500 font-mono ml-2 shrink-0">
              {(colors[key] || '').toUpperCase()}
            </span>
          </div>
          {/* Proportional bar */}
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: colors[key] || '#1a1a2e',
                width: `${flex * 2}%`,
              }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default ColorBar
