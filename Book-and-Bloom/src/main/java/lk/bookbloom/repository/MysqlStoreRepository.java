package lk.bookbloom.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.bookbloom.model.*;
import lk.bookbloom.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.*;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;

/** Relational persistence behind the same service abstraction as file storage. */
@Repository
@ConditionalOnProperty(name="bookbloom.storage", havingValue="mysql")
public class MysqlStoreRepository implements StoreRepository {
    private static final Logger log = LoggerFactory.getLogger(MysqlStoreRepository.class);
    private final ObjectMapper mapper;
    private final String url;
    private final Properties credentials = new Properties();

    public MysqlStoreRepository(ObjectMapper mapper,
            @Value("${bookbloom.mysql.url}") String url,
            @Value("${bookbloom.mysql.username}") String username,
            @Value("${bookbloom.mysql.password}") String password,
            @Value("${bookbloom.mysql.import-file:}") String importFile) throws IOException {
        this.mapper = mapper;
        this.url = url;
        credentials.setProperty("user", username);
        credentials.setProperty("password", password);
        credentials.setProperty("connectionTimeZone", "UTC");
        credentials.setProperty("forceConnectionTimeZoneToSession", "true");
        credentials.setProperty("connectTimeout", "5000");
        credentials.setProperty("socketTimeout", "30000");
        // A one-time import preserves passwords, IDs, stock and order history.
        // A nonempty database is never replaced from a file on restart.
        if (!importFile.isBlank()) {
            Path path = Path.of(importFile);
            boolean imported = transaction(state -> {
                if (!empty(state)) return false;
                StoreState source;
                try {
                    if (!Files.isRegularFile(path)) throw new IOException("MySQL import file was not found: " + path);
                    source = mapper.readValue(path.toFile(), StoreState.class);
                } catch (IOException e) { throw new UncheckedIOException(e); }
                if (source.getSchemaVersion() != 1) throw new IllegalStateException("Unsupported import schema; database was not modified.");
                state.setUsers(source.getUsers()); state.setAuthors(source.getAuthors());
                state.setCategories(source.getCategories()); state.setBooks(source.getBooks());
                state.setOrders(source.getOrders()); state.setReviews(source.getReviews());
                return true;
            });
            log.info(imported ? "Existing file data imported into MySQL." : "MySQL already contains data; import skipped.");
        }
        log.info("MySQL repository enabled; website data is stored in relational tables.");
    }

    private static boolean empty(StoreState s) {
        return s.getUsers().isEmpty() && s.getBooks().isEmpty() && s.getAuthors().isEmpty()
                && s.getCategories().isEmpty() && s.getOrders().isEmpty() && s.getReviews().isEmpty();
    }

    private Connection connection() throws SQLException {
        Connection c = DriverManager.getConnection(url, credentials);
        c.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
        c.setAutoCommit(false);
        return c;
    }

    @Override public StoreState snapshot() {
        try (Connection c = connection()) {
            StoreState state = load(c, false);
            c.commit();
            return state;
        } catch (SQLException e) {
            throw new IllegalStateException("Could not read MySQL data. Check the database connection.", e);
        }
    }

