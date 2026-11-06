package lk.bookbloom.service;

import com.fasterxml.jackson.databind.JsonNode;
import lk.bookbloom.model.*;
import lk.bookbloom.repository.StoreRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;
import static lk.bookbloom.service.Rules.*;

@Service
public class ReviewService {
    private final StoreRepository repository;
    public ReviewService(StoreRepository repository) { this.repository=repository; }
    public List<Map<String,Object>> list() {
        StoreState s=repository.snapshot();
        return s.getReviews().stream().map(r -> {
            Map<String,Object> out=new LinkedHashMap<>(); out.put("id",r.getId()); out.put("bookId",r.getBookId()); out.put("userId",r.getUserId()); out.put("rating",r.getRating()); out.put("comment",r.getComment()); out.put("createdAt",r.getCreatedAt());
            out.put("name",s.getUsers().stream().filter(u -> u.getId().equals(r.getUserId())).map(User::getName).findFirst().orElse("Reader")); return out;
        }).toList();
    }
    public Review save(String actor,String reviewId,JsonNode body) {
        return repository.transaction(s -> {
            user(s,actor); Review r;
            if (reviewId == null) {
                String bookId=text(body,"bookId",1,60); book(s,bookId);
                require(s.getReviews().stream().noneMatch(x -> x.getUserId().equals(actor) && x.getBookId().equals(bookId)),"You already reviewed this book. Edit your existing review instead.");
                r=new Review(); r.setId(id("REV")); r.setBookId(bookId); r.setUserId(actor); r.setCreatedAt(Instant.now().toString()); s.getReviews().add(r);
            } else {
                r=found(s.getReviews().stream().filter(x -> x.getId().equals(reviewId)).findFirst(),"Review");
                if (!r.getUserId().equals(actor)) throw new BusinessException(403,"Only the review's author may edit it.");
            }
            r.setRating(number(body,"rating",1,5)); r.setComment(text(body,"comment",5,1000)); return r;
        });
    }
    public void delete(String actor,String id) {
        repository.transaction(s -> {
            User u=user(s,actor); Review r=found(s.getReviews().stream().filter(x -> x.getId().equals(id)).findFirst(),"Review");
            if (!u.canManageCatalog() && !r.getUserId().equals(actor)) throw new BusinessException(403,"You cannot delete another reader's review.");
            s.getReviews().remove(r); return null;
        });
    }
}
