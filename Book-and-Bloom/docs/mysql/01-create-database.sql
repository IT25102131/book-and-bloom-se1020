-- Book & Bloom: MySQL 8.4 LTS (also supports MySQL 8.0.16+).
-- Run ONCE on a NEW book_bloom schema in MySQL Workbench.
-- No DROP statements. If tables already exist, stop and inspect them.
-- Creating this schema does NOT connect the current text-file Java repository.
CREATE DATABASE IF NOT EXISTS book_bloom
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE book_bloom;
SET time_zone = '+00:00';

CREATE TABLE users (
  user_id VARCHAR(60) NOT NULL PRIMARY KEY,
  user_role VARCHAR(10) NOT NULL,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(350) NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT ck_users_role CHECK (user_role IN ('ADMIN', 'CUSTOMER'))
) ENGINE=InnoDB;

CREATE TABLE authors (
  author_id VARCHAR(60) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bio VARCHAR(1500) NOT NULL,
  nationality VARCHAR(80) NOT NULL DEFAULT '',
  primary_genre VARCHAR(100) NOT NULL DEFAULT '',
  accolades VARCHAR(250) NOT NULL DEFAULT '',
  born_year VARCHAR(30) NOT NULL DEFAULT '',
  photo_url VARCHAR(500) NOT NULL DEFAULT '',
  CONSTRAINT uq_authors_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE categories (
  category_id VARCHAR(60) NOT NULL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  description VARCHAR(300) NOT NULL,
  CONSTRAINT uq_categories_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE books (
  book_id VARCHAR(60) NOT NULL PRIMARY KEY,
  book_type VARCHAR(10) NOT NULL,
  title VARCHAR(140) NOT NULL,
  author_id VARCHAR(60) NOT NULL,
  category_id VARCHAR(60) NOT NULL,
  isbn VARCHAR(30) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  stock INT NOT NULL,
  description VARCHAR(2500) NOT NULL,
  cover_color CHAR(7) NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  pages INT NULL,
  file_format VARCHAR(4) NULL,
  catalog_position BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  CONSTRAINT uq_books_isbn UNIQUE (isbn),
  CONSTRAINT uq_books_catalog_position UNIQUE (catalog_position),
  CONSTRAINT fk_books_author FOREIGN KEY (author_id) REFERENCES authors(author_id),
  CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
  CONSTRAINT ck_books_price CHECK (price > 0 AND price <= 1000000),
  CONSTRAINT ck_books_stock CHECK (stock BETWEEN 0 AND 100000),
  CONSTRAINT ck_books_featured CHECK (featured IN (0,1)),
  CONSTRAINT ck_books_format CHECK (
    (book_type = 'PRINTED' AND pages IS NOT NULL AND pages BETWEEN 1 AND 10000 AND file_format IS NULL)
    OR (book_type = 'EBOOK' AND pages IS NULL AND file_format IS NOT NULL AND file_format IN ('PDF','EPUB'))
  )
) ENGINE=InnoDB;

CREATE TABLE orders (
  order_id VARCHAR(60) NOT NULL PRIMARY KEY,
  user_id VARCHAR(60) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  delivery_fee DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  status VARCHAR(12) NOT NULL,
  address VARCHAR(350) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT ck_orders_status CHECK (status IN ('PLACED','PROCESSING','COMPLETED','CANCELLED')),
  CONSTRAINT ck_orders_subtotal CHECK (subtotal >= 0),
  CONSTRAINT ck_orders_delivery_fee CHECK (delivery_fee >= 0),
  CONSTRAINT ck_orders_total CHECK (total = subtotal + delivery_fee)
) ENGINE=InnoDB;

CREATE TABLE order_lines (
  order_id VARCHAR(60) NOT NULL,
  line_number INT NOT NULL,
  book_id VARCHAR(60) NOT NULL,
  title VARCHAR(140) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL,
  shipping BOOLEAN NOT NULL,
  PRIMARY KEY (order_id, line_number),
  CONSTRAINT uq_order_lines_book UNIQUE (order_id, book_id),
  CONSTRAINT fk_order_lines_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT ck_order_lines_number CHECK (line_number > 0),
  CONSTRAINT ck_order_lines_price CHECK (unit_price > 0),
  CONSTRAINT ck_order_lines_quantity CHECK (quantity BETWEEN 1 AND 20),
  CONSTRAINT ck_order_lines_shipping CHECK (shipping IN (0,1))
  -- book_id is a historical reference, intentionally without a Books FK.
  -- Completed/cancelled order snapshots survive removal of catalog books.
  -- Java must still block deleting books in active orders.
) ENGINE=InnoDB;

CREATE TABLE reviews (
  review_id VARCHAR(60) NOT NULL PRIMARY KEY,
  user_id VARCHAR(60) NOT NULL,
  book_id VARCHAR(60) NOT NULL,
  rating INT NOT NULL,
  comment VARCHAR(1000) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_reviews_user_book UNIQUE (user_id, book_id),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

SHOW TABLES;
