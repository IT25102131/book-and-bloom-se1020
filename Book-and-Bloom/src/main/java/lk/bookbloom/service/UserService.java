package lk.bookbloom.service;

import com.fasterxml.jackson.databind.JsonNode;
import lk.bookbloom.model.*;
import lk.bookbloom.repository.StoreRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;
import static lk.bookbloom.service.Rules.*;

@Service
public class UserService {
    private final StoreRepository repository;
    public UserService(StoreRepository repository) { this.repository = repository; }
    public Map<String,Object> register(JsonNode body) {
        String password = text(body,"password",8,128);
        String hash = Passwords.hash(password);
        return repository.transaction(s -> {
            Customer u = new Customer(); u.setId(id("USR")); u.setCreatedAt(Instant.now().toString());
            updateFields(s,u,body); u.setPasswordHash(hash); s.getUsers().add(u); return u.publicProfile();
        });
    }
    public User authenticate(JsonNode body) {
        String email = text(body,"email",3,150).toLowerCase(Locale.ROOT);
        String password = text(body,"password",1,128);
        User u = repository.snapshot().getUsers().stream().filter(x -> x.getEmail().equals(email)).findFirst().orElse(null);
        if (u == null || !Passwords.matches(password,u.getPasswordHash())) throw new BusinessException(401,"Email or password is incorrect.");
        return u;
    }
    public Map<String,Object> profile(String actor) { return user(repository.snapshot(),actor).publicProfile(); }
    public List<Map<String,Object>> list(String actor) { StoreState s=repository.snapshot(); admin(s,actor); return s.getUsers().stream().map(User::publicProfile).toList(); }
    public Map<String,Object> update(String actor, String target, JsonNode body) {
        return repository.transaction(s -> {
            User caller=user(s,actor); if (!actor.equals(target)) admin(s,actor);
            User u=user(s,target); updateFields(s,u,body);
            if (body.hasNonNull("password") && !body.path("password").asText().isBlank()) {
                require(actor.equals(target),"Password changes must be made by the account owner.");
                require(Passwords.matches(text(body,"currentPassword",1,128),caller.getPasswordHash()),"Current password is incorrect.");
                u.setPasswordHash(Passwords.hash(text(body,"password",8,128)));
            }
            return u.publicProfile();
        });
    }
    public void delete(String actor, String target) {
        repository.transaction(s -> {
            if (!actor.equals(target)) admin(s,actor); else user(s,actor);
            User u=user(s,target);
            require(!u.canManageCatalog(),"The demo administrator cannot be deleted.");
            require(s.getOrders().stream().noneMatch(o -> o.getUserId().equals(target)),"Remove cancelled orders first. Accounts with order history cannot be deleted.");
            s.getReviews().removeIf(r -> r.getUserId().equals(target)); s.getUsers().remove(u); return null;
        });
    }
    private void updateFields(StoreState s, User u, JsonNode body) {
        String email=text(body,"email",3,150).toLowerCase(Locale.ROOT);
        require(email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"),"Enter a valid email address.");
        require(s.getUsers().stream().noneMatch(x -> x.getEmail().equals(email) && !x.getId().equals(u.getId())),"This email is already registered.");
        u.setName(text(body,"name",2,80)); u.setEmail(email); u.setAddress(text(body,"address",0,350));
    }
}
