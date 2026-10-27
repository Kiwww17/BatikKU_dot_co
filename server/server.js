const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// Helper: verifikasi token dari header Authorization
// ─────────────────────────────────────────────
function getTokenPayload(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

// POST /api/register — registrasi user biasa
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Semua field wajib diisi' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email sudah terdaftar' });

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'user']
    );
    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/login — login admin & user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email dan password wajib diisi' });

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: 'Email atau password salah' });

    const user = rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

// GET /api/products — ambil semua produk + avg rating, support filter (public)
app.get('/api/products', async (req, res) => {
  try {
    const { daerah, gender, lengan } = req.query;
    const conditions = [];
    const params = [];

    if (daerah)  { conditions.push('p.daerah = ?');  params.push(daerah); }
    if (gender)  { conditions.push('p.gender = ?');  params.push(gender); }
    if (lengan)  { conditions.push('p.lengan = ?');  params.push(lengan); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT p.*,
              ROUND(AVG(r.rating), 1)  AS avg_rating,
              COUNT(r.id)              AS rating_count
       FROM products p
       LEFT JOIN product_ratings r ON r.product_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/categories — nilai unik daerah, gender, lengan (public)
app.get('/api/categories', async (req, res) => {
  try {
    const [[daerahRows], [genderRows], [lenganRows]] = await Promise.all([
      db.query("SELECT DISTINCT daerah FROM products WHERE daerah <> '' ORDER BY daerah"),
      db.query('SELECT DISTINCT gender FROM products ORDER BY gender'),
      db.query('SELECT DISTINCT lengan FROM products ORDER BY lengan'),
    ]);
    res.json({
      daerah: daerahRows.map(r => r.daerah),
      gender: genderRows.map(r => r.gender),
      lengan: lenganRows.map(r => r.lengan),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/products/:id — detail produk + semua review (public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const [[product]] = await db.query(
      `SELECT p.*,
              ROUND(AVG(r.rating), 1) AS avg_rating,
              COUNT(r.id)             AS rating_count
       FROM products p
       LEFT JOIN product_ratings r ON r.product_id = p.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.review, r.created_at, u.name AS user_name, u.id AS user_id
       FROM product_ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...product, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/products — tambah produk (admin only)
app.post('/api/products', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user || user.role !== 'admin')
    return res.status(403).json({ message: 'Akses ditolak' });

  const { title, description, image_url, price, stock, daerah, gender, lengan } = req.body;
  if (!title || !price || !daerah)
    return res.status(400).json({ message: 'Judul, harga, dan daerah wajib diisi' });

  try {
    const [result] = await db.query(
      'INSERT INTO products (title, description, image_url, price, stock, daerah, gender, lengan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', image_url || '', price, stock || 0, daerah, gender || 'Unisex', lengan || 'Pendek']
    );
    res.status(201).json({ message: 'Produk ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/products/:id — edit produk (admin only)
app.put('/api/products/:id', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user || user.role !== 'admin')
    return res.status(403).json({ message: 'Akses ditolak' });

  const { title, description, image_url, price, stock, daerah, gender, lengan } = req.body;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE products SET title=?, description=?, image_url=?, price=?, stock=?, daerah=?, gender=?, lengan=? WHERE id=?',
      [title, description, image_url, price, stock, daerah || '', gender || 'Unisex', lengan || 'Pendek', id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────
// RATINGS
// ─────────────────────────────────────────────

// POST /api/ratings — submit rating oleh user
app.post('/api/ratings', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user) return res.status(401).json({ message: 'Login diperlukan' });

  const { product_id, rating, review } = req.body;
  if (!product_id || !rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: 'product_id dan rating (1-5) wajib diisi' });

  try {
    await db.query(
      `INSERT INTO product_ratings (user_id, product_id, rating, review)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)`,
      [user.id, product_id, rating, review || null]
    );
    res.status(201).json({ message: 'Rating berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/ratings/:productId — semua rating sebuah produk (public)
app.get('/api/ratings/:productId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.rating, r.review, r.created_at, u.name AS user_name, u.id AS user_id
       FROM product_ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/products/:id — hapus produk (admin only)
app.delete('/api/products/:id', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user || user.role !== 'admin')
    return res.status(403).json({ message: 'Akses ditolak' });

  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────

// GET /api/cart — ambil keranjang user
app.get('/api/cart', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user) return res.status(401).json({ message: 'Login diperlukan' });

  try {
    const [rows] = await db.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.title, p.image_url, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/cart — tambah item ke keranjang
app.post('/api/cart', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user) return res.status(401).json({ message: 'Login diperlukan' });

  const { product_id, quantity } = req.body;
  if (!product_id) return res.status(400).json({ message: 'product_id wajib diisi' });

  try {
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [user.id, product_id]
    );

    if (existing.length > 0) {
      // sudah ada di keranjang → tambah quantity
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [
        quantity || 1,
        existing[0].id,
      ]);
    } else {
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user.id, product_id, quantity || 1]
      );
    }
    res.status(201).json({ message: 'Item ditambahkan ke keranjang' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/cart/:id — update quantity item keranjang
app.put('/api/cart/:id', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user) return res.status(401).json({ message: 'Login diperlukan' });

  const { quantity } = req.body;
  if (!quantity || quantity < 1)
    return res.status(400).json({ message: 'Quantity tidak valid' });

  try {
    const [result] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    res.json({ message: 'Quantity diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/cart/:id — hapus item dari keranjang
app.delete('/api/cart/:id', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user) return res.status(401).json({ message: 'Login diperlukan' });

  try {
    const [result] = await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    res.json({ message: 'Item dihapus dari keranjang' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────
// ORDERS & CHECKOUT
// ─────────────────────────────────────────────

// POST /api/checkout — buat order + invoice Xendit
app.post('/api/checkout', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user) return res.status(401).json({ message: 'Login diperlukan' });

  try {
    // Ambil isi keranjang user (sertakan stock untuk validasi)
    const [cartItems] = await db.query(
      `SELECT ci.quantity, p.id AS product_id, p.title, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [user.id]
    );

    if (cartItems.length === 0)
      return res.status(400).json({ message: 'Keranjang kosong' });

    // Konversi price/quantity/stock dari string (MySQL) ke number
    const normalizedItems = cartItems.map((item) => ({
      ...item,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity, 10),
      stock: parseInt(item.stock, 10),
    }));

    // Validasi stok mencukupi untuk semua item
    const outOfStock = normalizedItems.filter((item) => item.quantity > item.stock);
    if (outOfStock.length > 0) {
      const names = outOfStock.map((i) => `"${i.title}" (stok tersisa: ${i.stock})`).join(', ');
      return res.status(400).json({ message: `Stok tidak mencukupi untuk: ${names}` });
    }

    const totalAmount = Math.round(
      normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );

    // Buat order di DB
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [user.id, totalAmount, 'pending']
    );
    const orderId = orderResult.insertId;

    // Simpan order items & kurangi stok produk
    for (const item of normalizedItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await db.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Buat invoice Xendit
    const xenditPayload = {
      external_id: `order-${orderId}`,
      amount: totalAmount,
      payer_email: req.body.email || 'customer@email.com',
      description: `Pembayaran Order #${orderId}`,
      success_redirect_url: `${process.env.CLIENT_URL}/orders`,
      failure_redirect_url: `${process.env.CLIENT_URL}/cart`,
      items: normalizedItems.map((item) => ({
        name: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const xenditResponse = await axios.post(
      'https://api.xendit.co/v2/invoices',
      xenditPayload,
      {
        auth: { username: process.env.XENDIT_SECRET_KEY, password: '' },
      }
    );

    const { id: invoiceId, invoice_url: invoiceUrl } = xenditResponse.data;

    // Simpan xendit invoice ID & URL ke order
    await db.query(
      'UPDATE orders SET xendit_invoice_id = ?, xendit_invoice_url = ? WHERE id = ?',
      [invoiceId, invoiceUrl, orderId]
    );

    // Kosongkan keranjang
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [user.id]);

    res.json({ order_id: orderId, invoice_url: invoiceUrl });
  } catch (err) {
    // Sertakan detail error Xendit jika ada
    const xenditDetail = err.response?.data ? JSON.stringify(err.response.data) : null;
    res.status(500).json({
      message: 'Checkout gagal',
      error: err.message,
      ...(xenditDetail && { xendit: xenditDetail }),
    });
  }
});

// GET /api/orders — riwayat order user
app.get('/api/orders', async (req, res) => {
  const user = getTokenPayload(req);
  if (!user) return res.status(401).json({ message: 'Login diperlukan' });

  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    // Ambil items untuk tiap order
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.quantity, oi.price, p.title, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/xendit/webhook — update status order setelah pembayaran
app.post('/api/xendit/webhook', async (req, res) => {
  // Verifikasi webhook token dari Xendit
  const webhookToken = req.headers['x-callback-token'];
  if (webhookToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return res.status(401).json({ message: 'Webhook token tidak valid' });
  }

  const { external_id, status } = req.body;
  // external_id format: "order-{orderId}"
  const orderId = external_id?.replace('order-', '');

  if (!orderId) return res.status(400).json({ message: 'external_id tidak valid' });

  try {
    if (status === 'PAID') {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', ['paid', orderId]);
    } else if (status === 'EXPIRED') {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', orderId]);
    }
    res.json({ message: 'Webhook diterima' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
