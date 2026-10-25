import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar.jsx'
import StarRating from '../../components/StarRating.jsx'

const EMPTY_FORM = { title: '', description: '', image_url: '', price: '', stock: '', daerah: '', gender: 'Unisex', lengan: 'Pendek' }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products')
      setProducts(res.data)
    } catch { }
    finally { setLoading(false) }
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(product) {
    setForm({
      title: product.title,
      description: product.description || '',
      image_url: product.image_url || '',
      price: product.price,
      stock: product.stock,
      daerah: product.daerah || '',
      gender: product.gender || 'Unisex',
      lengan: product.lengan || 'Pendek',
    })
    setEditId(product.id)
    setError('')
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editId) {
        await axios.put(`/api/products/${editId}`, form, { headers })
        showToast('Produk berhasil diperbarui')
      } else {
        await axios.post('/api/products', form, { headers })
        showToast('Produk berhasil ditambahkan')
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus produk ini?')) return
    try {
      await axios.delete(`/api/products/${id}`, { headers })
      setProducts(prev => prev.filter(p => p.id !== id))
      showToast('Produk dihapus')
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const formatRp = v => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(v)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
          <button
            onClick={openAdd}
            className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            + Tambah Produk
          </button>
        </div>

        {/* Form tambah / edit produk */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Judul Produk *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="Nama produk"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 resize-none"
                  placeholder="Deskripsi produk..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">URL Gambar</label>
                <input
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Harga (Rp) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="150000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stok</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="0"
                />
              </div>

              {/* ── Kategori Batik ── */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Daerah Asal *</label>
                <input
                  required
                  value={form.daerah}
                  onChange={e => setForm({ ...form, daerah: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="contoh: Jogja, Solo, Pekalongan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  >
                    <option>Unisex</option>
                    <option>Pria</option>
                    <option>Wanita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Lengan</label>
                  <select
                    value={form.lengan}
                    onChange={e => setForm({ ...form, lengan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  >
                    <option>Pendek</option>
                    <option>Panjang</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-xl text-sm font-medium transition disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel produk */}
        {loading ? (
          <p className="text-gray-400 text-center py-16">Memuat produk...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400 text-center py-16">Belum ada produk. Tambahkan produk pertama!</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Produk</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Harga</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Stok</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden lg:table-cell">Kategori</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden xl:table-cell">Rating</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url || 'https://placehold.co/48x48?text=img'}
                          alt={p.title}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          onError={e => { e.target.src = 'https://placehold.co/48x48?text=img' }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-primary-900 font-semibold hidden sm:table-cell">
                      {formatRp(p.price)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{p.stock}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        {p.daerah && <span className="text-xs bg-primary-50 text-primary-800 border border-primary-200 rounded-full px-2 py-0.5 inline-block w-fit">{p.daerah}</span>}
                        <div className="flex gap-1">
                          {p.gender && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{p.gender}</span>}
                          {p.lengan && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{p.lengan}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <div className="flex items-center gap-1">
                        <StarRating value={parseFloat(p.avg_rating) || 0} size="sm" />
                        <span className="text-xs text-gray-500">
                          {p.avg_rating ? parseFloat(p.avg_rating).toFixed(1) : '—'}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({parseInt(p.rating_count) || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-primary-700 hover:text-primary-900 text-xs font-medium mr-3 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
