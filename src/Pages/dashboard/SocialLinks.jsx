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
    ExternalLink,
    Link2,
    GripVertical,
    Upload,
    Palette,
    Settings2,
} from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'

/* ── Fallback Icon Mapping ── */
import {
    Linkedin,
    Instagram,
    Youtube,
    Github,
    Twitter,
    Facebook,
    Globe,
    MessageCircle, // placeholder for WhatsApp/TikTok etc.
} from 'lucide-react'

const getLucideIcon = (name) => {
    switch (name?.toLowerCase()) {
        case 'linkedin': return Linkedin
        case 'instagram': return Instagram
        case 'youtube': return Youtube
        case 'github': return Github
        case 'twitter': return Twitter
        case 'facebook': return Facebook
        case 'tiktok': return MessageCircle // TikTok doesn't have a native Lucide icon
        default: return Globe
    }
}

const Card = ({ children, className = '' }) => (
    <div className={`relative group ${className}`}>
        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
        <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl h-full overflow-hidden">
            {children}
        </div>
    </div>
)

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
            <div className="relative bg-[#0a0a1a] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
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

const PLATFORM_PRESETS = {
    linkedin: { platform: 'LinkedIn', display_name: "Let's Connect", sub_text: 'on LinkedIn', icon: 'Linkedin', color: '#0A66C2', gradient: 'from-[#0A66C2] to-[#0077B5]' },
    instagram: { platform: 'Instagram', display_name: 'Instagram', sub_text: '@username', icon: 'Instagram', color: '#E4405F', gradient: 'from-[#833AB4] via-[#E4405F] to-[#FCAF45]' },
    youtube: { platform: 'YouTube', display_name: 'YouTube', sub_text: '@channel', icon: 'Youtube', color: '#FF0000', gradient: 'from-[#FF0000] to-[#CC0000]' },
    github: { platform: 'GitHub', display_name: 'GitHub', sub_text: '@username', icon: 'Github', color: '#24292e', gradient: 'from-[#333] to-[#24292e]' },
    tiktok: { platform: 'TikTok', display_name: 'TikTok', sub_text: '@username', icon: 'TikTok', color: '#000000', gradient: 'from-[#000000] via-[#25F4EE] to-[#FE2C55]' },
}

const normalizePlatformKey = (val) => String(val || '').toLowerCase().replace(/[^a-z]/g, '')
const getPlatformPreset = (platform) => PLATFORM_PRESETS[normalizePlatformKey(platform)] || null

