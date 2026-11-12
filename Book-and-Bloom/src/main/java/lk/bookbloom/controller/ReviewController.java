package lk.bookbloom.controller;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.model.Review;
import lk.bookbloom.service.ReviewService;
import lk.bookbloom.web.ApiServlet;
import java.util.*;

/** Controller Servlet for Member 6 (IT25102519): Reader Reviews & Ratings Management. */
public class ReviewController extends ApiServlet {
    private final ReviewService reviews;

    public ReviewController(ObjectMapper mapper, ReviewService reviews) {
        super(mapper);
        this.reviews = reviews;
    }

    @Override
    protected Object dispatch(String method, String actor, JsonNode body,
            HttpServletRequest request, HttpServletResponse response, HttpSession session) throws Exception {
        return dispatchCollectionItem(method, request, response, (m, id) -> switch (m) {
            case "GET" -> list();
            case "POST", "PUT" -> save(actor, id, body);
            case "DELETE" -> delete(actor, id);
            default -> throw methodError();
        });
    }

    public List<Map<String, Object>> list() {
        return reviews.list();
    }

    public Review save(String actor, String id, JsonNode body) {
        return reviews.save(actor, id, body);
    }

    public Map<String, String> delete(String actor, String id) {
        reviews.delete(actor, id);
        return Map.of("message", "Review removed.");
    }
}
