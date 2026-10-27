# AGENTS.md — Task Checklist

Progress implementasi Toko Batik Online sesuai PRD.md.

---

## Backend

- [x] `server/package.json` — dependencies: express, mysql2, jsonwebtoken, cors, dotenv, axios
- [x] `server/.env.example` — template environment variables
- [x] `server/db.js` — koneksi MySQL dengan mysql2
- [x] `server/server.js` — semua route & logika bisnis:
  - [x] `POST /api/register`
  - [x] `POST /api/login`
  - [x] `GET /api/products`
  - [x] `POST /api/products` (admin)
  - [x] `PUT /api/products/:id` (admin)
  - [x] `DELETE /api/products/:id` (admin)
  - [x] `GET /api/cart` (user)
  - [x] `POST /api/cart` (user)
  - [x] `PUT /api/cart/:id` (user)
  - [x] `DELETE /api/cart/:id` (user)
  - [x] `POST /api/checkout` (user) + Xendit invoice
  - [x] `GET /api/orders` (user)
  - [x] `POST /api/xendit/webhook`

## Database

- [x] `database/schema.sql` — CREATE TABLE untuk users, products, cart_items, orders, order_items
- [x] `database/seed.sql` — INSERT admin seed user + 3 contoh produk
- [x] `database/schema.sql` — seksi MIGRASI idempotent: kolom `daerah`/`gender`/`lengan`, index `daerah`/`lengan`, UNIQUE `(title, daerah)`, FK `order_items.product_id` → `ON DELETE SET NULL` (tanpa `ALTER TABLE ... IF NOT EXISTS` yang tidak didukung MySQL)
- [x] `database/seed.sql` — idempotent: `ON DUPLICATE KEY UPDATE` (aman dijalankan berulang)

## Frontend

- [x] `client/` — setup Vite + React + Tailwind
- [x] `client/package.json`
- [x] `client/vite.config.js` — proxy /api ke localhost:5000
- [x] `client/tailwind.config.js` — custom color hijau gelap (primary-900)
- [x] `client/postcss.config.js`
- [x] `client/index.html`
- [x] `client/src/index.css` — Tailwind directives
- [x] `client/src/main.jsx`
- [x] `client/src/App.jsx` — routing dengan React Router + PrivateRoute
- [x] `client/src/components/Navbar.jsx`
- [x] `client/src/components/ProductCard.jsx`
- [x] `client/src/components/CartItem.jsx`
- [x] `client/src/pages/LoginPage.jsx`
- [x] `client/src/pages/RegisterPage.jsx`
- [x] `client/src/pages/ProductListPage.jsx`
- [x] `client/src/pages/CartPage.jsx`
- [x] `client/src/pages/CheckoutPage.jsx`
- [x] `client/src/pages/admin/AdminDashboard.jsx`
- [x] `client/src/pages/OrderHistoryPage.jsx` ← riwayat transaksi user
- [x] `client/src/components/StarRating.jsx` ← komponen bintang reusable
- [x] `client/src/pages/ProductDetailPage.jsx` ← detail produk + form rating
- [x] `client/src/components/ProductCard.jsx` — update: avg rating + klik ke detail
- [x] `client/src/pages/admin/AdminDashboard.jsx` — update: kolom rating
- [x] `database/schema.sql` — update: tabel product_ratings
- [x] `server/server.js` — update: GET /api/products (avg rating), GET /api/products/:id, POST /api/ratings, GET /api/ratings/:productId

---

## Sprint: Kategori Batik + Redesign Home

### Database
- [x] `database/schema.sql` — ALTER TABLE products: tambah kolom `daerah`, `gender`, `lengan`
- [x] `database/seed.sql` — update 6 seed produk batik dengan kategori lengkap

### Backend (`server/server.js`)
- [x] `GET /api/products` — tambah filter query param `?daerah=&gender=&lengan=`
- [x] `POST /api/products` — tambah field `daerah`, `gender`, `lengan`
- [x] `PUT /api/products/:id` — tambah field `daerah`, `gender`, `lengan`
- [x] `GET /api/categories` — endpoint baru: return daftar nilai unik daerah, gender, lengan

### Frontend — Admin
- [x] `AdminDashboard.jsx` — form tambah/edit: tambah input `daerah`, dropdown `gender`, dropdown `lengan`
- [x] `AdminDashboard.jsx` — tabel produk: tambah kolom Kategori (daerah+gender+lengan badge) & Rating

### Frontend — Home Redesign
- [x] `ProductListPage.jsx` — redesign total: Hero Banner + Panel Kategori Cepat + Filter Chips + Grid
- [x] `ProductCard.jsx` — tampilkan badge kategori (daerah, gender, lengan)

---

## Cara Menjalankan

### 1. Setup Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend
```bash
cd server
cp .env.example .env   # isi nilai DB, JWT_SECRET, XENDIT_SECRET_KEY
npm install
npm run dev            # berjalan di http://localhost:5000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev            # berjalan di http://localhost:5173
```

### 4. Akun Admin Default
| Field    | Nilai             |
|----------|-------------------|
| Email    | admin@toko.com    |
| Password | admin123          |
| Role     | admin             |

---

## Status Legend
- `[ ]` Pending
- `[-]` In Progress
- `[x]` Done
