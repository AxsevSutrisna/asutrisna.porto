/**
 * PresetCard Component
 * Individual preset card with:
 * - Horizontal color strip preview
 * - Preset name, category badge, vibe text
 * - Preview & Apply action buttons
 * - Hover elevation / active border states
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
  const primary = colors.primary_dark  || '#6366f1'
  const accent  = colors.primary_light || '#a855f7'
  const badgeCls = CATEGORY_BADGE_STYLES[preset.category] ?? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col rounded-2xl border overflow-hidden
        transition-all duration-300 ease-out cursor-default
        ${isActive
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.02]'
          : hovered
            ? 'border-white/20 shadow-xl shadow-black/40 scale-[1.02]'
            : 'border-white/8 shadow-sm'
        }
      `}
      style={{
        background: hovered || isActive
          ? `linear-gradient(145deg, rgba(${hexToRgb(primary)}, 0.08) 0%, rgba(255,255,255,0.03) 100%)`
          : 'rgba(255,255,255,0.04)',
      }}
    >
      {/* Active indicator glow top bar */}
      {isActive && (
        <div
          className="absolute top-0 left-0 w-full h-0.5 z-10"
          style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
        />
      )}

      {/* Color strip */}
      <div className="p-3 pb-0">
        <ColorStrip colors={colors} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 pt-3 gap-3">

        {/* Title + badges */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-semibold text-white leading-tight truncate">{preset.name}</h3>
            {isActive && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
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
          <p className="text-xs text-gray-500 line-clamp-2 flex-1 flex items-start gap-1">
            <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-gray-600" />
            {preset.vibe}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={() => onPreview(preset)}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-medium border border-white/10 text-gray-300 hover:bg-white/8 hover:border-white/20 hover:text-white transition-all duration-200"
          >
            Preview
          </button>
          <button
            onClick={() => onApply(preset)}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
            style={{
              background:  isActive
                ? `linear-gradient(135deg, ${primary}, ${accent})`
                : hovered
                  ? `linear-gradient(135deg, ${primary}cc, ${accent}cc)`
                  : `linear-gradient(135deg, ${primary}80, ${accent}80)`,
              border: `1px solid ${primary}40`,
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
