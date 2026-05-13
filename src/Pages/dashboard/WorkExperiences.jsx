import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../supabase'
import { Briefcase, Pencil, Plus, Trash2, Sparkles } from 'lucide-react'
import WorkExperienceForm from '../../components/WorkExperienceForm'
import {
    buildWorkExperiencePayload,
    compareWorkExperienceTimeline,
    formatDateRange,
    getEmploymentTypeBadgeClasses,
    normalizeWorkExperience,
    validateWorkExperienceForm,
} from '../../utils/workExperiences'

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
                        <span className="text-xl leading-none">×</span>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    </div>
)

const SkeletonCard = () => (
    <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10" />
        <div className="relative bg-white/5 border border-white/12 rounded-2xl p-4 flex flex-col gap-3">
            <div className="h-4 bg-white/5 animate-pulse rounded-lg w-2/3" />
            <div className="h-3 bg-white/5 animate-pulse rounded-lg w-1/2" />
            <div className="h-3 bg-white/5 animate-pulse rounded-lg w-full" />
            <div className="h-3 bg-white/5 animate-pulse rounded-lg w-4/5" />
            <div className="flex gap-1.5 mt-1">
                <div className="h-5 w-16 bg-white/5 animate-pulse rounded-full" />
                <div className="h-5 w-12 bg-white/5 animate-pulse rounded-full" />
            </div>
        </div>
    </div>
)

const ExperienceCard = ({ experience, onEdit, onDelete }) => {
    const techStack = Array.isArray(experience.tech_stack) ? experience.tech_stack : []

    return (
        <Card>
            <div className="p-5 flex flex-col h-full gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white text-base leading-snug">{experience.position}</h3>
                            {experience.is_current && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider">
                                    Current Role
                                </span>
                            )}
                        </div>
                        <p className="text-gray-300 text-sm">
                            {experience.company}
                            {experience.location ? ` · ${experience.location}` : ''}
                        </p>
                    </div>

                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] border uppercase tracking-wider ${getEmploymentTypeBadgeClasses(experience.employment_type)}`}>
                        {experience.employment_type}
                    </span>
                </div>

                <div className="text-xs text-gray-500">
                    {formatDateRange(
                        experience.start_month,
                        experience.start_year,
                        experience.end_month,
                        experience.end_year,
                        experience.is_current,
                    )}
                </div>

                {experience.description && (
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                        {experience.description}
                    </p>
                )}

                {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {techStack.slice(0, 6).map((tech) => (
                            <span
                                key={tech}
                                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px]"
                            >
                                {tech}
                            </span>
                        ))}
                        {techStack.length > 6 && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[11px]">
                                +{techStack.length - 6}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-white/8">
                    <span className="text-[11px] text-gray-500">Order: {experience.display_order ?? 0}</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => onEdit(experience)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10 text-xs transition-colors"
                        >
                            <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(experience.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
                        >
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

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

        // Two-step update avoids unique-constraint collisions if display_order is constrained.
        for (let i = 0; i < total; i++) {
            const { error } = await supabase
                .from('work_experiences')
                .update({ display_order: -(i + 1) })
                .eq('id', items[i].id)

            if (error) {
                console.error('Failed to stage display_order for', items[i].id, error)
                return
            }
        }

        for (let i = 0; i < total; i++) {
            const targetOrder = total - i
            const { error } = await supabase
                .from('work_experiences')
                .update({ display_order: targetOrder })
                .eq('id', items[i].id)

            if (error) {
                console.error('Failed to finalize display_order for', items[i].id, error)
                return
            }
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

        const normalized = (data || [])
            .map(normalizeWorkExperience)
            .sort(compareWorkExperienceTimeline)

        const needsOrderReset = normalized.some((experience, index) => {
            const expectedOrder = normalized.length - index
            return Number(experience.display_order ?? 0) !== expectedOrder
        })

        if (needsOrderReset) {
            await syncDisplayOrders(normalized)

            const refreshed = normalized.map((experience, index) => ({
                ...experience,
                display_order: normalized.length - index,
            }))

            setExperiences(refreshed)
            setLoading(false)
            return
        }

        setExperiences(normalized)
        setLoading(false)
    }

    useEffect(() => {
        fetchExperiences()
    }, [])

    const nextDisplayOrder = useMemo(() => {
        const maxOrder = experiences.reduce((currentMax, experience) => {
            const order = Number(experience.display_order ?? 0)
            return order > currentMax ? order : currentMax
        }, 0)

        return maxOrder + 1
    }, [experiences])

    const closeModals = () => {
        setShowCreate(false)
        setEditExperience(null)
        setFormErrors({})
    }

    const handleCreate = async (form) => {
        const errors = validateWorkExperienceForm(form)
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setSubmitting(true)
        setFormErrors({})

        const payload = buildWorkExperiencePayload(form)
        payload.display_order = nextDisplayOrder

        const { error } = await supabase.from('work_experiences').insert(payload)

        setSubmitting(false)

        if (error) {
            console.error('Failed to create work experience:', error)
            return
        }

        closeModals()
        fetchExperiences()
    }

    const handleEdit = async (form) => {
        if (!editExperience) return

        const errors = validateWorkExperienceForm(form)
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setSubmitting(true)
        setFormErrors({})

        const payload = buildWorkExperiencePayload(form)
        payload.display_order = editExperience.display_order ?? 0

        const { error } = await supabase
            .from('work_experiences')
            .update(payload)
            .eq('id', editExperience.id)

        setSubmitting(false)

        if (error) {
            console.error('Failed to update work experience:', error)
            return
        }

        closeModals()
        fetchExperiences()
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this work experience?')) return

        const { error } = await supabase.from('work_experiences').delete().eq('id', id)

        if (error) {
            console.error('Failed to delete work experience:', error)
            return
        }

        fetchExperiences()
    }

    const handleOpenEdit = (experience) => {
        setEditExperience(experience)
        setShowCreate(false)
        setFormErrors({})
    }

    const handleOpenCreate = () => {
        setShowCreate(true)
        setEditExperience(null)
        setFormErrors({})
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
                        <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Work Experiences</h1>
                        <p className="text-gray-500 text-xs">
                            {loading ? 'Loading...' : `${experiences.length} experiences total`}
                        </p>
                    </div>
                </div>

                <button onClick={handleOpenCreate} className="relative group shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-200">New Experience</span>
                    </div>
                </button>
            </div>

            {showCreate && (
                <Modal title="Add New Work Experience" onClose={closeModals}>
                    <WorkExperienceForm
                        onSubmit={handleCreate}
                        onCancel={closeModals}
                        submitting={submitting}
                        errors={formErrors}
                        submitLabel="Save Experience"
                    />
                </Modal>
            )}

            {editExperience && (
                <Modal title="Edit Work Experience" onClose={closeModals}>
                    <WorkExperienceForm
                        initial={editExperience}
                        onSubmit={handleEdit}
                        onCancel={closeModals}
                        submitting={submitting}
                        errors={formErrors}
                        submitLabel="Update Experience"
                    />
                </Modal>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            ) : experiences.length === 0 ? (
                <Card>
                    <div className="p-16 text-center">
                        <Sparkles className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No work experiences yet. Create your first one!</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {experiences.map((experience) => (
                        <ExperienceCard
                            key={experience.id}
                            experience={experience}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}