# PRD — Toko Batik Online

## Overview

Aplikasi toko online khusus **batik** dengan **1 penjual (admin)** dan **banyak pembeli (user)**. Setiap produk batik dapat dikategorikan berdasarkan **daerah asal**, **jenis kelamin**, dan **panjang lengan**. Halaman utama (home) memiliki layout modern bergaya toko fashion dengan hero banner, panel kategori cepat, dan grid produk yang dapat difilter. Admin mengelola produk via dashboard. User dapat browse, filter, checkout via Xendit.

---

## Tech Stack

| Layer      | Teknologi                                      |
|------------|------------------------------------------------|
| Frontend   | ReactJS (JSX) + Tailwind CSS                   |
| Backend    | ExpressJS — semua logika bisnis di `server.js` |
| Database   | MySQL — koneksi di `db.js`                     |
| Payment    | Xendit Payment Gateway                         |
| Auth       | Session/JWT sederhana (tanpa middleware ORM)   |

**Tema UI:** Minimalis-modern, aksen hijau gelap (`#1a4731` / `green-900`).

---

## Roles

| Role  | Kemampuan                                                    |
|-------|--------------------------------------------------------------|
| Admin | Login, tambah/edit/hapus produk (judul, gambar, deskripsi, harga) |
| User  | Register, login, lihat produk, keranjang, checkout via Xendit |

> Admin hanya **1 akun** — di-seed langsung ke database, tidak ada fitur registrasi admin.

---

## Struktur Proyek

```
toko-online/
├── client/                  # Frontend ReactJS
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ProductListPage.jsx   # halaman utama user
│       │   ├── CartPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   └── admin/
│       │       └── AdminDashboard.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProductCard.jsx
│       │   └── CartItem.jsx
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── server.js            # semua route & logika bisnis
│   └── db.js                # koneksi MySQL
├── PRD.md
└── package.json (root, atau masing-masing folder)
```

---

## Database Schema

### Tabel `users`
| Kolom      | Tipe         | Keterangan               |
|------------|--------------|--------------------------|
| id         | INT PK AI    |                          |
| name       | VARCHAR(100) |                          |
| email      | VARCHAR(100) | UNIQUE                   |
| password   | VARCHAR(100) | plain text               |
| role       | ENUM('admin','user') | default 'user'   |
| created_at | TIMESTAMP    | default CURRENT_TIMESTAMP|

### Tabel `products` (update)
| Kolom        | Tipe                                      | Keterangan                           |
|--------------|-------------------------------------------|--------------------------------------|
| id           | INT PK AI                                 |                                      |
| title        | VARCHAR(200)                              |                                      |
| description  | TEXT                                      |                                      |
| image_url    | VARCHAR(500)                              |                                      |
| price        | DECIMAL(12,2)                             |                                      |
| stock        | INT                                       | default 0                            |
| daerah       | VARCHAR(100)                              | contoh: Jogja, Solo, Pekalongan      |
| gender       | ENUM('Pria','Wanita','Unisex')            | default 'Unisex'                     |
| lengan       | ENUM('Panjang','Pendek')                  | default 'Pendek'                     |
| created_at   | TIMESTAMP                                 | default CURRENT_TIMESTAMP            |

### Tabel `cart_items`
| Kolom      | Tipe      | Keterangan                          |
|------------|-----------|-------------------------------------|
| id         | INT PK AI |                                     |
| user_id    | INT FK    | references users(id)                |
| product_id | INT FK    | references products(id)             |
| quantity   | INT       | default 1                           |

### Tabel `orders`
| Kolom          | Tipe          | Keterangan                              |
|----------------|---------------|-----------------------------------------|
| id             | INT PK AI     |                                         |
| user_id        | INT FK        | references users(id)                    |
| total_amount   | DECIMAL(12,2) |                                         |
| status         | ENUM('pending','paid','cancelled') | default 'pending' |
| xendit_invoice_id | VARCHAR(200) | ID invoice dari Xendit               |
| xendit_invoice_url | VARCHAR(500) | URL pembayaran Xendit              |
| created_at     | TIMESTAMP     | default CURRENT_TIMESTAMP               |

### Tabel `order_items`
| Kolom      | Tipe          | Keterangan              |
|------------|---------------|-------------------------|
| id         | INT PK AI     |                         |
| order_id   | INT FK        | references orders(id)   |
| product_id | INT FK        | references products(id) |
| quantity   | INT           |                         |
| price      | DECIMAL(12,2) | harga saat checkout     |

### Tabel `product_ratings` ← **BARU**
| Kolom      | Tipe      | Keterangan                                        |
|------------|-----------|---------------------------------------------------|
| id         | INT PK AI |                                                   |
| user_id    | INT FK    | references users(id)                              |
| product_id | INT FK    | references products(id)                           |
| rating     | TINYINT   | nilai 1–5                                         |
| review     | TEXT      | komentar opsional                                 |
| created_at | TIMESTAMP | default CURRENT_TIMESTAMP                         |
| UNIQUE     | (user_id, product_id) | 1 user hanya bisa rating 1x per produk |

