import { useState } from 'react'
import { supabase } from "../supabase";
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react'
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { alert(error.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()

    if (profile?.role !== 'admin') {
      alert('Access denied')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }
    navigate('/dashboard')
  }

  return (
    <>
      <Helmet>
        <title>Login Admin | asutrisnadev</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-700" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
            <Card className="relative p-8 space-y-7 bg-[color:var(--color-backdrop-base)]">

              {/* Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300 text-xs font-medium">Admin Portal</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-white">Welcome Back</h1>
                <p className="text-gray-400 text-sm">Sign in to manage your portfolio</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                  <div className="neo-input flex items-center overflow-hidden focus-within:border-indigo-500/60 transition-colors">
                    <Mail className="w-4 h-4 text-gray-500 ml-4 shrink-0" />
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent px-3 py-3 text-gray-100 placeholder-gray-500 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
                  <div className="neo-input flex items-center overflow-hidden focus-within:border-indigo-500/60 transition-colors">
                    <Lock className="w-4 h-4 text-gray-500 ml-4 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full bg-transparent px-3 py-3 text-gray-100 placeholder-gray-500 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="mr-4 shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-1 group/btn h-12">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <LogIn className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}