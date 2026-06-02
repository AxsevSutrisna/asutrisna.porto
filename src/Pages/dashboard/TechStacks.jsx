import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { supabase } from '../../supabase'
import { useToast } from '../../hooks/useToast'
import ToastStack from '../../components/ToastStack'
import {
    Boxes,
    Plus,
    Pencil,
    Trash2,
    Upload,
    ImageIcon,
    X,
    Eye,
    EyeOff,
    GripVertical,
} from 'lucide-react'

const Card = ({ children, className = '' }) => (
    <div className={`relative group ${className}`}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
            {children}
        </div>
    </div>
)

const Modal = ({ title, onClose, children }) =>
    ReactDOM.createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-20 pointer-events-none" />
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
        </div>,
        document.body
    )


const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={type === 'number' ? '0' : undefined}
            className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
    </div>
)

const toSlug = (value) =>
    String(value || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

const validateTechStackForm = (form, iconFile, initial) => {
    const errors = {}

    if (!String(form.name || '').trim()) {
        errors.name = 'Name wajib diisi.'
    }

    const hasIcon = Boolean(iconFile || initial?.icon_url)
    if (!hasIcon) {
        errors.icon = 'Icon wajib diupload.'
    }

    return errors
}

const FieldError = ({ message }) =>
    message ? <p className="mt-2 text-sm text-red-400">{message}</p> : null

const TechStackCard = ({ item, onEdit, onDelete, onToggleActive }) => (
    <Card>
        <div className="p-4 flex flex-col h-full gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${item.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                            {item.is_active ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                    <p className="text-gray-500 text-xs">/{item.slug}</p>
                </div>

                <div className="flex gap-2">
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

            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                    {item.icon_url ? (
                        <img src={item.icon_url} alt={item.name} className="w-14 h-14 object-contain" />
                    ) : (
                        <ImageIcon className="w-6 h-6 text-gray-600" />
                    )}
                </div>

                <div className="space-y-1 text-sm">
                    <p className="text-gray-300">{item.category || 'General'}</p>
                    <p className="text-gray-500 text-xs">Order: {item.sort_order ?? 0}</p>
                    {item.description ? <p className="text-gray-400 text-xs line-clamp-2">{item.description}</p> : null}
                </div>
            </div>
        </div>
    </Card>
)

const TechStackForm = ({ initial, onSubmit, onCancel, uploading }) => {
    const [form, setForm] = useState({
        name: initial?.name || '',
        slug: initial?.slug || '',
        category: initial?.category || '',
        description: initial?.description || '',
        sort_order: initial?.sort_order ?? '',
        is_active: initial?.is_active ?? true,
    })
    const [iconFile, setIconFile] = useState(null)
    const [preview, setPreview] = useState(initial?.icon_url || null)
    const [autoGenerateSlug, setAutoGenerateSlug] = useState(!initial)
    const [errors, setErrors] = useState({})

    const set = (key) => (event) => {
        const value = key === 'is_active' ? event.target.checked : event.target.value

        if (key === 'name') {
            setForm((current) => ({
                ...current,
                name: value,
                slug: autoGenerateSlug ? toSlug(value) : current.slug,
            }))
            setErrors((current) => {
                if (!current.name) return current
                const next = { ...current }
                delete next.name
                return next
            })
            return
        }

        if (key === 'slug') {
            setForm((current) => ({ ...current, slug: value }))
            setAutoGenerateSlug(!value)
            return
        }

        if (key === 'sort_order') {
            const numValue = value === '' ? '' : Math.max(0, Number(value) || 0)
            setForm((current) => ({ ...current, [key]: numValue }))
            return
        }

        setForm((current) => ({ ...current, [key]: value }))
    }

    const handleFile = (event) => {
        const file = event.target.files[0]
        if (!file) return
        setIconFile(file)
        setPreview(URL.createObjectURL(file))
        setErrors((current) => {
            if (!current.icon) return current
            const next = { ...current }
            delete next.icon
            return next
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const nextErrors = validateTechStackForm(form, iconFile, initial)
        setErrors(nextErrors)

        if (Object.keys(nextErrors).length > 0) {
            return
        }

        onSubmit(form, iconFile)
    }

    const inputClass = (field) =>
        `w-full bg-[#0d0d22] border rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all ${errors[field] ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : 'border-white/10'
        }`

    const uploadClass =
        `flex items-center gap-4 w-full bg-[#0d0d22] border rounded-xl px-4 py-4 cursor-pointer transition-all ${errors.icon
            ? 'border-red-500/50 hover:border-red-500/70'
            : 'border-dashed border-white/15 hover:border-indigo-500/40 hover:bg-white/4'
        }`

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="p-5 sm:p-6 space-y-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Name *</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="e.g. ReactJS"
                        className={inputClass('name')}
                    />
                    <FieldError message={errors.name} />
                </div>
                <div className="space-y-1.5">
                    <InputField label="Slug" value={form.slug} onChange={set('slug')} placeholder="Auto-generated from name" />
                    <p className="text-[11px] text-gray-500">Optional. If left empty, slug will be generated from the name.</p>
                </div>
                <InputField label="Category" value={form.category} onChange={set('category')} placeholder="e.g. frontend" />
                <InputField label="Sort Order" type="number" value={form.sort_order} onChange={set('sort_order')} placeholder="Leave empty to place at the bottom" />
                <p className="-mt-2 text-[11px] text-gray-500 sm:col-span-2">Optional. If left empty, the new tech stack will be placed after the current last order.</p>

                <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Description</label>
                    <textarea
                        value={form.description}
                        onChange={set('description')}
                        rows={3}
                        className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                        placeholder="Optional description"
                    />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Icon *</label>
                    <label className={uploadClass}>
                        <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full h-full object-contain p-2" />
                            ) : (
                                <ImageIcon className="w-5 h-5 text-gray-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-300">{iconFile ? iconFile.name : 'Click to upload icon'}</p>
                            <p className="text-xs text-gray-600 mt-0.5">PNG, SVG, WEBP recommended</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </label>
                    <FieldError message={errors.icon} />
                </div>

                <label className="flex items-center gap-3 sm:col-span-2 text-sm text-gray-300">
                    <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="accent-indigo-500 w-4 h-4" />
                    Active and visible on portfolio
                </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors no-neo">
                    Cancel
                </button>
                <button type="submit" disabled={uploading} className="relative group/s">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-5 py-2 bg-[#030014] rounded-xl border border-white/10">
                        {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4 text-indigo-400" />}
                        <span className="text-sm text-gray-200">{uploading ? 'Saving...' : 'Save Tech Stack'}</span>
                    </div>
                </button>
            </div>
        </form>
    )
}

export default function TechStacks() {
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
            .from('tech_stacks')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching tech stacks:', error)
        }

        setItems(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const uploadIcon = async (file) => {
        const fileName = `tech-${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('tech-stack-icons').upload(fileName, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('tech-stack-icons').getPublicUrl(fileName)
        return data.publicUrl
    }

    const checkSlugUnique = async (slug, currentId = null) => {
        const normalizedSlug = toSlug(slug)
        if (!normalizedSlug) {
            throw new Error('Slug is required')
        }

        let query = supabase
            .from('tech_stacks')
            .select('id, slug')
            .eq('slug', normalizedSlug)

        if (currentId) {
            query = query.neq('id', currentId)
        }

        const { data, error } = await query.limit(1)

        if (error) throw error
        if ((data || []).length > 0) {
            throw new Error('Slug already used. Please choose another one.')
        }

        return normalizedSlug
    }

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
        return Number.isNaN(parsedSortOrder) ? getNextSortOrder() : parsedSortOrder
    }

    const persistOrder = async (orderedItems) => {
        const updates = orderedItems.map((item, index) =>
            supabase
                .from('tech_stacks')
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

    const handleDragOver = (event) => {
        event.preventDefault()
    }

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
            console.error('Error reordering tech stacks:', error)
            pushToast('error', error.message || 'Failed to reorder tech stacks')
        } finally {
            setDraggingId(null)
            setDropTargetId(null)
        }
    }

    const handleCreate = async (form, iconFile) => {
        setUploading(true)
        try {
            const slug = await checkSlugUnique(form.slug || form.name)
            const iconUrl = iconFile ? await uploadIcon(iconFile) : null
            const sortOrder = resolveSortOrder(form.sort_order)

            const { error } = await supabase.from('tech_stacks').insert({
                name: form.name,
                slug,
                category: form.category || null,
                description: form.description || null,
                icon_url: iconUrl,
                sort_order: sortOrder,
                is_active: form.is_active,
            })

            if (error) throw error

            setShowCreate(false)
            pushToast('success', 'Tech stack created successfully!')
            fetchItems()
        } catch (error) {
            console.error('Error creating tech stack:', error)
            pushToast('error', error.message || 'Failed to create tech stack')
        } finally {
            setUploading(false)
        }
    }

    const handleEdit = async (form, iconFile) => {
        if (!editItem) return
        setUploading(true)
        try {
            const slug = await checkSlugUnique(form.slug || form.name, editItem.id)
            const iconUrl = iconFile ? await uploadIcon(iconFile) : editItem.icon_url
            const sortOrder = resolveSortOrder(form.sort_order)

            const { error } = await supabase
                .from('tech_stacks')
                .update({
                    name: form.name,
                    slug,
                    category: form.category || null,
                    description: form.description || null,
                    icon_url: iconUrl,
                    sort_order: sortOrder,
                    is_active: form.is_active,
                })
                .eq('id', editItem.id)

            if (error) throw error

            setEditItem(null)
            pushToast('success', 'Tech stack updated successfully!')
            fetchItems()
        } catch (error) {
            console.error('Error updating tech stack:', error)
            pushToast('error', error.message || 'Failed to update tech stack')
        } finally {
            setUploading(false)
        }
    }

    const deleteItem = async (id) => {
        if (!confirm('Delete this tech stack?')) return
        const { error } = await supabase.from('tech_stacks').delete().eq('id', id)
        if (error) {
            pushToast('error', error.message || 'Failed to delete tech stack')
            return
        }
        pushToast('success', 'Tech stack deleted successfully!')
        fetchItems()
    }

    const toggleActive = async (item) => {
        const { error } = await supabase
            .from('tech_stacks')
            .update({ is_active: !item.is_active })
            .eq('id', item.id)

        if (error) {
            pushToast('error', error.message || 'Failed to update status')
            return
        }

        pushToast('success', 'Tech stack status updated!')
        fetchItems()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
                        <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
                            <Boxes className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Tech Stack</h1>
                        <p className="text-gray-500 text-xs">{loading ? 'Loading...' : `${items.length} stacks total`}</p>
                    </div>
                </div>

                <button onClick={() => setShowCreate(true)} className="relative group shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-200">New Tech Stack</span>
                    </div>
                </button>
            </div>

            {showCreate && (
                <Modal title="Add Tech Stack" onClose={() => setShowCreate(false)}>
                    <TechStackForm initial={null} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} uploading={uploading} />
                </Modal>
            )}

            {editItem && (
                <Modal title="Edit Tech Stack" onClose={() => setEditItem(null)}>
                    <TechStackForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} uploading={uploading} />
                </Modal>
            )}

            {loading ? (
                <Card>
                    <div className="p-16 text-center">
                        <Boxes className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Loading tech stacks...</p>
                    </div>
                </Card>
            ) : items.length === 0 ? (
                <Card>
                    <div className="p-16 text-center">
                        <Boxes className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No tech stack data yet.</p>
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
                            className={`relative ${draggingId === item.id ? 'opacity-60 scale-[0.99]' : ''} ${dropTargetId === item.id ? 'ring-2 ring-indigo-400/70 ring-offset-2 ring-offset-transparent shadow-[0_0_0_1px_rgba(129,140,248,0.25)]' : ''}`}
                        >
                            {dropTargetId === item.id && draggingId !== item.id && (
                                <div className="absolute -inset-1 rounded-2xl border-2 border-dashed border-indigo-400/70 bg-indigo-500/10 pointer-events-none flex items-center justify-center text-indigo-200 text-xs font-medium tracking-widest uppercase">
                                    Drop to place here
                                </div>
                            )}
                            <TechStackCard
                                item={item}
                                onEdit={setEditItem}
                                onDelete={deleteItem}
                                onToggleActive={toggleActive}
                            />
                        </div>
                    ))}
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={removeToast} />
        </div>
    )
}