    @Override public <T> T transaction(Function<StoreState,T> action) {
        try (Connection c = connection()) {
            String lock = "bookbloom:" + c.getCatalog();
            boolean acquired = false;
            try {
                try (PreparedStatement p = c.prepareStatement("SELECT GET_LOCK(?, 15)")) {
                    p.setString(1, lock);
                    try (ResultSet r = p.executeQuery()) {
                        acquired = r.next() && r.getInt(1) == 1;
                    }
                }
                if (!acquired) throw new SQLException("The database is busy. Try again.");
                // Shared across repository objects/JVMs, plus row locks against
                // concurrent SQL edits. Stock and orders commit together.
                StoreState before = load(c, true);
                StoreState candidate = mapper.convertValue(before, StoreState.class);
                T result = action.apply(candidate);
                persist(c, before, candidate);
                c.commit();
                return result;
            } catch (SQLException | RuntimeException e) {
                try { c.rollback(); } catch (SQLException rollback) { e.addSuppressed(rollback); }
                throw e;
            } finally {
                if (acquired) try (PreparedStatement p = c.prepareStatement("SELECT RELEASE_LOCK(?)")) {
                    p.setString(1, lock); p.executeQuery().close();
                } catch (SQLException e) { log.warn("MySQL lock release failed; closing the connection releases it."); }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Could not save MySQL changes. The transaction was rolled back.", e);
        }
    }

    @FunctionalInterface private interface Reader { void read(ResultSet r) throws SQLException; }
    private void read(Connection c, String query, boolean lock, Reader reader) throws SQLException {
        try (Statement p = c.createStatement(); ResultSet r = p.executeQuery(query + (lock ? " FOR UPDATE" : ""))) {
            while (r.next()) reader.read(r);
        }
    }

    private StoreState load(Connection c, boolean lock) throws SQLException {
        StoreState s = new StoreState();
        read(c, "SELECT * FROM users ORDER BY user_id", lock, r -> {
            User u = "ADMIN".equals(r.getString("user_role")) ? new AdminUser() : new Customer();
            u.setId(r.getString("user_id")); u.setName(r.getString("name")); u.setEmail(r.getString("email"));
            u.setPasswordHash(r.getString("password_hash")); u.setAddress(r.getString("address"));
            u.setCreatedAt(time(r, "created_at")); s.getUsers().add(u);
        });
        try (Statement st = c.createStatement()) {
            try { st.execute("ALTER TABLE authors ADD COLUMN nationality VARCHAR(80) DEFAULT ''"); } catch (SQLException ignored) {}
            try { st.execute("ALTER TABLE authors ADD COLUMN primary_genre VARCHAR(100) DEFAULT ''"); } catch (SQLException ignored) {}
            try { st.execute("ALTER TABLE authors ADD COLUMN accolades VARCHAR(250) DEFAULT ''"); } catch (SQLException ignored) {}
            try { st.execute("ALTER TABLE authors ADD COLUMN born_year VARCHAR(30) DEFAULT ''"); } catch (SQLException ignored) {}
            try { st.execute("ALTER TABLE authors ADD COLUMN photo_url VARCHAR(500) DEFAULT ''"); } catch (SQLException ignored) {}
        } catch (SQLException ignored) {}
        read(c, "SELECT * FROM authors ORDER BY author_id", lock, r -> {
            Author a = new Author(); a.setId(r.getString("author_id")); a.setName(r.getString("name"));
            a.setBio(r.getString("bio"));
            try { a.setNationality(r.getString("nationality")); } catch (SQLException ignored) {}
            try { a.setPrimaryGenre(r.getString("primary_genre")); } catch (SQLException ignored) {}
            try { a.setAccolades(r.getString("accolades")); } catch (SQLException ignored) {}
            try { a.setBornYear(r.getString("born_year")); } catch (SQLException ignored) {}
            try { a.setPhotoUrl(r.getString("photo_url")); } catch (SQLException ignored) {}
            s.getAuthors().add(a);
        });
        read(c, "SELECT * FROM categories ORDER BY category_id", lock, r -> {
            Category a = new Category(); a.setId(r.getString("category_id")); a.setName(r.getString("name"));
            a.setDescription(r.getString("description")); s.getCategories().add(a);
        });
        read(c, "SELECT * FROM books ORDER BY catalog_position", lock, r -> {
            Book b;
            if ("PRINTED".equals(r.getString("book_type"))) {
                PrintedBook printed = new PrintedBook(); printed.setPages(r.getInt("pages")); b = printed;
            } else { EBook ebook = new EBook(); ebook.setFileFormat(r.getString("file_format")); b = ebook; }
            b.setId(r.getString("book_id")); b.setTitle(r.getString("title"));
            b.setAuthorId(r.getString("author_id")); b.setCategoryId(r.getString("category_id"));
            b.setIsbn(r.getString("isbn")); b.setPrice(r.getBigDecimal("price")); b.setStock(r.getInt("stock"));
            b.setDescription(r.getString("description")); b.setCoverColor(r.getString("cover_color"));
            b.setFeatured(r.getBoolean("featured")); s.getBooks().add(b);
        });
        Map<String,Order> orders = new LinkedHashMap<>();
        read(c, "SELECT * FROM orders ORDER BY created_at, order_id", lock, r -> {
            Order o = new Order(); o.setId(r.getString("order_id")); o.setUserId(r.getString("user_id"));
            o.setSubtotal(r.getBigDecimal("subtotal")); o.setDeliveryFee(r.getBigDecimal("delivery_fee"));
            o.setTotal(r.getBigDecimal("total")); o.setStatus(r.getString("status"));
            o.setAddress(r.getString("address")); o.setCreatedAt(time(r, "created_at"));
            s.getOrders().add(o); orders.put(o.getId(), o);
        });
        read(c, "SELECT * FROM order_lines ORDER BY order_id, line_number", lock, r -> {
            OrderLine line = new OrderLine(); line.setBookId(r.getString("book_id")); line.setTitle(r.getString("title"));
            line.setUnitPrice(r.getBigDecimal("unit_price")); line.setQuantity(r.getInt("quantity"));
            line.setShipping(r.getBoolean("shipping")); orders.get(r.getString("order_id")).getLines().add(line);
        });
        read(c, "SELECT * FROM reviews ORDER BY created_at, review_id", lock, r -> {
            Review a = new Review(); a.setId(r.getString("review_id")); a.setUserId(r.getString("user_id"));
            a.setBookId(r.getString("book_id")); a.setRating(r.getInt("rating")); a.setComment(r.getString("comment"));
            a.setCreatedAt(time(r, "created_at")); s.getReviews().add(a);
        });
        return s;
    }

    private static Calendar utc() { return Calendar.getInstance(TimeZone.getTimeZone("UTC")); }
    private static String time(ResultSet r, String column) throws SQLException {
        return r.getTimestamp(column, utc()).toInstant().toString();
    }
    private static Timestamp timestamp(String value) { return Timestamp.from(Instant.parse(value)); }

    private void execute(Connection c, String sql, Object... values) throws SQLException {
        try (PreparedStatement p = c.prepareStatement(sql)) {
            for (int i = 0; i < values.length; i++) {
                if (values[i] instanceof Timestamp t) p.setTimestamp(i + 1, t, utc());
                else p.setObject(i + 1, values[i]);
            }
            p.executeUpdate();
        }
    }
    private void upsert(Connection c, String table, String columns, Object... values) throws SQLException {
        String[] fields = columns.split(",");
        boolean exists;
        try (PreparedStatement p = c.prepareStatement("SELECT 1 FROM " + table + " WHERE " + fields[0] + "=?")) {
            p.setObject(1, values[0]); try (ResultSet r = p.executeQuery()) { exists = r.next(); }
        }
        if (exists) {
            String updates = String.join(",", Arrays.stream(fields).skip(1).map(f -> f + "=?").toList());
            Object[] parameters = new Object[values.length];
            System.arraycopy(values, 1, parameters, 0, values.length - 1);
            parameters[parameters.length - 1] = values[0];
            execute(c, "UPDATE " + table + " SET " + updates + " WHERE " + fields[0] + "=?", parameters);
        } else {
            String placeholders = String.join(",", Collections.nCopies(fields.length, "?"));
            execute(c, "INSERT INTO " + table + " (" + columns + ") VALUES (" + placeholders + ")", values);
        }
    }

    private <E> List<E> changed(List<E> old, List<E> next, Function<E,String> id) {
        Map<String,E> previous = new HashMap<>(); old.forEach(e -> previous.put(id.apply(e), e));
        return next.stream().filter(e -> !mapper.valueToTree(e).equals(mapper.valueToTree(previous.get(id.apply(e))))).toList();
    }
    private <E> void removeMissing(Connection c, String table, String key, List<E> old, List<E> next, Function<E,String> id) throws SQLException {
        Set<String> keep = new HashSet<>(); next.forEach(e -> keep.add(id.apply(e)));
        for (E e : old) if (!keep.contains(id.apply(e))) execute(c, "DELETE FROM " + table + " WHERE " + key + "=?", id.apply(e));
    }

    private void persist(Connection c, StoreState old, StoreState s) throws SQLException {
        removeMissing(c, "reviews", "review_id", old.getReviews(), s.getReviews(), Review::getId);
        removeMissing(c, "orders", "order_id", old.getOrders(), s.getOrders(), Order::getId);
        removeMissing(c, "books", "book_id", old.getBooks(), s.getBooks(), Book::getId);
        for (User u : changed(old.getUsers(), s.getUsers(), User::getId))
            upsert(c, "users", "user_id,user_role,name,email,password_hash,address,created_at",
                    u.getId(), u.role(), u.getName(), u.getEmail(), u.getPasswordHash(), u.getAddress(), timestamp(u.getCreatedAt()));
        for (Author a : changed(old.getAuthors(), s.getAuthors(), Author::getId))
            upsert(c, "authors", "author_id,name,bio,nationality,primary_genre,accolades,born_year,photo_url",
                    a.getId(), a.getName(), a.getBio(),
                    a.getNationality() != null ? a.getNationality() : "",
                    a.getPrimaryGenre() != null ? a.getPrimaryGenre() : "",
                    a.getAccolades() != null ? a.getAccolades() : "",
                    a.getBornYear() != null ? a.getBornYear() : "",
                    a.getPhotoUrl() != null ? a.getPhotoUrl() : "");
        for (Category a : changed(old.getCategories(), s.getCategories(), Category::getId))
            upsert(c, "categories", "category_id,name,description", a.getId(), a.getName(), a.getDescription());
        for (Book b : changed(old.getBooks(), s.getBooks(), Book::getId))
            upsert(c, "books", "book_id,book_type,title,author_id,category_id,isbn,price,stock,description,cover_color,featured,pages,file_format",
                    b.getId(), b instanceof PrintedBook ? "PRINTED" : "EBOOK", b.getTitle(), b.getAuthorId(), b.getCategoryId(),
                    b.getIsbn(), b.getPrice(), b.getStock(), b.getDescription(), b.getCoverColor(), b.getFeatured(),
                    b instanceof PrintedBook p ? p.getPages() : null, b instanceof EBook e ? e.getFileFormat() : null);
        for (Order o : changed(old.getOrders(), s.getOrders(), Order::getId)) {
            upsert(c, "orders", "order_id,user_id,subtotal,delivery_fee,total,status,address,created_at",
                    o.getId(), o.getUserId(), o.getSubtotal(), o.getDeliveryFee(), o.getTotal(), o.getStatus(), o.getAddress(), timestamp(o.getCreatedAt()));
            execute(c, "DELETE FROM order_lines WHERE order_id=?", o.getId());
            for (int i = 0; i < o.getLines().size(); i++) {
                OrderLine l = o.getLines().get(i);
                execute(c, "INSERT INTO order_lines (order_id,line_number,book_id,title,unit_price,quantity,shipping) VALUES (?,?,?,?,?,?,?)",
                        o.getId(), i + 1, l.getBookId(), l.getTitle(), l.getUnitPrice(), l.getQuantity(), l.getShipping());
            }
        }
        for (Review a : changed(old.getReviews(), s.getReviews(), Review::getId))
            upsert(c, "reviews", "review_id,user_id,book_id,rating,comment,created_at",
                    a.getId(), a.getUserId(), a.getBookId(), a.getRating(), a.getComment(), timestamp(a.getCreatedAt()));
        removeMissing(c, "authors", "author_id", old.getAuthors(), s.getAuthors(), Author::getId);
        removeMissing(c, "categories", "category_id", old.getCategories(), s.getCategories(), Category::getId);
        removeMissing(c, "users", "user_id", old.getUsers(), s.getUsers(), User::getId);
    }
}
