import { useEffect, useMemo, useState } from 'react'
import { Calendar, Plus, X } from 'lucide-react'
import {
    EMPLOYMENT_TYPES,
    MAX_YEAR,
    MIN_YEAR,
    MONTH_NAMES,
    normalizeWorkExperience,
} from '../utils/workExperiences'

const FieldError = ({ message }) =>
    message ? <p className="text-[11px] text-red-400 mt-1">{message}</p> : null

const InputField = ({ label, value, onChange, placeholder, error, type = 'text', required = false }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full bg-[#0d0d22] border rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none transition-all focus:ring-1 ${error ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : 'border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/20'}`}
        />
        <FieldError message={error} />
    </div>
)

const SelectField = ({ label, value, onChange, options, placeholder, error }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            {label}
        </label>
        <select
            value={value}
            onChange={onChange}
            className={`w-full bg-[#0d0d22] border rounded-xl px-4 py-2.5 text-gray-200 text-sm outline-none transition-all focus:ring-1 ${error ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : 'border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/20'}`}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
        <FieldError message={error} />
    </div>
)

const MonthYearSelect = ({ label, month, year, onMonthChange, onYearChange, errorMonth, errorYear }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            {label}
        </label>
        <div className="grid grid-cols-2 gap-3">
            <div>
                <select
                    value={month}
                    onChange={onMonthChange}
                    className={`w-full bg-[#0d0d22] border rounded-xl px-4 py-2.5 text-gray-200 text-sm outline-none transition-all focus:ring-1 ${errorMonth ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : 'border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/20'}`}
                >
                    <option value="">Month</option>
                    {MONTH_NAMES.map((item, index) => (
                        <option key={item} value={index + 1}>
                            {item}
                        </option>
                    ))}
                </select>
                <FieldError message={errorMonth} />
            </div>
            <div>
                <select
                    value={year}
                    onChange={onYearChange}
                    className={`w-full bg-[#0d0d22] border rounded-xl px-4 py-2.5 text-gray-200 text-sm outline-none transition-all focus:ring-1 ${errorYear ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : 'border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/20'}`}
                >
                    <option value="">Year</option>
                    {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, index) => MIN_YEAR + index).map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
                <FieldError message={errorYear} />
            </div>
        </div>
    </div>
)

