import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Navbar() {
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)

  const token = localStorage.getItem('token')
  let user = null
  try {
    user = token ? JSON.parse(atob(token.split('.')[1])) : null
  } catch { user = null }

  useEffect(() => {
    if (!token || user?.role === 'admin') return
    axios.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCartCount(res.data.length))
      .catch(() => {})
  }, [token])

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="bg-primary-900 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight">
          🛍 BatikKU.co
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-5 text-sm">
          {user?.role === 'admin' ? (
            // Admin
            <>
              <Link to="/admin" className="hover:text-primary-300 transition">Dashboard</Link>
              <div className="flex items-center gap-3">
                <span className="text-primary-300 hidden sm:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-primary-700 hover:bg-primary-600 px-3 py-1 rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : user ? (
            // User login
            <>
              <Link to="/" className="hover:text-primary-300 transition">Produk</Link>
              <Link to="/orders" className="hover:text-primary-300 transition">Pesanan</Link>
              <Link to="/cart" className="relative hover:text-primary-300 transition">
                <span>Keranjang</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-white text-primary-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-primary-300 hidden sm:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-primary-700 hover:bg-primary-600 px-3 py-1 rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            // Guest — belum login
            <>
              <Link to="/" className="hover:text-primary-300 transition">Produk</Link>
              <Link
                to="/login"
                className="hover:text-primary-300 transition"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-white text-primary-900 hover:bg-primary-100 px-3 py-1 rounded font-medium transition"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
