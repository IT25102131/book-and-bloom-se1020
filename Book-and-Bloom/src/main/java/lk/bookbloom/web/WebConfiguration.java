package lk.bookbloom.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import lk.bookbloom.service.*;
import org.springframework.boot.web.servlet.*;
import org.springframework.context.annotation.*;

@Configuration
public class WebConfiguration {
    @Bean public ServletRegistrationBean<ApiServlet> api(ObjectMapper mapper,UserService users,BookService books,AuthorService authors,CategoryService categories,OrderService orders,ReviewService reviews) {
        return new ServletRegistrationBean<>(new ApiServlet(mapper,users,books,authors,categories,orders,reviews),"/api/*");
    }
    @Bean public FilterRegistrationBean<Filter> securityHeaders() {
        Filter filter=(request,response,chain) -> {
            HttpServletResponse r=(HttpServletResponse)response;
            r.setHeader("X-Content-Type-Options","nosniff"); r.setHeader("X-Frame-Options","DENY"); r.setHeader("Referrer-Policy","same-origin");
            r.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
            chain.doFilter(request,response);
        };
        FilterRegistrationBean<Filter> bean=new FilterRegistrationBean<>(filter); bean.addUrlPatterns("/*"); return bean;
    }
}
