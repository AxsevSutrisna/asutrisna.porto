import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import { Trash2, Plus, Edit2, X } from 'lucide-react'

export default function WorkExperience() {
    const [experiences, setExperiences] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        position: '',
        company: '',
        employment_type: 'Full Time',
        location: '',
        start_month: '',
        start_year: new Date().getFullYear(),
        end_month: '',
        end_year: new Date().getFullYear(),
        is_current: false,
        description: '',
        tech_stack: '[]',
        display_order: 1,
    })

    useEffect(() => {
        fetchExperiences()
    }, [])

    const fetchExperiences = async () => {
        try {
            setLoading(true)
            setError(null)
            const { data, error: fetchError } = await supabase
                .from('work_experiences')
                .select('*')
                .order('display_order', { ascending: true })

            if (fetchError) {
                console.error('Error fetching work experiences:', fetchError)
                setError(`Failed to load work experiences: ${fetchError.message}`)
                setExperiences([])
            } else {
                console.log('Fetched work experiences:', data)
                setExperiences(data || [])
            }
        } catch (err) {
            console.error('Error fetching work experiences:', err)
            setError(err.message)
            setExperiences([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('work_experiences')
                    .update(formData)
                    .eq('id', editingId)

                if (error) throw error
                alert('Work experience updated successfully!')
            } else {
                const { error } = await supabase
                    .from('work_experiences')
                    .insert([formData])

                if (error) throw error
                alert('Work experience added successfully!')
            }

            setFormData({
                position: '',
                company: '',
                employment_type: 'Full Time',
                location: '',
                start_month: '',
                start_year: new Date().getFullYear(),
                end_month: '',
                end_year: new Date().getFullYear(),
                is_current: false,
                description: '',
                tech_stack: '[]',
                display_order: 1,
            })
            setEditingId(null)
            setIsOpen(false)
            fetchExperiences()
        } catch (error) {
            console.error('Error saving work experience:', error)
            alert('Failed to save work experience')
        }
    }

    const handleEdit = (experience) => {
        setFormData(experience)
        setEditingId(experience.id)
        setIsOpen(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                const { error } = await supabase
                    .from('work_experiences')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                alert('Work experience deleted successfully!')
                fetchExperiences()
            } catch (error) {
                console.error('Error deleting work experience:', error)
                alert('Failed to delete work experience')
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Work Experience</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your work history</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            position: '',
                            company: '',
                            employment_type: 'Full-time',
                            location: '',
                            start_date: '',
                            end_date: '',
                            currently_working: false,
                            description: '',
                            technologies: [],
                        })
                        setEditingId(null)
                        setIsOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Experience
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : error ? (
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={fetchExperiences}
                        className="mt-3 px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition"
                    >
                        Try Again
                    </button>
                </div>
            ) : experiences.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                    <p>No work experiences yet. Click "Add Experience" to create one.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {experiences.map((exp) => (
                        <div
                            key={exp.id}
                            className="p-4 border border-white/10 rounded-lg hover:border-white/20 transition group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-white font-semibold">{exp.position}</h3>
                                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                                            {exp.employment_type}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{exp.company}</p>
                                    <p className="text-gray-500 text-xs">{exp.location}</p>
                                    <p className="text-gray-500 text-xs">
                                        {exp.start_month}/{exp.start_year} -{' '}
                                        {exp.is_current ? 'Present' : `${exp.end_month}/${exp.end_year}`}
                                    </p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => handleEdit(exp)}
                                        className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exp.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-lg w-full max-w-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingId ? 'Edit Experience' : 'Add Experience'}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Position"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    required
                                    className="col-span-2 px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="Company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    required
                                    className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                                <select
                                    value={formData.employment_type}
                                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                    className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                >
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Magang">Magang</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="col-span-2 px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                                <div className="col-span-2 grid grid-cols-4 gap-2">
                                    <select
                                        value={formData.start_month}
                                        onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
                                        required
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2"
                                    >
                                        <option value="">Start Month</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                            <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.start_year}
                                        onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) })}
                                        required
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 grid grid-cols-4 gap-2">
                                    <select
                                        value={formData.end_month}
                                        onChange={(e) => setFormData({ ...formData, end_month: e.target.value })}
                                        disabled={formData.is_current}
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">End Month</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                            <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.end_year}
                                        onChange={(e) => setFormData({ ...formData, end_year: parseInt(e.target.value) })}
                                        disabled={formData.is_current}
                                        className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <label className="col-span-2 flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_current}
                                        onChange={(e) =>
                                            setFormData({ ...formData, is_current: e.target.checked, end_month: '', end_year: new Date().getFullYear() })
                                        }
                                        className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                    />
                                    <span className="text-gray-300 text-sm">Currently working here</span>
                                </label>
                                <textarea
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="col-span-2 px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Technologies (comma-separated)"
                                    value={(() => {
                                        try {
                                            const parsed = JSON.parse(formData.tech_stack);
                                            return Array.isArray(parsed) ? parsed.join(', ') : '';
                                        } catch {
                                            return '';
                                        }
                                    })()}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tech_stack: JSON.stringify(e.target.value.split(',').map((t) => t.trim())),
                                        })
                                    }
                                    className="col-span-2 px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
                                >
                                    {editingId ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
