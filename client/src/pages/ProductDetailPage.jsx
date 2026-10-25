import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar.jsx'
import StarRating from '../components/StarRating.jsx'

function formatRp(val) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(val)
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState('')

  // form rating
  const [myRating, setMyRating]   = useState(0)
  const [myReview, setMyReview]   = useState('')
  const [hovered, setHovered]     = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [ratingError, setRatingError] = useState('')

  const token = localStorage.getItem('token')
  let currentUser = null
  try { currentUser = token ? JSON.parse(atob(token.split('.')[1])) : null } catch {}

  useEffect(() => { fetchProduct() }, [id])

  async function fetchProduct() {
    setLoading(true)
    try {
      const res = await axios.get(`/api/products/${id}`)
      setProduct(res.data)
      // Cek apakah user sudah pernah rating
      if (currentUser) {
        const existing = res.data.reviews?.find(r => r.user_id === currentUser.id)
        if (existing) {
          setMyRating(existing.rating)
          setMyReview(existing.review || '')
        }
      }
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddToCart() {
    if (!token) {
      navigate(`/register?redirect=/products/${id}&reason=cart`)
      return
    }
    try {
      await axios.post('/api/cart', { product_id: product.id, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      showToast('Ditambahkan ke keranjang!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menambahkan')
    }
  }

  async function handleSubmitRating(e) {
    e.preventDefault()
    setRatingError('')
    if (myRating === 0) { setRatingError('Pilih jumlah bintang terlebih dahulu'); return }
    setSubmitting(true)
    try {
      await axios.post('/api/ratings', {
        product_id: product.id,
        rating: myRating,
        review: myReview,
      }, { headers: { Authorization: `Bearer ${token}` } })
      showToast('Rating berhasil disimpan!')
      fetchProduct() // refresh reviews
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Gagal menyimpan rating')
    } finally {
      setSubmitting(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const myExistingRating = product?.reviews?.find(r => r.user_id === currentUser?.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-400 py-24">Memuat produk...</p>
      </div>
    )
  }

  if (!product) return null

  const avgRating  = parseFloat(product.avg_rating) || 0
  const ratingCount = parseInt(product.rating_count) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tombol kembali */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-primary-800 hover:underline mb-6 inline-block"
        >
          ← Kembali
        </button>

        {/* Detail produk */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-8">
          <div className="flex flex-col md:flex-row">
            <img
              src={product.image_url || 'https://placehold.co/480x360?text=No+Image'}
              alt={product.title}
              className="w-full md:w-80 h-64 md:h-auto object-cover flex-shrink-0"
              onError={e => { e.target.src = 'https://placehold.co/480x360?text=No+Image' }}
            />
            <div className="p-6 flex flex-col flex-1">
              <h1 className="text-xl font-bold text-gray-800 mb-2">{product.title}</h1>

              {/* Rating summary */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating value={avgRating} size="md" />
                <span className="text-sm font-semibold text-gray-700">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-gray-400">
                  ({ratingCount} ulasan)
                </span>
              </div>

              <p className="text-2xl font-bold text-primary-900 mb-3">{formatRp(product.price)}</p>

              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                {product.description || 'Tidak ada deskripsi.'}
              </p>

              <div className="flex items-center gap-4 mb-5">
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                  product.stock > 0
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-primary-900 hover:bg-primary-800 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition w-full sm:w-auto"
              >
                + Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>

        {/* Section ulasan */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Form rating — hanya untuk user login, belum pernah rating */}
          {token && currentUser?.role !== 'admin' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">
                {myExistingRating ? 'Ulasan kamu' : 'Beri Ulasan'}
              </h2>

              {myExistingRating ? (
                // Tampilkan ulasan sendiri, tidak bisa ubah setelah submit
                <div className="space-y-2">
                  <StarRating value={myExistingRating.rating} size="lg" />
                  <p className="text-sm text-gray-600 mt-2">
                    {myExistingRating.review || <span className="italic text-gray-400">Tidak ada komentar</span>}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(myExistingRating.created_at)}</p>
                  <p className="text-xs text-primary-700 font-medium">
                    Kamu sudah memberi rating untuk produk ini.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRating} className="space-y-4">
                  {/* Bintang interaktif */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Pilih rating:</p>
                    <span className="inline-flex gap-1 text-3xl">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          onClick={() => setMyRating(star)}
                          onMouseEnter={() => setHovered(star)}
                          onMouseLeave={() => setHovered(0)}
                          className={`cursor-pointer transition-transform hover:scale-110 select-none ${
                            (hovered || myRating) >= star ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                    {myRating > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{myRating} dari 5 bintang</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Komentar (opsional)</label>
                    <textarea
                      rows={3}
                      value={myReview}
                      onChange={e => setMyReview(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 resize-none"
                      placeholder="Tulis pengalaman kamu tentang produk ini..."
                    />
                  </div>

                  {ratingError && (
                    <p className="text-xs text-red-500">{ratingError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary-900 hover:bg-primary-800 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
                  >
                    {submitting ? 'Menyimpan...' : 'Kirim Ulasan'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Daftar semua ulasan */}
          <div className={token && currentUser?.role !== 'admin' ? '' : 'md:col-span-2'}>
            <h2 className="font-semibold text-gray-800 mb-4">
              Semua Ulasan
              {ratingCount > 0 && <span className="text-gray-400 font-normal text-sm ml-2">({ratingCount})</span>}
            </h2>

            {product.reviews?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
                Belum ada ulasan. Jadilah yang pertama!
              </div>
            ) : (
              <div className="space-y-3">
                {product.reviews?.map(r => (
                  <div
                    key={r.id}
                    className={`bg-white rounded-xl border p-4 shadow-sm ${
                      r.user_id === currentUser?.id ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {r.user_name}
                        {r.user_id === currentUser?.id && (
                          <span className="ml-2 text-xs text-primary-700 font-normal">(kamu)</span>
                        )}
                      </span>
                      <StarRating value={r.rating} size="sm" />
                    </div>
                    {r.review && (
                      <p className="text-sm text-gray-600 mt-1">{r.review}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
