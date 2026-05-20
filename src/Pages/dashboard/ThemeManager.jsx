import { useState, useEffect, useRef } from 'react'
import { HexColorPicker } from 'react-colorful'
import { fetchTheme, updateTheme, resetTheme, THEME_COLOR_CATEGORIES, DEFAULT_THEME } from '../../utils/themeManager'
import { RotateCcw, Copy, Check, X } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import ToastStack from '../../components/ToastStack'

export default function ThemeManager() {
    const [colors, setColors] = useState(DEFAULT_THEME)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [invalidFields, setInvalidFields] = useState({})
    const [copiedField, setCopiedField] = useState(null)
    const [pickerOpen, setPickerOpen] = useState(null) // Track which color picker is open
    const modalRef = useRef(null)
    const isClosingRef = useRef(false)
    const { toasts, pushToast, removeToast } = useToast()

    useEffect(() => {
        fetchThemeData()
    }, [])

    const fetchThemeData = async () => {
        try {
            setLoading(true)
            const theme = await fetchTheme()
            setColors(theme)
        } catch (error) {
            console.error('Error fetching theme:', error)
        } finally {
            setLoading(false)
        }
    }

    const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

    const normalizeHexColor = (value) => {
        if (value.startsWith('#') && value.length === 4) {
            return '#' + value.slice(1).split('').map((char) => char + char).join('')
        }
        return value
    }

    const validateHexColor = (value) => {
        const normalized = normalizeHexColor(value)
        return HEX_COLOR_REGEX.test(normalized)
    }

    const handleColorChange = (key, value) => {
        const normalized = normalizeHexColor(value)
        setColors({ ...colors, [key]: normalized })

        if (value && !validateHexColor(value)) {
            setInvalidFields({ ...invalidFields, [key]: true })
        } else {
            setInvalidFields({ ...invalidFields, [key]: false })
        }
    }

    const handleResetField = (key) => {
        setColors({ ...colors, [key]: DEFAULT_THEME[key] })
        setInvalidFields({ ...invalidFields, [key]: false })
    }

    const handleCopyToClipboard = (value, key) => {
        navigator.clipboard.writeText(value)
        setCopiedField(key)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const handleSave = async () => {
        if (Object.values(invalidFields).some(Boolean)) {
            pushToast('error', 'Please fix invalid hex colors before saving')
            return
        }

        try {
            setSaving(true)
            await updateTheme(colors)
            pushToast('success', 'Theme updated successfully!')
        } catch (error) {
            console.error('Error saving theme:', error)
            pushToast('error', error.message || 'Failed to save theme')
        } finally {
            setSaving(false)
        }
    }

    const handleReset = async () => {
        if (confirm('Reset all colors to default?')) {
            try {
                setSaving(true)
                await resetTheme()
                setColors(DEFAULT_THEME)
                setInvalidFields({})
                pushToast('success', 'Theme reset successfully!')
            } catch (error) {
                console.error('Error resetting theme:', error)
                pushToast('error', error.message || 'Failed to reset theme')
            } finally {
                setSaving(false)
            }
        }
    }

    const buildBackdropPreview = () => {
        const backdropBase = colors.backdrop_base || DEFAULT_THEME.backdrop_base
        const backdropGlow = colors.backdrop_glow || DEFAULT_THEME.backdrop_glow
        const gridLine = colors.background_grid_line || DEFAULT_THEME.background_grid_line
        const blobOne = colors.background_blob_one || DEFAULT_THEME.background_blob_one
        const blobTwo = colors.background_blob_two || DEFAULT_THEME.background_blob_two

        return {
            background: `
        radial-gradient(circle at top, rgba(${hexToRgb(backdropGlow)}, 0.8) 0%, transparent 68%),
        linear-gradient(45deg, rgba(${hexToRgb(gridLine)}, 0.035) 1px, transparent 1px),
        linear-gradient(-45deg, rgba(${hexToRgb(gridLine)}, 0.035) 1px, transparent 1px),
        ${backdropBase}
      `.trim(),
            backgroundSize: '100% 100%, 28px 28px, 28px 28px, 100% 100%',
        }
    }

    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `${r}, ${g}, ${b}`
    }

    const ColorPickerField = ({ label, value, fieldKey, hint, defaultValue }) => {
        const isInvalid = invalidFields[fieldKey]
        const isDefault = value === defaultValue

        return (
            <>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-medium">{label}</label>
                        {isDefault && <span className="text-xs text-gray-500">(default)</span>}
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Large clickable color preview */}
                        <div
                            onClick={() => setPickerOpen(fieldKey)}
                            className="w-14 h-10 rounded-lg cursor-pointer border-2 border-white/20 hover:border-indigo-400/50 transition-all hover:scale-110 shrink-0 shadow-lg hover:shadow-indigo-500/20"
                            style={{ backgroundColor: value }}
                            title="Click to open color picker"
                        />

                        {/* Hex input */}
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleColorChange(fieldKey, e.target.value.toUpperCase())}
                            placeholder="#000000"
                            className={`flex-1 px-3 py-2 bg-white/5 border rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none transition font-mono ${isInvalid ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'
                                }`}
                        />

                        {/* Copy button */}
                        <button
                            type="button"
                            onClick={() => handleCopyToClipboard(value, fieldKey)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition shrink-0"
                            title="Copy color code"
                        >
                            {copiedField === fieldKey ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </button>

                        {/* Reset button */}
                        <button
                            type="button"
                            onClick={() => handleResetField(fieldKey)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition shrink-0"
                            title="Reset to default"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    {isInvalid && <p className="text-xs text-red-400">Use valid hex color format, example: #A1B2C3</p>}
                    {hint && <p className="text-xs text-gray-500">{hint}</p>}
                </div>

                {/* Modal Color Picker - Rendered at document level to avoid propagation */}
                {pickerOpen === fieldKey && (
                    <div
                        ref={modalRef}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={(e) => {
                            // Only close if clicking directly on the backdrop, not the modal content
                            if (e.target === modalRef.current) {
                                setPickerOpen(null)
                            }
                        }}
                        onPointerDown={(e) => {
                            if (e.target === modalRef.current) {
                                e.currentTarget.setPointerCapture(e.pointerId)
                            }
                        }}
                    >
                        <div
                            className="bg-[#0a0a1a] border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-semibold">{label}</h3>
                                <button
                                    onClick={() => setPickerOpen(null)}
                                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Color Picker Section */}
                            <div className="space-y-4">
                                {/* react-colorful Hex Color Picker */}
                                <div
                                    className="flex justify-center"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <div className="w-full"
                                        onPointerDown={(e) => e.stopPropagation()}
                                    >
                                        <HexColorPicker
                                            color={value}
                                            onChange={(color) => handleColorChange(fieldKey, color)}
                                            style={{ width: '100%', height: '200px' }}
                                        />
                                    </div>
                                </div>

                                {/* Hex input and preview side by side */}
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-gray-400 text-xs font-medium block mb-2">HEX Code</label>
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) => handleColorChange(fieldKey, e.target.value.toUpperCase())}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            placeholder="#000000"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-xs font-medium block mb-2">Preview</label>
                                        <div
                                            className="w-16 h-10 rounded-lg border border-white/10 shadow-lg"
                                            style={{ backgroundColor: value }}
                                        />
                                    </div>
                                </div>

                                {/* RGB Display */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1"
                                    onMouseDown={(e) => e.stopPropagation()}>
                                    <p className="text-gray-400 text-xs font-medium">RGB</p>
                                    <p className="text-white text-sm font-mono">{hexToRgb(value)}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => handleResetField(fieldKey)}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="flex-1 px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg text-sm transition"
                                    >
                                        Reset to Default
                                    </button>
                                    <button
                                        onClick={() => setPickerOpen(null)}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition font-medium"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    if (loading) return <div className="text-gray-400 text-center py-8">Loading theme...</div>

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Theme Manager</h1>
                    <p className="text-gray-400 text-sm mt-1">Customize your portfolio colors</p>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition border border-red-500/20"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset All
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Color Categories */}
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(THEME_COLOR_CATEGORIES).map(([categoryKey, category]) => (
                        <div key={categoryKey} className="space-y-4 p-4 border border-white/10 rounded-lg">
                            <div>
                                <h3 className="text-white font-semibold">{category.label}</h3>
                                <p className="text-gray-500 text-xs mt-1">{category.hint}</p>
                            </div>

                            <div className="space-y-3">
                                {category.fields.map((fieldKey) => (
                                    <ColorPickerField
                                        key={fieldKey}
                                        label={fieldKey.replace(/_/g, ' ').toUpperCase()}
                                        value={colors[fieldKey] || DEFAULT_THEME[fieldKey]}
                                        fieldKey={fieldKey}
                                        defaultValue={DEFAULT_THEME[fieldKey]}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="sticky top-6 space-y-4">
                        {/* Main Preview */}
                        <div className="p-4 border border-white/10 rounded-lg overflow-hidden">
                            <p className="text-white text-sm font-medium mb-3">Backdrop Preview</p>
                            <div
                                className="w-full h-40 rounded-lg border border-white/10 relative overflow-hidden"
                                style={buildBackdropPreview()}
                            >
                                {/* Animated blobs */}
                                <div
                                    className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-40 animate-pulse"
                                    style={{ backgroundColor: colors.background_blob_one || DEFAULT_THEME.background_blob_one }}
                                />
                                <div
                                    className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30 animate-pulse"
                                    style={{
                                        backgroundColor: colors.background_blob_two || DEFAULT_THEME.background_blob_two,
                                        animationDelay: '1s'
                                    }}
                                />

                                {/* Content preview - Buttons */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                                    {/* Primary Button */}
                                    <button
                                        disabled
                                        className="px-4 py-1.5 rounded-lg font-medium transition text-white text-xs"
                                        style={{
                                            background: `linear-gradient(135deg, ${colors.button_primary_from || colors.primary_color_dark} 0%, ${colors.button_primary_to || colors.primary_color_light} 100%)`
                                        }}
                                    >
                                        Primary
                                    </button>

                                    {/* Text Examples */}
                                    <div className="text-center text-xs space-y-0.5">
                                        <p style={{ color: colors.text_primary || DEFAULT_THEME.text_primary }}>Primary Text</p>
                                        <p style={{ color: colors.text_secondary || DEFAULT_THEME.text_secondary }}>Secondary Text</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Button Styles Preview */}
                        <div className="p-4 border border-white/10 rounded-lg space-y-3">
                            <p className="text-white text-sm font-medium">Button Styles</p>

                            {/* Primary Button */}
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">Primary Button</p>
                                <button
                                    disabled
                                    className="w-full px-3 py-2 rounded-lg font-medium text-white text-xs transition"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.button_primary_from || colors.primary_color_dark}, ${colors.button_primary_to || colors.primary_color_light})`
                                    }}
                                >
                                    Click Me
                                </button>
                            </div>

                            {/* Secondary Button */}
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">Secondary Button</p>
                                <button
                                    disabled
                                    className="w-full px-3 py-2 rounded-lg font-medium text-white text-xs transition"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.button_secondary_from || colors.secondary_color_dark}, ${colors.button_secondary_to || colors.secondary_color_light})`
                                    }}
                                >
                                    Secondary
                                </button>
                            </div>

                            {/* Outline Button */}
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">Outline Button</p>
                                <button
                                    disabled
                                    className="w-full px-3 py-2 rounded-lg font-medium text-xs transition border-2"
                                    style={{
                                        borderColor: colors.button_outline_color || colors.primary_color_light,
                                        color: colors.button_outline_color || colors.primary_color_light,
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    Outline
                                </button>
                            </div>
                        </div>

                        {/* Text Colors Preview */}
                        <div className="p-4 border border-white/10 rounded-lg space-y-3">
                            <p className="text-white text-sm font-medium">Text Colors</p>

                            <div className="space-y-2 text-xs">
                                <div style={{ color: colors.text_primary || DEFAULT_THEME.text_primary }}>
                                    <p>● Primary Text Color</p>
                                </div>
                                <div style={{ color: colors.text_secondary || DEFAULT_THEME.text_secondary }}>
                                    <p>● Secondary Text Color</p>
                                </div>
                                <div style={{ color: colors.text_muted || DEFAULT_THEME.text_muted }}>
                                    <p>● Muted Text Color</p>
                                </div>
                            </div>
                        </div>

                        {/* State Colors Preview */}
                        <div className="p-4 border border-white/10 rounded-lg space-y-3">
                            <p className="text-white text-sm font-medium">State Colors</p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="space-y-1">
                                    <div
                                        className="w-full h-6 rounded border border-white/10"
                                        style={{ backgroundColor: colors.state_success || DEFAULT_THEME.state_success }}
                                        title="Success"
                                    />
                                    <p className="text-gray-400 text-center">Success</p>
                                </div>
                                <div className="space-y-1">
                                    <div
                                        className="w-full h-6 rounded border border-white/10"
                                        style={{ backgroundColor: colors.state_warning || DEFAULT_THEME.state_warning }}
                                        title="Warning"
                                    />
                                    <p className="text-gray-400 text-center">Warning</p>
                                </div>
                                <div className="space-y-1">
                                    <div
                                        className="w-full h-6 rounded border border-white/10"
                                        style={{ backgroundColor: colors.state_error || DEFAULT_THEME.state_error }}
                                        title="Error"
                                    />
                                    <p className="text-gray-400 text-center">Error</p>
                                </div>
                                <div className="space-y-1">
                                    <div
                                        className="w-full h-6 rounded border border-white/10"
                                        style={{ backgroundColor: colors.state_info || DEFAULT_THEME.state_info }}
                                        title="Info"
                                    />
                                    <p className="text-gray-400 text-center">Info</p>
                                </div>
                            </div>
                        </div>

                        {/* Color Palette */}
                        <div className="p-4 border border-white/10 rounded-lg space-y-3">
                            <p className="text-white text-sm font-medium">Main Palette</p>

                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center space-y-1">
                                    <div
                                        className="w-full h-10 rounded-lg border border-white/10 shadow-sm"
                                        style={{ backgroundColor: colors.button_primary_from || colors.primary_color_dark }}
                                        title="Primary Dark"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Primary</p>
                                </div>
                                <div className="text-center space-y-1">
                                    <div
                                        className="w-full h-10 rounded-lg border border-white/10 shadow-sm"
                                        style={{ backgroundColor: colors.button_primary_to || colors.primary_color_light }}
                                        title="Primary Light"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Light</p>
                                </div>
                                <div className="text-center space-y-1">
                                    <div
                                        className="w-full h-10 rounded-lg border border-white/10 shadow-sm"
                                        style={{ backgroundColor: colors.backdrop_base || DEFAULT_THEME.backdrop_base }}
                                        title="Base"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Base</p>
                                </div>
                                <div className="text-center space-y-1">
                                    <div
                                        className="w-full h-10 rounded-lg border border-white/10 shadow-sm"
                                        style={{ backgroundColor: colors.backdrop_glow || DEFAULT_THEME.backdrop_glow }}
                                        title="Glow"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Glow</p>
                                </div>
                            </div>
                        </div>

                        {/* Card Preview */}
                        <div className="p-4 border border-white/10 rounded-lg space-y-3">
                            <p className="text-white text-sm font-medium">Card Preview</p>

                            <div
                                className="p-3 rounded-lg border-2 space-y-2"
                                style={{
                                    backgroundColor: colors.card_bg_dark || DEFAULT_THEME.card_bg_dark,
                                    borderColor: colors.card_border_light || DEFAULT_THEME.card_border_light
                                }}
                            >
                                <p style={{ color: colors.text_primary || DEFAULT_THEME.text_primary }} className="text-xs font-medium">
                                    Card Title
                                </p>
                                <p style={{ color: colors.text_secondary || DEFAULT_THEME.text_secondary }} className="text-xs">
                                    Card content with custom colors
                                </p>
                            </div>
                        </div>

                        {/* Color Palette Mini View */}
                        <div className="p-4 border border-white/10 rounded-lg">
                            <p className="text-white text-xs font-medium mb-3 uppercase tracking-wider">Color Palette</p>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center">
                                    <div
                                        className="w-full h-8 rounded-lg mb-1 border border-white/10"
                                        style={{ backgroundColor: colors.primary_color_dark }}
                                        title="Primary Dark"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Primary</p>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="w-full h-8 rounded-lg mb-1 border border-white/10"
                                        style={{ backgroundColor: colors.primary_color_light }}
                                        title="Primary Light"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Light</p>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="w-full h-8 rounded-lg mb-1 border border-white/10"
                                        style={{ backgroundColor: colors.backdrop_base }}
                                        title="Backdrop Base"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Base</p>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="w-full h-8 rounded-lg mb-1 border border-white/10"
                                        style={{ backgroundColor: colors.backdrop_glow }}
                                        title="Backdrop Glow"
                                    />
                                    <p className="text-xs text-gray-400 truncate">Glow</p>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving || Object.values(invalidFields).some(Boolean)}
                            className="w-full px-4 py-3 rounded-lg transition font-medium text-sm text-white"
                            style={{
                                background: `linear-gradient(135deg, ${colors.button_primary_from || colors.primary_color_dark}, ${colors.button_primary_to || colors.primary_color_light})`,
                                opacity: saving || Object.values(invalidFields).some(Boolean) ? 0.5 : 1,
                                cursor: saving || Object.values(invalidFields).some(Boolean) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Theme'}
                        </button>
                    </div>
                </div>
            </div>

            <ToastStack toasts={toasts} onDismiss={removeToast} />
        </div>
    )
}
