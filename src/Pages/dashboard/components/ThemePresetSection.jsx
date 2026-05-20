/**
 * ThemePresetSection Component
 *
 * Main container for the "Quick Palette Selection" feature inside ThemeManager.
 *
 * Responsibilities:
 * - Fetch all theme_presets from Supabase on mount
 * - Derive filter categories dynamically from the data
 * - Filter displayed presets when user selects a category tab
 * - Open a full-detail preview modal on Preview click
 * - On Apply (card or modal): map preset color_scheme → ThemeManager field names
 *   and call onPresetApply({ ...mapped colors })
 *
 * Color key mapping
 * -----------------
 * DB preset color_scheme         → ThemeManager colors state
 *   primary_dark                 →  primary_color_dark
 *   primary_light                →  primary_color_light
 *   secondary_dark               →  secondary_color_dark
 *   secondary_light              →  secondary_color_light
 *   backdrop_base                →  backdrop_base          (same)
 *   backdrop_glow                →  backdrop_glow          (same)
 *
 * Additionally the preset primary/secondary colors are propagated to the
 * derivative fields (buttons, blobs, links, glows) for a full one-click
 * theme experience. Callers may override this by handling onPresetApply
 * themselves.
 *
 * Props
 * -----
 * onPresetApply(mappedColors)  - called with the full ThemeManager color object
 * currentColors                - current ThemeManager colors state (used to
 *                                detect which preset is "active")
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../../supabase'
import { AlertCircle, RefreshCw } from 'lucide-react'
import PresetFilterTabs from './PresetFilterTabs'
import PresetCardsGrid  from './PresetCardsGrid'
import ApplyPresetModal from './ApplyPresetModal'

/* ─── helpers ────────────────────────────────────────────────────────────── */

/**
 * Maps a preset's color_scheme (DB keys) → ThemeManager color field names.
 * Also fans out primary/secondary into buttons, blobs, links, glows so the
 * whole theme coheres after a single preset apply.
 */
function mapPresetToTheme(colorScheme) {
  const {
    primary_dark    = '#6366f1',
    primary_light   = '#a855f7',
    secondary_dark  = '#8b5cf6',
    secondary_light = '#c084fc',
    backdrop_base   = '#030014',
    backdrop_glow   = '#1a0a2e',
  } = colorScheme

  return {
    // Core palette
    primary_color_dark:    primary_dark,
    primary_color_light:   primary_light,
    secondary_color_dark:  secondary_dark,
    secondary_color_light: secondary_light,

    // Backdrop
    backdrop_base,
    backdrop_glow,

    // Background blobs (derived from primary/secondary)
    background_blob_one:        primary_dark,
    background_blob_two:        primary_light,
    background_blob_three:      secondary_light,
    background_blob_four:       secondary_dark,
    background_grid_line:       primary_dark,
    background_gradient_from:   primary_dark,
    background_gradient_to:     primary_light,

    // Buttons
    button_primary_from:    primary_dark,
    button_primary_to:      primary_light,
    button_secondary_from:  secondary_dark,
    button_secondary_to:    secondary_light,
    button_outline_color:   primary_light,

    // Navigation
    navbar_bg:              backdrop_base,
    navbar_link_active:     '#ffffff',
    navbar_link_inactive:   primary_light,

    // Links
    link_color:       primary_dark,
    link_hover_color: primary_light,

    // Input borders
    input_border_focus: primary_dark,

    // Effects / glows
    shadow_primary_color: primary_dark,
    glow_color_primary:   primary_dark,
    glow_color_secondary: primary_light,
    grid_line_color:      primary_dark,
    overlay_bg_color:     backdrop_base,
  }
}

/**
 * Checks whether the current ThemeManager colors match a preset's core palette.
 * Returns true when the 6 main fields all match.
 */
function isPresetActive(preset, currentColors) {
  if (!preset?.color_scheme || !currentColors) return false
  const cs = preset.color_scheme
  return (
    currentColors.primary_color_dark    === cs.primary_dark   &&
    currentColors.primary_color_light   === cs.primary_light  &&
    currentColors.secondary_color_dark  === cs.secondary_dark &&
    currentColors.secondary_color_light === cs.secondary_light &&
    currentColors.backdrop_base         === cs.backdrop_base  &&
    currentColors.backdrop_glow         === cs.backdrop_glow
  )
}

