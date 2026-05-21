import { useEffect, useState } from 'react'
import { supabase } from "../../supabase";
import { Award, Upload, Trash2, ImageIcon, Plus, Eye, X } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import ToastStack from '../../components/ToastStack'

const Card = ({ children, className = '' }) => (
    <div className={`relative group/card ${className}`}>
        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover/card:opacity-20 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full p-6">
            {children}
        </div>
    </div>
)

const SkeletonCard = () => (
    <div className="relative">
        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl overflow-hidden p-2">
            <div className="w-full aspect-[4/3] bg-white/5 rounded-xl animate-pulse" />
        </div>
    </div>
)

const CertCard = ({ cert, onDelete, onView }) => {
    const [imgLoaded, setImgLoaded] = useState(false)

    return (
        <div className="relative group/item">
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover/item:opacity-30 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl p-2 h-full flex flex-col">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40">
                    {!imgLoaded && (
                        <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    )}
                    <img
                        src={cert.img}
                        alt="Certificate"
                        onLoad={() => setImgLoaded(true)}
                        className={`w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700 ${imgLoaded ? 'block' : 'hidden'}`}
                    />
                    
                    {/* Hover Overlay */}
                    {imgLoaded && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                            <button
                                onClick={() => onView(cert.img)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-indigo-500/40 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110 shadow-lg"
                                title="View Full Image"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(cert.id)}
                                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/50 text-red-100 flex items-center justify-center border border-red-500/30 transition-all hover:scale-110 shadow-lg"
                                title="Delete Certificate"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Certificates() {
    const [certs, setCerts] = useState([])
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [loading, setLoading] = useState(true)
    const [lightboxImage, setLightboxImage] = useState(null)
    const { toasts, pushToast, removeToast } = useToast()

    const fetchCerts = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false })
        if (error) {
            console.error(error)
            pushToast('error', 'Failed to load certificates')
        } else {
            setCerts(data || [])
        }
        setLoading(false)
    }

    useEffect(() => { fetchCerts() }, [])

    const handleFile = (f) => {
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
    }

    const uploadImage = async () => {
        if (!file) return
        setUploading(true)
        try {
            const fileName = `cert-${Date.now()}-${file.name}`
            const { error: uploadError } = await supabase.storage.from('certificate-images').upload(fileName, file)
            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('certificate-images').getPublicUrl(fileName)
            
            const { error: dbError } = await supabase.from('certificates').insert({ img: data.publicUrl })
            if (dbError) throw dbError

            pushToast('success', 'Certificate uploaded successfully!')
            setFile(null); setPreview(null);
            fetchCerts()
        } catch (error) {
            console.error('Upload error:', error)
            pushToast('error', 'Failed to upload certificate')
        } finally {
            setUploading(false)
        }
    }

    const deleteCert = async (id) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return
        try {
            const { error } = await supabase.from('certificates').delete().eq('id', id)
            if (error) throw error
            pushToast('success', 'Certificate deleted')
            fetchCerts()
        } catch (error) {
            console.error('Delete error:', error)
            pushToast('error', 'Failed to delete certificate')
        }
    }

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (lightboxImage) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => { document.body.style.overflow = 'auto' }
    }, [lightboxImage])

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute -inset-0.5 rounded-xl blur opacity-50" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                    <div className="relative w-12 h-12 rounded-xl border border-white/15 flex items-center justify-center bg-[#0a0a1a]">
                        <Award className="w-6 h-6 text-indigo-400" />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Certificates Manager</h1>
                    <p className="text-gray-400 text-sm mt-0.5">
                        {loading ? 'Loading...' : `Manage your ${certs.length} certificates and achievements`}
                    </p>
                </div>
            </div>

            {/* Upload Section */}
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/5">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Upload New Certificate</h2>
                    </div>

                    <label
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                        className={`flex flex-col items-center justify-center w-full min-h-[200px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${dragOver ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-white/10 bg-black/20 hover:border-indigo-500/40 hover:bg-black/40'
                            }`}
                    >
                        {preview ? (
                            <div className="relative p-4 w-full flex items-center justify-center">
                                <img src={preview} alt="preview" className="max-h-56 object-contain rounded-lg shadow-2xl border border-white/10" />
                            </div>
                        ) : (
                            <div className="text-center space-y-3 p-8">
                                <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                                    <ImageIcon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-200">Drag & drop your certificate here</p>
                                    <p className="text-xs text-gray-500 mt-1">or click to browse files (PNG, JPG, WEBP)</p>
                                </div>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} className="hidden" />
                    </label>

                    {file && (
                        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 flex-wrap">
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                                <p className="text-sm text-gray-300 truncate font-medium">{file.name}</p>
                            </div>
                            <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                                <button 
                                    onClick={() => { setFile(null); setPreview(null) }}
                                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={uploadImage} 
                                    disabled={uploading} 
                                    className="relative group/btn flex-1 sm:flex-none focus:outline-none"
                                >
                                    <div className="absolute -inset-0.5 rounded-lg opacity-60 blur group-hover/btn:opacity-100 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                                    <div className="relative flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-[#0a0a1a] border border-white/15 transition-colors group-hover/btn:bg-[#111122]">
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                <span className="text-sm font-medium text-white">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 text-indigo-400" />
                                                <span className="text-sm font-medium text-white">Upload Certificate</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Your Certificates</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : certs.length === 0 ? (
                    <Card className="!p-16">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <Award className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-gray-300 font-medium">No certificates found.</p>
                            <p className="text-gray-500 text-sm mt-1">Upload your first certificate above to showcase it on your portfolio.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {certs.map(cert => (
                            <CertCard key={cert.id} cert={cert} onDelete={deleteCert} onView={setLightboxImage} />
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <button 
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/20"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={lightboxImage} 
                            alt="Certificate Full View" 
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={removeToast} />
        </div>
    )
}