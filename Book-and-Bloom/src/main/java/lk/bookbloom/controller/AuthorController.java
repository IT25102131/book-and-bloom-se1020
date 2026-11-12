package lk.bookbloom.controller;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.model.Author;
import lk.bookbloom.service.AuthorService;
import lk.bookbloom.web.ApiServlet;
import java.util.*;

/** Controller Servlet for Member 4 (IT25101966): Author Profiles & Management. */
public class AuthorController extends ApiServlet {
    private final AuthorService authors;

    public AuthorController(ObjectMapper mapper, AuthorService authors) {
        super(mapper);
        this.authors = authors;
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

    public List<Author> list() {
        return authors.list();
    }

    public Author save(String actor, String id, JsonNode body) {
        return authors.save(actor, id, body);
    }

    public Map<String, String> delete(String actor, String id) {
        authors.delete(actor, id);
        return Map.of("message", "Author removed.");
    }
}

