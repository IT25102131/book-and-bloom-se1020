package lk.bookbloom.controller;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.model.Category;
import lk.bookbloom.service.CategoryService;
import lk.bookbloom.web.ApiServlet;
import java.util.*;

/** Controller Servlet for Member 5 (IT25102132): Book Category Management. */
public class CategoryController extends ApiServlet {
    private final CategoryService categories;

    public CategoryController(ObjectMapper mapper, CategoryService categories) {
        super(mapper);
        this.categories = categories;
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

    public List<Category> list() {
        return categories.list();
    }

    public Category save(String actor, String id, JsonNode body) {
        return categories.save(actor, id, body);
    }

    public Map<String, String> delete(String actor, String id) {
        categories.delete(actor, id);
        return Map.of("message", "Category removed.");
    }
}

