export const EMPLOYMENT_TYPES = ["Magang", "Full Time", "Kontrak"]
export const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
]

export const MIN_YEAR = 2000
export const MAX_YEAR = new Date().getFullYear()

export const formatMonthYear = (month, year) => {
    const monthIndex = Number(month) - 1
    const safeMonth = MONTH_NAMES[monthIndex] || ""
    const safeYear = year ? String(year) : ""

    if (!safeMonth && !safeYear) return ""
    if (!safeMonth) return safeYear
    if (!safeYear) return safeMonth

    return `${safeMonth} ${safeYear}`
}

export const formatDateRange = (startMonth, startYear, endMonth, endYear, isCurrent) => {
    const start = formatMonthYear(startMonth, startYear)
    if (!start) return ""

    if (isCurrent) {
        return `${start} - Present`
    }

    const end = formatMonthYear(endMonth, endYear)
    if (!end) return start

    return `${start} - ${end}`
}

export const getWorkExperienceTimelineValue = (experience = {}) => {
    const isCurrent = Boolean(experience.is_current ?? experience.isCurrent)
    const now = new Date()

    const year = isCurrent
        ? now.getFullYear()
        : Number(experience.end_year ?? experience.endYear ?? experience.start_year ?? experience.startYear ?? 0)

    const month = isCurrent
        ? now.getMonth() + 1
        : Number(experience.end_month ?? experience.endMonth ?? experience.start_month ?? experience.startMonth ?? 0)

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        return 0
    }

    return year * 100 + month
}

export const compareWorkExperienceTimeline = (left, right) => {
    const rightTimeline = getWorkExperienceTimelineValue(right)
    const leftTimeline = getWorkExperienceTimelineValue(left)

    if (rightTimeline !== leftTimeline) {
        return rightTimeline - leftTimeline
    }

    const rightStart = (Number(right.start_year ?? right.startYear ?? 0) * 100) + Number(right.start_month ?? right.startMonth ?? 0)
    const leftStart = (Number(left.start_year ?? left.startYear ?? 0) * 100) + Number(left.start_month ?? left.startMonth ?? 0)

    if (rightStart !== leftStart) {
        return rightStart - leftStart
    }

    return (Number(right.display_order ?? right.displayOrder ?? 0) - Number(left.display_order ?? left.displayOrder ?? 0))
}

export const getEmploymentTypeBadgeClasses = (employmentType) => {
    const badgeClasses = {
        Magang: "bg-blue-500/20 border-blue-500/30 text-blue-300",
        "Full Time": "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
        Kontrak: "bg-orange-500/20 border-orange-500/30 text-orange-300",
    }

    return badgeClasses[employmentType] || "bg-white/10 border-white/15 text-gray-300"
}

export const normalizeTechStack = (techStack) => {
    if (Array.isArray(techStack)) {
        return techStack
            .map((item) => String(item ?? "").trim())
            .filter(Boolean)
    }

    if (typeof techStack === "string" && techStack.trim()) {
        return techStack
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
    }

    return []
}

export const normalizeWorkExperience = (rawExperience = {}) => {
    const techStack = normalizeTechStack(
        rawExperience.tech_stack ?? rawExperience.techStack ?? rawExperience.TechStack,
    )

    const startMonth = Number(rawExperience.start_month ?? rawExperience.startMonth ?? "") || ""
    const startYear = Number(rawExperience.start_year ?? rawExperience.startYear ?? "") || ""
    const endMonth = Number(rawExperience.end_month ?? rawExperience.endMonth ?? "") || ""
    const endYear = Number(rawExperience.end_year ?? rawExperience.endYear ?? "") || ""
    const isCurrent = Boolean(rawExperience.is_current ?? rawExperience.isCurrent)

    return {
        ...rawExperience,
        position: rawExperience.position ?? rawExperience.title ?? "",
        employment_type: rawExperience.employment_type ?? rawExperience.employmentType ?? "",
        company: rawExperience.company ?? "",
        is_current: isCurrent,
        start_month: startMonth,
        start_year: startYear,
        end_month: isCurrent ? "" : endMonth,
        end_year: isCurrent ? "" : endYear,
        location: rawExperience.location ?? "",
        description: rawExperience.description ?? "",
        tech_stack: techStack,
        display_order: Number(rawExperience.display_order ?? rawExperience.displayOrder ?? 0) || 0,
        created_at: rawExperience.created_at ?? rawExperience.createdAt ?? null,
        updated_at: rawExperience.updated_at ?? rawExperience.updatedAt ?? null,
    }
}

export const validateWorkExperienceForm = (form) => {
    const errors = {}

    const position = String(form.position ?? "").trim()
    const employmentType = String(form.employment_type ?? "").trim()
    const company = String(form.company ?? "").trim()
    const location = String(form.location ?? "").trim()
    const description = String(form.description ?? "").trim()
    const startMonth = Number(form.start_month)
    const startYear = Number(form.start_year)
    const endMonth = Number(form.end_month)
    const endYear = Number(form.end_year)
    const isCurrent = Boolean(form.is_current)

    if (!position) {
        errors.position = "Position wajib diisi"
    } else if (position.length > 100) {
        errors.position = "Position maksimal 100 karakter"
    }

    if (!EMPLOYMENT_TYPES.includes(employmentType)) {
        errors.employment_type = "Jenis pekerjaan tidak valid"
    }

    if (!company) {
        errors.company = "Company wajib diisi"
    } else if (company.length > 100) {
        errors.company = "Company maksimal 100 karakter"
    }

    if (!Number.isInteger(startMonth) || startMonth < 1 || startMonth > 12) {
        errors.start_month = "Start month harus antara 1 sampai 12"
    }

    if (!Number.isInteger(startYear) || startYear < MIN_YEAR || startYear > MAX_YEAR) {
        errors.start_year = `Start year harus antara ${MIN_YEAR} sampai ${MAX_YEAR}`
    }

    if (!location && location !== "") {
        errors.location = "Location tidak valid"
    } else if (location.length > 100) {
        errors.location = "Location maksimal 100 karakter"
    }

    if (description.length > 1000) {
        errors.description = "Description maksimal 1000 karakter"
    }

    if (!isCurrent) {
        if (!Number.isInteger(endMonth) || endMonth < 1 || endMonth > 12) {
            errors.end_month = "End month harus antara 1 sampai 12"
        }

        if (!Number.isInteger(endYear) || endYear < MIN_YEAR || endYear > MAX_YEAR) {
            errors.end_year = `End year harus antara ${MIN_YEAR} sampai ${MAX_YEAR}`
        }

        if (
            Number.isInteger(startYear) &&
            Number.isInteger(startMonth) &&
            Number.isInteger(endYear) &&
            Number.isInteger(endMonth)
        ) {
            const startValue = startYear * 100 + startMonth
            const endValue = endYear * 100 + endMonth

            if (endValue < startValue) {
                errors.end_date = "End date harus lebih besar atau sama dengan start date"
            }
        }
    }

    return errors
}

export const buildWorkExperiencePayload = (form) => ({
    position: String(form.position ?? "").trim(),
    employment_type: String(form.employment_type ?? "").trim(),
    company: String(form.company ?? "").trim(),
    is_current: Boolean(form.is_current),
    start_month: Number(form.start_month),
    start_year: Number(form.start_year),
    end_month: form.is_current ? null : Number(form.end_month),
    end_year: form.is_current ? null : Number(form.end_year),
    location: String(form.location ?? "").trim(),
    description: String(form.description ?? "").trim(),
    tech_stack: normalizeTechStack(form.tech_stack),
})