const DEFAULT_ORIGIN = 'https://asutrisna-porto.vercel.app/'

const trimString = (value) => String(value ?? '').trim()

export const resolveSiteUrl = (origin = DEFAULT_ORIGIN, path = '/') => {
    const base = trimString(origin) || DEFAULT_ORIGIN
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${base.replace(/\/$/, '')}${normalizedPath}`
}

export const resolveAbsoluteUrl = (value, origin = DEFAULT_ORIGIN) => {
    const url = trimString(value)
    if (!url) return ''

    if (/^https?:\/\//i.test(url)) return url

    try {
        return new URL(url, origin || DEFAULT_ORIGIN).toString()
    } catch {
        return url
    }
}

const normalizeList = (value) => {
    if (!Array.isArray(value)) return []
    return Array.from(new Set(value.map(trimString).filter(Boolean)))
}

export const serializeJsonLd = (value) =>
    JSON.stringify(value)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')

export const buildWebSiteSchema = ({ name, url, description, inLanguage = 'id', publisher }) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: trimString(name),
    url: trimString(url),
    description: trimString(description),
    inLanguage,
    publisher: publisher || undefined,
})

export const buildWebPageSchema = ({ name, url, description, primaryImageOfPage, about, isPartOf, author }) => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: trimString(name),
    url: trimString(url),
    description: trimString(description),
    primaryImageOfPage: primaryImageOfPage ? { '@type': 'ImageObject', url: primaryImageOfPage } : undefined,
    about: about || undefined,
    isPartOf: isPartOf || undefined,
    author: author || undefined,
})

export const buildPersonSchema = ({ name, url, image, jobTitle, description, sameAs = [] }) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: trimString(name),
    url: trimString(url),
    image: trimString(image),
    jobTitle: trimString(jobTitle),
    description: trimString(description),
    sameAs: normalizeList(sameAs),
})

export const buildCreativeWorkSchema = ({ name, url, description, image, author, publisher, datePublished, dateModified }) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: trimString(name),
    url: trimString(url),
    description: trimString(description),
    image: trimString(image),
    author: author || undefined,
    publisher: publisher || undefined,
    datePublished: trimString(datePublished),
    dateModified: trimString(dateModified),
})
