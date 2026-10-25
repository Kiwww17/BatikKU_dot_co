-- ============================================
-- Schema: toko_online
-- ============================================

CREATE DATABASE IF NOT EXISTS toko_online
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE toko_online;

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(100)  NOT NULL UNIQUE,
  password   VARCHAR(100)  NOT NULL,
  role       ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel products
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)   NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  price       DECIMAL(12,2)  NOT NULL,
  stock       INT            NOT NULL DEFAULT 0,
  daerah      VARCHAR(100)   NOT NULL DEFAULT '',
  gender      ENUM('Pria','Wanita','Unisex') NOT NULL DEFAULT 'Unisex',
  lengan      ENUM('Panjang','Pendek')       NOT NULL DEFAULT 'Pendek',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrasi untuk database yang sudah ada (aman dijalankan ulang)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS daerah VARCHAR(100)   NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gender ENUM('Pria','Wanita','Unisex') NOT NULL DEFAULT 'Unisex',
  ADD COLUMN IF NOT EXISTS lengan ENUM('Panjang','Pendek')       NOT NULL DEFAULT 'Pendek';

-- Tabel cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabel orders
CREATE TABLE IF NOT EXISTS orders (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL,
  total_amount       DECIMAL(12,2) NOT NULL,
  status             ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  xendit_invoice_id  VARCHAR(200),
  xendit_invoice_url VARCHAR(500),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel order_items
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT            NOT NULL,
  product_id INT            NOT NULL,
  quantity   INT            NOT NULL,
  price      DECIMAL(12,2)  NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Tabel product_ratings
CREATE TABLE IF NOT EXISTS product_ratings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT     NOT NULL,
  product_id INT     NOT NULL,
  rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review     TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
