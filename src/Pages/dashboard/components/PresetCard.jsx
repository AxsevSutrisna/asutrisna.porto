/**
 * PresetCard Component
 * Individual preset card with:
 * - Rich atmospheric color strip preview (uses new color_scheme keys)
 * - Preset name, category badge, vibe text
 * - Hover glow effect using preset's own primary color
 * - Preview & Apply action buttons
 * - Active border + glow state
 */

import { useState } from 'react'
import { Sparkles, Tag } from 'lucide-react'
import { ColorStrip } from './ColorBar'

const CATEGORY_BADGE_STYLES = {
  professional: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  creative:     'bg-orange-500/20 border-orange-500/30 text-orange-300',
  luxury:       'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  tech:         'bg-violet-500/20 border-violet-500/30 text-violet-300',
  natural:      'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  energy:       'bg-red-500/20 border-red-500/30 text-red-300',
}

const PresetCard = ({ preset, isActive = false, onPreview, onApply }) => {
  const [hovered, setHovered] = useState(false)

  const colors  = preset.color_scheme || {}

  // ── Support both new keys (primary_color_dark) and old (primary_dark) ──
  const primary = colors.primary_color_dark  || colors.primary_dark  || '#6366f1'
  const accent  = colors.primary_color_light || colors.primary_light || '#a855f7'
  const backdrop = colors.backdrop_base || '#030014'

  const badgeCls = CATEGORY_BADGE_STYLES[preset.category?.toLowerCase()] ?? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col rounded-2xl border overflow-hidden
        transition-all duration-300 ease-out cursor-default
        ${isActive
          ? 'border-2 shadow-lg scale-[1.02]'
          : hovered
            ? 'border-white/25 shadow-xl shadow-black/50 scale-[1.015]'
            : 'border-white/8 shadow-sm'
        }
      `}
      style={{
        borderColor: isActive ? primary : undefined,
        boxShadow: isActive
          ? `0 0 0 1px ${primary}60, 0 8px 32px ${primary}30`
          : hovered
            ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${primary}30`
            : undefined,
        background: hovered || isActive
          ? `linear-gradient(160deg,
              rgba(${hexToRgb(primary)}, 0.1) 0%,
              rgba(${hexToRgb(backdrop)}, 0.85) 60%,
              rgba(${hexToRgb(accent)}, 0.06) 100%)`
          : `linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
      }}
    >
      {/* Active top glow bar */}
      {isActive && (
        <div
          className="absolute top-0 left-0 w-full h-0.5 z-10"
          style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
        />
      )}

      {/* Hover corner glow */}
      {hovered && !isActive && (
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accent }}
        />
      )}

      {/* Color strip */}
      <div className="p-3 pb-2">
        <ColorStrip colors={colors} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-1 gap-3">

        {/* Title + active badge */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-semibold text-white leading-tight truncate">{preset.name}</h3>
            {isActive && (
              <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                ✓ Active
              </span>
            )}
          </div>

          {preset.category && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${badgeCls}`}>
              <Tag className="w-2.5 h-2.5" />
              {preset.category.charAt(0).toUpperCase() + preset.category.slice(1)}
            </span>
          )}
        </div>

        {/* Vibe */}
        {preset.vibe && (
          <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1.5 flex-1">
            <Sparkles className="w-3 h-3 shrink-0 text-gray-600" />
            {preset.vibe}
          </p>
        )}

        {/* Mini color dots */}
        <div className="flex items-center gap-1 -mb-1">
          {[
            colors.primary_color_dark,
            colors.primary_color_light,
            colors.secondary_color_dark,
            colors.secondary_color_light,
            colors.backdrop_glow,
          ].filter(Boolean).map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full border border-white/15 shadow-sm"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <span className="text-[10px] text-gray-600 ml-auto font-mono">{primary}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={() => onPreview(preset)}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-medium border border-white/10 text-gray-300 hover:bg-white/8 hover:border-white/25 hover:text-white transition-all duration-200"
          >
            Preview
          </button>
          <button
            onClick={() => onApply(preset)}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${primary}, ${accent})`
                : hovered
                  ? `linear-gradient(135deg, ${primary}dd, ${accent}cc)`
                  : `linear-gradient(135deg, ${primary}90, ${accent}80)`,
              border: `1px solid ${primary}50`,
              boxShadow: (isActive || hovered) ? `0 4px 12px ${primary}40` : 'none',
            }}
          >
            {isActive ? '✓ Applied' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex = '#000000') {
  const c = hex.replace('#', '')
  return `${parseInt(c.slice(0,2),16)||0}, ${parseInt(c.slice(2,4),16)||0}, ${parseInt(c.slice(4,6),16)||0}`
}

export default PresetCard