export default function WorkExperienceForm({
    initial,
    onSubmit,
    onCancel,
    submitting = false,
    errors = {},
    submitLabel = 'Save Experience',
}) {
    const initialForm = useMemo(() => {
        const normalized = normalizeWorkExperience(initial)

        return {
            position: normalized.position || '',
            employment_type: normalized.employment_type || '',
            company: normalized.company || '',
            is_current: Boolean(normalized.is_current),
            start_month: normalized.start_month ? String(normalized.start_month) : '',
            start_year: normalized.start_year ? String(normalized.start_year) : '',
            end_month: normalized.is_current ? '' : normalized.end_month ? String(normalized.end_month) : '',
            end_year: normalized.is_current ? '' : normalized.end_year ? String(normalized.end_year) : '',
            location: normalized.location || '',
            description: normalized.description || '',
            tech_stack: normalized.tech_stack || [],
            tech_input: '',
        }
    }, [initial])

    const [form, setForm] = useState(initialForm)

    useEffect(() => {
        setForm(initialForm)
    }, [initialForm])

    const set = (key) => (event) => {
        const value = key === 'is_current' ? event.target.checked : event.target.value

        if (key === 'is_current' && value) {
            setForm((current) => ({
                ...current,
                is_current: true,
                end_month: '',
                end_year: '',
            }))
            return
        }

        setForm((current) => ({ ...current, [key]: value }))
    }

    const addTech = () => {
        const tech = form.tech_input.trim()
        if (!tech) return

        setForm((current) => {
            if (current.tech_stack.some((item) => item.toLowerCase() === tech.toLowerCase())) {
                return { ...current, tech_input: '' }
            }

            return {
                ...current,
                tech_stack: [...current.tech_stack, tech].slice(0, 12),
                tech_input: '',
            }
        })
    }

    const removeTech = (techToRemove) => {
        setForm((current) => ({
            ...current,
            tech_stack: current.tech_stack.filter((tech) => tech !== techToRemove),
        }))
    }

    const handleTechKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            addTech()
        }
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit(form)
            }}
            className="p-5 sm:p-6 space-y-5"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <InputField
                        label="Position"
                        value={form.position}
                        onChange={set('position')}
                        placeholder="e.g. Frontend Developer"
                        required
                        error={errors.position}
                    />
                </div>

                <SelectField
                    label="Employment Type"
                    value={form.employment_type}
                    onChange={set('employment_type')}
                    options={EMPLOYMENT_TYPES}
                    placeholder="Select employment type"
                    error={errors.employment_type}
                />

                <InputField
                    label="Company"
                    value={form.company}
                    onChange={set('company')}
                    placeholder="e.g. PT Teknologi Nusantara"
                    required
                    error={errors.company}
                />

                <InputField
                    label="Location"
                    value={form.location}
                    onChange={set('location')}
                    placeholder="e.g. Jakarta, Indonesia"
                    error={errors.location}
                />

                <div className="sm:col-span-2 space-y-1.5">
                    <label className="flex items-center gap-3 text-sm text-gray-300 bg-white/3 border border-white/10 rounded-xl px-4 py-3">
                        <input
                            type="checkbox"
                            checked={form.is_current}
                            onChange={set('is_current')}
                            className="accent-indigo-500 w-4 h-4"
                        />
                        <span className="flex items-center gap-2">
                            This is my current role
                        </span>
                    </label>
                </div>

                <div className="sm:col-span-2">
                    <MonthYearSelect
                        label="Start Date"
                        month={form.start_month}
                        year={form.start_year}
                        onMonthChange={set('start_month')}
                        onYearChange={set('start_year')}
                        errorMonth={errors.start_month}
                        errorYear={errors.start_year}
                    />
                </div>

                {!form.is_current && (
                    <div className="sm:col-span-2">
                        <MonthYearSelect
                            label="End Date"
                            month={form.end_month}
                            year={form.end_year}
                            onMonthChange={set('end_month')}
                            onYearChange={set('end_year')}
                            errorMonth={errors.end_month}
                            errorYear={errors.end_year}
                        />
                        <FieldError message={errors.end_date} />
                    </div>
                )}

                <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
                        Description
                    </label>
                    <textarea
                        value={form.description}
                        onChange={set('description')}
                        rows={4}
                        placeholder="Explain your main responsibilities, achievements, and scope..."
                        className={`w-full bg-[#0d0d22] border rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none transition-all resize-none focus:ring-1 ${errors.description ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : 'border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/20'}`}
                    />
                    <FieldError message={errors.description} />
                </div>

                <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
                        Tech Stack / Skills
                    </label>
                    <div className="rounded-xl border border-white/10 bg-[#0d0d22] p-4 space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={form.tech_input}
                                onChange={set('tech_input')}
                                onKeyDown={handleTechKeyDown}
                                placeholder="Type a skill and press Enter"
                                className="flex-1 bg-[#0a0a1a] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            />
                            <button
                                type="button"
                                onClick={addTech}
                                className="px-4 py-2.5 rounded-xl border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/10 transition-colors text-sm inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>

                        {form.tech_stack.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {form.tech_stack.map((tech) => (
                                    <span
                                        key={tech}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs"
                                    >
                                        {tech}
                                        <button
                                            type="button"
                                            onClick={() => removeTech(tech)}
                                            className="text-indigo-200/80 hover:text-white transition-colors"
                                            aria-label={`Remove ${tech}`}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">Add technologies or skills used in this role.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
                >
                    Cancel
                </button>
                <button type="submit" disabled={submitting} className="relative group/s">
                    <div className="absolute -inset-0.5 rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                    <div className="relative flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Calendar className="w-4 h-4 text-indigo-400" />
                        )}
                        <span className="text-sm text-gray-200">{submitting ? 'Saving...' : submitLabel}</span>
                    </div>
                </button>
            </div>
        </form>
    )
}