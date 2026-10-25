import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function ProductListPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState({ daerah: [], gender: [], lengan: [] })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Filter state
  const [filterDaerah, setFilterDaerah] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterLengan, setFilterLengan] = useState('')

  const productsSectionRef = useRef(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterDaerah) params.set('daerah', filterDaerah)
    if (filterGender) params.set('gender', filterGender)
    if (filterLengan) params.set('lengan', filterLengan)

    axios.get(`/api/products?${params.toString()}`)
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filterDaerah, filterGender, filterLengan])

  async function handleAddToCart(productId) {
    if (!token) {
      window.location.href = '/register?redirect=/&reason=cart'
      return
    }
    try {
      await axios.post('/api/cart', { product_id: productId, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      showToast('Produk ditambahkan ke keranjang!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menambahkan')
    }
  }

  function scrollToProducts() {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function applyQuickFilter(type, value) {
    if (type === 'daerah') { setFilterDaerah(value); setFilterGender(''); setFilterLengan('') }
    if (type === 'gender') { setFilterGender(value); setFilterDaerah(''); setFilterLengan('') }
    if (type === 'lengan') { setFilterLengan(value); setFilterDaerah(''); setFilterGender('') }
    scrollToProducts()
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const activeFilterCount = [filterDaerah, filterGender, filterLengan].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ══════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════ */}
      <section className="bg-primary-900 text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 z-10">
            <span className="inline-block text-xs font-semibold bg-primary-700 text-primary-100 px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              Koleksi Batik Nusantara
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Keindahan Batik<br />dari Seluruh<br />
              <span className="text-primary-300">Nusantara</span>
            </h1>
            <p className="text-primary-200 text-sm leading-relaxed mb-8 max-w-sm">
              Temukan koleksi batik autentik dari berbagai daerah — Jogja, Solo, Pekalongan, Cirebon, Madura, dan lebih banyak lagi.
            </p>
            <button
              onClick={scrollToProducts}
              className="bg-white text-primary-900 hover:bg-primary-100 font-semibold px-7 py-3 rounded-xl text-sm transition"
            >
              Belanja Sekarang →
            </button>
          </div>
          {/* Dekorasi */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-center w-72 h-56 rounded-2xl bg-primary-800 border border-primary-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-300 to-transparent" />
            <div className="text-center z-10 p-4">
              <p className="text-6xl mb-2">🪡</p>
              <p className="text-primary-200 text-xs font-medium">Batik Tulis & Cap</p>
              <p className="text-primary-300 text-xs">Premium Quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PANEL KATEGORI CEPAT
      ══════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Jelajahi Kategori</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Daerah */}
            <div className="border border-gray-200 rounded-2xl p-4 hover:border-primary-300 hover:bg-primary-50 transition cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center text-lg">🗺️</span>
                <p className="font-semibold text-gray-700 text-sm">Berdasarkan Daerah</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.daerah.slice(0, 5).map(d => (
                  <button
                    key={d}
                    onClick={() => applyQuickFilter('daerah', d)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${filterDaerah === d ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-800'}`}
                  >
                    {d}
                  </button>
                ))}
                {categories.daerah.length === 0 && <span className="text-xs text-gray-400">Memuat...</span>}
              </div>
            </div>

            {/* Gender */}
            <div className="border border-gray-200 rounded-2xl p-4 hover:border-primary-300 hover:bg-primary-50 transition cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center text-lg">👤</span>
                <p className="font-semibold text-gray-700 text-sm">Berdasarkan Gender</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Pria', 'Wanita', 'Unisex'].map(g => (
                  <button
                    key={g}
                    onClick={() => applyQuickFilter('gender', g)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${filterGender === g ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-800'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Lengan */}
            <div className="border border-gray-200 rounded-2xl p-4 hover:border-primary-300 hover:bg-primary-50 transition cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center text-lg">👕</span>
                <p className="font-semibold text-gray-700 text-sm">Berdasarkan Lengan</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Panjang', 'Pendek'].map(l => (
                  <button
                    key={l}
                    onClick={() => applyQuickFilter('lengan', l)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${filterLengan === l ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-800'}`}
                  >
                    Lengan {l}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FILTER BAR + GRID PRODUK
      ══════════════════════════════════════ */}
      <section ref={productsSectionRef} className="max-w-5xl mx-auto px-4 py-8">
        {/* Header baris */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Semua Produk</h2>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                Menampilkan <span className="font-medium text-gray-600">{products.length}</span> produk
                {activeFilterCount > 0 && ' (difilter)'}
              </p>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterDaerah(''); setFilterGender(''); setFilterLengan('') }}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition"
            >
              ✕ Reset Filter
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Daerah chips */}
          {categories.daerah.map(d => (
            <button
              key={`d-${d}`}
              onClick={() => setFilterDaerah(filterDaerah === d ? '' : d)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                filterDaerah === d
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              📍 {d}
            </button>
          ))}

          {/* Gender chips */}
          {['Pria', 'Wanita', 'Unisex'].map(g => (
            <button
              key={`g-${g}`}
              onClick={() => setFilterGender(filterGender === g ? '' : g)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                filterGender === g
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              👤 {g}
            </button>
          ))}

          {/* Lengan chips */}
          {['Panjang', 'Pendek'].map(l => (
            <button
              key={`l-${l}`}
              onClick={() => setFilterLengan(filterLengan === l ? '' : l)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                filterLengan === l
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              👕 Lengan {l}
            </button>
          ))}
        </div>

        {/* Grid produk */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium mb-2">Tidak ada produk yang cocok.</p>
            <button
              onClick={() => { setFilterDaerah(''); setFilterGender(''); setFilterLengan('') }}
              className="text-primary-800 text-sm hover:underline"
            >
              Reset semua filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* Toast notifikasi */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg transition">
          {toast}
        </div>
      )}
    </div>
  )
}
