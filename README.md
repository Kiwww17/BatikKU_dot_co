# 🧵 Toko Batik Online

Aplikasi toko online khusus batik Nusantara — dibangun dengan stack **React + Express + MySQL**. Mendukung katalog produk dengan filter kategori (daerah, gender, lengan), keranjang belanja, pembayaran via **Xendit**, rating & ulasan produk, serta dashboard admin untuk mengelola produk.

---

## ✨ Fitur Utama

### Untuk Pengunjung (Guest)
- Browse produk batik tanpa perlu login
- Filter produk berdasarkan **daerah asal**, **jenis kelamin**, dan **panjang lengan**
- Lihat detail produk dan ulasan pembeli

### Untuk User (Pembeli)
- Registrasi & login akun
- Tambah produk ke keranjang belanja
- Checkout & bayar via **Xendit Invoice**
- Riwayat transaksi (status: pending / lunas / dibatalkan)
- Beri rating bintang (1–5) dan ulasan produk

### Untuk Admin (Penjual)
- Dashboard manajemen produk
- Tambah / edit / hapus produk batik
- Input kategori per produk: daerah, gender, lengan
- Pantau rata-rata rating setiap produk

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| **Frontend** | React 18 (JSX) + Vite + Tailwind CSS |
| **Backend** | Express.js — semua logika di satu file `server.js` |
| **Database** | MySQL 8 + `mysql2` (connection pool) |
| **Auth** | JWT (`jsonwebtoken`) — token disimpan di `localStorage` |
| **Payment** | [Xendit](https://xendit.co) — Invoice API |
| **HTTP Client** | Axios (frontend & backend) |

**Tema UI:** Minimalis-modern, aksen hijau gelap `#14532d` (Tailwind `primary-900`)

---

## 📁 Struktur Proyek

```
toko-online/
├── client/                  # Frontend — React + Vite
│   └── src/
│       ├── pages/           # Halaman: Home, Cart, Checkout, Orders, Admin, dst
│       └── components/      # Navbar, ProductCard, CartItem, StarRating
├── server/
│   ├── server.js            # Semua route & logika bisnis Express
│   ├── db.js                # Koneksi MySQL (connection pool)
│   └── .env.example         # Template environment variables
├── database/
│   ├── schema.sql           # DDL — buat semua tabel
│   └── seed.sql             # Data awal: admin + 30 produk batik
├── PRD.md                   # Product Requirements Document
└── AGENTS.md                # Checklist progres implementasi
```

---

## 🚀 Cara Instalasi

### Prasyarat
- **Node.js** ≥ 18
- **MySQL** ≥ 8
- Akun [Xendit](https://dashboard.xendit.co) (mode Test untuk development)

---

### 1. Clone & Masuk ke Direktori

```bash
git clone https://github.com/Kiwww17/BatikKU_dot_co
cd toko-online
```

---

### 2. Setup Database

```bash
# Buat database & tabel
mysql -u root -p < database/schema.sql

# Isi data awal (admin + 30 produk batik)
mysql -u root -p < database/seed.sql
```

---

### 3. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Salin file env dan isi nilainya
cp .env.example .env
```

Edit file `server/.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql
DB_NAME=toko_online

JWT_SECRET=isi_dengan_string_acak_apa_saja

XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxxxxxxxx
XENDIT_WEBHOOK_TOKEN=token_webhook_dari_xendit

CLIENT_URL=http://localhost:5173
```

> **Cara mendapatkan Xendit key:**
> Login ke [dashboard.xendit.co](https://dashboard.xendit.co) → Settings → API Keys → Generate Secret Key (aktifkan permission **Invoice**).

```bash
# Jalankan server (development)
npm run dev
# → berjalan di http://localhost:5000
```

---

### 4. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Jalankan dev server
npm run dev
# → berjalan di http://localhost:5173
```

> Vite sudah dikonfigurasi proxy: semua request `/api/*` diteruskan ke `localhost:5000`.

---

### 5. Buka di Browser

```
http://localhost:5173
```

---

## 🔑 Akun Default

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@toko.com | admin123 |
| User | budi@email.com | budi123 |
| User | siti@email.com | siti123 |

---

## 🗄️ Schema Database

| Tabel | Keterangan |
|---|---|
| `users` | Akun admin & user pembeli |
| `products` | Produk batik (+ kolom `daerah`, `gender`, `lengan`) |
| `cart_items` | Item keranjang belanja per user |
| `orders` | Order / transaksi (xendit invoice ID & URL disimpan di sini) |
| `order_items` | Detail item per order (harga snapshot saat checkout) |
| `product_ratings` | Rating bintang & ulasan per user per produk (UNIQUE) |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/register` | Public |
| POST | `/api/login` | Public |

### Products
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/products?daerah=&gender=&lengan=` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Categories
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/categories` | Public |

### Cart
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/cart` | User |
| POST | `/api/cart` | User |
| PUT | `/api/cart/:id` | User |
| DELETE | `/api/cart/:id` | User |

### Orders & Checkout
| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/checkout` | User |
| GET | `/api/orders` | User |
| POST | `/api/xendit/webhook` | Public (Xendit) |

### Ratings
| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/ratings` | User |
| GET | `/api/ratings/:productId` | Public |

---

## 🔄 Alur Pembayaran (Xendit)

```
User klik "Bayar Sekarang"
    → POST /api/checkout
    → Backend buat order di DB
    → Backend panggil Xendit Create Invoice API
    → Frontend redirect ke xendit_invoice_url
    → User bayar di halaman Xendit
    → Xendit kirim webhook ke POST /api/xendit/webhook
    → Backend update orders.status = 'paid'
```