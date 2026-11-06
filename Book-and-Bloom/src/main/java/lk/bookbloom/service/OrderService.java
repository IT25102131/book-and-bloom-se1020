package lk.bookbloom.service;

import com.fasterxml.jackson.databind.JsonNode;
import lk.bookbloom.model.*;
import lk.bookbloom.repository.StoreRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import static lk.bookbloom.service.Rules.*;

@Service
public class OrderService {
    private final StoreRepository repository;
    public OrderService(StoreRepository repository) { this.repository=repository; }
    public List<Order> list(String actor) {
        StoreState s=repository.snapshot(); User u=user(s,actor);
        return s.getOrders().stream().filter(o -> u.canManageCatalog() || o.getUserId().equals(actor)).sorted(Comparator.comparing(Order::getCreatedAt).reversed()).toList();
    }
    public Order create(String actor,JsonNode body) {
        return repository.transaction(s -> {
            user(s,actor); JsonNode items=body.path("items"); require(items.isArray() && items.size()>0 && items.size()<=50,"Your bag must contain 1–50 different books.");
            Order order=new Order(); order.setId(id("ORD")); order.setUserId(actor); order.setCreatedAt(Instant.now().toString());
            Set<String> seen=new HashSet<>(); BigDecimal subtotal=BigDecimal.ZERO; boolean ships=false;
            for (JsonNode item:items) {
                Book b=book(s,text(item,"bookId",1,60)); require(seen.add(b.getId()),"Combine duplicate books into one order line.");
                int qty=number(item,"quantity",1,20); require(b.getStock()>=qty,"Not enough stock for " + b.getTitle() + ".");
                OrderLine line=new OrderLine(); line.setBookId(b.getId()); line.setTitle(b.getTitle()); line.setUnitPrice(b.getPrice()); line.setQuantity(qty); line.setShipping(b.requiresShipping());
                order.getLines().add(line); b.setStock(b.getStock()-qty);
                subtotal=subtotal.add(b.getPrice().multiply(BigDecimal.valueOf(qty))); ships |= b.requiresShipping();
            }
            order.setAddress(text(body,"address",ships ? 10 : 0,350)); order.setSubtotal(subtotal);
            order.setDeliveryFee(ships && subtotal.compareTo(new BigDecimal("5000"))<0 ? new BigDecimal("350.00") : new BigDecimal("0.00"));
            order.setTotal(subtotal.add(order.getDeliveryFee())); s.getOrders().add(order); return order;
        });
    }
    public Order update(String actor,String id,JsonNode body) {
        return repository.transaction(s -> {
            User u=user(s,actor); Order o=visible(s,u,id); String next=text(body,"status",1,20);
            if (!u.canManageCatalog()) require(next.equals("CANCELLED") && o.getStatus().equals("PLACED"),"Only newly placed orders can be cancelled by customers.");
            boolean allowed=switch(o.getStatus()) {
                case "PLACED" -> Set.of("PROCESSING","CANCELLED").contains(next);
                case "PROCESSING" -> Set.of("COMPLETED","CANCELLED").contains(next);
                default -> false;
            };
            require(allowed,"This order status transition is not allowed.");
            if (next.equals("CANCELLED")) for (OrderLine line:o.getLines()) { Book b=book(s,line.getBookId()); b.setStock(b.getStock()+line.getQuantity()); }
            o.setStatus(next); return o;
        });
    }
    public void delete(String actor,String id) {
        repository.transaction(s -> {
            User u=user(s,actor); Order o=visible(s,u,id); require(o.getStatus().equals("CANCELLED"),"Only cancelled orders can be deleted."); s.getOrders().remove(o); return null;
        });
    }
    private Order visible(StoreState s,User u,String id) {
        Order o=found(s.getOrders().stream().filter(x -> x.getId().equals(id)).findFirst(),"Order");
        if (!u.canManageCatalog() && !o.getUserId().equals(u.getId())) throw new BusinessException(403,"This order belongs to another customer."); return o;
    }
}
