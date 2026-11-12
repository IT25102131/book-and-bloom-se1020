package lk.bookbloom.web;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import lk.bookbloom.service.BusinessException;
import java.io.IOException;
import java.util.*;

/**
 * Shared abstract Jakarta Servlet handling HTTP/session boundaries, CSRF validation,
 * payload limits, JSON parsing, and structured errors for all resource controllers.
 */
public abstract class ApiServlet extends HttpServlet {
    protected final ObjectMapper mapper;

    protected ApiServlet(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    protected final void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store");
        try {
            String method = request.getMethod();
            HttpSession session = request.getSession(true);
            if (session.getAttribute("csrf") == null) {
                session.setAttribute("csrf", UUID.randomUUID().toString());
            }
            String actor = (String) session.getAttribute("userId");
            if (!method.equals("GET") && !method.equals("HEAD")) {
                if (!Objects.equals(session.getAttribute("csrf"), request.getHeader("X-CSRF-Token"))) {
                    throw new BusinessException(403, "Your session changed. Refresh the page and try again.");
                }
                if (request.getContentLengthLong() > 65536) {
                    throw new BusinessException(413, "Request is too large.");
                }
            }
            byte[] payload = method.equals("GET") || method.equals("HEAD")
                    ? new byte[0]
                    : request.getInputStream().readNBytes(65537);
            if (payload.length > 65536) {
                throw new BusinessException(413, "Request is too large.");
            }
            JsonNode body = payload.length == 0 ? mapper.createObjectNode() : mapper.readTree(payload);
            if (body == null || !body.isObject()) {
                throw new BusinessException(400, "Expected a JSON object.");
            }
            Object result = dispatch(method, actor, body, request, response, session);
            writeResult(response, method, request, result);
        } catch (BusinessException e) {
            response.setStatus(e.getStatus());
            mapper.writeValue(response.getWriter(), Map.of("error", e.getMessage()));
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            response.setStatus(400);
            mapper.writeValue(response.getWriter(), Map.of("error", "Invalid JSON request."));
        } catch (Exception e) {
            getServletContext().log("Request failed", e);
            response.setStatus(500);
            mapper.writeValue(response.getWriter(), Map.of("error", "We could not save or load your changes. Please try again."));
        }
    }

    protected abstract Object dispatch(
            String method,
            String actor,
            JsonNode body,
            HttpServletRequest request,
            HttpServletResponse response,
            HttpSession session) throws Exception;

    protected Object dispatchCollectionItem(
            String method,
            HttpServletRequest request,
            HttpServletResponse response,
            ResourceHandler handler) throws Exception {
        String id = extractId(request);
        if (method.equals("POST") && id != null) {
            throw new BusinessException(405, "POST must target a collection.");
        }
        if ((method.equals("PUT") || method.equals("DELETE")) && id == null) {
            throw new BusinessException(400, "An item ID is required.");
        }
        Object result = handler.handle(method, id);
        if (method.equals("POST")) {
            response.setStatus(201);
        }
        return result;
    }

    protected String extractId(HttpServletRequest request) {
        String info = Optional.ofNullable(request.getPathInfo()).orElse("");
        if (info.isEmpty() || info.equals("/")) {
            return null;
        }
        String sub = info.startsWith("/") ? info.substring(1) : info;
        if (sub.contains("/")) {
            throw new BusinessException(404, "Endpoint not found.");
        }
        return sub.isEmpty() ? null : sub;
    }

    protected void writeResult(HttpServletResponse response, String method, HttpServletRequest request, Object result)
            throws IOException {
        mapper.writeValue(response.getWriter(), result);
    }

    protected BusinessException methodError() {
        return new BusinessException(405, "Method not allowed.");
    }

    @FunctionalInterface
    protected interface ResourceHandler {
        Object handle(String method, String id) throws Exception;
    }
}
