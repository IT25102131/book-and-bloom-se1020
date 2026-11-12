package lk.bookbloom.controller;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.model.Order;
import lk.bookbloom.service.OrderService;
import lk.bookbloom.web.ApiServlet;
import java.util.*;

/** Controller Servlet for Member 3 (IT25102130): Orders, Checkout & Status Management. */
public class OrderController extends ApiServlet {
    private final OrderService orders;

    public OrderController(ObjectMapper mapper, OrderService orders) {
        super(mapper);
        this.orders = orders;
    }

    @Override
    protected Object dispatch(String method, String actor, JsonNode body,
            HttpServletRequest request, HttpServletResponse response, HttpSession session) throws Exception {
        return dispatchCollectionItem(method, request, response, (m, id) -> switch (m) {
            case "GET" -> list(actor);
            case "POST" -> create(actor, body);
            case "PUT" -> update(actor, id, body);
            case "DELETE" -> delete(actor, id);
            default -> throw methodError();
        });
    }

    public List<Order> list(String actor) {
        return orders.list(actor);
    }

    public Order create(String actor, JsonNode body) {
        return orders.create(actor, body);
    }

    public Order update(String actor, String id, JsonNode body) {
        return orders.update(actor, id, body);
    }

    public Map<String, String> delete(String actor, String id) {
        orders.delete(actor, id);
        return Map.of("message", "Order removed.");
    }
}

