import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../supabase'
import { useToast } from '../../hooks/useToast'
import ToastStack from '../../components/ToastStack'
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Eye,
    EyeOff,
    Star,
    StarOff,
    GripVertical,
    ExternalLink,
    Link2,
} from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'

const Card = ({ children, className = '' }) => (
    <div className={`relative group ${className}`}>
        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
            {children}
        </div>
    </div>
)

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
            <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    </div>
)

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false, min }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
    </div>
)

const ICON_HINTS = ['Linkedin', 'Instagram', 'Youtube', 'Github', 'TikTok', 'ExternalLink']

const PLATFORM_PRESETS = {
    linkedin: {
        platform: 'LinkedIn',
        display_name: "Let's Connect",
        sub_text: 'on LinkedIn',
        icon: 'Linkedin',
        color: '#0A66C2',
        gradient: 'from-[#0A66C2] to-[#0077B5]',
    },
    instagram: {
        platform: 'Instagram',
        display_name: 'Instagram',
        sub_text: '@instagram',
        icon: 'Instagram',
        color: '#E4405F',
        gradient: 'from-[#833AB4] via-[#E4405F] to-[#FCAF45]',
    },
    youtube: {
        platform: 'YouTube',
        display_name: 'Youtube',
        sub_text: '@youtube',
        icon: 'Youtube',
        color: '#FF0000',
        gradient: 'from-[#FF0000] to-[#CC0000]',
    },
    github: {
        platform: 'GitHub',
        display_name: 'Github',
        sub_text: '@github',
        icon: 'Github',
        color: '#24292e',
        gradient: 'from-[#333] to-[#24292e]',
    },
    tiktok: {
        platform: 'TikTok',
        display_name: 'Tiktok',
        sub_text: '@tiktok',
        icon: 'TikTok',
        color: '#000000',
        gradient: 'from-[#000000] via-[#25F4EE] to-[#FE2C55]',
    },
}

const normalizePlatformKey = (value) =>
    String(value || '')
        .toLowerCase()
        .replace(/[^a-z]/g, '')

const getPlatformPreset = (platform) => PLATFORM_PRESETS[normalizePlatformKey(platform)] || null

const COLOR_PALETTE = [
    '#0A66C2',
    '#E4405F',
    '#FF0000',
    '#24292e',
    '#000000',
    '#8b5cf6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
]

const GRADIENT_PRESETS = [
    { label: 'LinkedIn', value: 'from-[#0A66C2] to-[#0077B5]' },
    { label: 'Instagram', value: 'from-[#833AB4] via-[#E4405F] to-[#FCAF45]' },
    { label: 'YouTube', value: 'from-[#FF0000] to-[#CC0000]' },
    { label: 'GitHub', value: 'from-[#333] to-[#24292e]' },
    { label: 'TikTok', value: 'from-[#000000] via-[#25F4EE] to-[#FE2C55]' },
    { label: 'Blue Purple', value: 'from-[#6366f1] to-[#a855f7]' },
    { label: 'Cyan Emerald', value: 'from-[#06b6d4] to-[#10b981]' },
    { label: 'Orange Pink', value: 'from-[#f59e0b] to-[#ec4899]' },
]


const normalizeUrl = (value) => {
    if (!value) return ''
    try {
        return new URL(value).toString()
    } catch {
        return ''
    }
}

const isValidUrl = (value) => {
    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}

