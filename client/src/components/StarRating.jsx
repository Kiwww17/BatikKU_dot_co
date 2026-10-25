/**
 * StarRating — komponen bintang reusable
 *
 * Props:
 *   value      — rating saat ini (0–5, bisa desimal untuk display)
 *   onChange   — jika diberikan, bintang jadi interaktif (klik untuk pilih)
 *   size       — 'sm' | 'md' | 'lg'  (default 'md')
 */
export default function StarRating({ value = 0, onChange, size = 'md' }) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }
  const interactive = typeof onChange === 'function'

  return (
    <span className={`inline-flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star
        const half   = !filled && value >= star - 0.5

        return (
          <span
            key={star}
            onClick={interactive ? () => onChange(star) : undefined}
            className={[
              interactive ? 'cursor-pointer hover:scale-110 transition-transform select-none' : '',
              filled ? 'text-yellow-400' : half ? 'text-yellow-300' : 'text-gray-300',
            ].join(' ')}
            title={interactive ? `${star} bintang` : undefined}
          >
            {half ? '½' : '★'}
          </span>
        )
      })}
    </span>
  )
}
