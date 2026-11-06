package lk.bookbloom;

import com.fasterxml.jackson.databind.*;
import lk.bookbloom.model.*;
import lk.bookbloom.model.Order;
import lk.bookbloom.repository.*;
import lk.bookbloom.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

class BookstoreTest {
    @TempDir Path directory;
    ObjectMapper mapper=new ObjectMapper();
    FileStoreRepository repo;
    UserService users; BookService books; AuthorService authors; CategoryService categories; OrderService orders; ReviewService reviews;
    @BeforeEach void setup() throws Exception {
        repo=new FileStoreRepository(mapper,directory.toString()); new DemoData(repo,mapper).run();
        users=new UserService(repo); books=new BookService(repo); authors=new AuthorService(repo); categories=new CategoryService(repo); orders=new OrderService(repo); reviews=new ReviewService(repo);
    }
    @AfterEach void close() throws Exception { repo.close(); }
    JsonNode json(String text) throws Exception { return mapper.readTree(text); }
    JsonNode order(int quantity) throws Exception { return json("{\"items\":[{\"bookId\":\"BK-001\",\"quantity\":"+quantity+"}],\"address\":\"24 Flower Road, Colombo\"}"); }
    @Test void createOrderUsesServerPricesAndPersists() throws Exception {
        Order o=orders.create("USR-DEMO",order(2)); assertEquals(new BigDecimal("4050.00"),o.getTotal()); assertEquals(10,books.get("BK-001").getStock());
        repo.close(); repo=new FileStoreRepository(mapper,directory.toString()); assertEquals(1,repo.snapshot().getOrders().size()); assertEquals(10,repo.snapshot().getBooks().get(0).getStock());
    }
    @Test void insufficientStockRollsBackAllOrderLines() throws Exception {
        JsonNode body=json("{\"items\":[{\"bookId\":\"BK-001\",\"quantity\":1},{\"bookId\":\"BK-002\",\"quantity\":20}],\"address\":\"24 Flower Road, Colombo\"}");
        assertThrows(BusinessException.class,()->orders.create("USR-DEMO",body)); assertEquals(12,books.get("BK-001").getStock()); assertTrue(orders.list("USR-DEMO").isEmpty());
    }
    @Test void cancellationRestocksExactlyOnce() throws Exception {
        Order o=orders.create("USR-DEMO",order(2)); JsonNode cancel=json("{\"status\":\"CANCELLED\"}"); orders.update("USR-DEMO",o.getId(),cancel); assertEquals(12,books.get("BK-001").getStock());
        assertThrows(BusinessException.class,()->orders.update("USR-DEMO",o.getId(),cancel)); assertEquals(12,books.get("BK-001").getStock()); orders.delete("USR-DEMO",o.getId()); assertTrue(orders.list("USR-DEMO").isEmpty());
    }
    @Test void customersCannotCompleteOrdersOrReadOthers() throws Exception {
        Order o=orders.create("USR-ADMIN",order(1)); JsonNode next=json("{\"status\":\"PROCESSING\"}");
        assertTrue(orders.list("USR-DEMO").isEmpty()); assertThrows(BusinessException.class,()->orders.update("USR-DEMO",o.getId(),next));
        Order mine=orders.create("USR-DEMO",order(1)); assertThrows(BusinessException.class,()->orders.update("USR-DEMO",mine.getId(),next));
    }
    @Test void freeDeliveryAndDigitalPolymorphism() throws Exception {
        assertEquals(new BigDecimal("0.00"),orders.create("USR-DEMO",order(3)).getDeliveryFee());
        Order digital=orders.create("USR-DEMO",json("{\"items\":[{\"bookId\":\"BK-005\",\"quantity\":1}],\"address\":\"\"}"));
        assertEquals(new BigDecimal("0.00"),digital.getDeliveryFee()); assertInstanceOf(EBook.class,books.get("BK-005")); assertFalse(books.get("BK-005").requiresShipping()); assertTrue(books.get("BK-001").requiresShipping());
    }
    @Test void duplicateCartLinesAndFractionalQuantitiesAreRejected() throws Exception {
        JsonNode duplicate=json("{\"items\":[{\"bookId\":\"BK-001\",\"quantity\":1},{\"bookId\":\"BK-001\",\"quantity\":1}],\"address\":\"Valid address here\"}");
        assertThrows(BusinessException.class,()->orders.create("USR-DEMO",duplicate));
        JsonNode fraction=json("{\"items\":[{\"bookId\":\"BK-001\",\"quantity\":1.2}],\"address\":\"Valid address here\"}"); assertThrows(BusinessException.class,()->orders.create("USR-DEMO",fraction));
    }
    @Test void simultaneousOrdersCannotOversell() throws Exception {
        ExecutorService pool=Executors.newFixedThreadPool(2); JsonNode body=order(10);
        try { List<Future<Boolean>> outcomes=pool.invokeAll(List.of(()->{try{orders.create("USR-DEMO",body);return true;}catch(BusinessException e){return false;}},()->{try{orders.create("USR-DEMO",body);return true;}catch(BusinessException e){return false;}}));
            int successes=0;for(Future<Boolean> f:outcomes)if(f.get())successes++; assertEquals(1,successes);assertEquals(2,books.get("BK-001").getStock());
        } finally { pool.shutdownNow(); }
    }
    @Test void registrationHashesPasswordsAndPreventsDuplicateEmail() throws Exception {
        JsonNode body=json("{\"name\":\"New Reader\",\"email\":\"NEW@example.com\",\"password\":\"PassWord123!\",\"address\":\"\"}");
        Map<String,Object> u=users.register(body); assertEquals("new@example.com",u.get("email")); assertFalse(u.containsKey("passwordHash")); assertThrows(BusinessException.class,()->users.register(body));
        assertFalse(Files.readString(directory.resolve("bookstore.txt")).contains("PassWord123!")); assertEquals(u.get("id"),users.authenticate(body).getId());
    }
    @Test void customerCannotMutateCatalog() throws Exception {
        assertThrows(BusinessException.class,()->books.delete("USR-DEMO","BK-001")); assertThrows(BusinessException.class,()->users.list("USR-DEMO"));
    }
    @Test void relationshipsPreventOrphanedBooks() {
        assertThrows(BusinessException.class,()->authors.delete("USR-ADMIN","AUT-1")); assertThrows(BusinessException.class,()->categories.delete("USR-ADMIN","CAT-1"));
    }
    @Test void authorAndCategoryCrud() throws Exception {
        Author a=authors.save("USR-ADMIN",null,json("{\"name\":\"Test Author\",\"bio\":\"A sample biography for testing.\"}"));
        authors.save("USR-ADMIN",a.getId(),json("{\"name\":\"Edited Author\",\"bio\":\"A changed biography for testing.\"}")); assertTrue(authors.list().stream().anyMatch(x->x.getName().equals("Edited Author"))); authors.delete("USR-ADMIN",a.getId());
        Category c=categories.save("USR-ADMIN",null,json("{\"name\":\"Poetry\",\"description\":\"Words in verse.\"}"));
        categories.save("USR-ADMIN",c.getId(),json("{\"name\":\"Poems\",\"description\":\"Words in beautiful verse.\"}")); categories.delete("USR-ADMIN",c.getId()); assertEquals(4,categories.list().size());
    }
    @Test void bookCrudAndPriceValidation() throws Exception {
        var body=mapper.valueToTree(books.get("BK-001")); ((com.fasterxml.jackson.databind.node.ObjectNode)body).put("isbn","TEST-NEW"); Book b=books.save("USR-ADMIN",null,body);
        ((com.fasterxml.jackson.databind.node.ObjectNode)body).put("title","A New Title"); books.save("USR-ADMIN",b.getId(),body); assertEquals("A New Title",books.get(b.getId()).getTitle());
        ((com.fasterxml.jackson.databind.node.ObjectNode)body).put("price",-1); assertThrows(BusinessException.class,()->books.save("USR-ADMIN",b.getId(),body)); books.delete("USR-ADMIN",b.getId()); assertEquals(12,books.list().size());
    }
    @Test void reviewsEnforceOwnershipAndUniqueness() throws Exception {
        JsonNode body=json("{\"bookId\":\"BK-001\",\"rating\":5,\"comment\":\"A lovely read.\"}"); Review r=reviews.save("USR-DEMO",null,body);
        assertThrows(BusinessException.class,()->reviews.save("USR-DEMO",null,body)); assertThrows(BusinessException.class,()->reviews.save("USR-ADMIN",r.getId(),body));
        reviews.save("USR-DEMO",r.getId(),json("{\"rating\":4,\"comment\":\"Updated thoughts on this book.\"}")); assertEquals(4,reviews.list().get(0).get("rating")); reviews.delete("USR-ADMIN",r.getId()); assertTrue(reviews.list().isEmpty());
    }
    @Test void userUpdateAndDeleteWithReviewCascade() throws Exception {
        Map<String,Object> u=users.register(json("{\"name\":\"Test Reader\",\"email\":\"test@example.com\",\"password\":\"Password123\"}"));String id=(String)u.get("id");
        users.update(id,id,json("{\"name\":\"Edited Reader\",\"email\":\"test@example.com\",\"address\":\"Test address\"}"));
        reviews.save(id,null,json("{\"bookId\":\"BK-001\",\"rating\":3,\"comment\":\"Some thoughtful review.\"}"));users.delete(id,id);assertTrue(reviews.list().isEmpty());assertThrows(BusinessException.class,()->users.profile(id));
    }
    @Test void activeOrderPreventsBookAndAccountDeletion() throws Exception {
        orders.create("USR-DEMO",order(1)); assertThrows(BusinessException.class,()->books.delete("USR-ADMIN","BK-001"));assertThrows(BusinessException.class,()->users.delete("USR-DEMO","USR-DEMO"));
    }
    @Test void snapshotsAreDetachedAndFailedTransactionsLeaveDiskUntouched() throws Exception {
        String before=Files.readString(directory.resolve("bookstore.txt"));repo.snapshot().getBooks().clear();assertEquals(12,books.list().size());
        assertThrows(BusinessException.class,()->repo.transaction(s->{s.getBooks().clear();throw new BusinessException(400,"Failure");}));assertEquals(before,Files.readString(directory.resolve("bookstore.txt")));
    }
    @Test void secondProcessCannotOpenSameDataDirectory() { assertThrows(java.io.IOException.class,()->new FileStoreRepository(mapper,directory.toString())); }
    @Test void corruptFileFailsWithoutReplacingOriginal() throws Exception {
        Path other=directory.resolve("corrupt");Files.createDirectories(other);Files.writeString(other.resolve("bookstore.txt"),"not valid JSON");assertThrows(Exception.class,()->new FileStoreRepository(mapper,other.toString()));assertEquals("not valid JSON",Files.readString(other.resolve("bookstore.txt")));
    }
}