const SocialLinkCard = ({ item, onEdit, onDelete, onToggleActive, onSetPrimary, isDragging, isDropTarget }) => {
    const getShortUrl = (url) => {
        try {
            const urlObj = new URL(url)
            return urlObj.hostname.replace('www.', '')
        } catch {
            return url.slice(0, 30) + (url.length > 30 ? '...' : '')
        }
    }

    const getShortGradient = (gradient) => {
        if (!gradient) return '-'
        return gradient.length > 35 ? gradient.slice(0, 32) + '...' : gradient
    }

    const getShortIcon = (icon) => {
        if (!icon) return 'Custom Icon'
        // If it's a URL, extract filename
        if (icon.includes('/')) {
            const filename = icon.split('/').pop()
            return filename.length > 25 ? filename.slice(0, 22) + '...' : filename
        }
        // If it's text, truncate if needed
        return icon.length > 25 ? icon.slice(0, 22) + '...' : icon
    }

    return (
        <Card className={`${isDragging ? 'opacity-60 scale-[0.99]' : ''} ${isDropTarget ? 'ring-2 ring-indigo-400/70 ring-offset-2 ring-offset-transparent shadow-[0_0_0_1px_rgba(129,140,248,0.25)]' : ''}`}>
            <div className="relative p-4 flex flex-col h-full gap-4">
                {isDropTarget && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-indigo-400/70 bg-indigo-500/10 pointer-events-none flex items-center justify-center text-indigo-200 text-xs font-medium tracking-widest uppercase">
                        Drop to place here
                    </div>
                )}

                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-white text-sm truncate">{item.display_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap ${item.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                                {item.is_active ? 'Active' : 'Hidden'}
                            </span>
                            {item.is_primary ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] border bg-yellow-500/10 border-yellow-500/20 text-yellow-300 whitespace-nowrap">
                                    Primary
                                </span>
                            ) : null}
                        </div>
                        <p className="text-gray-500 text-xs truncate">{item.platform} · /{getShortIcon(item.icon)}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => onSetPrimary(item)}
                            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-yellow-300 hover:border-yellow-300/30 transition-colors"
                            title={item.is_primary ? 'Primary link' : 'Set as primary'}
                        >
                            {item.is_primary ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onToggleActive(item)}
                            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                            title={item.is_active ? 'Deactivate' : 'Activate'}
                        >
                            {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onEdit(item)}
                            className="p-2 rounded-lg border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest">
                    <GripVertical className="w-4 h-4 text-gray-600" />
                    Drag to reorder
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0" style={{ background: item.color ? `${item.color}15` : undefined }}>
                            <Link2 className="w-5 h-5" style={{ color: item.color || '#9ca3af' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-200 truncate" title={item.url}>{getShortUrl(item.url)}</p>
                            <p className="text-xs text-gray-500 truncate">{item.sub_text || 'No subtitle'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 whitespace-nowrap">Order: {item.sort_order ?? 0}</span>
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 whitespace-nowrap">Color: {item.color || '-'}</span>
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 truncate" title={item.gradient || '-'}>Gradient: {getShortGradient(item.gradient)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                        title={item.url}
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Link
                    </a>
                    <div className="text-[11px] text-gray-500 uppercase tracking-widest truncate" title={item.icon || 'Custom Icon'}>{getShortIcon(item.icon)}</div>
                </div>
            </div>
        </Card>
    )
}

const SocialLinkForm = ({ initial, onSubmit, onCancel, uploading }) => {
    const [form, setForm] = useState({
        platform: initial?.platform || '',
        display_name: initial?.display_name || '',
        sub_text: initial?.sub_text || '',
        url: initial?.url || '',
        icon: initial?.icon || '',
        color: initial?.color || '',
        gradient: initial?.gradient || '',
        sort_order: initial?.sort_order ?? '',
        is_primary: initial?.is_primary ?? false,
        is_active: initial?.is_active ?? true,
    })
    const [colorDraft, setColorDraft] = useState(initial?.color || '#6366f1')
    const [iconFile, setIconFile] = useState(null)
    const [iconPreview, setIconPreview] = useState(initial?.icon || null)

    useEffect(() => {
        setColorDraft(form.color || '#6366f1')
    }, [form.color])

    const applyPlatformPreset = (platform) => {
        const preset = getPlatformPreset(platform)
        if (!preset) return

        setForm((current) => ({
            ...current,
            platform: preset.platform,
            display_name: preset.display_name,
            sub_text: preset.sub_text,
            icon: preset.icon,
            color: preset.color,
            gradient: preset.gradient,
        }))
        setColorDraft(preset.color)
    }

    const set = (key) => (event) => {
        const value = key === 'is_primary' || key === 'is_active' ? event.target.checked : event.target.value

        if (key === 'display_name') {
            setForm((current) => ({
                ...current,
                display_name: value,
                platform: current.platform || value,
            }))
            return
        }

        if (key === 'platform') {
            setForm((current) => ({ ...current, platform: value }))
            applyPlatformPreset(value)
            return
        }

        if (key === 'color') {
            setColorDraft(value)
            setForm((current) => ({ ...current, color: value }))
            return
        }

        if (key === 'gradient') {
            setForm((current) => ({ ...current, gradient: value }))
            return
        }

        if (key === 'sort_order') {
            const numValue = value === '' ? '' : Math.max(0, Number(value) || 0)
            setForm((current) => ({ ...current, [key]: numValue }))
            return
        }

        setForm((current) => ({ ...current, [key]: value }))
    }

    const livePreview = {
        platform: form.platform || 'Platform',
        displayName: form.display_name || 'Display name',
        subText: form.sub_text || 'Sub text preview',
        color: form.color || '#6366f1',
        gradient: form.gradient || 'from-[#6366f1] to-[#a855f7]',
    }

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return
        setIconFile(file)
        try { setIconPreview(URL.createObjectURL(file)) } catch { setIconPreview(null) }
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit(form, iconFile)
            }}
            className="p-5 sm:p-6 space-y-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Platform Presets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                        {Object.values(PLATFORM_PRESETS).map((preset) => {
                            const active = normalizePlatformKey(form.platform) === normalizePlatformKey(preset.platform)
                            return (
                                <button
                                    key={preset.platform}
                                    type="button"
                                    onClick={() => {
                                        setForm((current) => ({
                                            ...current,
                                            platform: preset.platform,
                                            display_name: preset.display_name,
                                            sub_text: preset.sub_text,
                                            icon: preset.icon,
                                            color: preset.color,
                                            gradient: preset.gradient,
                                        }))
                                        setColorDraft(preset.color)
                                    }}
                                    className={`rounded-xl border px-3 py-2 text-left transition-all duration-200 ${active ? 'border-indigo-400/50 bg-indigo-500/10' : 'border-white/10 hover:border-white/25 bg-white/5'}`}
                                >
                                    <span className="block text-sm font-medium text-white">{preset.platform}</span>
                                    <span className="block text-[11px] text-gray-400 truncate">{preset.gradient}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <InputField label="Platform" value={form.platform} onChange={set('platform')} placeholder="e.g. LinkedIn" required />
                <InputField label="Display Name" value={form.display_name} onChange={set('display_name')} placeholder="e.g. Let's Connect" required />
                <InputField label="Sub Text" value={form.sub_text} onChange={set('sub_text')} placeholder="e.g. on LinkedIn" />
                <InputField label="URL" value={form.url} onChange={set('url')} placeholder="https://example.com" required />

                <div className="sm:col-span-2">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Icon</label>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {iconPreview ? (
                                <img src={iconPreview} alt="icon preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-500 text-sm">No image</div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex gap-3 items-center">
                                <label className="inline-flex items-center bg-indigo-600 text-white rounded-full px-4 py-2 text-sm cursor-pointer">
                                    Choose File
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                <div className="text-sm text-gray-300">{iconFile ? iconFile.name : (initial?.icon ? 'Using existing icon' : 'No file chosen')}</div>
                            </div>

                            <div className="mt-3">
                                <InputField label="Or Icon Key (fallback)" value={form.icon} onChange={set('icon')} placeholder="e.g. Linkedin" />
                                <p className="text-[11px] text-gray-500 mt-2">If you upload an image it will be used as the icon; otherwise the frontend icon mapping will use the icon key.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <InputField label="Sort Order" type="number" value={form.sort_order} onChange={set('sort_order')} placeholder="Leave empty to place at the bottom" min="0" />
                <p className="-mt-2 text-[11px] text-gray-500 sm:col-span-2">Optional. If left empty, the new social link will be placed after the current last order.</p>



                <div className="sm:col-span-2 space-y-3">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Color</label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {COLOR_PALETTE.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    setColorDraft(color)
                                    setForm((current) => ({ ...current, color }))
                                }}
                                className={`h-10 rounded-xl border transition-all duration-200 ${form.color === color ? 'border-white ring-2 ring-indigo-400/40 scale-[1.03]' : 'border-white/10 hover:border-white/25'}`}
                                style={{ backgroundColor: color }}
                                title={color}
                                aria-label={`Choose color ${color}`}
                            />
                        ))}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-4 items-start">
                            <div className="w-full">
                                <HexColorPicker
                                    color={colorDraft}
                                    onChange={(value) => {
                                        setColorDraft(value)
                                        setForm((current) => ({ ...current, color: value }))
                                    }}
                                    className="!w-full !h-[220px]"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl border border-white/10" style={{ backgroundColor: form.color || '#6366f1' }} />
                                    <HexColorInput
                                        color={form.color || '#6366f1'}
                                        onChange={(value) => {
                                            setColorDraft(value)
                                            setForm((current) => ({ ...current, color: value }))
                                        }}
                                        className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-3 py-2.5 text-gray-200 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all uppercase"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500">Pick a color from the palette, use the picker, or type a hex value.</p>
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-gray-500 uppercase tracking-widest">Quick picks</span>
                                    <div className="flex flex-wrap gap-2">
                                        {COLOR_PALETTE.slice(0, 6).map((color) => (
                                            <button
                                                key={`quick-${color}`}
                                                type="button"
                                                onClick={() => {
                                                    setColorDraft(color)
                                                    setForm((current) => ({ ...current, color }))
                                                }}
                                                className="h-8 w-8 rounded-full border border-white/10"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                                aria-label={`Quick select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Gradient</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {GRADIENT_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => setForm((current) => ({ ...current, gradient: preset.value }))}
                                className={`relative overflow-hidden rounded-xl border px-3 py-2 text-left transition-all duration-200 ${form.gradient === preset.value ? 'border-white ring-2 ring-indigo-400/40 scale-[1.02]' : 'border-white/10 hover:border-white/25'}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${preset.value} opacity-30`} />
                                <span className="relative block text-sm font-medium text-white">{preset.label}</span>
                                <span className="relative block text-[11px] text-gray-300 truncate">{preset.value}</span>
                            </button>
                        ))}
                    </div>
                    <div className={`h-20 rounded-xl bg-gradient-to-r ${form.gradient || 'from-[#6366f1] to-[#a855f7]'} border border-white/10 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                        <div className="relative h-full flex items-center justify-between px-4">
                            <span className="text-sm font-medium text-white">Live Gradient Preview</span>
                            <span className="text-[11px] text-white/70 uppercase tracking-widest">{form.gradient || 'Default'}</span>
                        </div>
                    </div>
                    <InputField label="Custom Gradient" value={form.gradient} onChange={set('gradient')} placeholder="from-[#0A66C2] to-[#0077B5]" />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Icon Hint</label>
                    <div className="flex flex-wrap gap-2">
                        {ICON_HINTS.map((hint) => (
                            <button
                                key={hint}
                                type="button"
                                onClick={() => setForm((current) => ({ ...current, icon: hint }))}
                                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${form.icon === hint ? 'border-indigo-400/40 text-indigo-200 bg-indigo-500/10' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}
                            >
                                {hint}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-500">Use the same icon key as the frontend icon mapping.</p>
                </div>

                <label className="flex items-center gap-3 sm:col-span-2 text-sm text-gray-300">
                    <input type="checkbox" checked={form.is_primary} onChange={set('is_primary')} className="accent-indigo-500 w-4 h-4" />
                    Mark as primary social link
                </label>

                <label className="flex items-center gap-3 sm:col-span-2 text-sm text-gray-300">
                    <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="accent-indigo-500 w-4 h-4" />
                    Active and visible on portfolio
                </label>

                <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Live Preview</label>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${livePreview.gradient}`} />
                            <div className="relative flex items-center gap-4 min-w-0">
                                <div className="relative flex items-center justify-center shrink-0">
                                    <div className="absolute inset-0 opacity-25 rounded-md" style={{ backgroundColor: livePreview.color }} />
                                    <div className="relative p-2 rounded-md">
                                        <Link2 className="w-6 h-6" style={{ color: livePreview.color }} />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-bold text-white truncate">{livePreview.displayName}</p>
                                    <p className="text-sm text-gray-400 truncate">{livePreview.subText}</p>
                                    <p className="text-[11px] text-gray-500 mt-1">{livePreview.platform}</p>
                                </div>
                            </div>
                            <ExternalLink className="relative w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={uploading} className="relative group/s">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-5 py-2 bg-[#030014] rounded-xl border border-white/10">
                        {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                        <span className="text-sm text-gray-200">{uploading ? 'Saving...' : 'Save Social Link'}</span>
                    </div>
                </button>
            </div>
        </form>
    )
}

export default function SocialLinksDashboard() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [draggingId, setDraggingId] = useState(null)
    const [dropTargetId, setDropTargetId] = useState(null)
    const { toasts, pushToast, removeToast } = useToast()

    const fetchItems = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('social_links')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching social links:', error)
        }

        setItems(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const getNextSortOrder = () => {
        const highestSortOrder = items.reduce((highest, item) => {
            const currentSortOrder = Number(item.sort_order || 0)
            return currentSortOrder > highest ? currentSortOrder : highest
        }, 0)

        return highestSortOrder + 1
    }

    const resolveSortOrder = (value) => {
        if (value === '' || value === null || value === undefined) {
            return getNextSortOrder()
        }

        const parsedSortOrder = Number(value)
        return Number.isNaN(parsedSortOrder) ? getNextSortOrder() : Math.max(0, parsedSortOrder)
    }

    const clearOtherPrimary = async (currentId = null) => {
        let query = supabase
            .from('social_links')
            .update({ is_primary: false })
            .eq('is_primary', true)

        if (currentId) {
            query = query.neq('id', currentId)
        }

        const { error } = await query
        if (error) throw error
    }

    const validateForm = (form) => {
        if (!form.platform?.trim()) throw new Error('Platform is required')
        if (!form.display_name?.trim()) throw new Error('Display name is required')
        if (!form.url?.trim()) throw new Error('URL is required')
        if (!isValidUrl(form.url)) throw new Error('URL is not valid')
        return {
            ...form,
            platform: form.platform.trim(),
            display_name: form.display_name.trim(),
            sub_text: form.sub_text.trim(),
            url: normalizeUrl(form.url.trim()),
            icon: form.icon.trim(),
            color: form.color.trim(),
            gradient: form.gradient.trim(),
        }
    }

    const uploadIcon = async (file) => {
        if (!file) return null
        const fileName = `social-icons/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('project-images').upload(fileName, file, {
            upsert: true,
        })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('project-images').getPublicUrl(fileName)
        return data.publicUrl
    }

    const persistOrder = async (orderedItems) => {
        const updates = orderedItems.map((item, index) =>
            supabase
                .from('social_links')
                .update({ sort_order: index + 1 })
                .eq('id', item.id)
        )

        const results = await Promise.all(updates)
        const failed = results.find((result) => result.error)
        if (failed?.error) {
            throw failed.error
        }

        setItems(orderedItems.map((item, index) => ({ ...item, sort_order: index + 1 })))
    }

    const handleDragStart = (id) => setDraggingId(id)
    const handleDragOver = (event) => event.preventDefault()

    const handleDragEnter = (id) => {
        if (draggingId && draggingId !== id) {
            setDropTargetId(id)
        }
    }

    const handleDragLeave = (id, event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            if (dropTargetId === id) {
                setDropTargetId(null)
            }
        }
    }

    const handleDrop = async (targetId) => {
        if (!draggingId || draggingId === targetId) return

        const currentItems = [...items]
        const sourceIndex = currentItems.findIndex((item) => item.id === draggingId)
        const targetIndex = currentItems.findIndex((item) => item.id === targetId)

        if (sourceIndex === -1 || targetIndex === -1) return

        const nextItems = [...currentItems]
        const [movedItem] = nextItems.splice(sourceIndex, 1)
        nextItems.splice(targetIndex, 0, movedItem)

        try {
            await persistOrder(nextItems)
        } catch (error) {
            console.error('Error reordering social links:', error)
            alert(error.message || 'Failed to reorder social links')
        } finally {
            setDraggingId(null)
            setDropTargetId(null)
        }
    }

    const handleCreate = async (form, iconFile) => {
        setUploading(true)
        try {
            const normalized = validateForm(form)
            const sortOrder = resolveSortOrder(normalized.sort_order)

            if (normalized.is_primary) {
                await clearOtherPrimary()
            }

            // If an image file was provided, upload and use its public URL as icon
            let iconValue = normalized.icon || null
            if (iconFile) {
                try {
                    const publicUrl = await uploadIcon(iconFile)
                    if (publicUrl) iconValue = publicUrl
                } catch (err) {
                    console.error('Icon upload failed:', err)
                    throw new Error('Failed to upload icon image')
                }
            }

            const { error } = await supabase.from('social_links').insert({
                platform: normalized.platform,
                display_name: normalized.display_name,
                sub_text: normalized.sub_text || null,
                url: normalized.url,
                icon: iconValue || null,
                color: normalized.color || null,
                gradient: normalized.gradient || null,
                is_primary: normalized.is_primary,
                sort_order: sortOrder,
                is_active: normalized.is_active,
            })

            if (error) throw error

            setShowCreate(false)
            pushToast('success', 'Social link created successfully!')
            fetchItems()
        } catch (error) {
            console.error('Error creating social link:', error)
            pushToast('error', error.message || 'Failed to create social link')
        } finally {
            setUploading(false)
        }
    }

    const handleEdit = async (form, iconFile) => {
        if (!editItem) return
        setUploading(true)
        try {
            const normalized = validateForm(form)
            const sortOrder = resolveSortOrder(normalized.sort_order)

            if (normalized.is_primary) {
                await clearOtherPrimary(editItem.id)
            }

            let iconValue = normalized.icon || null
            if (iconFile) {
                try {
                    const publicUrl = await uploadIcon(iconFile)
                    if (publicUrl) iconValue = publicUrl
                } catch (err) {
                    console.error('Icon upload failed:', err)
                    throw new Error('Failed to upload icon image')
                }
            }

            const { error } = await supabase
                .from('social_links')
                .update({
                    platform: normalized.platform,
                    display_name: normalized.display_name,
                    sub_text: normalized.sub_text || null,
                    url: normalized.url,
                    icon: iconValue || null,
                    color: normalized.color || null,
                    gradient: normalized.gradient || null,
                    is_primary: normalized.is_primary,
                    sort_order: sortOrder,
                    is_active: normalized.is_active,
                })
                .eq('id', editItem.id)

            if (error) throw error

            setEditItem(null)
            pushToast('success', 'Social link updated successfully!')
            fetchItems()
        } catch (error) {
            console.error('Error updating social link:', error)
            pushToast('error', error.message || 'Failed to update social link')
        } finally {
            setUploading(false)
        }
    }

    const deleteItem = async (id) => {
        if (!confirm('Delete this social link?')) return
        const { error } = await supabase.from('social_links').delete().eq('id', id)
        if (error) {
            pushToast('error', error.message || 'Failed to delete social link')
            return
        }
        pushToast('success', 'Social link deleted successfully!')
        fetchItems()
    }

    const toggleActive = async (item) => {
        const { error } = await supabase
            .from('social_links')
            .update({ is_active: !item.is_active })
            .eq('id', item.id)

        if (error) {
            pushToast('error', error.message || 'Failed to update status')
            return
        }

        pushToast('success', 'Social link status updated!')
        fetchItems()
    }

    const setPrimary = async (item) => {
        try {
            await clearOtherPrimary(item.id)
            const { error } = await supabase
                .from('social_links')
                .update({ is_primary: true })
                .eq('id', item.id)

            if (error) throw error

            pushToast('success', 'Primary social link updated!')
            fetchItems()
        } catch (error) {
            console.error('Error updating primary social link:', error)
            pushToast('error', error.message || 'Failed to set primary social link')
        }
    }

    const activePrimary = useMemo(() => items.find((item) => item.is_primary), [items])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
                        <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
                            <Link2 className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Social Links</h1>
                        <p className="text-gray-500 text-xs">{loading ? 'Loading...' : `${items.length} links total${activePrimary ? ` · primary: ${activePrimary.display_name}` : ''}`}</p>
                    </div>
                </div>

                <button onClick={() => setShowCreate(true)} className="relative group shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-200">New Social Link</span>
                    </div>
                </button>
            </div>

            {showCreate && (
                <Modal title="Add Social Link" onClose={() => setShowCreate(false)}>
                    <SocialLinkForm initial={null} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} uploading={uploading} />
                </Modal>
            )}

            {editItem && (
                <Modal title="Edit Social Link" onClose={() => setEditItem(null)}>
                    <SocialLinkForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} uploading={uploading} />
                </Modal>
            )}

            {loading ? (
                <Card>
                    <div className="p-16 text-center">
                        <Link2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Loading social links...</p>
                    </div>
                </Card>
            ) : items.length === 0 ? (
                <Card>
                    <div className="p-16 text-center">
                        <Link2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No social links yet.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(item.id)}
                            onDragEnd={() => setDraggingId(null)}
                            onDragEnter={() => handleDragEnter(item.id)}
                            onDragLeave={(event) => handleDragLeave(item.id, event)}
                            className="relative"
                        >
                            <SocialLinkCard
                                item={item}
                                onEdit={setEditItem}
                                onDelete={deleteItem}
                                onToggleActive={toggleActive}
                                onSetPrimary={setPrimary}
                                isDragging={draggingId === item.id}
                                isDropTarget={dropTargetId === item.id}
                            />
                        </div>
                    ))}
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={removeToast} />
        </div>
    )
}


