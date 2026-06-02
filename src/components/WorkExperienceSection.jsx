import { useEffect, useMemo, useState, memo, useRef } from 'react'
import { Briefcase, Sparkles, MapPin, CalendarDays } from 'lucide-react'
import { supabase } from '../supabase'
import {
    compareWorkExperienceTimeline,
    formatDateRange,
    getEmploymentTypeBadgeClasses,
    normalizeWorkExperience,
} from '../utils/workExperiences'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

const SectionHeader = memo(() => (
    <div className="text-center pb-10">
        <Badge variant="default" className="px-4 py-2 text-sm mb-5">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary-light)' }} />
            Career journey and hands-on experience
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary-light)' }} />
        </Badge>

        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
            Work Experience
        </h2>

        <p className="mt-4 text-gray-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            A summary of roles, responsibilities, and technologies I have used across internships, contract work, and full-time positions.
        </p>
    </div>
))
SectionHeader.displayName = 'SectionHeader'

/**
 * Parses a description string into structured blocks:
 * - Lines starting with '- ' or '• ' → rendered as <ul><li> list (semantic, SEO-friendly)
 * - Blank lines → paragraph break
 * - Other text → rendered as a <p>
 *
 * Groups consecutive bullet lines together into a single <ul>.
 */
function renderDescription(text) {
    if (!text) return null

    const lines = text.split('\n')
    const blocks = [] // array of { type: 'bullet'|'text', content: string }

    lines.forEach((raw) => {
        const line = raw.trim()
        if (!line) return // skip empty lines
        const isBullet = /^[-•–]\s+/.test(line)
        if (isBullet) {
            blocks.push({ type: 'bullet', content: line.replace(/^[-•–]\s+/, '') })
        } else {
            blocks.push({ type: 'text', content: line })
        }
    })

    if (!blocks.length) return null

    // Group consecutive bullets into <ul>, interleave with <p> for text
    const elements = []
    let i = 0
    while (i < blocks.length) {
        if (blocks[i].type === 'bullet') {
            // Collect all consecutive bullet items
            const items = []
            while (i < blocks.length && blocks[i].type === 'bullet') {
                items.push(blocks[i].content)
                i++
            }
            elements.push(
                <ul key={`ul-${i}`} className="space-y-1.5 list-none">
                    {items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm sm:text-base text-gray-200 leading-relaxed">
                            <span
                                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: 'var(--color-primary-light)' }}
                                aria-hidden="true"
                            />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        } else {
            elements.push(
                <p key={`p-${i}`} className="text-sm sm:text-base text-gray-200 leading-relaxed">
                    {blocks[i].content}
                </p>
            )
            i++
        }
    }

    return <div className="space-y-2">{elements}</div>
}

const ExperienceCard = ({ experience }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isTruncated, setIsTruncated] = useState(false)
    const contentRef = useRef(null)
    const techStack = Array.isArray(experience.tech_stack) ? experience.tech_stack : []

    useEffect(() => {
        if (contentRef.current) {
            // Check if the scroll height exceeds our collapsed max-height
            if (contentRef.current.scrollHeight > 180) {
                setIsTruncated(true)
            }
        }
    }, [experience.description])

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-primary-dark to-theme-primary-light rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500" />
            <Card className="relative h-full p-5 sm:p-6 group-hover:border-white/30 transition-all duration-500">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                                {experience.position}
                            </h3>
                            {experience.is_current && (
                                <Badge variant="primary" className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5">
                                    Current
                                </Badge>
                            )}
                        </div>

                        <p className="text-gray-300 text-sm sm:text-base flex flex-wrap items-center gap-2">
                            <span className="font-medium text-white">{experience.company}</span>
                            <span className="text-gray-600">•</span>
                            <Badge variant="neutral" className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 font-normal">
                                {experience.employment_type}
                            </Badge>
                        </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                        <Badge variant="neutral" className="text-xs font-normal hover:bg-[color:var(--color-backdrop-base)] cursor-default transition-colors">
                            <CalendarDays className="text-theme-primary-light" />
                            {formatDateRange(
                                experience.start_month,
                                experience.start_year,
                                experience.end_month,
                                experience.end_year,
                                experience.is_current,
                            )}
                        </Badge>

                        {experience.location && (
                            <Badge variant="neutral" className="text-xs font-normal hover:bg-[color:var(--color-backdrop-base)] cursor-default transition-colors">
                                <MapPin className="text-theme-primary-light" />
                                {experience.location}
                            </Badge>
                        )}
                    </div>
                </div>

                {experience.description && (
                    <div className="mt-5 relative">
                        <div 
                            ref={contentRef}
                            className={`transition-all duration-500 overflow-hidden ${
                                isExpanded ? 'max-h-[2000px]' : 'max-h-[150px]'
                            }`}
                        >
                            {renderDescription(experience.description)}
                            
                            {!isExpanded && isTruncated && (
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[color:var(--color-backdrop-base)] to-transparent pointer-events-none" />
                            )}
                        </div>
                        
                        {isTruncated && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-3 text-sm text-theme-primary-light hover:text-white transition-colors flex items-center gap-1 font-medium focus:outline-none relative z-10"
                            >
                                {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                    </div>
                )}

                {techStack.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {techStack.map((tech) => (
                            <Badge
                                key={tech}
                                variant="neutral"
                                className="text-xs font-normal hover:bg-[color:var(--color-backdrop-base)] cursor-default transition-colors"
                            >
                                {tech}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-white/0 via-white/15 to-white/0" />
            </Card>
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
                            <div className="space-y-5 sm:space-y-6 md:pl-10 lg:pl-12">
                                {experiences.map((experience, index) => (
                                    <div key={experience.id} className="relative">
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