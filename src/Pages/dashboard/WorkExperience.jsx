import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import { Trash2, Plus, Edit2, X } from 'lucide-react'

// small helper to parse tech_stack stored as JSON string or array
const parseTechStack = (stack) => {
    if (!stack) return []
    if (Array.isArray(stack)) return stack
    try {
        const parsed = JSON.parse(stack)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        // fallback: try comma-separated
        return String(stack).split(',').map(s => s.trim()).filter(Boolean)
    }
}

const getEmploymentBadgeClasses = (employmentType) => {
    switch (employmentType) {
        case 'Magang':
            return 'bg-cyan-500/15 text-cyan-300 border-cyan-400/25'
        case 'Kontrak':
            return 'bg-amber-500/15 text-amber-300 border-amber-400/25'
        default:
            return 'bg-indigo-500/15 text-indigo-200 border-indigo-400/25'
    }
}

const formatMonthYear = (month, year) => {
    if (!month || !year) return '-'
    return `${new Date(2024, month - 1).toLocaleString('en-US', { month: 'short' })} ${year}`
}

const compareStartDateDesc = (a, b) => {
    const aYear = Number(a.start_year) || 0
    const bYear = Number(b.start_year) || 0

    if (aYear !== bYear) {
        return bYear - aYear
    }

    const aMonth = Number(a.start_month) || 0
    const bMonth = Number(b.start_month) || 0

    if (aMonth !== bMonth) {
        return bMonth - aMonth
    }

    return Number(b.id) - Number(a.id)
}

