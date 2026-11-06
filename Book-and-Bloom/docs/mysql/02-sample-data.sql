-- Public fictional sample data only. Run once AFTER 01-create-database.sql.

-- Existing website data/accounts/orders are not imported by this script.

-- Hash format matches Java Passwords.java, but the app is NOT connected yet.

USE book_bloom;

SET time_zone = '+00:00';

START TRANSACTION;

INSERT INTO users (user_id, user_role, name, email, password_hash, address) VALUES
  ('USR-ADMIN', 'ADMIN', 'Store Administrator', 'admin@bookbloom.lk', '210000:5MwQYtNqRSEB5swc3uELvQ==:U2FLMc8uu5f6BdqivdZj1hFk3YiNo7+0tgI1E+ZUoXc=', ''),
  ('USR-DEMO', 'CUSTOMER', 'Nethmi Perera', 'reader@bookbloom.lk', '210000:vJ9M77LwMBHAGkRH/abtow==:rI8MnXNyKvUUzwku+0Hd2czb1jTZhjTBgoDU/AkyrGE=', '24 Flower Road, Colombo 07');

INSERT INTO authors (author_id, name, bio) VALUES
  ('AUT-1', 'Maya Senanayake', 'A Colombo-based storyteller exploring belonging, family and the everyday magic of island life.'),
  ('AUT-2', 'Elliot Reed', 'An essayist writing about attention, creativity and a gentler approach to meaningful work.'),
  ('AUT-3', 'Arun Fernando', 'A naturalist and writer documenting the landscapes and quiet corners of Sri Lanka.'),
  ('AUT-4', 'Clara Bennett', 'A novelist fascinated by old houses, hidden histories and unexpected friendships.'),
  ('AUT-5', 'Samira Khan', 'A designer and educator who makes technology and creative practice approachable.'),
  ('AUT-6', 'Oliver Hayes', 'A travel writer following slow journeys, good food and the stories between destinations.');

INSERT INTO categories (category_id, name, description) VALUES
  ('CAT-1', 'Fiction', 'Lose yourself in a different world.'),
  ('CAT-2', 'Personal Growth', 'Small steps. Fresh perspectives.'),
  ('CAT-3', 'Nature & Travel', 'Stories for the curious explorer.'),
  ('CAT-4', 'Design & Technology', 'Ideas to make something wonderful.');

INSERT INTO books (book_id, book_type, title, author_id, category_id, isbn, price, stock, description, cover_color, featured, pages, file_format) VALUES
  ('BK-001', 'PRINTED', 'The Art of Slowing Down', 'AUT-2', 'CAT-2', '978-955-100-001', '1850.00', 12, 'A thoughtful companion for finding room to breathe. Through small rituals and considered reflections, discover how a slower pace can make life feel richer.', '#e7b471', 1, 224, NULL),
  ('BK-002', 'PRINTED', 'Where the Light Falls', 'AUT-1', 'CAT-1', '978-955-100-002', '2400.00', 15, 'When a letter arrives at an old Colombo house, three generations revisit a story they thought was finished. A warm novel of home, memory and second chances.', '#2e514e', 1, 312, NULL),
  ('BK-003', 'PRINTED', 'Wild Ceylon', 'AUT-3', 'CAT-3', '978-955-100-003', '3200.00', 18, 'From misty highlands to sunlit coastlines, explore the island through the eyes of a naturalist. An illustrated journey into remarkable places and the life they hold.', '#9fa878', 1, 280, NULL),
  ('BK-004', 'PRINTED', 'A Little More Wonder', 'AUT-4', 'CAT-1', '978-955-100-004', '1950.00', 21, 'A bookseller inherits a box of unfinished letters and begins a journey across her city. A charming story about curiosity, kindness and finding your people.', '#b77966', 1, 256, NULL),
  ('BK-005', 'EBOOK', 'Make Room for Ideas', 'AUT-5', 'CAT-4', '978-955-100-005', '1650.00', 24, 'A practical guide to creative work, from the first untidy thought to the finished thing. Friendly exercises help you build a sustainable creative practice.', '#587e98', 0, NULL, 'EPUB'),
  ('BK-006', 'PRINTED', 'The Long Way Home', 'AUT-6', 'CAT-3', '978-955-100-006', '2750.00', 27, 'Choose the scenic route. Follow unhurried train rides and winding coastal roads in this collection of travel essays about the joy of paying attention.', '#ba934e', 0, 296, NULL),
  ('BK-007', 'PRINTED', 'The Quiet Garden', 'AUT-4', 'CAT-1', '978-955-100-007', '2100.00', 30, 'Behind a locked gate, a forgotten garden brings unlikely neighbours together. A gentle novel about new beginnings and the things we choose to grow.', '#8c9b7a', 0, 304, NULL),
  ('BK-008', 'EBOOK', 'Everyday Courage', 'AUT-2', 'CAT-2', '978-955-100-008', '1450.00', 33, 'Courage is often a collection of small choices. These grounded reflections invite you to begin before you feel ready and make space for a more intentional life.', '#c88870', 0, NULL, 'EPUB'),
  ('BK-009', 'PRINTED', 'Designing with Purpose', 'AUT-5', 'CAT-4', '978-955-100-009', '3600.00', 36, 'A clear introduction to thoughtful design. Learn to ask better questions, understand people and turn complex problems into useful, approachable experiences.', '#363f56', 0, 340, NULL),
  ('BK-010', 'PRINTED', 'Letters from Galle', 'AUT-1', 'CAT-1', '978-955-100-010', '2250.00', 39, 'Two strangers exchange letters from opposite sides of an old fort. A lyrical story of friendship, discovery and the places that stay with us.', '#d6aa72', 0, 288, NULL),
  ('BK-011', 'PRINTED', 'Beyond the Tea Hills', 'AUT-3', 'CAT-3', '978-955-100-011', '2900.00', 42, 'Walk the paths beyond the familiar viewpoints and meet the people who call the hills home. Nature writing and travel notes come together in this island journey.', '#608c82', 0, 268, NULL),
  ('BK-012', 'PRINTED', 'Begin Again', 'AUT-2', 'CAT-2', '978-955-100-012', '1750.00', 45, 'A fresh start can be smaller than you think. Thoughtful prompts and short essays help you reconnect with what matters and build habits that leave room for living.', '#a59bb3', 0, 208, NULL);

COMMIT;

SELECT COUNT(*) AS sample_book_count FROM books;
