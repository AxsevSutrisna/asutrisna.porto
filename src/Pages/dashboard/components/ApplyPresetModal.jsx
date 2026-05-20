/**
 * ApplyPresetModal Component
 * Full-detail preview modal for a selected preset.
 * Shows color bar, description, vibe, use case, and confirm/cancel actions.
 */

import { useEffect, useRef } from 'react'
import { X, Sparkles, Tag, Zap } from 'lucide-react'
import ColorBar, { ColorStrip } from './ColorBar'

const CATEGORY_BADGE_STYLES = {
  professional: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  creative:     'bg-orange-500/20 border-orange-500/30 text-orange-300',
  luxury:       'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  tech:         'bg-violet-500/20 border-violet-500/30 text-violet-300',
  natural:      'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  energy:       'bg-red-500/20 border-red-500/30 text-red-300',
}

const ApplyPresetModal = ({ preset, onApply, onClose }) => {
  const backdropRef = useRef(null)

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /* Close when clicking backdrop directly */
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose()
  }

  if (!preset) return null

  const colors  = preset.color_scheme || {}
  const badgeCls = CATEGORY_BADGE_STYLES[preset.category] ?? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60"
        style={{
          background: `linear-gradient(135deg, rgba(${hexToRgb(colors.backdrop_base || '#030014')}, 0.95) 0%, rgba(${hexToRgb(colors.backdrop_glow || '#1a0a2e')}, 0.95) 100%)`,
        }}
      >
        {/* Glow accent */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
          style={{
            background: `linear-gradient(90deg, ${colors.primary_dark || '#6366f1'}, ${colors.primary_light || '#a855f7'})`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border border-white/10 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.primary_dark || '#6366f1'}, ${colors.primary_light || '#a855f7'})`,
              }}
            />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{preset.name}</h2>
              {preset.category && (
                <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full border text-xs font-medium ${badgeCls}`}>
                  <Tag className="w-2.5 h-2.5" />
                  {preset.category.charAt(0).toUpperCase() + preset.category.slice(1)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Horizontal color strip */}
          <ColorStrip colors={colors} />

          {/* Detailed color breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Color Breakdown</p>
            <ColorBar colors={colors} />
          </div>

          {/* Description */}
          {preset.description && (
            <p className="text-sm text-gray-300 leading-relaxed">{preset.description}</p>
          )}

          {/* Vibe & Use Case */}
          <div className="grid grid-cols-2 gap-3">
            {preset.vibe && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Vibe
                </p>
                <p className="text-xs text-gray-300 leading-relaxed">{preset.vibe}</p>
              </div>
            )}
            {preset.use_case && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Use Case
                </p>
                <p className="text-xs text-gray-300 leading-relaxed">{preset.use_case}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/8 bg-black/20">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 hover:border-white/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(preset)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{
              background: `linear-gradient(135deg, ${colors.primary_dark || '#6366f1'}, ${colors.primary_light || '#a855f7'})`,
              boxShadow: `0 4px 14px ${colors.primary_dark || '#6366f1'}40`,
            }}
          >
            ✓ Apply Preset
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Converts a 6-digit hex color to "r, g, b" string
 * (safe for use in rgba() CSS expressions)
 */
function hexToRgb(hex = '#000000') {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return `${r}, ${g}, ${b}`
}

export default ApplyPresetModal
