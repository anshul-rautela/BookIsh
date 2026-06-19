import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-[#0f0f1a] to-cyan-900/10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">📚</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Bookish
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your reading community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-3xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Email</label>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              placeholder="you@example.com"
              className="w-full bg-[#16213e] border border-[#2a2a4a] focus:border-violet-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Password</label>
            <input
              id="login-password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              placeholder="••••••••"
              className="w-full bg-[#16213e] border border-[#2a2a4a] focus:border-violet-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-violet-700/30"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
