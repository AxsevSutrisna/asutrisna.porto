/**
 * ApplyPresetModal Component
 * Full-detail preview modal for a selected preset.
 * Updated to use new color_scheme keys (identical to site_theme columns).
 *
 * Features:
 * - Atmospheric backdrop preview with animated blobs
 * - Grouped color swatches (Core, Backdrop, Background, Buttons, Text, Cards, Effects)
 * - Live mini UI preview (button, text, card samples)
 * - Description, vibe, use-case info
 */

import { useEffect, useRef } from 'react'
import { X, Sparkles, Tag, Zap, Palette } from 'lucide-react'
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

  /* Close when clicking backdrop */
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose()
  }

  if (!preset) return null

  const colors = preset.color_scheme || {}

  // ── Support both new keys (primary_color_dark) and old (primary_dark) ──
  const primary   = colors.primary_color_dark   || colors.primary_dark   || '#6366f1'
  const light     = colors.primary_color_light  || colors.primary_light  || '#a855f7'
  const secDark   = colors.secondary_color_dark  || colors.secondary_dark  || '#8b5cf6'
  const secLight  = colors.secondary_color_light || colors.secondary_light || '#c084fc'
  const backdrop  = colors.backdrop_base || '#030014'
  const glow      = colors.backdrop_glow || '#1a0a2e'

  const badgeCls = CATEGORY_BADGE_STYLES[preset.category?.toLowerCase()] ?? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/80 flex flex-col"
        style={{
          background: `linear-gradient(160deg, ${backdrop}f5 0%, ${glow}f0 100%)`,
          maxHeight: '90vh',
        }}
      >
        {/* Top gradient glow bar */}
        <div
          className="absolute top-0 left-0 w-full h-1 z-10"
          style={{ background: `linear-gradient(90deg, ${primary}, ${light}, ${secLight})` }}
        />

        {/* Ambient glow blobs in background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-25"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: light }}
          />
          <div
            className="absolute top-1/2 right-8 w-24 h-24 rounded-full blur-2xl opacity-15"
            style={{ backgroundColor: secLight }}
          />
        </div>

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            {/* Color icon */}
            <div
              className="w-10 h-10 rounded-xl border border-white/15 shadow-lg flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${primary}, ${light})` }}
            >
              <Palette className="w-5 h-5 text-white/90" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white leading-tight">{preset.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {preset.category && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${badgeCls}`}>
                    <Tag className="w-2.5 h-2.5" />
                    {preset.category.charAt(0).toUpperCase() + preset.category.slice(1)}
                  </span>
                )}
                {preset.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                    ✦ Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="relative overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Atmospheric color strip */}
          <ColorStrip colors={colors} />

          {/* ── Live Mini UI Preview ── */}
          <div
            className="rounded-xl p-4 border border-white/10 space-y-3"
            style={{ backgroundColor: `${backdrop}cc` }}
          >
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Live Preview</p>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Primary button */}
              <div
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${colors.button_primary_from || primary}, ${colors.button_primary_to || light})`,
                  boxShadow: `0 4px 12px ${primary}50`,
                }}
              >
                Primary Button
              </div>

              {/* Secondary button */}
              <div
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${colors.button_secondary_from || secDark}, ${colors.button_secondary_to || secLight})`,
                }}
              >
                Secondary
              </div>

              {/* Outline button */}
              <div
                className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  border: `1.5px solid ${colors.button_outline_color || light}`,
                  color: colors.button_outline_color || light,
                  backgroundColor: 'transparent',
                }}
              >
                Outline
              </div>
            </div>

            {/* Text samples */}
            <div className="space-y-0.5 text-xs">
              <p style={{ color: colors.text_primary || '#f5f3ff' }}>● Primary text — this is your main content color</p>
              <p style={{ color: colors.text_secondary || '#d8d4e8' }}>● Secondary text — supporting information</p>
              <p style={{ color: colors.text_muted || '#64748b' }}>● Muted text — captions and metadata</p>
            </div>

            {/* Mini card */}
            <div
              className="rounded-lg border p-3 text-xs"
              style={{
                backgroundColor: colors.card_bg_dark || '#1e1b4b',
                borderColor: colors.card_border_light || '#e5e0ff',
              }}
            >
              <p style={{ color: colors.text_primary || '#f5f3ff' }} className="font-medium">Card Title</p>
              <p style={{ color: colors.text_secondary || '#d8d4e8' }} className="mt-0.5">Card with themed background and borders</p>
              <p style={{ color: colors.link_color || primary }} className="mt-1">→ Learn more</p>
            </div>
          </div>

          {/* ── Full Color Breakdown ── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Palette className="w-3 h-3" />
              All {Object.keys(colors).length} Colors
            </p>
            <ColorBar colors={colors} />
          </div>

          {/* Description */}
          {preset.description && (
            <p className="text-sm text-gray-300 leading-relaxed border-t border-white/8 pt-4">
              {preset.description}
            </p>
          )}

          {/* Vibe & Use Case */}
          <div className="grid grid-cols-2 gap-3">
            {preset.vibe && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Vibe
                </p>
                <p className="text-xs text-gray-200 font-medium">{preset.vibe}</p>
              </div>
            )}
            {preset.use_case && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Use Case
                </p>
                <p className="text-xs text-gray-200 leading-relaxed">{preset.use_case}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="relative flex gap-3 px-6 py-4 border-t border-white/8 shrink-0"
          style={{ background: `${backdrop}cc` }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/8 hover:border-white/20 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(preset)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${light})`,
              boxShadow: `0 4px 20px ${primary}60`,
            }}
          >
            ✓ Apply Preset
          </button>
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex = '#000000') {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return `${r}, ${g}, ${b}`
}

export default ApplyPresetModal
