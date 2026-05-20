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
} from 'lucide-react'

const ABOUT_FALLBACK = {
    name: 'Asep Sutrisna Suhada Putra',
    description:
        'Saya adalah mahasiswa Teknik Informatika yang berfokus pada pengembangan Front-End. Saya berfokus pada penciptaan pengalaman digital yang menarik dan selalu berupaya memberikan solusi terbaik dalam setiap proyek yang saya kerjakan.',
    quote: 'Leveraging AI as a professional tool, not a replacement.',
}

const Card = ({ children, className = '' }) => (
    <div className={`relative group ${className}`}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
            {children}
        </div>
    </div>
)

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-3xl flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
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
    </div>
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
            className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
    </div>
)

const TextAreaField = ({ label, value, onChange, placeholder, rows = 4, required = false }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
        />
    </div>
)

const AboutCard = ({ item, onEdit, onDelete, onTogglePublish }) => (
    <Card>
        <div className="p-4 flex flex-col h-full gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${item.is_published ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                            {item.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>
                    <p className="text-gray-500 text-xs">Version {item.version || 1}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onTogglePublish(item)}
                        className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                        title={item.is_published ? 'Unpublish' : 'Publish'}
                    >
                        {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                    <div className="relative w-full aspect-[1/1] rounded-xl border border-white/8 overflow-hidden bg-white/5">
                        {item.photo_url ? (
                            <img
                                src={item.photo_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.src = '/Photo.jpg'
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                <ImageIcon className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3 text-sm">
                    <p className="text-gray-400 line-clamp-3 leading-relaxed">{item.description}</p>
                    <div className="rounded-xl bg-white/5 border border-white/8 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs uppercase tracking-wider font-medium">
                            <Sparkles className="w-4 h-4" /> Quote
                        </div>
                        <p className="text-gray-300 text-xs italic">{item.quote || ABOUT_FALLBACK.quote}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <FileText className="w-4 h-4" />
                        {item.cv_url ? 'CV attached' : 'No CV attached'}
                    </div>
                </div>
            </div>
        </div>
    </Card>
)

const AboutForm = ({ initial, onSubmit, onCancel, uploading }) => {
    const isEditing = Boolean(initial)
    const [form, setForm] = useState({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        quote: initial?.quote ?? '',
        is_published: initial?.is_published ?? true,
    })
    const [photoFile, setPhotoFile] = useState(null)
    const [cvFile, setCvFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(isEditing ? (initial?.photo_url || '/Photo.jpg') : null)
    const [cvLabel, setCvLabel] = useState(isEditing && initial?.cv_url ? 'Current CV attached' : 'No CV attached')

    const handleChange = (key) => (event) => {
        const value = key === 'is_published' ? event.target.checked : event.target.value
        setForm((current) => ({ ...current, [key]: value }))
    }

    const handlePhotoChange = (event) => {
        const file = event.target.files[0]
        if (!file) return
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
    }

    const handleCvChange = (event) => {
        const file = event.target.files[0]
        if (!file) return
        setCvFile(file)
        setCvLabel(file.name)
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit(form, photoFile, cvFile)
            }}
            className="p-5 sm:p-6 space-y-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <InputField
                        label="Name"
                        value={form.name}
                        onChange={handleChange('name')}
                        placeholder="Your full name"
                        required
                    />
                </div>

                <div className="sm:col-span-2">
                    <TextAreaField
                        label="Description"
                        value={form.description}
                        onChange={handleChange('description')}
                        placeholder="Describe yourself for the About page"
                        rows={5}
                        required
                    />
                </div>

                <div className="sm:col-span-2">
                    <TextAreaField
                        label="Quote"
                        value={form.quote}
                        onChange={handleChange('quote')}
                        placeholder="Short quote displayed on the About page"
                        rows={3}
                    />
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Profile Photo</label>
                        <label className="flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-indigo-500/40 hover:bg-white/4 transition-all">
                            <div className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-300">{photoFile ? photoFile.name : 'Click to upload photo'}</p>
                                <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, WEBP supported</p>
                            </div>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">CV File</label>
                        <label className="flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-indigo-500/40 hover:bg-white/4 transition-all">
                            <div className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-300">{cvLabel}</p>
                                <p className="text-xs text-gray-600 mt-0.5">PDF recommended</p>
                            </div>
                            <input type="file" accept="application/pdf" onChange={handleCvChange} className="hidden" />
                        </label>
                    </div>
                </div>

                <label className="flex items-center gap-3 sm:col-span-2 text-sm text-gray-300">
                    <input
                        type="checkbox"
                        checked={form.is_published}
                        onChange={handleChange('is_published')}
                        className="accent-indigo-500 w-4 h-4"
                    />
                    Publish this About content
                </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
                >
                    Cancel
                </button>
                <button type="submit" disabled={uploading} className="relative group/s">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-5 py-2 bg-[#030014] rounded-xl border border-white/10">
                        {uploading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4 text-indigo-400" />
                        )}
                        <span className="text-sm text-gray-200">{uploading ? 'Saving...' : 'Save About'}</span>
                    </div>
                </button>
            </div>
        </form>
    )
}

export default function About() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [uploading, setUploading] = useState(false)
    const { toasts, pushToast, removeToast } = useToast()

    const fetchItems = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('about_contents')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching about contents:', error)
        }

        setItems(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

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
        return fileName
    }

    const handleCreate = async (form, photoFile, cvFile) => {
        setUploading(true)
        try {
            const photoUrl = photoFile ? await uploadPhoto(photoFile) : ABOUT_FALLBACK.photo_url
            const cvUrl = cvFile ? await uploadCv(cvFile) : ABOUT_FALLBACK.cv_url

            if (form.is_published) {
                await supabase
                    .from('about_contents')
                    .update({ is_published: false })
                    .eq('is_published', true)
            }

            await supabase.from('about_contents').insert({
                name: form.name,
                description: form.description,
                quote: form.quote,
                photo_url: photoUrl,
                cv_url: cvUrl,
                is_published: form.is_published,
                version: 1,
            })

            setShowCreate(false)
            pushToast('success', 'About content created successfully!')
            fetchItems()
        } catch (error) {
            console.error('Error creating about content:', error)
            pushToast('error', error.message || 'Failed to save about content')
        } finally {
            setUploading(false)
        }
    }

    const handleEdit = async (form, photoFile, cvFile) => {
        if (!editItem) return
        setUploading(true)
        try {
            const photoUrl = photoFile ? await uploadPhoto(photoFile) : (editItem.photo_url || ABOUT_FALLBACK.photo_url)
            const cvUrl = cvFile ? await uploadCv(cvFile) : (editItem.cv_url || ABOUT_FALLBACK.cv_url)

            if (form.is_published) {
                await supabase
                    .from('about_contents')
                    .update({ is_published: false })
                    .neq('id', editItem.id)
                    .eq('is_published', true)
            }

            await supabase
                .from('about_contents')
                .update({
                    name: form.name,
                    description: form.description,
                    quote: form.quote,
                    photo_url: photoUrl,
                    cv_url: cvUrl,
                    is_published: form.is_published,
                    version: (editItem.version || 1) + 1,
                })
                .eq('id', editItem.id)

            setEditItem(null)
            pushToast('success', 'About content updated successfully!')
            fetchItems()
        } catch (error) {
            console.error('Error updating about content:', error)
            pushToast('error', error.message || 'Failed to update about content')
        } finally {
            setUploading(false)
        }
    }

    const deleteItem = async (id) => {
        if (!confirm('Delete this about content?')) return
        const { error } = await supabase.from('about_contents').delete().eq('id', id)
        if (error) {
            pushToast('error', error.message || 'Failed to delete about content')
            return
        }
        pushToast('success', 'About content deleted successfully!')
        fetchItems()
    }

    const togglePublish = async (item) => {
        if (item.is_published) {
            await supabase
                .from('about_contents')
                .update({ is_published: false })
                .eq('id', item.id)
        } else {
            await supabase
                .from('about_contents')
                .update({ is_published: false })
                .neq('id', item.id)
                .eq('is_published', true)

            await supabase
                .from('about_contents')
                .update({ is_published: true })
                .eq('id', item.id)
        }
        pushToast('success', item.is_published ? 'About content unpublished!' : 'About content published!')
        fetchItems()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
                        <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">About Content</h1>
                        <p className="text-gray-500 text-xs">
                            {loading ? 'Loading...' : `${items.length} about record(s)`}
                        </p>
                    </div>
                </div>

                <button onClick={() => setShowCreate(true)} className="relative group shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-200">New About</span>
                    </div>
                </button>
            </div>

            {showCreate && (
                <Modal title="Add About Content" onClose={() => setShowCreate(false)}>
                    <AboutForm
                        initial={null}
                        onSubmit={handleCreate}
                        onCancel={() => setShowCreate(false)}
                        uploading={uploading}
                    />
                </Modal>
            )}

            {editItem && (
                <Modal title="Edit About Content" onClose={() => setEditItem(null)}>
                    <AboutForm
                        initial={editItem}
                        onSubmit={handleEdit}
                        onCancel={() => setEditItem(null)}
                        uploading={uploading}
                    />
                </Modal>
            )}

            {loading ? (
                <Card>
                    <div className="p-16 text-center">
                        <Sparkles className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Loading about content...</p>
                    </div>
                </Card>
            ) : items.length === 0 ? (
                <Card>
                    <div className="p-16 text-center">
                        <Sparkles className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No about content yet. Create the first one!</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {items.map((item) => (
                        <AboutCard
                            key={item.id}
                            item={item}
                            onEdit={setEditItem}
                            onDelete={deleteItem}
                            onTogglePublish={togglePublish}
                        />
                    ))}
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={removeToast} />
        </div>
    )
}
