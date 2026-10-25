import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar.jsx'
import CartItem from '../components/CartItem.jsx'

export default function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const res = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(res.data)
    } catch { }
    finally { setLoading(false) }
  }

  async function handleUpdateQty(cartId, newQty) {
    if (newQty < 1) return
    try {
      await axios.put(`/api/cart/${cartId}`, { quantity: newQty }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(prev => prev.map(i => i.id === cartId ? { ...i, quantity: newQty } : i))
    } catch { }
  }

  async function handleRemove(cartId) {
    try {
      await axios.delete(`/api/cart/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(prev => prev.filter(i => i.id !== cartId))
    } catch { }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(total)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Keranjang Belanja</h2>

        {loading ? (
          <p className="text-gray-400 text-center py-16">Memuat keranjang...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🛒</p>
            <p>Keranjangmu kosong.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-primary-800 text-sm hover:underline"
            >
              Lihat produk
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 px-5">
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQty={handleUpdateQty}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Total & Checkout */}
            <div className="mt-5 bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Belanja</p>
                <p className="text-xl font-bold text-primary-900">{formattedTotal}</p>
              </div>
              <button
                onClick={() => navigate('/checkout', { state: { items, total } })}
                className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Checkout →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
