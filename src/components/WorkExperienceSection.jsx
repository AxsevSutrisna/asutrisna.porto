import { useEffect, useMemo, useState, memo } from 'react'
import { Briefcase, Sparkles, MapPin, CalendarDays } from 'lucide-react'
import { supabase } from '../supabase'
import {
    compareWorkExperienceTimeline,
    formatDateRange,
    getEmploymentTypeBadgeClasses,
    normalizeWorkExperience,
} from '../utils/workExperiences'

const SectionHeader = memo(() => (
    <div className="text-center pb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-sm text-gray-300 mb-5">
            <Sparkles className="w-4 h-4 text-theme-primary-light" />
            Career journey and hands-on experience
            <Sparkles className="w-4 h-4 text-purple-400" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-theme-primary-dark to-theme-primary-light">
            Work Experience
        </h2>

        <p className="mt-4 text-gray-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            A summary of roles, responsibilities, and technologies I have used across internships, contract work, and full-time positions.
        </p>
    </div>
))
SectionHeader.displayName = 'SectionHeader'

const ExperienceCard = ({ experience }) => {
    const techStack = Array.isArray(experience.tech_stack) ? experience.tech_stack : []

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-primary-dark to-theme-primary-light rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500" />
            <article className="relative h-full rounded-2xl border border-white/10 bg-[#090918]/80 backdrop-blur-xl p-5 sm:p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                                {experience.position}
                            </h3>
                            {experience.is_current && (
                                <span className="px-2.5 py-1 rounded-full bg-theme-primary-light/20 border border-theme-primary-light/30 text-theme-primary-light text-[10px] uppercase tracking-[0.2em]">
                                    Current
                                </span>
                            )}
                        </div>

                        <p className="text-gray-300 text-sm sm:text-base flex flex-wrap items-center gap-2">
                            <span className="font-medium text-white">{experience.company}</span>
                            <span className="text-gray-600">•</span>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${getEmploymentTypeBadgeClasses(experience.employment_type)}`}>
                                {experience.employment_type}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                            <CalendarDays className="w-3.5 h-3.5 text-theme-primary-light" />
                            {formatDateRange(
                                experience.start_month,
                                experience.start_year,
                                experience.end_month,
                                experience.end_year,
                                experience.is_current,
                            )}
                        </div>

                        {experience.location && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                                <MapPin className="w-3.5 h-3.5 text-theme-primary-light" />
                                {experience.location}
                            </div>
                        )}
                    </div>
                </div>

                {experience.description && (
                    <p className="mt-5 text-sm sm:text-base text-gray-400 leading-relaxed">
                        {experience.description}
                    </p>
                )}

                {techStack.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {techStack.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-200 text-xs"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-white/0 via-white/15 to-white/0" />
            </article>
        </div>
    )
}

const WorkExperienceSection = () => {
    const [experiences, setExperiences] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWorkExperiences = async () => {
            setLoading(true)

            try {
                const { data, error } = await supabase.from('work_experiences').select('*')
                if (error) throw error

                const normalized = (data || [])
                    .map(normalizeWorkExperience)
                    .sort(compareWorkExperienceTimeline)

                setExperiences(normalized)
                localStorage.setItem('workExperiences', JSON.stringify(data || []))
            } catch (error) {
                console.error('Failed to fetch work experiences:', error)

                const cached = localStorage.getItem('workExperiences')
                if (cached) {
                    setExperiences(
                        JSON.parse(cached).map(normalizeWorkExperience).sort(compareWorkExperienceTimeline),
                    )
                } else {
                    setExperiences([])
                }
            } finally {
                setLoading(false)
            }
        }

        fetchWorkExperiences()
    }, [])

    const hasExperiences = useMemo(() => experiences.length > 0, [experiences])

    return (
        <section
            id="WorkExperience"
            className="md:px-[10%] px-[5%] w-full sm:mt-0 mt-[3rem] bg-[var(--color-backdrop-base)] overflow-hidden py-20 sm:py-24"
            aria-label="Work Experience Section"
        >
            <div className="relative z-10 max-w-7xl mx-auto">
                <SectionHeader />

                <div className="mt-12 sm:mt-16">
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse min-h-[220px]" />
                            ))}
                        </div>
                    ) : hasExperiences ? (
                        <div className="relative">
                            <div
                                className="absolute left-[10px] top-0 bottom-0 w-px hidden md:block z-0"
                                style={{
                                    background:
                                        'linear-gradient(to bottom, color-mix(in srgb, var(--color-primary-dark) 70%, transparent) 0%, color-mix(in srgb, var(--color-primary-light) 45%, transparent) 45%, transparent 100%)',
                                }}
                            />
                            <div className="space-y-5 sm:space-y-6 md:pl-14 lg:pl-16">
                                {experiences.map((experience, index) => (
                                    <div key={experience.id} className="relative">
                                        <div className="absolute left-0 top-8 hidden md:flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-backdrop-base)] border border-theme-primary-dark/40 shadow-[0_0_0_6px_rgba(99,102,241,0.08)] z-10">
                                            <Briefcase className="w-3 h-3 text-theme-primary-light" />
                                        </div>
                                        <div className={`relative z-20 ${index % 2 === 0 ? 'lg:pr-20' : 'lg:pl-20'}`}>
                                            <ExperienceCard experience={experience} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 sm:p-14">
                            <Briefcase className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white">No work experience added yet</h3>
                            <p className="mt-3 text-gray-400">
                                The section is ready, but there is no published work experience to display.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default memo(WorkExperienceSection)