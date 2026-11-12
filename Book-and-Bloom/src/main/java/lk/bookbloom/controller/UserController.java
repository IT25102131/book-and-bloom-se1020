package lk.bookbloom.controller;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.model.User;
import lk.bookbloom.service.*;
import lk.bookbloom.web.ApiServlet;
import java.util.*;

/** Controller Servlet for Member 1 (IT25102131): User Accounts, Authentication & Sessions. */
public class UserController extends ApiServlet {
    private final UserService users;

    public UserController(ObjectMapper mapper, UserService users) {
        super(mapper);
        this.users = users;
    }

    @Override
    protected Object dispatch(String method, String actor, JsonNode body,
            HttpServletRequest request, HttpServletResponse response, HttpSession session) throws Exception {
        String servletPath = Optional.ofNullable(request.getServletPath()).orElse("");
        if ("/api/session".equals(servletPath)) {
            if (!"GET".equals(method)) throw methodError();
            return sessionInfo(actor, session);
        }
        if ("/api/login".equals(servletPath)) {
            if (!"POST".equals(method)) throw methodError();
            return login(body, request, session);
        }
        if ("/api/logout".equals(servletPath)) {
            if (!"POST".equals(method)) throw methodError();
            return logout(session);
        }
        if ("/api/register".equals(servletPath)) {
            if (!"POST".equals(method)) throw methodError();
            response.setStatus(201);
            return register(body);
        }
        return dispatchCollectionItem(method, request, response, (m, id) -> switch (m) {
            case "GET" -> id == null ? list(actor) : ownProfile(actor, id);
            case "PUT" -> update(actor, id, body);
            case "DELETE" -> delete(actor, id, session);
            default -> throw methodError();
        });
    }

    public Map<String, Object> sessionInfo(String actor, HttpSession session) {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("csrf", session.getAttribute("csrf"));
        try {
            info.put("user", actor == null ? null : users.profile(actor));
        } catch (BusinessException e) {
            session.removeAttribute("userId");
            info.put("user", null);
        }
        return info;
    }

    public Map<String, Object> login(JsonNode body, HttpServletRequest request, HttpSession session) {
        User u = users.authenticate(body);
        request.changeSessionId();
        session.setAttribute("userId", u.getId());
        session.setAttribute("csrf", UUID.randomUUID().toString());
        return Map.of("user", u.publicProfile(), "csrf", session.getAttribute("csrf"));
    }

    public Map<String, String> logout(HttpSession session) {
        session.invalidate();
        return Map.of("message", "Signed out.");
    }

    public Map<String, Object> register(JsonNode body) {
        return users.register(body);
    }

    public List<Map<String, Object>> list(String actor) {
        return users.list(actor);
    }

    public Map<String, Object> ownProfile(String actor, String target) {
        if (!Objects.equals(actor, target)) {
            throw new BusinessException(403, "Open your own profile.");
        }
        return users.profile(actor);
    }

    public Map<String, Object> update(String actor, String id, JsonNode body) {
        return users.update(actor, id, body);
    }

    public Map<String, String> delete(String actor, String id, HttpSession session) {
        users.delete(actor, id);
        if (id.equals(actor)) {
            session.invalidate();
        }
        return Map.of("message", "Account removed.");
    }
}