export default function WorkExperience() {
    const [experiences, setExperiences] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        position: '',
        company: '',
        employment_type: 'Full Time',
        location: '',
        start_month: '',
        start_year: new Date().getFullYear(),
        end_month: '',
        end_year: new Date().getFullYear(),
        is_current: false,
        description: '',
        tech_stack: '[]',
        display_order: 1,
    })
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
    const [toasts, setToasts] = useState([])
    const [techDraft, setTechDraft] = useState('')

    const pushToast = (type, message, timeout = 4000) => {
        const id = Math.random().toString(36).slice(2, 9)
        setToasts((t) => [...t, { id, type, message }])
        setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== id))
        }, timeout)
    }

    useEffect(() => {
        fetchExperiences()
    }, [])

    const fetchExperiences = async () => {
        try {
            setLoading(true)
            setError(null)
            const { data, error: fetchError } = await supabase
                .from('work_experiences')
                .select('*')

            if (fetchError) {
                console.error('Error fetching work experiences:', fetchError)
                setError(`Failed to load work experiences: ${fetchError.message}`)
                setExperiences([])
            } else {
                console.log('Fetched work experiences:', data)
                const sorted = [...(data || [])].sort(compareStartDateDesc)
                setExperiences(sorted)
            }
        } catch (err) {
            console.error('Error fetching work experiences:', err)
            setError(err.message)
            setExperiences([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // ensure employment_type is one of allowed DB values
            const allowedTypes = ['Magang', 'Full Time', 'Kontrak']
            const employment_type = allowedTypes.includes(formData.employment_type)
                ? formData.employment_type
                : 'Full Time'

            // prepare payload with proper integer/null types for month/year fields
            const payload = {
                ...formData,
                employment_type,
                start_month: formData.start_month ? parseInt(formData.start_month) : null,
                start_year: formData.start_year ? parseInt(formData.start_year) : null,
                end_month: formData.is_current ? null : (formData.end_month ? parseInt(formData.end_month) : null),
                end_year: formData.is_current ? null : (formData.end_year ? parseInt(formData.end_year) : null),
                display_order: formData.display_order ? parseInt(formData.display_order) : 1,
                tech_stack: typeof formData.tech_stack === 'string' ? formData.tech_stack : JSON.stringify(formData.tech_stack || []),
            }

            if (editingId) {
                const { error } = await supabase
                    .from('work_experiences')
                    .update(payload)
                    .eq('id', editingId)

                if (error) throw error
                pushToast('success', 'Work experience updated successfully!')
            } else {
                const { error } = await supabase
                    .from('work_experiences')
                    .insert([payload])

                if (error) throw error
                pushToast('success', 'Work experience added successfully!')
            }

            setFormData({
                position: '',
                company: '',
                employment_type: 'Full Time',
                location: '',
                start_month: '',
                start_year: new Date().getFullYear(),
                end_month: '',
                end_year: new Date().getFullYear(),
                is_current: false,
                description: '',
                tech_stack: '[]',
                display_order: 1,
            })
            setEditingId(null)
            setIsOpen(false)
            fetchExperiences()
        } catch (error) {
            console.error('Error saving work experience:', error)
            pushToast('error', 'Failed to save work experience')
        }
    }

    const handleEdit = (experience) => {
        // ensure tech_stack is stringified when setting form
        const tech = parseTechStack(experience.tech_stack)
        setFormData({ ...experience, tech_stack: JSON.stringify(tech) })
        setEditingId(experience.id)
        setIsOpen(true)
    }

    const handleDelete = (id) => {
        // open custom confirmation modal
        setDeleteConfirm({ open: true, id })
    }

    const confirmDelete = async () => {
        const id = deleteConfirm.id
        try {
            const { error } = await supabase
                .from('work_experiences')
                .delete()
                .eq('id', id)

            if (error) throw error
            setDeleteConfirm({ open: false, id: null })
            pushToast('success', 'Work experience deleted successfully!')
            fetchExperiences()
        } catch (error) {
            console.error('Error deleting work experience:', error)
            pushToast('error', 'Failed to delete work experience')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Work Experience</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your work history</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            position: '',
                            company: '',
                            employment_type: 'Full Time',
                            location: '',
                            start_month: '',
                            start_year: new Date().getFullYear(),
                            end_month: '',
                            end_year: new Date().getFullYear(),
                            is_current: false,
                            description: '',
                            tech_stack: '[]',
                            display_order: 1,
                        })
                        setEditingId(null)
                        setIsOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Experience
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : error ? (
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={fetchExperiences}
                        className="mt-3 px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition"
                    >
                        Try Again
                    </button>
                </div>
            ) : experiences.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                    <p>No work experiences yet. Click "Add Experience" to create one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {experiences.map((exp) => (
                        <div
                            key={exp.id}
                            className="relative group"
                        >
                            <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />

                            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10">
                                <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-white/0 via-white/15 to-white/0" />

                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight break-words">
                                                {exp.position}
                                            </h3>
                                            {exp.is_current && (
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-[10px] uppercase tracking-[0.18em]">
                                                    Current
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="font-medium text-gray-100">{exp.company}</span>
                                            {exp.location && (
                                                <>
                                                    <span className="text-gray-700">•</span>
                                                    <span className="text-gray-400">{exp.location}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 shrink-0 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
                                        <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] ${getEmploymentBadgeClasses(exp.employment_type)}`}>
                                            {exp.employment_type}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(exp)}
                                            className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition"
                                            aria-label="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exp.id)}
                                            className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-white transition"
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Period</div>
                                        <div className="text-sm text-gray-200 font-medium">
                                            {formatMonthYear(exp.start_month, exp.start_year)}
                                            <span className="mx-2 text-gray-600">—</span>
                                            {exp.is_current ? 'Present' : formatMonthYear(exp.end_month, exp.end_year)}
                                        </div>
                                    </div>
                                </div>

                                {exp.description && (
                                    <p className="mt-4 text-sm sm:text-[15px] text-gray-300 leading-relaxed line-clamp-3">
                                        {exp.description}
                                    </p>
                                )}

                                {Array.isArray(exp.tech_stack) && exp.tech_stack.length > 0 && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {exp.tech_stack.slice(0, 6).map((t) => (
                                            <span
                                                key={t}
                                                className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-200 text-xs"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                        {exp.tech_stack.length > 6 && (
                                            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                                                +{exp.tech_stack.length - 6}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </article>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-lg w-full max-w-2xl p-6 modal-animate">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingId ? 'Edit Experience' : 'Add Experience'}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Position"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    required
                                    className="col-span-2 px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="Company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    required
                                    className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                                <select
                                    value={formData.employment_type}
                                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                    className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                >
                                    <option value="Full Time">Full Time</option>
                                    <option value="Kontrak">Kontrak</option>
                                    <option value="Magang">Magang</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="col-span-2 px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                                <div className="col-span-2 grid grid-cols-4 gap-2">
                                    <select
                                        value={formData.start_month}
                                        onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
                                        required
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2"
                                    >
                                        <option value="">Start Month</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                            <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.start_year}
                                        onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) })}
                                        required
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 grid grid-cols-4 gap-2">
                                    <select
                                        value={formData.end_month}
                                        onChange={(e) => setFormData({ ...formData, end_month: e.target.value })}
                                        disabled={formData.is_current}
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">End Month</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                            <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.end_year}
                                        onChange={(e) => setFormData({ ...formData, end_year: parseInt(e.target.value) })}
                                        disabled={formData.is_current}
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <label className="col-span-2 flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_current}
                                        onChange={(e) =>
                                            setFormData({ ...formData, is_current: e.target.checked, end_month: '', end_year: new Date().getFullYear() })
                                        }
                                        className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                    />
                                    <span className="text-gray-300 text-sm">Currently working here</span>
                                </label>
                                <textarea
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="col-span-2 px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                                />
                                <div className="col-span-2">
                                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium mb-2">Technologies</label>
                                    <div className="rounded-lg border border-white/10 bg-[#0d0d22] px-3 py-3 space-y-2">
                                        <div className="flex flex-wrap gap-2 min-h-[42px] items-center">
                                            {parseTechStack(formData.tech_stack).length > 0 ? (
                                                parseTechStack(formData.tech_stack).map((item) => (
                                                    <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs">
                                                        {item}
                                                        <button type="button" onClick={() => {
                                                            // remove item
                                                            const next = parseTechStack(formData.tech_stack).filter(i => i !== item)
                                                            setFormData({ ...formData, tech_stack: JSON.stringify(next) })
                                                        }} className="text-indigo-200/70 hover:text-white ml-1">✕</button>
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-600">Technologies (add and press Enter)</p>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            value={techDraft}
                                            onChange={(e) => setTechDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault()
                                                    const value = techDraft.trim()
                                                    if (!value) return
                                                    const existing = parseTechStack(formData.tech_stack)
                                                    const next = [...existing, ...value.split(',').map(s => s.trim()).filter(Boolean)]
                                                    // dedupe
                                                    const dedup = Array.from(new Set(next))
                                                    setFormData({ ...formData, tech_stack: JSON.stringify(dedup) })
                                                    setTechDraft('')
                                                }
                                            }}
                                            onBlur={() => {
                                                if (techDraft.trim()) {
                                                    const value = techDraft.trim()
                                                    const existing = parseTechStack(formData.tech_stack)
                                                    const next = [...existing, ...value.split(',').map(s => s.trim()).filter(Boolean)]
                                                    const dedup = Array.from(new Set(next))
                                                    setFormData({ ...formData, tech_stack: JSON.stringify(dedup) })
                                                    setTechDraft('')
                                                }
                                            }}
                                            placeholder="Add a technology and press Enter"
                                            className="w-full bg-transparent text-gray-200 placeholder-gray-600 text-sm outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
                                >
                                    {editingId ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete confirmation modal */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-lg w-full max-w-md p-6 modal-animate">
                        <h3 className="text-lg font-semibold text-white mb-2">Delete work experience</h3>
                        <p className="text-gray-400 text-sm">Are you sure you want to delete this work experience? This action cannot be undone.</p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, id: null })}
                                className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toast container */}
            <div className="toast-container" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast ${t.type === 'success' ? 'success' : 'error'}`}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-sm">{t.message}</div>
                            <button onClick={() => setToasts((s) => s.filter(x => x.id !== t.id))} className="text-gray-400 hover:text-gray-200">✕</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
