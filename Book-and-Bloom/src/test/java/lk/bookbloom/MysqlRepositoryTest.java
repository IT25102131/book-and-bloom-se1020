package lk.bookbloom;

import com.fasterxml.jackson.databind.*;
import lk.bookbloom.model.*;
import lk.bookbloom.model.Order;
import lk.bookbloom.repository.MysqlStoreRepository;
import lk.bookbloom.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

/** Runs only against a dedicated, explicitly supplied MySQL test schema. */
@EnabledIfEnvironmentVariable(named="BOOKBLOOM_MYSQL_TEST_URL", matches=".+")
class MysqlRepositoryTest {
    @TempDir Path directory;
    final ObjectMapper mapper = new ObjectMapper();
    MysqlStoreRepository repo;
    UserService users; BookService books; AuthorService authors;
    CategoryService categories; OrderService orders; ReviewService reviews;

    MysqlStoreRepository repository(String importFile) throws Exception {
        String url = System.getenv("BOOKBLOOM_MYSQL_TEST_URL");
        if (!url.matches("jdbc:mysql://127\\.0\\.0\\.1:3306/book_bloom_test_[0-9]+(?:\\?.*)?"))
            throw new IllegalStateException("Integration tests require a separate book_bloom_test_<digits> schema.");
        return new MysqlStoreRepository(mapper, url, System.getenv("BOOKBLOOM_MYSQL_TEST_USER"),
                System.getenv("BOOKBLOOM_MYSQL_TEST_PASSWORD"), importFile);
    }

    @BeforeEach void setup() throws Exception {
        repo = repository("");
        repo.transaction(s -> {
            s.getReviews().clear(); s.getOrders().clear(); s.getBooks().clear();
            s.getAuthors().clear(); s.getCategories().clear(); s.getUsers().clear(); return null;
        });
        new DemoData(repo,mapper).run();
        users = new UserService(repo); books = new BookService(repo); authors = new AuthorService(repo);
        categories = new CategoryService(repo); orders = new OrderService(repo); reviews = new ReviewService(repo);
    }
    JsonNode json(String text) throws Exception { return mapper.readTree(text); }
    JsonNode order(int quantity) throws Exception {
        return json("{\"items\":[{\"bookId\":\"BK-001\",\"quantity\":" + quantity + "}],\"address\":\"24 Flower Road, Colombo\"}");
    }

    @Test void allSixModulesPersistAcrossRepositoryInstances() throws Exception {
        Map<String,Object> profile = users.register(json("{\"name\":\"SQL Reader\",\"email\":\"sql.reader@example.com\",\"password\":\"SqlReader!2026\"}"));
        String user = (String)profile.get("id");
        users.update(user,user,json("{\"name\":\"Updated SQL Reader\",\"email\":\"sql.reader@example.com\",\"address\":\"Colombo\"}"));
        Author author = authors.save("USR-ADMIN",null,json("{\"name\":\"SQL Author\",\"bio\":\"A biography for the SQL author.\"}"));
        authors.save("USR-ADMIN",author.getId(),json("{\"name\":\"SQL Author Updated\",\"bio\":\"An updated biography for SQL testing.\"}"));
        Category category = categories.save("USR-ADMIN",null,json("{\"name\":\"SQL Collection\",\"description\":\"A collection for SQL testing.\"}"));
        categories.save("USR-ADMIN",category.getId(),json("{\"name\":\"SQL Collection Updated\",\"description\":\"An updated SQL collection.\"}"));
        var body = mapper.valueToTree(books.get("BK-001"));
        var bookJson = (com.fasterxml.jackson.databind.node.ObjectNode)body;
        bookJson.put("isbn","SQL-TEST-BOOK"); bookJson.put("authorId",author.getId()); bookJson.put("categoryId",category.getId());
        Book book = books.save("USR-ADMIN",null,body);
        bookJson.put("title","Updated SQL Book"); books.save("USR-ADMIN",book.getId(),body);
        Review review = reviews.save(user,null,json("{\"bookId\":\"" + book.getId() + "\",\"rating\":5,\"comment\":\"A review stored in SQL.\"}"));
        reviews.save(user,review.getId(),json("{\"rating\":4,\"comment\":\"An updated SQL review.\"}"));
        Order order = orders.create(user,order(2));
        assertEquals(new BigDecimal("4050.00"),order.getTotal());
        assertEquals(10,new BookService(repository("")).get("BK-001").getStock());
        assertEquals("Updated SQL Reader",new UserService(repository("")).profile(user).get("name"));
        assertEquals("Updated SQL Book",new BookService(repository("")).get(book.getId()).getTitle());
        assertEquals(4,new ReviewService(repository("")).list().get(0).get("rating"));
        orders.update(user,order.getId(),json("{\"status\":\"CANCELLED\"}"));
        assertEquals(12,books.get("BK-001").getStock()); orders.delete(user,order.getId());
        reviews.delete(user,review.getId()); books.delete("USR-ADMIN",book.getId());
        authors.delete("USR-ADMIN",author.getId()); categories.delete("USR-ADMIN",category.getId()); users.delete(user,user);
        StoreState finalState = repository("").snapshot();
        assertEquals(12,finalState.getBooks().size()); assertEquals(2,finalState.getUsers().size());
        assertEquals(6,finalState.getAuthors().size()); assertEquals(4,finalState.getCategories().size());
        assertTrue(finalState.getOrders().isEmpty()); assertTrue(finalState.getReviews().isEmpty());
    }

