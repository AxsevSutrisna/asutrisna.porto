/**
 * ColorBar Component
 * Updated to use new color_scheme keys (identical to site_theme columns).
 *
 * ColorStrip  – compact gradient strip inside preset cards
 * ColorBar    – rich grouped color preview inside the modal
 */

/* ─── ColorStrip ──────────────────────────────────────────────────────────── */

/**
 * Compact horizontal strip that previews the theme atmosphere
 * using backdrop + blobs + primary/secondary as a mini-gradient scene.
 */
export const ColorStrip = ({ colors = {} }) => {
  const primary   = colors.primary_color_dark  || '#6366f1'
  const light     = colors.primary_color_light || '#a855f7'
  const secDark   = colors.secondary_color_dark  || '#8b5cf6'
  const secLight  = colors.secondary_color_light || '#c084fc'
  const backdrop  = colors.backdrop_base || '#030014'
  const blob1     = colors.background_blob_one   || primary
  const blob2     = colors.background_blob_two   || light
  const blob3     = colors.background_blob_three || secLight
  const blob4     = colors.background_blob_four  || secDark

  return (
    <div
      className="relative w-full h-14 rounded-xl overflow-hidden border border-white/10 shadow-inner"
      style={{ backgroundColor: backdrop }}
    >
      {/* Blob glow effects */}
      <div
        className="absolute -top-4 -left-4 w-16 h-16 rounded-full blur-2xl opacity-70"
        style={{ backgroundColor: blob1 }}
      />
      <div
        className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-60"
        style={{ backgroundColor: blob2 }}
      />
      <div
        className="absolute top-1 right-8 w-10 h-10 rounded-full blur-xl opacity-50"
        style={{ backgroundColor: blob3 }}
      />

      {/* Color swatches row at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex h-4">
        {[primary, light, secDark, secLight, blob1, blob2, blob3, blob4].map((c, i) => (
          <div
            key={i}
            className="flex-1 transition-all duration-300"
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Color group definitions for the modal ──────────────────────────────── */

const COLOR_GROUPS = [
  {
    label: 'Core Palette',
    slots: [
      { key: 'primary_color_dark',    label: 'Primary Dark'    },
      { key: 'primary_color_light',   label: 'Primary Light'   },
      { key: 'secondary_color_dark',  label: 'Secondary Dark'  },
      { key: 'secondary_color_light', label: 'Secondary Light' },
    ],
  },
  {
    label: 'Backdrop',
    slots: [
      { key: 'backdrop_base', label: 'Base' },
      { key: 'backdrop_glow', label: 'Glow' },
    ],
  },
  {
    label: 'Background',
    slots: [
      { key: 'background_blob_one',       label: 'Blob 1'    },
      { key: 'background_blob_two',       label: 'Blob 2'    },
      { key: 'background_blob_three',     label: 'Blob 3'    },
      { key: 'background_blob_four',      label: 'Blob 4'    },
      { key: 'background_gradient_from',  label: 'Grad From' },
      { key: 'background_gradient_to',    label: 'Grad To'   },
    ],
  },
  {
    label: 'Buttons',
    slots: [
      { key: 'button_primary_from',   label: 'Primary From'   },
      { key: 'button_primary_to',     label: 'Primary To'     },
      { key: 'button_secondary_from', label: 'Secondary From' },
      { key: 'button_secondary_to',   label: 'Secondary To'   },
      { key: 'button_outline_color',  label: 'Outline'        },
    ],
  },
  {
    label: 'Text & Borders',
    slots: [
      { key: 'text_primary',   label: 'Text Primary'   },
      { key: 'text_secondary', label: 'Text Secondary' },
      { key: 'text_muted',     label: 'Text Muted'     },
      { key: 'border_light',   label: 'Border Light'   },
      { key: 'border_dark',    label: 'Border Dark'    },
    ],
  },
  {
    label: 'Cards & Navigation',
    slots: [
      { key: 'card_bg_dark',         label: 'Card BG'       },
      { key: 'card_border_light',    label: 'Card Border'   },
      { key: 'navbar_bg',            label: 'Navbar BG'     },
      { key: 'navbar_link_active',   label: 'Link Active'   },
      { key: 'navbar_link_inactive', label: 'Link Inactive' },
    ],
  },
  {
    label: 'Effects',
    slots: [
      { key: 'glow_color_primary',   label: 'Glow Primary'   },
      { key: 'glow_color_secondary', label: 'Glow Secondary' },
      { key: 'shadow_primary_color', label: 'Shadow'         },
      { key: 'overlay_bg_color',     label: 'Overlay'        },
    ],
  },
]

/* ─── ColorBar (modal detail view) ───────────────────────────────────────── */

const ColorBar = ({ colors = {} }) => (
  <div className="space-y-4">
    {COLOR_GROUPS.map(({ label, slots }) => (
      <div key={label}>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          {label}
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {slots.map(({ key, label: slotLabel }) => {
            const hex = colors[key]
            if (!hex) return null
            return (
              <div key={key} className="flex flex-col items-center gap-1" title={`${slotLabel}: ${hex}`}>
                <div
                  className="w-8 h-8 rounded-lg border border-white/10 shadow-md"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-[9px] text-gray-600 leading-none text-center max-w-[36px] truncate">
                  {slotLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    ))}
  </div>
)

export default ColorBar
