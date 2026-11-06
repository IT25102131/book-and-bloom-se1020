package lk.bookbloom.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.bookbloom.model.*;
import lk.bookbloom.repository.StoreRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.time.Instant;

@Component
public class DemoData implements CommandLineRunner {
    private final StoreRepository repository;
    private final ObjectMapper mapper;
    public DemoData(StoreRepository repository,ObjectMapper mapper) { this.repository=repository; this.mapper=mapper; }
    @Override public void run(String... args) throws Exception {
        // Empty existing stores are not reseeded; the admin account is the initialization marker.
        if (!repository.snapshot().getUsers().isEmpty()) return;
        StoreState seed;
        try (InputStream in=getClass().getResourceAsStream("/sample-data/bookstore.txt")) { seed=mapper.readValue(in,StoreState.class); }
        AdminUser admin=new AdminUser(); admin.setId("USR-ADMIN"); admin.setName("Store Administrator"); admin.setEmail("admin@bookbloom.lk"); admin.setPasswordHash(Passwords.hash("BloomAdmin!2026")); admin.setCreatedAt(Instant.now().toString());
        Customer reader=new Customer(); reader.setId("USR-DEMO"); reader.setName("Nethmi Perera"); reader.setEmail("reader@bookbloom.lk"); reader.setPasswordHash(Passwords.hash("BloomReader!2026")); reader.setAddress("24 Flower Road, Colombo 07"); reader.setCreatedAt(Instant.now().toString());
        repository.transaction(s -> { s.setBooks(seed.getBooks()); s.setAuthors(seed.getAuthors()); s.setCategories(seed.getCategories()); s.getUsers().add(admin); s.getUsers().add(reader); return null; });
    }
}
