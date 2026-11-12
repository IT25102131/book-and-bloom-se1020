package lk.bookbloom.web;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lk.bookbloom.controller.*;
import lk.bookbloom.service.*;
import org.springframework.boot.web.servlet.*;
import org.springframework.context.annotation.*;

@Configuration
public class WebConfiguration {
    private static <T extends HttpServlet> ServletRegistrationBean<T> servlet(T instance, String... urls) {
        return new ServletRegistrationBean<>(instance, urls);
    }

    @Bean public ServletRegistrationBean<UserController> userController(ObjectMapper mapper, UserService users) {
        return servlet(new UserController(mapper, users), "/api/users/*", "/api/session", "/api/login", "/api/logout", "/api/register");
    }

    @Bean public ServletRegistrationBean<BookController> bookController(ObjectMapper mapper, BookService books) {
        return servlet(new BookController(mapper, books), "/api/books/*");
    }

    @Bean public ServletRegistrationBean<OrderController> orderController(ObjectMapper mapper, OrderService orders) {
        return servlet(new OrderController(mapper, orders), "/api/orders/*");
    }

    @Bean public ServletRegistrationBean<AuthorController> authorController(ObjectMapper mapper, AuthorService authors) {
        return servlet(new AuthorController(mapper, authors), "/api/authors/*");
    }

    @Bean public ServletRegistrationBean<CategoryController> categoryController(ObjectMapper mapper, CategoryService categories) {
        return servlet(new CategoryController(mapper, categories), "/api/categories/*");
    }

    @Bean public ServletRegistrationBean<ReviewController> reviewController(ObjectMapper mapper, ReviewService reviews) {
        return servlet(new ReviewController(mapper, reviews), "/api/reviews/*");
    }

    @Bean public ServletRegistrationBean<ApiServlet> apiFallback(ObjectMapper mapper) {
        return servlet(new ApiServlet(mapper) {
            @Override
            protected Object dispatch(String method, String actor, JsonNode body,
                    HttpServletRequest request, HttpServletResponse response, HttpSession session) {
                throw new BusinessException(404, "Endpoint not found.");
            }
        }, "/api/*");
    }

    @Bean public FilterRegistrationBean<Filter> securityHeaders() {
        Filter filter = (request, response, chain) -> {
            HttpServletResponse r = (HttpServletResponse) response;
            r.setHeader("X-Content-Type-Options", "nosniff");
            r.setHeader("X-Frame-Options", "DENY");
            r.setHeader("Referrer-Policy", "same-origin");
            r.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
            chain.doFilter(request, response);
        };
        FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>(filter);
        bean.addUrlPatterns("/*");
        return bean;
    }
}