const COLOR_PALETTE = ['#0A66C2', '#E4405F', '#FF0000', '#24292e', '#000000', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
const GRADIENT_PRESETS = [
    { label: 'LinkedIn', value: 'from-[#0A66C2] to-[#0077B5]' },
    { label: 'Instagram', value: 'from-[#833AB4] via-[#E4405F] to-[#FCAF45]' },
    { label: 'YouTube', value: 'from-[#FF0000] to-[#CC0000]' },
    { label: 'GitHub', value: 'from-[#333] to-[#24292e]' },
    { label: 'TikTok', value: 'from-[#000000] via-[#25F4EE] to-[#FE2C55]' },
    { label: 'Blue Purple', value: 'from-[#6366f1] to-[#a855f7]' },
]

const isValidUrl = (value) => { try { new URL(value); return true } catch { return false } }
const normalizeUrl = (value) => { if (!value) return ''; try { return new URL(value).toString() } catch { return '' } }

/* ── Premium Social Link Card ── */
const SocialLinkCard = ({ item, onEdit, onDelete, onToggleActive, onSetPrimary, isDragging, isDropTarget }) => {
    const [hovered, setHovered] = useState(false)
    const urlDomain = useMemo(() => {
        try { return new URL(item.url).hostname.replace('www.', '') }
        catch { return item.url.slice(0, 30) }
    }, [item.url])

    const IconComp = getLucideIcon(item.icon)
    const isCustomIcon = item.icon?.includes('/')

    return (
        <Card className={`${isDragging ? 'opacity-40 scale-95' : ''} ${isDropTarget ? 'ring-2 ring-indigo-500/80 ring-offset-2 ring-offset-[#0a0a1a]' : ''}`}>
            <div
                className="relative flex flex-col h-full p-5 gap-4 group/card"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Drag Handle Area */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-white/5 border-r border-white/5">
                    <GripVertical className="w-4 h-4 text-gray-500" />
                </div>

                {/* Subtle Background Glow */}
                <div
                    className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 80% 0%, ${item.color}25 0%, transparent 50%)` }}
                />

                <div className="pl-6 sm:pl-4 flex-1 flex flex-col relative z-10 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-lg truncate flex items-center gap-2">
                                {item.display_name}
                                {item.is_primary && <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 shrink-0" />}
                            </h3>
                            <p className="text-gray-400 text-sm truncate mt-0.5">{item.sub_text}</p>
                        </div>
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-xl" style={{ background: item.color || '#333' }}>
                            {isCustomIcon ? (
                                <img src={item.icon} alt={item.platform} className="w-7 h-7 object-contain" />
                            ) : (
                                <IconComp className="w-6 h-6 text-white" />
                            )}
                        </div>
                    </div>

                    {/* URL Pill */}
                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 w-fit max-w-full">
                        <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 hover:text-white truncate transition-colors">
                            {urlDomain}
                        </a>
                    </div>

                    {/* Actions Row */}
                    <div className="mt-auto pt-5 flex items-center justify-between gap-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border uppercase tracking-wider ${item.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                {item.is_active ? 'Active' : 'Hidden'}
                            </span>
                            <span className="text-[10px] text-gray-600 px-2 uppercase tracking-wider">#{item.sort_order}</span>
                        </div>

                        <div className="flex gap-1.5 opacity-60 group-hover/card:opacity-100 transition-opacity">
                            <button onClick={() => onSetPrimary(item)} title="Primary" className={`p-1.5 rounded-md border transition-colors ${item.is_primary ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                <Star className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onToggleActive(item)} title="Toggle Visibility" className="p-1.5 rounded-md border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                {item.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => onEdit(item)} title="Edit" className="p-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDelete(item.id)} title="Delete" className="p-1.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

/* ── Premium Social Link Form ── */
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

    const applyPreset = (preset) => {
        setForm(f => ({ ...f, platform: preset.platform, display_name: preset.display_name, sub_text: preset.sub_text, icon: preset.icon, color: preset.color, gradient: preset.gradient }))
        setColorDraft(preset.color)
    }

    const set = (key) => (e) => {
        let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        if (key === 'display_name') return setForm(f => ({ ...f, display_name: val, platform: f.platform || val }))
        if (key === 'platform') {
            setForm(f => ({ ...f, platform: val }))
            const p = getPlatformPreset(val); if (p) applyPreset(p)
            return
        }
        if (key === 'color') setColorDraft(val)
        if (key === 'sort_order') val = val === '' ? '' : Math.max(0, Number(val) || 0)
        setForm(f => ({ ...f, [key]: val }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIconFile(file)
        try { setIconPreview(URL.createObjectURL(file)) } catch { setIconPreview(null) }
    }

    const sectionTitle = (icon, text) => (
        <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest my-1">
            <div className="flex-1 h-px bg-white/6" />
            <span className="flex items-center gap-1.5">{icon} {text}</span>
            <div className="flex-1 h-px bg-white/6" />
        </div>
    )

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form, iconFile) }} className="p-5 sm:p-6 space-y-5">
            
            {sectionTitle(<Settings2 className="w-3 h-3" />, "Presets & Info")}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                        {Object.values(PLATFORM_PRESETS).map(preset => (
                            <button
                                key={preset.platform} type="button" onClick={() => applyPreset(preset)}
                                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${normalizePlatformKey(form.platform) === normalizePlatformKey(preset.platform) ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-200' : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                            >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                                {preset.platform}
                            </button>
                        ))}
                    </div>
                </div>

                <InputField label="Platform" value={form.platform} onChange={set('platform')} placeholder="e.g. LinkedIn" required />
                <InputField label="Display Name" value={form.display_name} onChange={set('display_name')} placeholder="e.g. Let's Connect" required />
                <InputField label="Sub Text" value={form.sub_text} onChange={set('sub_text')} placeholder="e.g. on LinkedIn" />
                <InputField label="URL" value={form.url} onChange={set('url')} placeholder="https://example.com" required />
            </div>

            {sectionTitle(<Palette className="w-3 h-3" />, "Styling")}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: Icon Upload */}
                <div className="space-y-1.5">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Icon</label>
                    <label className="flex items-center gap-3 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-500/40 hover:bg-white/4 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {iconPreview && iconPreview.includes('/') ? <img src={iconPreview} alt="preview" className="w-6 h-6 object-contain" /> : <Link2 className="w-5 h-5 text-gray-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-300 truncate">{iconFile ? iconFile.name : 'Upload Image'}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">Or use key below</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <input
                        type="text" value={form.icon} onChange={set('icon')} placeholder="Fallback key: e.g. Linkedin"
                        className="w-full bg-[#0d0d22] border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-600 text-xs outline-none focus:border-indigo-500/50"
                    />
                </div>

                {/* Right: Color Selection */}
                <div className="space-y-1.5">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Brand Color</label>
                    <div className="flex gap-2 flex-wrap">
                        {COLOR_PALETTE.slice(0, 8).map(color => (
                            <button key={color} type="button" onClick={() => { setColorDraft(color); setForm(f => ({ ...f, color })) }}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: color }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: form.color || '#333' }} />
                        <input
                            type="text" value={form.color} onChange={set('color')} placeholder="#HEX"
                            className="flex-1 bg-[#0d0d22] border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-600 text-sm outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Gradient Presets */}
            <div className="space-y-1.5">
                <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Gradient Overlay</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {GRADIENT_PRESETS.map(preset => (
                        <button key={preset.label} type="button" onClick={() => setForm(f => ({ ...f, gradient: preset.value }))}
                            className={`shrink-0 w-24 h-12 rounded-lg relative overflow-hidden border transition-all ${form.gradient === preset.value ? 'border-white ring-2 ring-indigo-500/40' : 'border-white/10 hover:border-white/30'}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${preset.value} opacity-80`} />
                            <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white drop-shadow-md">{preset.label}</span>
                        </button>
                    ))}
                </div>
                <input
                    type="text" value={form.gradient} onChange={set('gradient')} placeholder="e.g. from-[#333] to-[#000]"
                    className="w-full bg-[#0d0d22] border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-600 text-sm outline-none"
                />
            </div>

            {sectionTitle(<ExternalLink className="w-3 h-3" />, "Visibility & Order")}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Sort Order" type="number" value={form.sort_order} onChange={set('sort_order')} placeholder="Empty = bottom" min="0" />
                <div className="space-y-3 pt-6">
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={form.is_primary} onChange={set('is_primary')} className="accent-indigo-500 w-4 h-4 rounded" />
                        Mark as Primary Link
                    </label>
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="accent-indigo-500 w-4 h-4 rounded" />
                        Active & Visible
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={uploading} className="relative group/s">
                    <div className="absolute -inset-0.5 rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                    <div className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                        {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                        <span className="text-sm font-medium text-gray-200">{uploading ? 'Saving...' : initial ? 'Update' : 'Create'}</span>
                    </div>
                </button>
            </div>
        </form>
    )
}

