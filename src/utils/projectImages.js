export const MAX_PROJECT_IMAGES = 6

export const normalizeProjectImages = (project) => {
    if (!project) return []

    const images = []

    const pushValue = (value) => {
        if (!value) return

        if (Array.isArray(value)) {
            value.forEach(pushValue)
            return
        }

        if (typeof value === "string") {
            const trimmed = value.trim()
            if (trimmed) images.push(trimmed)
        }
    }

    pushValue(project.images)
    pushValue(project.Images)
    pushValue(project.img)
    pushValue(project.Img)
    pushValue(project.image)
    pushValue(project.Image)

    return [...new Set(images)].slice(0, MAX_PROJECT_IMAGES)
}

export const getPrimaryProjectImage = (project) => normalizeProjectImages(project)[0] || ""