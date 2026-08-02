CREATE DATABASE IF NOT EXISTS stockflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE stockflow;

-- ------------------------------------------------------------
-- Users (Phase 1 - authentication)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Idempotent migration: profile columns for users (Phase 3)
SET @user_phone_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'stockflow' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'
);
SET @user_phone_ddl := IF(
  @user_phone_exists = 0,
  'ALTER TABLE users
     ADD COLUMN phone VARCHAR(50) NULL AFTER password,
     ADD COLUMN location VARCHAR(255) NULL AFTER phone,
     ADD COLUMN bio TEXT NULL AFTER location,
     ADD COLUMN avatar VARCHAR(500) NULL AFTER bio',
  'SELECT 1'
);
PREPARE user_phone_stmt FROM @user_phone_ddl;
EXECUTE user_phone_stmt;
DEALLOCATE PREPARE user_phone_stmt;

-- ------------------------------------------------------------
-- User Settings (Phase 3 - preferences)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INT UNSIGNED PRIMARY KEY,
  low_stock_alerts TINYINT(1) NOT NULL DEFAULT 1,
  weekly_digest TINYINT(1) NOT NULL DEFAULT 1,
  order_updates TINYINT(1) NOT NULL DEFAULT 0,
  language VARCHAR(20) NOT NULL DEFAULT 'en',
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Categories (Phase 2 - inventory)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Suppliers (Phase 2 - inventory)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100) NULL,
  email VARCHAR(255) NULL UNIQUE,
  phone VARCHAR(50) NULL,
  address VARCHAR(500) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Products (Phase 2 - inventory)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  category_id INT UNSIGNED NULL,
  supplier_id INT UNSIGNED NULL,
  purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 10,
  description TEXT NULL,
  status ENUM('in-stock', 'low-stock', 'out-of-stock') NOT NULL DEFAULT 'in-stock',
  image VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_products_status (status),
  KEY idx_products_category (category_id),
  KEY idx_products_supplier (supplier_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Inventory Logs (Phase 2 - stock movements)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  type ENUM('stock-in', 'stock-out') NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  party VARCHAR(150) NULL,
  reference_number VARCHAR(100) NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_logs_product (product_id),
  KEY idx_logs_type (type),
  CONSTRAINT fk_logs_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Idempotent migration for databases created before the party column existed
SET @inventory_party_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'stockflow' AND TABLE_NAME = 'inventory_logs' AND COLUMN_NAME = 'party'
);
SET @inventory_party_ddl := IF(
  @inventory_party_exists = 0,
  'ALTER TABLE inventory_logs ADD COLUMN party VARCHAR(150) NULL AFTER quantity',
  'SELECT 1'
);
PREPARE inventory_party_stmt FROM @inventory_party_ddl;
EXECUTE inventory_party_stmt;
DEALLOCATE PREPARE inventory_party_stmt;

-- ------------------------------------------------------------
-- Contact Messages (Phase 3 - landing page)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
