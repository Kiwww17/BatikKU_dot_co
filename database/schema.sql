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
  -- nullable: foreign key di bawah memakai ON DELETE SET NULL
  product_id INT            NULL,
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

-- ============================================
-- MIGRASI (aman dijalankan berulang / idempotent)
-- ============================================
-- Catatan: MySQL 8 TIDAK mendukung `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
-- (itu sintaks MariaDB). Karena itu keberadaan kolom/index/constraint dicek
-- lewat information_schema, lalu DDL dijalankan via PREPARE.
--
-- File ini harus dieksekusi statement-per-statement:
--   mysql -u root -p < database/schema.sql          (CLI, aman)
--   phpMyAdmin / DBeaver                             (aman)
--   mysql2 (Node)                                    (butuh multipleStatements: true)
--
-- `DO 0` dipakai sebagai no-op: valid, preparable, dan tidak menghasilkan result set.

-- products.daerah
SET @has_daerah := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'daerah');
SET @sql := IF(@has_daerah = 0,
  'ALTER TABLE products ADD COLUMN daerah VARCHAR(100) NOT NULL DEFAULT '''' AFTER stock',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- products.gender
SET @has_gender := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'gender');
SET @sql := IF(@has_gender = 0,
  'ALTER TABLE products ADD COLUMN gender ENUM(''Pria'',''Wanita'',''Unisex'') NOT NULL DEFAULT ''Unisex'' AFTER daerah',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- products.lengan
SET @has_lengan := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'lengan');
SET @sql := IF(@has_lengan = 0,
  'ALTER TABLE products ADD COLUMN lengan ENUM(''Panjang'',''Pendek'') NOT NULL DEFAULT ''Pendek'' AFTER gender',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index untuk filter katalog GET /api/products?daerah=&lengan=
-- (gender sengaja tanpa index: kardinalitasnya hanya 3 nilai)
SET @has_idx_daerah := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_daerah');
SET @sql := IF(@has_idx_daerah = 0,
  'ALTER TABLE products ADD INDEX idx_products_daerah (daerah)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_idx_lengan := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_lengan');
SET @sql := IF(@has_idx_lengan = 0,
  'ALTER TABLE products ADD INDEX idx_products_lengan (lengan)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Unique key agar seed.sql idempotent (ON DUPLICATE KEY UPDATE).
-- Hanya ditambahkan bila belum ada duplikat (title, daerah); kalau ada,
-- migrasi dilewati dan menampilkan pesan untuk dedupe manual.
SET @has_uq_seed := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'uq_products_title_daerah');
SET @dupe_seed := (SELECT COUNT(*) FROM (
  SELECT title, daerah FROM products GROUP BY title, daerah HAVING COUNT(*) > 1
) AS dup);
SET @sql := IF(@has_uq_seed = 0 AND @dupe_seed = 0,
  'ALTER TABLE products ADD UNIQUE KEY uq_products_title_daerah (title, daerah)',
  IF(@has_uq_seed = 0,
    'SELECT ''SKIP unique key: ada duplikat (title, daerah) di products — rapikan manual lalu jalankan ulang.'' AS migrasi_info',
    'DO 0'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- order_items.product_id: nullable + FK ON DELETE SET NULL
-- (skema lama memakai NOT NULL + ON DELETE CASCADE sehingga hapus produk gagal)
SET @fk_name := (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items'
    AND COLUMN_NAME = 'product_id' AND REFERENCED_TABLE_NAME = 'products' LIMIT 1);
SET @fk_rule := (SELECT DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items'
    AND CONSTRAINT_NAME = @fk_name);
SET @sql := IF(@fk_name IS NOT NULL AND @fk_rule <> 'SET NULL',
  CONCAT('ALTER TABLE order_items DROP FOREIGN KEY `', @fk_name, '`'),
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @oi_nullable := (SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'product_id');
SET @sql := IF(@oi_nullable = 'NO',
  'ALTER TABLE order_items MODIFY COLUMN product_id INT NULL',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_fk_product := (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items'
    AND COLUMN_NAME = 'product_id' AND REFERENCED_TABLE_NAME = 'products');
SET @sql := IF(@has_fk_product = 0,
  'ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