/** Builds { all: 10, professional: 2, tech: 3, … } from preset list */
function buildCounts(presets) {
  return presets.reduce((acc, p) => {
    acc.all = (acc.all || 0) + 1
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})
}

/* ─── component ──────────────────────────────────────────────────────────── */

const ALL = 'all'

const ThemePresetSection = ({ onPresetApply, currentColors }) => {
  const [presets,          setPresets]          = useState([])
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [previewPreset,    setPreviewPreset]    = useState(null) // preset open in modal

  /* ── fetch ─────────────────────────────────────────────────────────────── */
  const fetchPresets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: sbErr } = await supabase
        .from('theme_presets')
        .select('id, name, description, vibe, use_case, category, color_scheme, is_default, is_featured')
        .order('is_featured', { ascending: false })
        .order('id',          { ascending: true  })

      if (sbErr) throw sbErr

      // Ensure color_scheme is always an object (Supabase can return string)
      const normalized = (data || []).map((p) => ({
        ...p,
        color_scheme: typeof p.color_scheme === 'string'
          ? JSON.parse(p.color_scheme)
          : p.color_scheme,
      }))

      setPresets(normalized)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPresets() }, [fetchPresets])

  /* ── derived state ─────────────────────────────────────────────────────── */

  /** Unique sorted categories derived from real data */
  const categories = useMemo(() => {
    const cats = [...new Set(presets.map((p) => p.category).filter(Boolean))].sort()
    return [ALL, ...cats]
  }, [presets])

  /** Per-category counts for badge display */
  const counts = useMemo(() => buildCounts(presets), [presets])

  /** Filtered list for the current tab */
  const filteredPresets = useMemo(() => {
    if (selectedCategory === ALL) return presets
    return presets.filter((p) => p.category === selectedCategory)
  }, [presets, selectedCategory])

  /** ID of the preset whose colors match currentColors */
  const activePresetId = useMemo(() => {
    if (!currentColors) return null
    const found = presets.find((p) => isPresetActive(p, currentColors))
    return found?.id ?? null
  }, [presets, currentColors])

  /* ── actions ───────────────────────────────────────────────────────────── */

  const handlePreview = useCallback((preset) => {
    setPreviewPreset(preset)
  }, [])

  const handleApply = useCallback((preset) => {
    if (!onPresetApply) return
    const mapped = mapPresetToTheme(preset.color_scheme || {})
    onPresetApply(mapped)
    setPreviewPreset(null) // close modal if open
  }, [onPresetApply])

  const handleCloseModal = useCallback(() => {
    setPreviewPreset(null)
  }, [])

  /* ── render ────────────────────────────────────────────────────────────── */

  return (
    <section className="space-y-5">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">
            🎨 Quick Palette Selection
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Choose a pre-designed color theme and apply instantly
          </p>
        </div>

        {/* Retry button shown only when data loaded successfully */}
        {!loading && !error && (
          <button
            onClick={fetchPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10 transition"
            title="Refresh presets"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        )}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-300 font-medium">Failed to load presets</p>
            <p className="text-xs text-red-400 mt-0.5 break-words">{error}</p>
          </div>
          <button
            onClick={fetchPresets}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-medium transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Filter tabs — only after first successful load ── */}
      {!loading && !error && categories.length > 1 && (
        <PresetFilterTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          counts={counts}
        />
      )}

      {/* ── Cards grid ── */}
      {!error && (
        <PresetCardsGrid
          presets={filteredPresets}
          loading={loading}
          onPreview={handlePreview}
          onApply={handleApply}
          activePresetId={activePresetId}
        />
      )}

      {/* ── Preview modal ── */}
      {previewPreset && (
        <ApplyPresetModal
          preset={previewPreset}
          onApply={handleApply}
          onClose={handleCloseModal}
        />
      )}
    </section>
  )
}

export default ThemePresetSection