---

## API Endpoints (di `server.js`)

### Auth
| Method | Endpoint           | Akses | Keterangan                    |
|--------|--------------------|-------|-------------------------------|
| POST   | `/api/register`    | Public| Registrasi user biasa         |
| POST   | `/api/login`       | Public| Login admin & user, return token JWT sederhana |

### Products
| Method | Endpoint             | Akses | Keterangan                                                     |
|--------|----------------------|-------|----------------------------------------------------------------|
| GET    | `/api/products`      | Public| Ambil semua produk; support query `?daerah=&gender=&lengan=`   |
| POST   | `/api/products`      | Admin | Tambah produk baru (termasuk daerah, gender, lengan)           |
| PUT    | `/api/products/:id`  | Admin | Edit produk (termasuk kategori)                                |
| DELETE | `/api/products/:id`  | Admin | Hapus produk                                                   |

### Categories
| Method | Endpoint             | Akses  | Keterangan                                      |
|--------|----------------------|--------|-------------------------------------------------|
| GET    | `/api/categories`    | Public | Ambil daftar nilai unik: daerah, gender, lengan |

### Cart
| Method | Endpoint             | Akses | Keterangan                  |
|--------|----------------------|-------|-----------------------------|
| GET    | `/api/cart`          | User  | Ambil isi keranjang         |
| POST   | `/api/cart`          | User  | Tambah item ke keranjang    |
| PUT    | `/api/cart/:id`      | User  | Update quantity item        |
| DELETE | `/api/cart/:id`      | User  | Hapus item dari keranjang   |

### Products (tambahan)
| Method | Endpoint                    | Akses  | Keterangan                                      |
|--------|-----------------------------|--------|-------------------------------------------------|
| GET    | `/api/products/:id`         | Public | Detail produk + semua review + avg rating       |

### Ratings ← **BARU**
| Method | Endpoint                    | Akses  | Keterangan                                      |
|--------|-----------------------------|--------|-------------------------------------------------|
| POST   | `/api/ratings`              | User   | Submit rating (1–5) + review untuk suatu produk |
| GET    | `/api/ratings/:productId`   | Public | Ambil semua rating produk tertentu              |

### Orders & Checkout
| Method | Endpoint                       | Akses  | Keterangan                                      |
|--------|--------------------------------|--------|-------------------------------------------------|
| POST   | `/api/checkout`                | User   | Buat order dari keranjang + buat invoice Xendit |
| GET    | `/api/orders`                  | User   | Riwayat order user                              |
| POST   | `/api/xendit/webhook`          | Public | Webhook Xendit — update status order ke 'paid'  |

> Autentikasi dilakukan dengan mengecek header `Authorization: Bearer <token>` langsung di dalam `server.js` tanpa middleware terpisah. Tidak menggunakan ORM atau controller.

---

## Alur Utama

### User Checkout
1. User login → mendapat token
2. User browse produk di `ProductListPage`
3. User tambah produk ke keranjang
4. User buka `CartPage`, review item
5. User klik Checkout → `POST /api/checkout`
6. Backend buat order + panggil Xendit Create Invoice API
7. Backend kembalikan `xendit_invoice_url` ke frontend
8. Frontend redirect user ke URL pembayaran Xendit
9. Xendit kirim webhook ke `/api/xendit/webhook` setelah pembayaran berhasil
10. Backend update `orders.status` menjadi `'paid'`

### Admin Kelola Produk
1. Admin login dengan email & password yang sudah di-seed
2. Admin diarahkan ke `AdminDashboard`
3. Admin bisa tambah, edit, dan hapus produk (dengan URL gambar)

---

## Fitur Per Halaman

### `LoginPage` & `RegisterPage`
- Form login (email + password)
- Register hanya untuk user biasa
- Setelah login, simpan token di `localStorage`
- Redirect: admin → `/admin`, user → `/`

### `ProductListPage` (Home) ← **REDESIGN**

Layout baru mengacu referensi gambar (toko fashion modern), terdiri dari section berurutan:

#### 1. Hero Banner
- Banner fullwidth dengan teks promosi (judul, subjudul, tombol "Belanja Sekarang")
- Background hijau gelap dengan gambar batik dekoratif (URL eksternal)
- Desain minimalis-modern, bukan slider

#### 2. Panel Kategori Cepat
- 3 kartu filter cepat horizontal:
  - **Berdasarkan Daerah** (ikon peta, contoh: Jogja, Solo, Pekalongan)
  - **Berdasarkan Gender** (ikon orang, Pria / Wanita / Unisex)
  - **Berdasarkan Lengan** (ikon baju, Panjang / Pendek)
