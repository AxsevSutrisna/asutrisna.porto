import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')
const outputPath = resolve(projectRoot, 'public', 'sitemap.xml')

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://asutrisna-porto.vercel.app/').replace(/\/$/, '')
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const staticPaths = ['/']

const escapeXml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

const toSlug = (title) =>
    String(title ?? '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

const formatLastMod = (value) => {
    if (!value) return null

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null

    return date.toISOString().slice(0, 10)
}

const createUrlEntry = ({ path, lastMod }) => {
    const loc = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
    return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        lastMod ? `    <lastmod>${escapeXml(lastMod)}</lastmod>` : null,
        '  </url>',
    ]
        .filter(Boolean)
        .join('\n')
}

const getPublishedProjects = async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[sitemap] Supabase env vars missing; generating static URLs only.')
        return []
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabase
        .from('projects')
        .select('title, created_at, is_published')
        .or('is_published.is.null,is_published.eq.true')
        .order('created_at', { ascending: false })

    if (error) {
        console.warn('[sitemap] Failed to fetch projects:', error.message || error)
        return []
    }

    return (data || [])
        .map((project) => {
            const slug = toSlug(project.title)
            if (!slug) return null

            return {
                path: `/project/${slug}`,
                lastMod: formatLastMod(project.created_at),
            }
        })
        .filter(Boolean)
}

const buildSitemapXml = (entries) => [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(createUrlEntry),
    '</urlset>',
    '',
].join('\n')

const run = async () => {
    const projectEntries = await getPublishedProjects()
    const uniqueEntries = new Map()

    for (const path of staticPaths) {
        uniqueEntries.set(path, { path, lastMod: null })
    }

    for (const entry of projectEntries) {
        uniqueEntries.set(entry.path, entry)
    }

    const xml = buildSitemapXml([...uniqueEntries.values()])

    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, xml, 'utf8')
    console.log(`[sitemap] Wrote ${uniqueEntries.size} URLs to ${outputPath}`)
}

run().catch((error) => {
    console.error('[sitemap] Generation failed:', error)
    process.exitCode = 1
})
