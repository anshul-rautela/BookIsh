import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const { register } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="text-3xl filter drop-shadow-sm">📖</span>
            <span className="text-3xl font-bold font-serif tracking-tight text-[#1C1917] group-hover:text-[#8C2520] transition-colors">
              Bookish
            </span>
          </Link>
          <h1 className="text-3xl font-bold font-serif text-[#1C1917]">Join Bookish</h1>
          <p className="text-[#57534E] mt-1 text-sm font-serif">Create your reading community account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#F5EFE0] border border-[#E4D7C3] rounded-3xl p-8 space-y-5 shadow-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-700 text-sm font-serif">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#57534E] mb-2 uppercase tracking-wider font-serif font-bold">Username</label>
            <input
              id="register-username"
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              minLength={3}
              maxLength={50}
              placeholder="your_username"
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-[#1C1917] placeholder-[#78716C] text-sm transition-all shadow-inner font-serif"
            />
          </div>

          <div>
            <label className="block text-xs text-[#57534E] mb-2 uppercase tracking-wider font-serif font-bold">Email</label>
            <input
              id="register-email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              placeholder="you@example.com"
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-[#1C1917] placeholder-[#78716C] text-sm transition-all shadow-inner font-serif"
            />
          </div>

          <div>
            <label className="block text-xs text-[#57534E] mb-2 uppercase tracking-wider font-serif font-bold">Password</label>
            <input
              id="register-password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-[#1C1917] placeholder-[#78716C] text-sm transition-all shadow-inner font-serif"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#8C2520] hover:bg-[#6C1A16] disabled:opacity-50 text-[#FFFDF7] rounded-xl font-serif font-bold text-base transition-all shadow-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[#78716C] text-sm mt-6 font-serif">
          Already have an account?{' '}
          <Link to="/login" className="text-[#8C2520] hover:text-[#6C1A16] transition-colors font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