- Klik kartu kategori → filter produk secara otomatis (scroll ke section produk)

#### 3. Filter Bar + Section Produk
- Filter bar horizontal dengan chip/pill yang bisa diklik:
  - **Semua** (default)
  - Chip daerah: Jogja · Solo · Pekalongan · dst (diambil dinamis dari `GET /api/categories`)
  - Chip gender: Pria · Wanita · Unisex
  - Chip lengan: Panjang · Pendek
- Filter aktif ditandai dengan background hijau gelap
- Bisa kombinasi beberapa filter sekaligus (multi-filter)
- Grid produk 2–4 kolom responsive, tampilkan `ProductCard`
- Teks jumlah hasil: "Menampilkan X produk"
- Pesan kosong jika tidak ada produk yang cocok

### `CartPage`
- List item keranjang (gambar, nama, harga, quantity)
- Tombol +/- quantity, tombol hapus item
- Total harga
- Tombol "Checkout"

### `CheckoutPage`
- Konfirmasi ringkasan order
- Tombol "Bayar Sekarang" → redirect ke Xendit

### `AdminDashboard` (update)
- Tabel daftar produk dengan kolom tambahan: **Daerah**, **Gender**, **Lengan**, **Rating**
- Form tambah/edit produk dengan field baru:
  - **Daerah** — input teks bebas (misal: Jogja, Solo, Pekalongan, Madura, dll)
  - **Gender** — dropdown: Pria / Wanita / Unisex
  - **Lengan** — dropdown: Panjang / Pendek
- Validasi: daerah wajib diisi
- Tombol edit & hapus per produk
- Kolom **Rating** — tampilkan avg rating bintang + jumlah ulasan per produk

### `ProductDetailPage` ← **BARU**
- Dapat diakses via route `/products/:id`
- Tampilkan gambar besar, judul, harga, stok, deskripsi lengkap produk
- Tampilkan avg rating bintang + jumlah total ulasan
- Tombol "Tambah ke Keranjang"
- Daftar ulasan dari user lain (nama, bintang, komentar, tanggal)
- Form submit rating: pilih 1–5 bintang + textarea komentar (hanya untuk user yang sudah login)
- Jika user sudah pernah memberi rating, form tidak muncul dan tampilkan ulasan mereka dengan label "Ulasan kamu"
- Bintang interaktif — hover highlight sebelum diklik

### `ProductCard` (update)
- Tampilkan avg rating bintang di bawah judul produk
- Seluruh card bisa diklik → navigasi ke `/products/:id`

### `OrderHistoryPage` ← **BARU**
- Hanya dapat diakses oleh user yang sudah login (route `/orders`)
- Menampilkan daftar semua order milik user yang sedang login, diurutkan terbaru di atas
- Setiap order menampilkan:
  - Nomor order (`#id`)
  - Tanggal & waktu order dibuat
  - Status order dengan badge warna: `pending` (kuning), `paid` (hijau), `cancelled` (merah)
  - Total pembayaran
  - Daftar item dalam order (nama produk, quantity, harga satuan)
- Jika status `pending`, tampilkan tombol **"Lanjut Bayar"** yang membuka `xendit_invoice_url` di tab baru
- Jika belum ada order, tampilkan pesan kosong dengan link ke halaman produk
- Navbar tetap tampil di halaman ini

---

## Constraints & Non-Goals

- ✅ Password disimpan **plain text** (tidak di-hash)
- ✅ Tidak ada middleware, ORM, atau controller terpisah
- ✅ Semua logika backend di satu file `server.js`
- ✅ Koneksi DB di file terpisah `db.js`
- ✅ Kategori batik: daerah (teks bebas), gender (enum), lengan (enum)
- ✅ Filter produk multi-dimensi di frontend (query param ke backend)
- ❌ Tidak ada upload gambar — menggunakan URL gambar eksternal
- ❌ Tidak ada notifikasi email
- ❌ Tidak ada multi-penjual
- ❌ Tidak ada sub-kategori berjenjang (kategori cukup 3 dimensi flat)
- ❌ Hero banner tidak perlu carousel/slider, cukup statis

---

## Ringkasan Perubahan dari Versi Sebelumnya

| Area        | Perubahan                                                                          |
|-------------|------------------------------------------------------------------------------------|
| DB          | Tambah kolom `daerah`, `gender`, `lengan` di tabel `products`                      |
| Backend     | `GET /api/products` support filter query param; endpoint baru `GET /api/categories`|
| Admin       | Form tambah/edit produk tambah 3 field kategori; tabel produk tampilkan kategori   |
| Home UI     | Redesign total: Hero → Panel Kategori Cepat → Filter Bar → Grid Produk             |
| ProductCard | Tampilkan badge kategori (daerah, gender, lengan) di bawah nama produk             |
