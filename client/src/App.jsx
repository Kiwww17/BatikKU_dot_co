import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProductListPage from './pages/ProductListPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderHistoryPage from './pages/OrderHistoryPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

function getUser() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

// Route yang butuh login — guest diarahkan ke /register dengan query redirect
function AuthRequired({ children, adminOnly = false }) {
  const user = getUser()
  const location = useLocation()
  if (!user) {
    return <Navigate to={`/register?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Halaman publik — bisa diakses tanpa login */}
        <Route path="/"             element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Halaman yang butuh login */}
        <Route path="/cart" element={
          <AuthRequired><CartPage /></AuthRequired>
        } />

        <Route path="/checkout" element={
          <AuthRequired><CheckoutPage /></AuthRequired>
        } />

        <Route path="/orders" element={
          <AuthRequired><OrderHistoryPage /></AuthRequired>
        } />

        <Route path="/admin" element={
          <AuthRequired adminOnly><AdminDashboard /></AuthRequired>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
