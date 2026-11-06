package lk.bookbloom.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
    @GetMapping("/") public String home() { return "home"; }
    @GetMapping("/catalog") public String catalog() { return "catalog"; }
    @GetMapping("/book") public String book() { return "book"; }
    @GetMapping("/cart") public String cart() { return "cart"; }
    @GetMapping("/login") public String login() { return "login"; }
    @GetMapping("/register") public String register() { return "register"; }
    @GetMapping("/account") public String account() { return "account"; }
    @GetMapping("/orders") public String orders() { return "orders"; }
    @GetMapping("/admin") public String admin() { return "admin"; }
}
