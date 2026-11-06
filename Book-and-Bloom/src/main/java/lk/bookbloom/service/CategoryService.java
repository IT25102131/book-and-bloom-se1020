package lk.bookbloom.service;

import com.fasterxml.jackson.databind.JsonNode;
import lk.bookbloom.model.*;
import lk.bookbloom.repository.StoreRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import static lk.bookbloom.service.Rules.*;

@Service
public class CategoryService {
    private final StoreRepository repository;
    public CategoryService(StoreRepository repository) { this.repository=repository; }
    public List<Category> list() { return repository.snapshot().getCategories(); }
    public Category save(String actor,String categoryId,JsonNode body) {
        return repository.transaction(s -> {
            admin(s,actor); Category c=categoryId == null ? new Category() : found(s.getCategories().stream().filter(x -> x.getId().equals(categoryId)).findFirst(),"Category");
            if (categoryId == null) c.setId(id("CAT")); String name=text(body,"name",2,60);
            require(s.getCategories().stream().noneMatch(x -> x.getName().equalsIgnoreCase(name) && !x.getId().equals(c.getId())),"Category already exists.");
            c.setName(name); c.setDescription(text(body,"description",5,300)); if (categoryId == null) s.getCategories().add(c); return c;
        });
    }
    public void delete(String actor,String id) {
        repository.transaction(s -> {
            admin(s,actor); Category c=found(s.getCategories().stream().filter(x -> x.getId().equals(id)).findFirst(),"Category");
            require(s.getBooks().stream().noneMatch(b -> b.getCategoryId().equals(id)),"Reassign or remove the books in this category first."); s.getCategories().remove(c); return null;
        });
    }
}