/* ── Main Dashboard ── */
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
        const { data, error } = await supabase.from('social_links').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
        if (error) console.error('Fetch error:', error)
        setItems(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchItems() }, [])

    const getNextSortOrder = () => items.reduce((max, item) => Math.max(max, Number(item.sort_order || 0)), 0) + 1
    const resolveSortOrder = (value) => (value === '' || value === null) ? getNextSortOrder() : Math.max(0, Number(value) || 0)

    const clearOtherPrimary = async (currentId = null) => {
        let q = supabase.from('social_links').update({ is_primary: false }).eq('is_primary', true)
        if (currentId) q = q.neq('id', currentId)
        await q
    }

    const validateForm = (form) => {
        if (!form.platform?.trim()) throw new Error('Platform is required')
        if (!form.display_name?.trim()) throw new Error('Display name is required')
        if (!form.url?.trim()) throw new Error('URL is required')
        if (!isValidUrl(form.url)) throw new Error('URL is not valid')
        return { ...form, platform: form.platform.trim(), display_name: form.display_name.trim(), sub_text: form.sub_text.trim(), url: normalizeUrl(form.url.trim()), icon: form.icon.trim(), color: form.color.trim(), gradient: form.gradient.trim() }
    }

    const uploadIcon = async (file) => {
        if (!file) return null
        const fileName = `social-icons/${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('project-images').upload(fileName, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('project-images').getPublicUrl(fileName)
        return data.publicUrl
    }

    const persistOrder = async (orderedItems) => {
        const updates = orderedItems.map((item, i) => supabase.from('social_links').update({ sort_order: i + 1 }).eq('id', item.id))
        const results = await Promise.all(updates)
        if (results.some(r => r.error)) throw new Error('Reordering failed')
        setItems(orderedItems.map((item, i) => ({ ...item, sort_order: i + 1 })))
    }

    const handleDragStart = (id) => setDraggingId(id)
    const handleDragOver = (e) => e.preventDefault()
    const handleDragEnter = (id) => { if (draggingId && draggingId !== id) setDropTargetId(id) }
    const handleDragLeave = (id, e) => { if (!e.currentTarget.contains(e.relatedTarget) && dropTargetId === id) setDropTargetId(null) }

    const handleDrop = async (targetId) => {
        if (!draggingId || draggingId === targetId) return
        const srcIdx = items.findIndex(i => i.id === draggingId)
        const tgtIdx = items.findIndex(i => i.id === targetId)
        if (srcIdx === -1 || tgtIdx === -1) return

        const nextItems = [...items]
        const [moved] = nextItems.splice(srcIdx, 1)
        nextItems.splice(tgtIdx, 0, moved)

        try {
            await persistOrder(nextItems)
        } catch (err) {
            pushToast('error', 'Failed to reorder')
        } finally {
            setDraggingId(null); setDropTargetId(null)
        }
    }

    const handleCreate = async (form, iconFile) => {
        setUploading(true)
        try {
            const normalized = validateForm(form)
            const sortOrder = resolveSortOrder(normalized.sort_order)
            if (normalized.is_primary) await clearOtherPrimary()

            let iconValue = normalized.icon || null
            if (iconFile) {
                const publicUrl = await uploadIcon(iconFile)
                if (publicUrl) iconValue = publicUrl
            }

            const { error } = await supabase.from('social_links').insert({ ...normalized, icon: iconValue, sort_order: sortOrder })
            if (error) throw error

            setShowCreate(false); pushToast('success', 'Created!'); fetchItems()
        } catch (err) {
            pushToast('error', err.message || 'Failed to create')
        } finally { setUploading(false) }
    }

    const handleEdit = async (form, iconFile) => {
        if (!editItem) return
        setUploading(true)
        try {
            const normalized = validateForm(form)
            const sortOrder = resolveSortOrder(normalized.sort_order)
            if (normalized.is_primary) await clearOtherPrimary(editItem.id)

            let iconValue = normalized.icon || null
            if (iconFile) {
                const publicUrl = await uploadIcon(iconFile)
                if (publicUrl) iconValue = publicUrl
            }

            const { error } = await supabase.from('social_links').update({ ...normalized, icon: iconValue, sort_order: sortOrder }).eq('id', editItem.id)
            if (error) throw error

            setEditItem(null); pushToast('success', 'Updated!'); fetchItems()
        } catch (err) {
            pushToast('error', err.message || 'Failed to update')
        } finally { setUploading(false) }
    }

    const deleteItem = async (id) => {
        if (!confirm('Delete this social link?')) return
        const { error } = await supabase.from('social_links').delete().eq('id', id)
        if (error) { pushToast('error', 'Failed to delete'); return }
        pushToast('success', 'Deleted!'); fetchItems()
    }

    const toggleActive = async (item) => {
        const { error } = await supabase.from('social_links').update({ is_active: !item.is_active }).eq('id', item.id)
        if (error) { pushToast('error', 'Failed to update'); return }
        pushToast('success', 'Status updated!'); fetchItems()
    }

    const setPrimary = async (item) => {
        try {
            await clearOtherPrimary(item.id)
            const { error } = await supabase.from('social_links').update({ is_primary: true }).eq('id', item.id)
            if (error) throw error
            pushToast('success', 'Primary link updated!'); fetchItems()
        } catch (err) { pushToast('error', 'Failed to set primary') }
    }

    const activePrimary = useMemo(() => items.find((i) => i.is_primary), [items])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-1 rounded-xl blur-md opacity-60" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                        <div className="relative w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                            <Link2 className="w-5 h-5 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Social Links</h1>
                        {!loading && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[11px] text-gray-400 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5">
                                    {items.length} links
                                </span>
                                {activePrimary && (
                                    <span className="flex items-center gap-1 text-[11px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2.5 py-0.5">
                                        <Star className="w-3 h-3 fill-current" /> {activePrimary.display_name}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={() => setShowCreate(true)} className="relative group shrink-0">
                    <div className="absolute -inset-0.5 rounded-xl opacity-50 blur group-hover:opacity-90 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                    <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-gray-200">New Link</span>
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
                <div className="h-40 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            ) : items.length === 0 ? (
                <div className="py-24 text-center rounded-2xl border border-white/10 bg-white/5 border-dashed">
                    <Link2 className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No social links yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
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
