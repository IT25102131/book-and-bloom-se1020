package lk.bookbloom.web;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.model.Book;
import lk.bookbloom.model.User;
import lk.bookbloom.service.*;
import java.io.*;
import java.util.*;

/** Explicit Jakarta Servlet: HTTP/session boundary delegates business rules to services. */
public class ApiServlet extends HttpServlet {
    private final ObjectMapper mapper;
    private final UserService users;
    private final BookService books;
    private final AuthorService authors;
    private final CategoryService categories;
    private final OrderService orders;
    private final ReviewService reviews;
    public ApiServlet(ObjectMapper mapper,UserService users,BookService books,AuthorService authors,CategoryService categories,OrderService orders,ReviewService reviews) {
        this.mapper=mapper; this.users=users; this.books=books; this.authors=authors; this.categories=categories; this.orders=orders; this.reviews=reviews;
    }
    @Override protected void service(HttpServletRequest request,HttpServletResponse response) throws IOException {
        response.setContentType("application/json"); response.setCharacterEncoding("UTF-8"); response.setHeader("Cache-Control","no-store");
        try {
            String method=request.getMethod(); String path=Optional.ofNullable(request.getPathInfo()).orElse("/");
            HttpSession session=request.getSession(true);
            if (session.getAttribute("csrf")==null) session.setAttribute("csrf",UUID.randomUUID().toString());
            String actor=(String)session.getAttribute("userId");
            if (!method.equals("GET") && !method.equals("HEAD")) {
                if (!Objects.equals(session.getAttribute("csrf"),request.getHeader("X-CSRF-Token"))) throw new BusinessException(403,"Your session changed. Refresh the page and try again.");
                if (request.getContentLengthLong()>65536) throw new BusinessException(413,"Request is too large.");
            }
            byte[] payload=method.equals("GET") || method.equals("HEAD") ? new byte[0] : request.getInputStream().readNBytes(65537);
            if (payload.length>65536) throw new BusinessException(413,"Request is too large.");
            JsonNode body=payload.length==0 ? mapper.createObjectNode() : mapper.readTree(payload);
            if (body==null || !body.isObject()) throw new BusinessException(400,"Expected a JSON object.");
            Object result;
            if (path.equals("/session") && method.equals("GET")) {
                Map<String,Object> info=new LinkedHashMap<>(); info.put("csrf",session.getAttribute("csrf"));
                try { info.put("user",actor==null ? null : users.profile(actor)); }
                catch (BusinessException e) { session.removeAttribute("userId"); info.put("user",null); }
                result=info;
            } else if (path.equals("/login") && method.equals("POST")) {
                User u=users.authenticate(body); request.changeSessionId(); session.setAttribute("userId",u.getId()); session.setAttribute("csrf",UUID.randomUUID().toString());
                result=Map.of("user",u.publicProfile(),"csrf",session.getAttribute("csrf"));
            } else if (path.equals("/logout") && method.equals("POST")) { session.invalidate(); result=Map.of("message","Signed out."); }
            else if (path.equals("/register") && method.equals("POST")) { result=users.register(body); response.setStatus(201); }
            else {
                String[] parts=path.split("/"); String resource=parts.length>1 ? parts[1] : ""; String id=parts.length==3 ? parts[2] : null;
                if (parts.length>3) throw new BusinessException(404,"Endpoint not found.");
                if (method.equals("POST") && id!=null) throw new BusinessException(405,"POST must target a collection.");
                if ((method.equals("PUT") || method.equals("DELETE")) && id==null) throw new BusinessException(400,"An item ID is required.");
                result=switch(resource) {
                    case "books" -> switch(method) { case "GET" -> id==null ? books.list() : books.get(id); case "POST","PUT" -> books.save(actor,id,body); case "DELETE" -> { books.delete(actor,id); yield Map.of("message","Book removed."); } default -> throw methodError(); };
                    case "authors" -> switch(method) { case "GET" -> authors.list(); case "POST","PUT" -> authors.save(actor,id,body); case "DELETE" -> { authors.delete(actor,id); yield Map.of("message","Author removed."); } default -> throw methodError(); };
                    case "categories" -> switch(method) { case "GET" -> categories.list(); case "POST","PUT" -> categories.save(actor,id,body); case "DELETE" -> { categories.delete(actor,id); yield Map.of("message","Category removed."); } default -> throw methodError(); };
                    case "users" -> switch(method) { case "GET" -> id==null ? users.list(actor) : ownProfile(actor,id); case "PUT" -> users.update(actor,id,body); case "DELETE" -> { users.delete(actor,id); if (id.equals(actor)) session.invalidate(); yield Map.of("message","Account removed."); } default -> throw methodError(); };
                    case "orders" -> switch(method) { case "GET" -> orders.list(actor); case "POST" -> orders.create(actor,body); case "PUT" -> orders.update(actor,id,body); case "DELETE" -> { orders.delete(actor,id); yield Map.of("message","Order removed."); } default -> throw methodError(); };
                    case "reviews" -> switch(method) { case "GET" -> reviews.list(); case "POST","PUT" -> reviews.save(actor,id,body); case "DELETE" -> { reviews.delete(actor,id); yield Map.of("message","Review removed."); } default -> throw methodError(); };
                    default -> throw new BusinessException(404,"Endpoint not found.");
                };
                if (method.equals("POST")) response.setStatus(201);
            }
            if (path.equals("/books") && method.equals("GET")) {
                mapper.writerFor(mapper.getTypeFactory().constructCollectionType(List.class,Book.class)).writeValue(response.getWriter(),result);
            } else mapper.writeValue(response.getWriter(),result);
        } catch (BusinessException e) { response.setStatus(e.getStatus()); mapper.writeValue(response.getWriter(),Map.of("error",e.getMessage())); }
        catch (com.fasterxml.jackson.core.JsonProcessingException e) { response.setStatus(400); mapper.writeValue(response.getWriter(),Map.of("error","Invalid JSON request.")); }
        catch (Exception e) { getServletContext().log("Request failed",e); response.setStatus(500); mapper.writeValue(response.getWriter(),Map.of("error","We could not save or load your changes. Please try again.")); }
    }
    private Object ownProfile(String actor,String target) { if (!Objects.equals(actor,target)) throw new BusinessException(403,"Open your own profile."); return users.profile(actor); }
    private BusinessException methodError() { return new BusinessException(405,"Method not allowed."); }
}
