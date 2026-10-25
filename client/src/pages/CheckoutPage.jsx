import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar.jsx'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { items = [], total = 0 } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  let user = null
  try { user = token ? JSON.parse(atob(token.split('.')[1])) : null } catch { }

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(total)

  async function handlePay() {
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/checkout', { email: user?.email }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Redirect ke halaman pembayaran Xendit
      window.location.href = res.data.invoice_url
    } catch (err) {
      const data = err.response?.data
      setError(data?.xendit || data?.error || data?.message || 'Checkout gagal, coba lagi.')
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
          <p>Tidak ada item untuk di-checkout.</p>
          <button onClick={() => navigate('/cart')} className="mt-4 text-primary-800 hover:underline text-sm">
            Kembali ke Keranjang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Konfirmasi Pesanan</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Ringkasan order */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-4">
              <img
                src={item.image_url || 'https://placehold.co/60x60?text=img'}
                alt={item.title}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/60x60?text=img' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                <p className="text-xs text-gray-400">{item.quantity} pcs</p>
              </div>
              <p className="text-sm font-semibold text-primary-900">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex justify-between items-center mb-6">
          <span className="text-gray-600 text-sm">Total Pembayaran</span>
          <span className="text-xl font-bold text-primary-900">{formattedTotal}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            ← Kembali
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex-1 bg-primary-900 hover:bg-primary-800 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            {loading ? 'Memproses...' : '💳 Bayar Sekarang'}
          </button>
        </div>
      </main>
    </div>
  )
}
