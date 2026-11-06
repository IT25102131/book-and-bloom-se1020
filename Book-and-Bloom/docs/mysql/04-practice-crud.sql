-- Optional SQL practice: highlight and run ONE numbered block at a time.
-- Uses a dedicated demo category. Other records are not modified.
USE book_bloom;

-- 1. CREATE: run once. Repeating it produces a duplicate-ID error.
INSERT INTO categories (category_id, name, description)
VALUES ('CAT-SQL-DEMO', 'SQL Practice Collection', 'A temporary collection for demonstrating SQL CRUD.');

-- 2. READ
SELECT * FROM categories WHERE category_id = 'CAT-SQL-DEMO';

-- 3. UPDATE (WHERE uses the primary key and works with safe-update mode)
UPDATE categories
SET description = 'This description was updated using MySQL Workbench.'
WHERE category_id = 'CAT-SQL-DEMO';
SELECT * FROM categories WHERE category_id = 'CAT-SQL-DEMO';

-- 4. DELETE (only the practice row; do not link books to it)
DELETE FROM categories WHERE category_id = 'CAT-SQL-DEMO';
SELECT * FROM categories WHERE category_id = 'CAT-SQL-DEMO';
