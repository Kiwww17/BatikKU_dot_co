export default function CartItem({ item, onUpdateQty, onRemove }) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(item.price * item.quantity)

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <img
        src={item.image_url || 'https://placehold.co/80x80?text=img'}
        alt={item.title}
        className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
        onError={e => { e.target.src = 'https://placehold.co/80x80?text=img' }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)} / pcs
        </p>
      </div>

      {/* Quantity control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg leading-none disabled:opacity-40"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
          className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg leading-none"
        >
          +
        </button>
      </div>

      <div className="text-right min-w-[80px]">
        <p className="font-semibold text-primary-900 text-sm">{formattedPrice}</p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-xs text-red-400 hover:text-red-600 mt-0.5 transition"
        >
          Hapus
        </button>
      </div>
    </div>
  )
}