    @Test void sqlConstraintFailureRollsBackEarlierStockWrites() {
        assertThrows(IllegalStateException.class,() -> repo.transaction(s -> {
            s.getBooks().get(0).setStock(1);
            Review r = new Review(); r.setId("REV-INVALID"); r.setUserId("USR-DEMO"); r.setBookId("BK-001");
            r.setRating(6); r.setComment("Invalid rating for rollback verification."); r.setCreatedAt(java.time.Instant.now().toString());
            s.getReviews().add(r); return null;
        }));
        assertEquals(12,books.get("BK-001").getStock()); assertTrue(repo.snapshot().getReviews().isEmpty());
    }

    @Test void uniqueEmailCannotOverwriteAnotherUser() {
        assertThrows(IllegalStateException.class,() -> repo.transaction(s -> {
            Customer copy = new Customer(); copy.setId("USR-CONFLICT"); copy.setName("Conflict Reader");
            copy.setEmail("reader@bookbloom.lk"); copy.setAddress(""); copy.setPasswordHash("invalid");
            copy.setCreatedAt(java.time.Instant.now().toString()); s.getUsers().add(copy); return null;
        }));
        assertEquals(2,repo.snapshot().getUsers().size());
        assertEquals("Nethmi Perera",users.profile("USR-DEMO").get("name"));
    }

    @Test void separateRepositoriesCannotOversell() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2); JsonNode body = order(10);
        OrderService other = new OrderService(repository(""));
        try {
            List<Future<Boolean>> results = pool.invokeAll(List.of(
                () -> { try { orders.create("USR-DEMO",body); return true; } catch (BusinessException e) { return false; } },
                () -> { try { other.create("USR-DEMO",body); return true; } catch (BusinessException e) { return false; } }
            ));
            int successes = 0; for (Future<Boolean> result : results) if (result.get()) successes++;
            assertEquals(1,successes); assertEquals(2,books.get("BK-001").getStock());
        } finally { pool.shutdownNow(); }
    }

    @Test void completedOrderRetainsHistoricalBookSnapshot() throws Exception {
        Order o = orders.create("USR-DEMO",order(1));
        assertThrows(BusinessException.class,() -> books.delete("USR-ADMIN","BK-001"));
        orders.update("USR-ADMIN",o.getId(),json("{\"status\":\"PROCESSING\"}"));
        orders.update("USR-ADMIN",o.getId(),json("{\"status\":\"COMPLETED\"}"));
        books.delete("USR-ADMIN","BK-001");
        Order stored = new OrderService(repository("")).list("USR-DEMO").get(0);
        assertEquals("COMPLETED",stored.getStatus()); assertEquals("BK-001",stored.getLines().get(0).getBookId());
        assertEquals("The Art of Slowing Down",stored.getLines().get(0).getTitle());
    }

    @Test void importRunsOnceAndPreservesPasswordHashesAndOrders() throws Exception {
        orders.create("USR-DEMO",order(1)); StoreState source = repo.snapshot();
        Path file = directory.resolve("legacy.txt"); mapper.writeValue(file.toFile(),source);
        repo.transaction(s -> { s.getReviews().clear(); s.getOrders().clear(); s.getBooks().clear();
            s.getAuthors().clear(); s.getCategories().clear(); s.getUsers().clear(); return null; });
        MysqlStoreRepository migrated = repository(file.toString());
        assertEquals(1,migrated.snapshot().getOrders().size()); assertEquals(11,new BookService(migrated).get("BK-001").getStock());
        new UserService(migrated).authenticate(json("{\"email\":\"reader@bookbloom.lk\",\"password\":\"BloomReader!2026\"}"));
        migrated.transaction(s -> { s.getBooks().get(0).setTitle("Updated after import"); return null; });
        Files.delete(file); // Restart must use the DB, not require a legacy file.
        assertEquals("Updated after import",repository(file.toString()).snapshot().getBooks().get(0).getTitle());
    }

    @Test void ebookTypeAndCatalogOrderSurviveUpdates() throws Exception {
        assertInstanceOf(EBook.class,books.get("BK-005"));
        List<String> before = books.list().stream().map(Book::getId).toList();
        repo.transaction(s -> { s.getBooks().get(0).setTitle("A changed title"); return null; });
        assertEquals(before,new BookService(repository("")).list().stream().map(Book::getId).toList());
    }
}
