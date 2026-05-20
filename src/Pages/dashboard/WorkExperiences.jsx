import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../supabase'
import {
    Briefcase,
    Pencil,
    Plus,
    Trash2,
    Sparkles,
    MapPin,
    Calendar,
    Code2,
    Clock,
    CheckCircle2,
    Building2,
    GraduationCap,
    Timer,
} from 'lucide-react'
import WorkExperienceForm from '../../components/WorkExperienceForm'
import {
    buildWorkExperiencePayload,
    compareWorkExperienceTimeline,
    formatDateRange,
    normalizeWorkExperience,
    validateWorkExperienceForm,
} from '../../utils/workExperiences'

/* ── Helpers ── */
const getInitials = (company = '') =>
    company
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')

const EMPLOYMENT_STYLES = {
    'Full Time': { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    'Magang': { bg: 'bg-sky-500/15', border: 'border-sky-500/30', text: 'text-sky-300', dot: 'bg-sky-400' },
    'Kontrak': { bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-300', dot: 'bg-violet-400' },
    'Freelance': { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' },
    'Part Time': { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-300', dot: 'bg-rose-400' },
}
const getEmpStyle = (type) => EMPLOYMENT_STYLES[type] ?? { bg: 'bg-gray-500/15', border: 'border-gray-500/30', text: 'text-gray-300', dot: 'bg-gray-400' }

const calcDuration = (startMonth, startYear, endMonth, endYear, isCurrent) => {
    const now = new Date()
    const start = new Date(startYear, (startMonth ?? 1) - 1)
    const end = isCurrent ? now : new Date(endYear ?? now.getFullYear(), (endMonth ?? 1) - 1)
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    if (totalMonths < 1) return '< 1 mo'
    const y = Math.floor(totalMonths / 12)
    const m = totalMonths % 12
    return [y > 0 ? `${y} yr` : '', m > 0 ? `${m} mo` : ''].filter(Boolean).join(' ')
}

/* ── Modal ── */
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-3xl flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
            <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
                        <span className="text-xl leading-none">×</span>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    </div>
)

/* ── Skeleton ── */
const SkeletonRow = () => (
    <div className="flex gap-4 sm:gap-6 animate-pulse">
        {/* Timeline dot */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8" />
            <div className="w-0.5 flex-1 bg-white/5 min-h-[60px]" />
        </div>
        {/* Card */}
        <div className="flex-1 pb-8">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-3">
                <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-white/5 rounded-lg w-1/3" />
                        <div className="h-3 bg-white/5 rounded-lg w-1/4" />
                    </div>
                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                </div>
                <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                <div className="flex gap-1.5">
                    <div className="h-5 w-16 bg-white/5 rounded-full" />
                    <div className="h-5 w-20 bg-white/5 rounded-full" />
                </div>
            </div>
        </div>
    </div>
)

/* ── Premium Experience Card (Timeline Row) ── */
const ExperienceCard = ({ experience, onEdit, onDelete, isLast }) => {
    const [hovered, setHovered] = useState(false)
    const techStack = Array.isArray(experience.tech_stack) ? experience.tech_stack : []
    const empStyle = getEmpStyle(experience.employment_type)
    const initials = getInitials(experience.company)
    const duration = calcDuration(
        experience.start_month,
        experience.start_year,
        experience.end_month,
        experience.end_year,
        experience.is_current,
    )
    const dateRange = formatDateRange(
        experience.start_month,
        experience.start_year,
        experience.end_month,
        experience.end_year,
        experience.is_current,
    )

    return (
        <div className="flex gap-4 sm:gap-6">
            {/* ── Timeline column ── */}
            <div className="flex flex-col items-center shrink-0">
                {/* Avatar / dot */}
                <div
                    className={`relative w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                        experience.is_current
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/5 border-white/12 text-gray-400'
                    } ${hovered ? 'scale-110 shadow-lg shadow-indigo-500/20' : ''}`}
                >
                    {initials || <Building2 className="w-4 h-4" />}
                    {experience.is_current && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0a1a]">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        </span>
                    )}
                </div>
                {/* Connector line */}
                {!isLast && (
                    <div className="w-px flex-1 mt-2 min-h-[48px]"
                        style={{ background: hovered ? 'linear-gradient(to bottom, rgba(99,102,241,0.4), transparent)' : 'rgba(255,255,255,0.06)', transition: 'background 0.4s' }}
                    />
                )}
            </div>

            {/* ── Card ── */}
            <div
                className="flex-1 pb-6 group"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <div
                    className="relative rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/18 transition-all duration-400 overflow-hidden"
                    style={{ boxShadow: hovered ? '0 0 32px -8px rgba(99,102,241,0.2)' : 'none' }}
                >
                    {/* Top glow on hover */}
                    <div
                        className="absolute inset-x-0 top-0 h-px transition-opacity duration-500"
                        style={{
                            opacity: hovered ? 1 : 0,
                            background: 'linear-gradient(90deg, transparent, var(--color-primary-light), transparent)',
                        }}
                    />

                    <div className="p-5 flex flex-col gap-4">
                        {/* ── Top row: Title / Company / Badge ── */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-white text-base leading-tight group-hover:text-indigo-100 transition-colors duration-300">
                                        {experience.position}
                                    </h3>
                                    {experience.is_current && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> Current
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-gray-400">
                                    <span className="font-medium text-gray-300">{experience.company}</span>
                                    {experience.location && (
                                        <>
                                            <span className="text-gray-600">·</span>
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin className="w-3 h-3" /> {experience.location}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Employment type badge */}
                            <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${empStyle.bg} ${empStyle.border} ${empStyle.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${empStyle.dot}`} />
                                {experience.employment_type}
                            </span>
                        </div>

                        {/* ── Date range + Duration ── */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
                                <Calendar className="w-3 h-3 text-gray-600" />
                                <span>{dateRange}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
                                <Timer className="w-3 h-3 text-gray-600" />
                                <span>{duration}</span>
                            </div>
                        </div>

                        {/* ── Description ── */}
                        {experience.description && (
                            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 border-l-2 border-white/8 pl-3 group-hover:border-indigo-500/30 transition-colors duration-300">
                                {experience.description}
                            </p>
                        )}

                        {/* ── Tech Stack ── */}
                        {techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                <span className="flex items-center gap-1 text-[10px] text-gray-600 mr-1">
                                    <Code2 className="w-3 h-3" /> Stack:
                                </span>
                                {techStack.slice(0, 6).map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-2.5 py-0.5 rounded-full bg-indigo-500/8 border border-indigo-500/20 text-indigo-300/80 text-[11px] hover:bg-indigo-500/15 transition-colors"
                                    >
                                        {tech}
                                    </span>
                                ))}
                                {techStack.length > 6 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[11px]">
                                        +{techStack.length - 6}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/6">
                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> #{experience.display_order ?? 0} in timeline
                            </span>
                            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    type="button"
                                    onClick={() => onEdit(experience)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 text-xs font-medium transition-all duration-200"
                                >
                                    <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(experience.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 hover:bg-red-500/18 hover:border-red-500/40 text-xs font-medium transition-all duration-200"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Main Page ── */
export default function WorkExperiences() {
    const [experiences, setExperiences] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editExperience, setEditExperience] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState({})

    const syncDisplayOrders = async (items) => {
        const total = items.length
        if (total === 0) return

        for (let i = 0; i < total; i++) {
            const { error } = await supabase
                .from('work_experiences')
                .update({ display_order: -(i + 1) })
                .eq('id', items[i].id)
            if (error) { console.error('Failed to stage display_order for', items[i].id, error); return }
        }

        for (let i = 0; i < total; i++) {
            const { error } = await supabase
                .from('work_experiences')
                .update({ display_order: total - i })
                .eq('id', items[i].id)
            if (error) { console.error('Failed to finalize display_order for', items[i].id, error); return }
        }
    }

    const fetchExperiences = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('work_experiences').select('*')

        if (error) {
            console.error('Failed to fetch work experiences:', error)
            setExperiences([])
            setLoading(false)
            return
        }

        const normalized = (data || []).map(normalizeWorkExperience).sort(compareWorkExperienceTimeline)

        const needsOrderReset = normalized.some((experience, index) => {
            const expectedOrder = normalized.length - index
            return Number(experience.display_order ?? 0) !== expectedOrder
        })

        if (needsOrderReset) {
            await syncDisplayOrders(normalized)
            setExperiences(normalized.map((experience, index) => ({ ...experience, display_order: normalized.length - index })))
            setLoading(false)
            return
        }

        setExperiences(normalized)
        setLoading(false)
    }

    useEffect(() => { fetchExperiences() }, [])

    const nextDisplayOrder = useMemo(() => {
        const maxOrder = experiences.reduce((cur, e) => {
            const o = Number(e.display_order ?? 0)
            return o > cur ? o : cur
        }, 0)
        return maxOrder + 1
    }, [experiences])

    const closeModals = () => { setShowCreate(false); setEditExperience(null); setFormErrors({}) }

    const handleCreate = async (form) => {
        const errors = validateWorkExperienceForm(form)
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
        setSubmitting(true); setFormErrors({})
        const payload = buildWorkExperiencePayload(form)
        payload.display_order = nextDisplayOrder
        const { error } = await supabase.from('work_experiences').insert(payload)
        setSubmitting(false)
        if (error) { console.error('Failed to create work experience:', error); return }
        closeModals(); fetchExperiences()
    }

    const handleEdit = async (form) => {
        if (!editExperience) return
        const errors = validateWorkExperienceForm(form)
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
        setSubmitting(true); setFormErrors({})
        const payload = buildWorkExperiencePayload(form)
        payload.display_order = editExperience.display_order ?? 0
        const { error } = await supabase.from('work_experiences').update(payload).eq('id', editExperience.id)
        setSubmitting(false)
        if (error) { console.error('Failed to update work experience:', error); return }
        closeModals(); fetchExperiences()
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this work experience?')) return
        const { error } = await supabase.from('work_experiences').delete().eq('id', id)
        if (error) { console.error('Failed to delete work experience:', error); return }
        fetchExperiences()
    }

    const handleOpenEdit = (experience) => { setEditExperience(experience); setShowCreate(false); setFormErrors({}) }
    const handleOpenCreate = () => { setShowCreate(true); setEditExperience(null); setFormErrors({}) }

    const currentCount = experiences.filter((e) => e.is_current).length
    const totalYears = (() => {
        let totalMonths = 0
        for (const e of experiences) {
            const now = new Date()
            const start = new Date(e.start_year, (e.start_month ?? 1) - 1)
            const end = e.is_current ? now : new Date(e.end_year ?? now.getFullYear(), (e.end_month ?? 1) - 1)
            totalMonths += Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()))
        }
        return Math.floor(totalMonths / 12)
    })()

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left: Icon + Title + Stats */}
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div
                            className="absolute -inset-1 rounded-xl blur-md opacity-60"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))' }}
                        />
                        <div
                            className="relative w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-backdrop-base)' }}
                        >
                            <Briefcase className="w-5 h-5 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Work Experience</h1>
                        {!loading && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5">
                                    <Briefcase className="w-3 h-3" /> {experiences.length} roles
                                </span>
                                {currentCount > 0 && (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                                        <CheckCircle2 className="w-3 h-3" /> {currentCount} current
                                    </span>
                                )}
                                {totalYears > 0 && (
                                    <span className="flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5">
                                        <GraduationCap className="w-3 h-3" /> {totalYears}+ yrs exp
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <button onClick={handleOpenCreate} className="relative group shrink-0">
                    <div
                        className="absolute -inset-0.5 rounded-xl opacity-50 blur group-hover:opacity-90 transition duration-300"
                        style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }}
                    />
                    <div
                        className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10"
                        style={{ backgroundColor: 'var(--color-backdrop-base)' }}
                    >
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-gray-200">Add Experience</span>
                    </div>
                </button>
            </div>

            {/* ── Modals ── */}
            {showCreate && (
                <Modal title="Add New Work Experience" onClose={closeModals}>
                    <WorkExperienceForm onSubmit={handleCreate} onCancel={closeModals} submitting={submitting} errors={formErrors} submitLabel="Save Experience" />
                </Modal>
            )}
            {editExperience && (
                <Modal title="Edit Work Experience" onClose={closeModals}>
                    <WorkExperienceForm initial={editExperience} onSubmit={handleEdit} onCancel={closeModals} submitting={submitting} errors={formErrors} submitLabel="Update Experience" />
                </Modal>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="space-y-0 pt-2">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : experiences.length === 0 ? (
                /* Empty state */
                <div className="relative rounded-2xl border border-white/8 border-dashed overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
                    />
                    <div className="relative py-24 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-gray-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-300 font-medium text-sm">No work experiences yet</p>
                            <p className="text-gray-600 text-xs mt-1">Add your first role to build your career timeline</p>
                        </div>
                        <button onClick={handleOpenCreate} className="relative group mt-2">
                            <div
                                className="absolute -inset-0.5 rounded-xl opacity-50 blur group-hover:opacity-90 transition duration-300"
                                style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }}
                            />
                            <div
                                className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-200"
                                style={{ backgroundColor: 'var(--color-backdrop-base)' }}
                            >
                                <Plus className="w-4 h-4 text-indigo-400" /> Add First Experience
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                /* ── Timeline ── */
                <div className="pt-2">
                    {/* Legend */}
                    <div className="flex items-center gap-3 mb-5 text-[11px] text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Current role
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" /> Past role
                        </span>
                        <span className="hidden sm:flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Sorted by most recent first
                        </span>
                    </div>

                    <div className="space-y-0">
                        {experiences.map((experience, index) => (
                            <ExperienceCard
                                key={experience.id}
                                experience={experience}
                                onEdit={handleOpenEdit}
                                onDelete={handleDelete}
                                isLast={index === experiences.length - 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}