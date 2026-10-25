import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar.jsx'

const STATUS_BADGE = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid:      'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
}

const STATUS_LABEL = {
  pending:   'Menunggu Pembayaran',
  paid:      'Lunas',
  cancelled: 'Dibatalkan',
}

function formatRp(val) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios
      .get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Transaksi</h2>

        {loading ? (
          <p className="text-center text-gray-400 py-20">Memuat riwayat...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p className="mb-4">Belum ada transaksi.</p>
            <Link to="/" className="text-primary-800 text-sm hover:underline">
              Mulai belanja →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Header order */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Order #{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}
                  >
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>

                {/* Item-item order */}
                <div className="divide-y divide-gray-50">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-5 py-3">
                      <img
                        src={item.image_url || 'https://placehold.co/48x48?text=img'}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        onError={e => { e.target.src = 'https://placehold.co/48x48?text=img' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} pcs × {formatRp(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                        {formatRp(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer: total + tombol */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Total Pembayaran</p>
                    <p className="text-base font-bold text-primary-900">{formatRp(order.total_amount)}</p>
                  </div>
                  {order.status === 'pending' && order.xendit_invoice_url && (
                    <a
                      href={order.xendit_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary-900 hover:bg-primary-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition"
                    >
                      💳 Lanjut Bayar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
