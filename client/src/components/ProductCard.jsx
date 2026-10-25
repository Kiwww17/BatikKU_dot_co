import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating.jsx'

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate()

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(product.price)

  const avgRating   = parseFloat(product.avg_rating) || 0
  const ratingCount = parseInt(product.rating_count) || 0

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col cursor-pointer"
    >
      <img
        src={product.image_url || 'https://placehold.co/400x300?text=No+Image'}
        alt={product.title}
        className="w-full h-48 object-cover"
        onError={e => { e.target.src = 'https://placehold.co/400x300?text=No+Image' }}
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1">{product.title}</h3>

        {/* Badge kategori */}
        <div className="flex flex-wrap gap-1 mb-2">
          {product.daerah && (
            <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2 py-0.5">
              📍 {product.daerah}
            </span>
          )}
          {product.gender && product.gender !== 'Unisex' && (
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {product.gender}
            </span>
          )}
          {product.lengan && (
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {product.lengan}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <StarRating value={avgRating} size="sm" />
          {ratingCount > 0 ? (
            <span className="text-xs text-gray-400">({ratingCount})</span>
          ) : (
            <span className="text-xs text-gray-300">Belum ada ulasan</span>
          )}
        </div>

        <p className="text-gray-500 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-primary-900 font-bold text-base">{formattedPrice}</span>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product.id) }}
            className="bg-primary-900 hover:bg-primary-800 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  )
}
