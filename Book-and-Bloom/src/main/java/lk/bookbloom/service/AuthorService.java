package lk.bookbloom.service;

import com.fasterxml.jackson.databind.JsonNode;
import lk.bookbloom.model.*;
import lk.bookbloom.repository.StoreRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import static lk.bookbloom.service.Rules.*;

@Service
public class AuthorService {
    private final StoreRepository repository;
    public AuthorService(StoreRepository repository) { this.repository = repository; }
    public List<Author> list() { return repository.snapshot().getAuthors(); }
    public Author save(String actor, String authorId, JsonNode body) {
        return repository.transaction(s -> {
            admin(s, actor);
            Author a = authorId == null ? new Author() : found(s.getAuthors().stream().filter(x -> x.getId().equals(authorId)).findFirst(), "Author");
            if (authorId == null) a.setId(id("AUT"));
            String name = text(body, "name", 2, 100);
            require(s.getAuthors().stream().noneMatch(x -> x.getName().equalsIgnoreCase(name) && !x.getId().equals(a.getId())), "Author already exists.");
            a.setName(name);
            a.setBio(text(body, "bio", 10, 1500));
            if (body.has("nationality")) a.setNationality(body.path("nationality").asText("").strip());
            if (body.has("primaryGenre")) a.setPrimaryGenre(body.path("primaryGenre").asText("").strip());
            if (body.has("accolades")) a.setAccolades(body.path("accolades").asText("").strip());
            if (body.has("bornYear")) a.setBornYear(body.path("bornYear").asText("").strip());
            if (body.has("photoUrl")) a.setPhotoUrl(body.path("photoUrl").asText("").strip());
            if (authorId == null) s.getAuthors().add(a);
            return a;
        });
    }
    public void delete(String actor, String id) {
        repository.transaction(s -> {
            admin(s, actor);
            Author a = found(s.getAuthors().stream().filter(x -> x.getId().equals(id)).findFirst(), "Author");
            require(s.getBooks().stream().noneMatch(b -> b.getAuthorId().equals(id)), "Reassign or remove this author's books first.");
            s.getAuthors().remove(a);
            return null;
        });
    }
}
