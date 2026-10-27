USE toko_online;

-- Seed ini idempotent (aman dijalankan berulang):
--   - users  : UNIQUE(email) + ON DUPLICATE KEY UPDATE
--   - products: UNIQUE(title, daerah) + ON DUPLICATE KEY UPDATE
--               (unique key dibuat oleh blok MIGRASI di schema.sql)

-- Seed: 1 admin account
-- Email: admin@toko.com | Password: admin123
INSERT INTO users (name, email, password, role)
VALUES ('Admin Toko', 'admin@toko.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE id = id;

-- Seed: dummy user accounts
INSERT INTO users (name, email, password, role) VALUES
('Budi Santoso',    'budi@email.com',    'budi123',    'user'),
('Siti Rahayu',     'siti@email.com',    'siti123',    'user'),
('Agus Prasetyo',   'agus@email.com',    'agus123',    'user'),
('Dewi Lestari',    'dewi@email.com',    'dewi123',    'user'),
('Rizky Firmansyah','rizky@email.com',   'rizky123',   'user')
ON DUPLICATE KEY UPDATE id = id;

-- Seed: 30 produk batik dari berbagai daerah
INSERT INTO products (title, description, image_url, price, stock, daerah, gender, lengan) VALUES

-- ── JOGJA ───────────────────────────────────────────────────────────────
(
  'Batik Parang Kusumo Jogja',
  'Batik tulis klasik motif parang kusumo khas Yogyakarta. Bahan katun primissima halus, nyaman dan adem. Cocok untuk acara resmi maupun kasual.',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
  285000, 30, 'Jogja', 'Unisex', 'Panjang'
),
(
  'Batik Sidomukti Jogja Wanita',
  'Motif sidomukti bermakna kemakmuran, banyak dipakai pada upacara adat Jawa. Tersedia dalam blouse wanita lengan pendek yang anggun.',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  310000, 20, 'Jogja', 'Wanita', 'Pendek'
),
(
  'Batik Truntum Jogja Pria',
  'Motif truntum bermotif bintang kecil mekar, simbol kasih sayang yang tulus. Kemeja pria bahan dobby premium.',
  'https://images.unsplash.com/photo-1594938298603-c8148c4b4d7a?w=400',
  340000, 18, 'Jogja', 'Pria', 'Panjang'
),
(
  'Batik Lereng Jogja Pendek Unisex',
  'Motif lereng diagonal yang elegan, khas gaya Keraton Yogyakarta. Potongan modern unisex, pas untuk hangout.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  225000, 35, 'Jogja', 'Unisex', 'Pendek'
),

-- ── SOLO ────────────────────────────────────────────────────────────────
(
  'Batik Kawung Solo Wanita Pendek',
  'Blouse batik wanita motif kawung elegan khas Solo. Lengan pendek cocok untuk acara semi-formal.',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
  265000, 40, 'Solo', 'Wanita', 'Pendek'
),
(
  'Batik Parang Barong Solo Pria',
  'Motif parang barong yang gagah, dahulu hanya boleh dikenakan keluarga kerajaan. Kini hadir dalam kemeja formal pria.',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
  395000, 12, 'Solo', 'Pria', 'Panjang'
),
(
  'Batik Sekar Jagad Solo Unisex',
  'Motif sekar jagad melambangkan keindahan dunia yang beragam. Bahan katun halus cocok dipakai sehari-hari.',
  'https://images.unsplash.com/photo-1590080876351-41426d0d4c0f?w=400',
  245000, 28, 'Solo', 'Unisex', 'Pendek'
),
(
  'Batik Sido Asih Solo Wanita Panjang',
  'Sido asih berarti saling menyayangi — motif ini sering dipakai perempuan muda. Warna cokelat sogan yang hangat.',
  'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400',
  355000, 15, 'Solo', 'Wanita', 'Panjang'
),

-- ── PEKALONGAN ──────────────────────────────────────────────────────────
(
  'Batik Pekalongan Sogan Unisex',
  'Batik sogan Pekalongan dengan motif flora fauna warna kayu yang hangat. Cocok dipakai siapa saja.',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
  195000, 50, 'Pekalongan', 'Unisex', 'Pendek'
),
(
  'Batik Pekalongan Jlamprang Wanita',
  'Motif jlamprang terinspirasi dari kain patola India, memadukan geometri khas Pekalongan dengan nuansa modern.',
  'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=400',
  275000, 32, 'Pekalongan', 'Wanita', 'Panjang'
),
(
  'Batik Pekalongan Encim Pria',
  'Batik encim Pekalongan dengan pengaruh Tionghoa — motif bunga-bunga kecil berwarna cerah. Kemeja pria kasual.',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
  230000, 22, 'Pekalongan', 'Pria', 'Pendek'
),

-- ── CIREBON ─────────────────────────────────────────────────────────────
(
  'Batik Mega Mendung Cirebon Pria',
  'Kemeja batik pria motif mega mendung ikonik dari Cirebon. Warna biru gradasi, cocok untuk formal dan kasual.',
  'https://images.unsplash.com/photo-1603217040830-cd4a5b6e9d96?w=400',
  320000, 25, 'Cirebon', 'Pria', 'Panjang'
),
(
  'Batik Cirebon Naga Seba Unisex',
  'Motif naga seba menampilkan naga besar yang anggun, simbol kekuatan dan keberuntungan. Bahan premium adem.',
  'https://images.unsplash.com/photo-1603217041043-e21c19cec14f?w=400',
  420000, 10, 'Cirebon', 'Unisex', 'Panjang'
),
(
  'Batik Taman Arum Cirebon Wanita',
  'Motif taman arum menggambarkan taman bunga yang indah. Blouse wanita lengan pendek dengan warna cerah menawan.',
  'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400',
  285000, 18, 'Cirebon', 'Wanita', 'Pendek'
),

-- ── MADURA ──────────────────────────────────────────────────────────────
(
  'Batik Madura Gentongan Pria',
  'Batik gentongan Madura dengan warna cerah khas pesisir. Proses pewarnaan alami, motif unik.',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400',
  450000, 15, 'Madura', 'Pria', 'Panjang'
),
(
  'Batik Madura Storjan Wanita',
  'Motif storjan khas Madura dengan pola geometris sederhana namun berkarakter kuat. Warna merah-hitam yang berani.',
  'https://images.unsplash.com/photo-1593604340846-4fbe9763a8f3?w=400',
  385000, 12, 'Madura', 'Wanita', 'Panjang'
),
(
  'Batik Madura Kapal Pecah Unisex Pendek',
  'Motif kapal pecah unik dari Madura, menggambarkan keberanian nelayan. Kaos batik pendek yang nyaman dipakai.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  175000, 40, 'Madura', 'Unisex', 'Pendek'
),

-- ── LASEM ───────────────────────────────────────────────────────────────
(
  'Batik Lasem Tiga Negeri Wanita',
  'Batik Lasem motif tiga negeri dengan perpaduan merah, biru, dan sogan. Pilihan premium untuk wanita.',
  'https://images.unsplash.com/photo-1519748771451-a94c596fad67?w=400',
  580000, 10, 'Lasem', 'Wanita', 'Panjang'
),
(
  'Batik Lasem Sekar Jagad Pria',
  'Batik Lasem dengan motif sekar jagad berwarna merah Lasem yang khas. Kemeja pria elegan untuk acara formal.',
  'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400',
  620000, 8, 'Lasem', 'Pria', 'Panjang'
),

-- ── INDRAMAYU ───────────────────────────────────────────────────────────
(
  'Batik Indramayu Sawat Unisex',
  'Batik pesisir Indramayu dengan motif sawat (sayap garuda). Warna-warna cerah khas batik pantai utara Jawa.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  210000, 35, 'Indramayu', 'Unisex', 'Pendek'
),
(
  'Batik Indramayu Kembang Wanita',
  'Motif kembang-kembang segar khas Indramayu. Blouse wanita dengan warna merah muda dan hijau segar.',
  'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400',
  240000, 20, 'Indramayu', 'Wanita', 'Pendek'
),

-- ── BANYUMAS ────────────────────────────────────────────────────────────
(
  'Batik Banyumas Jonasan Pria',
  'Motif jonasan dengan pola geometris khas Banyumas yang kuat dan maskulin. Kemeja pria lengan panjang.',
  'https://images.unsplash.com/photo-1594938298603-c8148c4b4d7a?w=400',
  295000, 22, 'Banyumas', 'Pria', 'Panjang'
),
(
  'Batik Banyumas Lumbon Unisex',
  'Batik Banyumas motif lumbon dari pohon talas. Warna cokelat kemerahan yang unik, cocok dipakai santai.',
  'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400',
  185000, 30, 'Banyumas', 'Unisex', 'Pendek'
),

-- ── GARUT ───────────────────────────────────────────────────────────────
(
  'Batik Garut Sutra Wanita Panjang',
  'Batik Garut berbahan sutra halus dengan motif khas Priangan. Mewah dan cocok untuk acara pernikahan.',
  'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=400',
  750000, 7, 'Garut', 'Wanita', 'Panjang'
),
(
  'Batik Garut Lereng Pria',
  'Kemeja batik Garut motif lereng dengan warna biru tua dan putih yang bersih. Elegan untuk acara kantor.',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
  480000, 14, 'Garut', 'Pria', 'Panjang'
),

-- ── TUBAN ───────────────────────────────────────────────────────────────
(
  'Batik Gedog Tuban Unisex',
  'Batik gedog Tuban dibuat dengan alat tenun tradisional (gedog). Corak kuno yang autentik dan bernilai budaya tinggi.',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
  520000, 9, 'Tuban', 'Unisex', 'Panjang'
),

-- ── TASIKMALAYA ─────────────────────────────────────────────────────────
(
  'Batik Tasikmalaya Merak Wanita',
  'Motif merak megah khas Tasikmalaya dengan warna-warna cerah. Dress wanita lengan pendek yang anggun.',
  'https://images.unsplash.com/photo-1590080876351-41426d0d4c0f?w=400',
  365000, 16, 'Tasikmalaya', 'Wanita', 'Pendek'
),
(
  'Batik Tasikmalaya Rereng Pria Pendek',
  'Motif rereng (garis diagonal) khas Tasikmalaya dengan sentuhan warna hijau tosca. Cocok untuk casual Friday.',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  260000, 25, 'Tasikmalaya', 'Pria', 'Pendek'
),

-- ── KUDUS ───────────────────────────────────────────────────────────────
(
  'Batik Kudus Paksi Naga Liman Pria',
  'Motif paksi naga liman hewan mitologi berkekuatan sakti dari Kudus. Kemeja formal pria berwibawa.',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
  375000, 11, 'Kudus', 'Pria', 'Panjang'
),
(
  'Batik Kudus Lung-lungan Wanita',
  'Motif lung-lungan menampilkan sulur tumbuhan yang meliuk lembut. Blouse wanita dengan nuansa hijau daun.',
  'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400',
  290000, 19, 'Kudus', 'Wanita', 'Pendek'
)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  image_url   = VALUES(image_url),
  price       = VALUES(price),
  stock       = VALUES(stock),
  gender      = VALUES(gender),
  lengan      = VALUES(lengan);
