/**
 * Normalize work experience data from Supabase
 * Ensures all required fields have default values
 */
export const normalizeWorkExperience = (experience) => {
    let tech_stack = [];
    if (typeof experience.tech_stack === 'string') {
        try {
            tech_stack = JSON.parse(experience.tech_stack);
        } catch {
            tech_stack = [];
        }
    } else if (Array.isArray(experience.tech_stack)) {
        tech_stack = experience.tech_stack;
    }

    return {
        id: experience.id,
        position: experience.position || '',
        company: experience.company || '',
        employment_type: experience.employment_type || 'Full Time',
        location: experience.location || '',
        start_month: experience.start_month || 1,
        start_year: experience.start_year || new Date().getFullYear(),
        end_month: experience.end_month || null,
        end_year: experience.end_year || null,
        is_current: experience.is_current || false,
        description: experience.description || '',
        tech_stack: tech_stack,
        display_order: experience.display_order || 1,
    };
};

/**
 * Compare function for sorting work experiences by timeline
 * Most recent first (end_year/end_month descending, then start_year/start_month descending)
 */
export const compareWorkExperienceTimeline = (a, b) => {
    const aEndYear = a.is_current ? new Date().getFullYear() : (a.end_year || 0);
    const aEndMonth = a.is_current ? new Date().getMonth() + 1 : (a.end_month || 0);

    const bEndYear = b.is_current ? new Date().getFullYear() : (b.end_year || 0);
    const bEndMonth = b.is_current ? new Date().getMonth() + 1 : (b.end_month || 0);

    // Most recent first by end date
    if (aEndYear !== bEndYear) {
        return bEndYear - aEndYear;
    }

    if (aEndMonth !== bEndMonth) {
        return bEndMonth - aEndMonth;
    }

    // If end dates are the same, sort by start date
    if (a.start_year !== b.start_year) {
        return b.start_year - a.start_year;
    }

    return (b.start_month || 0) - (a.start_month || 0);
};

/**
 * Format date range for display
 * Returns "Month YYYY - Month YYYY" or "Month YYYY - Present" if currently working
 */
export const formatDateRange = (startMonth, startYear, endMonth, endYear, isCurrently) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const start = `${monthNames[startMonth - 1] || 'Jan'} ${startYear}`;
    const end = isCurrently ? 'Present' : `${monthNames[(endMonth || 1) - 1] || 'Jan'} ${endYear}`;

    return `${start} - ${end}`;
};

/**
 * Get badge classes based on employment type
 * Returns Tailwind classes for styling
 */
export const getEmploymentTypeBadgeClasses = (employmentType) => {
    const baseClasses = 'font-medium';

    switch (employmentType?.toLowerCase()) {
        case 'full-time':
            return `${baseClasses} bg-theme-state-success/10 text-theme-state-success border-theme-state-success/30`;
        case 'part-time':
            return `${baseClasses} bg-theme-state-info/10 text-theme-state-info border-theme-state-info/30`;
        case 'contract':
            return `${baseClasses} bg-theme-state-warning/10 text-theme-state-warning border-theme-state-warning/30`;
        case 'freelance':
            return `${baseClasses} bg-theme-secondary-dark/10 text-theme-secondary-light border-theme-secondary-dark/30`;
        case 'internship':
            return `${baseClasses} bg-theme-primary-dark/10 text-theme-primary-light border-theme-primary-dark/30`;
        default:
            return `${baseClasses} bg-gray-500/10 text-gray-400 border-gray-500/30`;
    }
};
