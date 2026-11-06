# MySQL connection — verified 14 October 2026

The website now supports real relational MySQL storage through `MysqlStoreRepository`. The existing services, JSP pages and servlet still implement the same six modules. `StoreRepository` selects file or MySQL persistence via `bookbloom.storage`.

## This computer

- Server: MySQL 8.0.46, `127.0.0.1:3306`.
- Database: `book_bloom`.
- Tables: `users`, `authors`, `categories`, `books`, `orders`, `order_lines`, `reviews`.
- The current IntelliJ copy's data was imported: 2 users, 12 books, 6 authors, 4 categories, 1 order and 1 order line. Existing hashes, IDs, stock and historical order prices were preserved.
- Credentials are stored in ignored `.local/application-local.properties`, not in the source, SQL scripts, shared ZIP or run-configuration XML.
- The original file data and a private migration backup remain available. The database is not reimported/overwritten on restart.

## IntelliJ

1. If IntelliJ displays **Load Maven Changes**, click it. Alternatively, open its Maven panel and click **Reload All Maven Projects**. This imports the MySQL Connector/J runtime dependency.
2. Select **Book and Bloom - Website (Correct Folder)** in the currently opened Desktop project.
3. Stop any older localhost instance, then Run.
4. The console must include **MySQL repository enabled; website data is stored in relational tables.** The browser opens automatically after startup.

## Workbench

Open the local connection, refresh **Schemas**, expand **book_bloom > Tables**. Run:

```sql
USE book_bloom;
SHOW TABLES;
SELECT user_id, name, email, user_role FROM users;
SELECT book_id, title, price, stock FROM books ORDER BY catalog_position;
SELECT order_id, user_id, status, total FROM orders;
```

For a practical demonstration, add an unused category through the website's admin page, query it in Workbench, edit it in the website, query again, then delete only that demo category. Workbench result grids do not refresh automatically; execute the SELECT again.

Do not rerun the create/seed scripts over this already configured database. Scripts 01 and 02 remain available for a new member's installation.

## Another laptop / shared source

The ZIP excludes credentials and runtime data. On another laptop:

1. Create the schema with `01-create-database.sql`.
2. Copy `application-local.properties.example` to `.local/application-local.properties` in the project root. Fill in that laptop's local connection details.
3. Set `bookbloom.storage=mysql`, import Maven changes, then run.
4. With no import file and entirely empty new tables, the normal demo-data initializer creates the fictional sample catalog/accounts. Alternatively, run the sample-data script once before starting.

Without a local configuration, shared source defaults to file mode. MySQL mode fails clearly if connection settings are unavailable; it does not silently save to a file.

## Verification

- 18 existing file repository/service tests passed.
- 7 live MySQL integration tests passed against an isolated temporary schema.
- 32 HTTP checks passed in MySQL mode: all 9 JSP pages, API type tags, login, sessions, CSRF, permissions, six-module CRUD, server totals, stock, cancellation and actual JVM restart persistence.
- The same 32 HTTP checks passed in file mode.
- MySQL tests cover rollback after a SQL constraint violation, unique-email collision without overwriting another user, two separate repository instances preventing overselling, preservation of completed-order history after catalog deletion, book subtypes and one-time data migration.

Transactions read a detached state under MySQL row locks and a database-scoped named lock, then write only changed rows with prepared statements and commit. Validation/SQL failures roll back stock and order changes together. This preserves the existing service interface for this small academic application; loading a whole store per operation is not a design for a large production catalog.

Older presentation/PDF exports describe the earlier file-only progress stage. This document records the current database implementation.
