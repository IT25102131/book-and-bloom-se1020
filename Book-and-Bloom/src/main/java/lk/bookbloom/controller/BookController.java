package lk.bookbloom.controller;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.model.Book;
import lk.bookbloom.service.BookService;
import lk.bookbloom.web.ApiServlet;
import java.io.IOException;
import java.util.*;

/** Controller Servlet for Member 2 (IT25102114): Book Catalog & Inventory Management. */
public class BookController extends ApiServlet {
    private final BookService books;

    public BookController(ObjectMapper mapper, BookService books) {
        super(mapper);
        this.books = books;
    }

    @Override
    protected Object dispatch(String method, String actor, JsonNode body,
            HttpServletRequest request, HttpServletResponse response, HttpSession session) throws Exception {
        return dispatchCollectionItem(method, request, response, (m, id) -> switch (m) {
            case "GET" -> id == null ? list() : get(id);
            case "POST", "PUT" -> save(actor, id, body);
            case "DELETE" -> delete(actor, id);
            default -> throw methodError();
        });
    }

    public List<Book> list() {
        return books.list();
    }

    public Book get(String id) {
        return books.get(id);
    }

    public Book save(String actor, String id, JsonNode body) {
        return books.save(actor, id, body);
    }

    public Map<String, String> delete(String actor, String id) {
        books.delete(actor, id);
        return Map.of("message", "Book removed.");
    }

    @Override
    protected void writeResult(HttpServletResponse response, String method, HttpServletRequest request, Object result)
            throws IOException {
        if ("GET".equals(method) && extractId(request) == null) {
            mapper.writerFor(mapper.getTypeFactory().constructCollectionType(List.class, Book.class))
                    .writeValue(response.getWriter(), result);
        } else {
            super.writeResult(response, method, request, result);
        }
    }
}

