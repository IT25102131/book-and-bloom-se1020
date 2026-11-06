package lk.bookbloom.service;

import com.fasterxml.jackson.databind.JsonNode;
import lk.bookbloom.model.*;
import lk.bookbloom.repository.StoreRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import static lk.bookbloom.service.Rules.*;

@Service
public class BookService {
    private final StoreRepository repository;
    public BookService(StoreRepository repository) { this.repository=repository; }
    public List<Book> list() { return repository.snapshot().getBooks(); }
    public Book get(String id) { return book(repository.snapshot(),id); }
    public Book save(String actor,String bookId,JsonNode body) {
        return repository.transaction(s -> {
            admin(s,actor); if (bookId != null) book(s,bookId);
            String type=text(body,"type",1,20); require(Set.of("PRINTED","EBOOK").contains(type),"Choose a valid book format.");
            Book b=type.equals("PRINTED") ? new PrintedBook() : new EBook(); b.setId(bookId == null ? id("BK") : bookId);
            b.setTitle(text(body,"title",1,140)); b.setAuthorId(text(body,"authorId",1,60)); b.setCategoryId(text(body,"categoryId",1,60));
            require(s.getAuthors().stream().anyMatch(a -> a.getId().equals(b.getAuthorId())),"Choose an existing author.");
            require(s.getCategories().stream().anyMatch(c -> c.getId().equals(b.getCategoryId())),"Choose an existing category.");
            b.setIsbn(text(body,"isbn",3,30));
            require(s.getBooks().stream().noneMatch(x -> x.getIsbn().equalsIgnoreCase(b.getIsbn()) && !x.getId().equals(b.getId())),"ISBN must be unique.");
            b.setPrice(money(body,"price")); b.setStock(number(body,"stock",0,100000)); b.setDescription(text(body,"description",10,2500));
            String color=text(body,"coverColor",7,7); require(color.matches("#[0-9a-fA-F]{6}"),"Choose a valid cover color."); b.setCoverColor(color);
            b.setFeatured(body.path("featured").asBoolean(false));
            if (b instanceof PrintedBook printed) printed.setPages(number(body,"pages",1,10000));
            if (b instanceof EBook ebook) { String format=text(body,"fileFormat",1,10); require(Set.of("PDF","EPUB").contains(format),"Choose PDF or EPUB."); ebook.setFileFormat(format); }
            if (bookId == null) s.getBooks().add(b);
            else {
                for (int i=0;i<s.getBooks().size();i++) {
                    if (s.getBooks().get(i).getId().equals(bookId)) { s.getBooks().set(i,b); break; }
                }
            }
            return b;
        });
    }
    public void delete(String actor,String id) {
        repository.transaction(s -> {
            admin(s,actor); Book b=book(s,id);
            require(s.getOrders().stream().noneMatch(o -> !o.getStatus().equals("CANCELLED") && !o.getStatus().equals("COMPLETED") && o.getLines().stream().anyMatch(l -> l.getBookId().equals(id))),"This book belongs to an active order. Complete or cancel it first.");
            s.getBooks().remove(b); s.getReviews().removeIf(r -> r.getBookId().equals(id)); return null;
        });
    }
}
