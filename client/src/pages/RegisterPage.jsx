import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const reason     = searchParams.get('reason')   // 'cart' | null

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/register', form)
      // Setelah daftar, arahkan ke login dengan redirect yang sama
      navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-primary-900 mb-1">Daftar</h1>
        <p className="text-gray-500 text-sm mb-4">Buat akun baru</p>

        {/* Banner info jika diarahkan dari aksi tertentu */}
        {reason === 'cart' && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 text-sm rounded-lg px-4 py-3 mb-4">
            🛒 Daftar atau <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold underline">masuk</Link> terlebih dahulu untuk menambahkan produk ke keranjang.
          </div>
        )}

        {reason === 'checkout' && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 text-sm rounded-lg px-4 py-3 mb-4">
            💳 Daftar atau <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold underline">masuk</Link> terlebih dahulu untuk melanjutkan checkout.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="Nama kamu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-900 hover:bg-primary-800 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Sudah punya akun?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-primary-700 hover:underline font-medium"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
