-- Read-only verification after scripts 01 and 02 succeed.
USE book_bloom;
SELECT VERSION() AS mysql_version, DATABASE() AS current_database;
SHOW TABLES;
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'authors', COUNT(*) FROM authors
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'books', COUNT(*) FROM books
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_lines', COUNT(*) FROM order_lines
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews;

SELECT b.book_id, b.title, a.name AS author, c.name AS category,
       b.book_type, b.price, b.stock
FROM books b
JOIN authors a ON a.author_id = b.author_id
JOIN categories c ON c.category_id = b.category_id
ORDER BY b.catalog_position;

-- Do not show password hashes during a presentation.
SELECT user_id, name, email, user_role FROM users;
SELECT table_name, column_name, referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'book_bloom' AND referenced_table_name IS NOT NULL
ORDER BY table_name, column_name;
