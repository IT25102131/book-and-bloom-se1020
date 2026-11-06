package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;


public class StoreState {
    private int schemaVersion = 1;
    private List<Book> books = new ArrayList<>();
    private List<User> users = new ArrayList<>();
    private List<Author> authors = new ArrayList<>();
    private List<Category> categories = new ArrayList<>();
    private List<Order> orders = new ArrayList<>();
    private List<Review> reviews = new ArrayList<>();

    public int getSchemaVersion() { return schemaVersion; }
    public void setSchemaVersion(int schemaVersion) { this.schemaVersion = schemaVersion; }
    public List<Book> getBooks() { return books; }
    public void setBooks(List<Book> books) { this.books = books; }
    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = users; }
    public List<Author> getAuthors() { return authors; }
    public void setAuthors(List<Author> authors) { this.authors = authors; }
    public List<Category> getCategories() { return categories; }
    public void setCategories(List<Category> categories) { this.categories = categories; }
    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }
    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }

}
