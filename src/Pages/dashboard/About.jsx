import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { useToast } from '../../hooks/useToast'
import ToastStack from '../../components/ToastStack'
import {
    Plus,
    Pencil,
    Trash2,
    Upload,
    ImageIcon,
    FileText,
    Eye,
    EyeOff,
    Sparkles,
    X,
    Quote,
    CheckCircle2,
    Clock,
    Download,
    User,
    RefreshCw,
    Globe,
} from 'lucide-react'

const ABOUT_FALLBACK = {
    name: 'Asep Sutrisna Suhada Putra',
    description: 'Saya adalah mahasiswa Teknik Informatika yang berfokus pada pengembangan Front-End.',
    quote: 'Leveraging AI as a professional tool, not a replacement.',
}

/* ── Helpers ── */
const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ── Modal ── */
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-3xl flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-25 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
            <div className="relative bg-[#0a0a1a] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    </div>
)

/* ── Premium About Card ── */
const AboutCard = ({ item, onEdit, onDelete, onTogglePublish, onViewCv }) => {
    const [imgLoaded, setImgLoaded] = useState(false)
    const [hovered, setHovered] = useState(false)

    return (
        <div
            className="group relative rounded-2xl border border-white/8 overflow-hidden bg-white/[0.02] hover:border-white/20 transition-all duration-500"
            style={{ boxShadow: hovered ? '0 0 48px -12px rgba(99,102,241,0.25)' : 'none' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Top glow line */}
            <div
                className="absolute inset-x-0 top-0 h-px transition-opacity duration-500 z-10"
                style={{ opacity: hovered ? 1 : 0, background: 'linear-gradient(90deg, transparent, var(--color-primary-light), transparent)' }}
            />

            {/* Radial glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.07) 0%, transparent 60%)' }}
            />

            <div className="relative flex flex-col sm:flex-row gap-0">
                {/* ── Left: Photo column ── */}
                <div className="relative w-full sm:w-56 shrink-0">
                    <div className="relative w-full h-56 sm:h-full min-h-[200px] overflow-hidden bg-white/5">
                        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
                        {item.photo_url ? (
                            <img
                                src={item.photo_url}
                                alt={item.name}
                                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setImgLoaded(true)}
                                onError={(e) => { e.currentTarget.src = '/Photo.jpg' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-12 h-12 text-white/10" />
                            </div>
                        )}
                        {/* Gradient overlay on photo */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a]/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#0a0a1a]/80" />

                        {/* Published badge on photo */}
                        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${
                            item.is_published
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                        }`}>
                            {item.is_published ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {item.is_published ? 'Published' : 'Draft'}
                        </div>
                    </div>
                </div>

                {/* ── Right: Content ── */}
                <div className="flex-1 p-5 flex flex-col gap-4 min-w-0">
                    {/* Name + Actions */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-indigo-100 transition-colors duration-300">
                                {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-gray-500 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <RefreshCw className="w-2.5 h-2.5" /> v{item.version || 1}
                                </span>
                                <span className="text-[11px] text-gray-600">
                                    Updated {formatDate(item.updated_at)}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={() => onTogglePublish(item)}
                                title={item.is_published ? 'Unpublish' : 'Publish'}
                                className={`p-2 rounded-lg border text-xs transition-all duration-200 ${
                                    item.is_published
                                        ? 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
                                        : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/5'
                                }`}
                            >
                                {item.is_published ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={() => onEdit(item)}
                                title="Edit"
                                className="p-2 rounded-lg border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all duration-200"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                title="Delete"
                                className="p-2 rounded-lg border border-red-500/20 bg-red-500/8 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 border-l-2 border-white/8 pl-3 group-hover:border-indigo-500/30 transition-colors duration-300">
                        {item.description}
                    </p>

                    {/* Quote block */}
                    {item.quote && (
                        <div className="relative rounded-xl bg-indigo-500/8 border border-indigo-500/20 p-3.5 overflow-hidden">
                            <div className="absolute top-2 right-3 text-indigo-500/20">
                                <Quote className="w-8 h-8" />
                            </div>
                            <p className="text-xs text-indigo-300/90 italic leading-relaxed pr-8">
                                "{item.quote}"
                            </p>
                        </div>
                    )}

                    {/* Footer: CV link */}
                    <div className="mt-auto flex items-center gap-3">
                        {item.cv_url ? (
                            <button
                                onClick={() => onViewCv(item.cv_url)}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-300 bg-white/5 hover:bg-indigo-500/10 border border-white/8 hover:border-indigo-500/25 rounded-lg px-3 py-1.5 transition-all duration-200"
                            >
                                <Download className="w-3 h-3" /> View CV
                            </button>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-white/3 border border-white/6 rounded-lg px-3 py-1.5">
                                <FileText className="w-3 h-3" /> No CV attached
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Premium About Form ── */
const AboutForm = ({ initial, onSubmit, onCancel, uploading, onViewCv }) => {
    const isEditing = Boolean(initial)
    const [form, setForm] = useState({
        name:         initial?.name         ?? '',
        description:  initial?.description  ?? '',
        quote:        initial?.quote        ?? '',
        is_published: initial?.is_published ?? true,
    })
    const [photoFile,    setPhotoFile]    = useState(null)
    const [cvFile,       setCvFile]       = useState(null)
    const [photoPreview, setPhotoPreview] = useState(isEditing ? (initial?.photo_url || null) : null)
    const [cvLabel,      setCvLabel]      = useState(isEditing && initial?.cv_url ? initial.cv_url.split('/').pop() : null)

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
    }

    const handleCvChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setCvFile(file)
        setCvLabel(file.name)
    }

    const inputCls = 'w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all'
    const labelCls = 'text-xs text-indigo-300/70 uppercase tracking-wider font-medium'

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form, photoFile, cvFile) }} className="p-5 sm:p-6 space-y-5">

            {/* ── Section: Identity ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest">
                    <div className="flex-1 h-px bg-white/6" />
                    <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> Identity</span>
                    <div className="flex-1 h-px bg-white/6" />
                </div>

                {/* Photo + Name side by side */}
                <div className="flex gap-4 items-start">
                    {/* Photo uploader */}
                    <label className="relative shrink-0 cursor-pointer group/photo">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 group-hover/photo:border-indigo-500/50 transition-colors bg-white/5">
                            {photoPreview ? (
                                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                    <ImageIcon className="w-6 h-6 text-gray-600" />
                                    <span className="text-[9px] text-gray-600 text-center leading-tight">Upload<br />Photo</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        {photoFile && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0a0a1a] flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </label>

                    {/* Name field */}
                    <div className="flex-1 space-y-1.5">
                        <label className={labelCls}>Full Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={set('name')}
                            placeholder="e.g. Asep Sutrisna"
                            required
                            className={inputCls}
                        />
                        <p className="text-[10px] text-gray-600">Displayed as the main heading on your About page</p>
                    </div>
                </div>
            </div>

            {/* ── Section: Content ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest">
                    <div className="flex-1 h-px bg-white/6" />
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Content</span>
                    <div className="flex-1 h-px bg-white/6" />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className={labelCls}>Bio / Description *</label>
                    <textarea
                        value={form.description}
                        onChange={set('description')}
                        placeholder="Describe yourself — your skills, experience, and what drives you..."
                        rows={5}
                        required
                        className={inputCls + ' resize-none'}
                    />
                    <p className="text-[10px] text-gray-600">{form.description.length} characters</p>
                </div>

                {/* Quote */}
                <div className="space-y-1.5">
                    <label className={labelCls}>Personal Quote</label>
                    <div className="relative">
                        <Quote className="absolute left-3 top-3 w-4 h-4 text-indigo-500/40 pointer-events-none" />
                        <textarea
                            value={form.quote}
                            onChange={set('quote')}
                            placeholder="A short quote that defines your professional philosophy..."
                            rows={2}
                            className={inputCls + ' resize-none pl-9'}
                        />
                    </div>
                    {form.quote && (
                        <div className="rounded-lg bg-indigo-500/8 border border-indigo-500/20 px-3 py-2">
                            <p className="text-xs text-indigo-300/80 italic">"{form.quote}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Section: Files ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest">
                    <div className="flex-1 h-px bg-white/6" />
                    <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Files</span>
                    <div className="flex-1 h-px bg-white/6" />
                </div>

                {/* CV Upload */}
                <div className="space-y-1.5">
                    <label className={labelCls}>CV / Resume</label>
                    <label className="flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/12 rounded-xl px-4 py-3.5 cursor-pointer hover:border-indigo-500/40 hover:bg-white/3 transition-all group/cv">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${cvLabel ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white/5 border-white/10 group-hover/cv:border-indigo-500/30'}`}>
                            <FileText className={`w-5 h-5 ${cvLabel ? 'text-emerald-300' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">
                                {cvLabel || (isEditing ? 'Replace current CV' : 'Upload CV / Resume')}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">PDF recommended · Max 10MB</p>
                        </div>
                        {cvLabel && (
                            <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                        )}
                        <input type="file" accept="application/pdf,.doc,.docx" onChange={handleCvChange} className="hidden" />
                    </label>
                    {isEditing && initial?.cv_url && !cvFile && (
                        <button type="button" onClick={() => onViewCv(initial.cv_url)}
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1">
                            <Eye className="w-3 h-3" /> View current CV
                        </button>
                    )}
                </div>
            </div>

            {/* ── Publish toggle ── */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8">
                <div>
                    <p className="text-sm font-medium text-gray-200">Publish this About page</p>
                    <p className="text-xs text-gray-500 mt-0.5">Only one record can be published at a time</p>
                </div>
                <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
                    className={`relative w-11 h-6 rounded-full border transition-all duration-300 ${
                        form.is_published ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10 border-white/15'
                    }`}
                >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                        form.is_published ? 'left-[22px]' : 'left-0.5'
                    }`} />
                </button>
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-2 pt-1 border-t border-white/6">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all">
                    Cancel
                </button>
                <button type="submit" disabled={uploading} className="relative group/s">
                    <div className="absolute -inset-0.5 rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                    <div className="relative flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                        {uploading
                            ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            : <Upload className="w-4 h-4 text-indigo-400" />
                        }
                        <span className="text-sm text-gray-200">{uploading ? 'Saving...' : isEditing ? 'Update About' : 'Save About'}</span>
                    </div>
                </button>
            </div>
        </form>
    )
}

/* ── Skeleton ── */
const SkeletonCard = () => (
    <div className="rounded-2xl border border-white/6 overflow-hidden animate-pulse flex flex-col sm:flex-row">
        <div className="w-full sm:w-56 h-48 bg-white/5 shrink-0" />
        <div className="flex-1 p-5 space-y-4">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <div className="h-5 bg-white/5 rounded-lg w-36" />
                    <div className="h-3 bg-white/5 rounded-lg w-24" />
                </div>
                <div className="flex gap-1.5">
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="h-3 bg-white/5 rounded-lg w-full" />
                <div className="h-3 bg-white/5 rounded-lg w-5/6" />
                <div className="h-3 bg-white/5 rounded-lg w-4/6" />
            </div>
            <div className="h-14 bg-white/5 rounded-xl" />
            <div className="h-8 bg-white/5 rounded-lg w-24" />
        </div>
    </div>
)

/* ── Main Page ── */
export default function About() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [uploading, setUploading] = useState(false)
    const { toasts, pushToast, removeToast } = useToast()

    const fetchItems = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('about_contents').select('*').order('created_at', { ascending: false })
        if (error) console.error('Error fetching about contents:', error)
        setItems(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchItems() }, [])

    const uploadPhoto = async (file) => {
        const fileName = `about-photo-${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('about-images').upload(fileName, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('about-images').getPublicUrl(fileName)
        return data.publicUrl
    }

    const uploadCv = async (file) => {
        const fileName = `about-cv-${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('about-cv').upload(fileName, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('about-cv').getPublicUrl(fileName)
        return data.publicUrl
    }

    const handleCreate = async (form, photoFile, cvFile) => {
        setUploading(true)
        try {
            const photoUrl = photoFile ? await uploadPhoto(photoFile) : ''
            const cvUrl = cvFile ? await uploadCv(cvFile) : ''
            if (form.is_published) {
                await supabase.from('about_contents').update({ is_published: false }).eq('is_published', true)
            }
            await supabase.from('about_contents').insert({
                name: form.name, description: form.description, quote: form.quote,
                photo_url: photoUrl, cv_url: cvUrl, is_published: form.is_published, version: 1,
            })
            setShowCreate(false)
            pushToast('success', 'About content created successfully!')
            fetchItems()
        } catch (err) {
            console.error(err)
            pushToast('error', err.message || 'Failed to save about content')
        } finally {
            setUploading(false)
        }
    }

    const handleEdit = async (form, photoFile, cvFile) => {
        if (!editItem) return
        setUploading(true)
        try {
            const photoUrl = photoFile ? await uploadPhoto(photoFile) : (editItem.photo_url || '')
            const cvUrl = cvFile ? await uploadCv(cvFile) : (editItem.cv_url || '')
            if (form.is_published) {
                await supabase.from('about_contents').update({ is_published: false }).neq('id', editItem.id).eq('is_published', true)
            }
            await supabase.from('about_contents').update({
                name: form.name, description: form.description, quote: form.quote,
                photo_url: photoUrl, cv_url: cvUrl, is_published: form.is_published,
                version: (editItem.version || 1) + 1,
            }).eq('id', editItem.id)
            setEditItem(null)
            pushToast('success', 'About content updated successfully!')
            fetchItems()
        } catch (err) {
            console.error(err)
            pushToast('error', err.message || 'Failed to update about content')
        } finally {
            setUploading(false)
        }
    }

    const deleteItem = async (id) => {
        if (!confirm('Delete this about content?')) return
        const { error } = await supabase.from('about_contents').delete().eq('id', id)
        if (error) { pushToast('error', error.message || 'Failed to delete'); return }
        pushToast('success', 'About content deleted!')
        fetchItems()
    }

    const togglePublish = async (item) => {
        if (item.is_published) {
            await supabase.from('about_contents').update({ is_published: false }).eq('id', item.id)
        } else {
            await supabase.from('about_contents').update({ is_published: false }).neq('id', item.id).eq('is_published', true)
            await supabase.from('about_contents').update({ is_published: true }).eq('id', item.id)
        }
        pushToast('success', item.is_published ? 'Unpublished!' : 'Published!')
        fetchItems()
    }

    const handleViewCv = async (cvUrl) => {
        try {
            let path = cvUrl;
            if (cvUrl.includes('/about-cv/')) {
                path = cvUrl.split('/about-cv/').slice(1).join('/about-cv/');
            }
            path = decodeURIComponent(path);

            const { data, error } = await supabase.storage.from('about-cv').createSignedUrl(path, 3600); // 1 hour expiration
            if (error) {
                console.error("Error creating signed URL:", error);
                window.open(cvUrl, '_blank'); // fallback
                return;
            }
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (err) {
            console.error("Failed to view CV:", err);
            window.open(cvUrl, '_blank'); // fallback
        }
    }

    const publishedCount = items.filter((i) => i.is_published).length

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-1 rounded-xl blur-md opacity-60" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                        <div className="relative w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">About Content</h1>
                        {!loading && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5">
                                    <User className="w-3 h-3" /> {items.length} record{items.length !== 1 ? 's' : ''}
                                </span>
                                {publishedCount > 0 && (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                                        <CheckCircle2 className="w-3 h-3" /> {publishedCount} live
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
                        <span className="text-sm font-medium text-gray-200">New About</span>
                    </div>
                </button>
            </div>

            {/* ── Modals ── */}
            {showCreate && (
                <Modal title="Add About Content" onClose={() => setShowCreate(false)}>
                    <AboutForm initial={null} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} uploading={uploading} onViewCv={handleViewCv} />
                </Modal>
            )}
            {editItem && (
                <Modal title="Edit About Content" onClose={() => setEditItem(null)}>
                    <AboutForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} uploading={uploading} onViewCv={handleViewCv} />
                </Modal>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="space-y-4">
                    <SkeletonCard />
                </div>
            ) : items.length === 0 ? (
                <div className="relative rounded-2xl border border-white/8 border-dashed overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
                    <div className="relative py-24 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-gray-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-300 font-medium text-sm">No about content yet</p>
                            <p className="text-gray-600 text-xs mt-1">Create your first about profile to show on your portfolio</p>
                        </div>
                        <button onClick={() => setShowCreate(true)} className="relative group mt-2">
                            <div className="absolute -inset-0.5 rounded-xl opacity-50 blur group-hover:opacity-90 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                            <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-200" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                                <Plus className="w-4 h-4 text-indigo-400" /> Create About Profile
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <AboutCard
                            key={item.id}
                            item={item}
                            onEdit={setEditItem}
                            onDelete={deleteItem}
                            onTogglePublish={togglePublish}
                            onViewCv={handleViewCv}
                        />
                    ))}
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={removeToast} />
        </div>
    )
}
