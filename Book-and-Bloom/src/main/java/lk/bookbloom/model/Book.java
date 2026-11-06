package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.*;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({@JsonSubTypes.Type(value=PrintedBook.class,name="PRINTED"),@JsonSubTypes.Type(value=EBook.class,name="EBOOK")})
public abstract class Book {
    private String id;
    private String title;
    private String authorId;
    private String categoryId;
    private String isbn;
    private BigDecimal price;
    private int stock;
    private String description;
    private String coverColor;
    private boolean featured = false;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCoverColor() { return coverColor; }
    public void setCoverColor(String coverColor) { this.coverColor = coverColor; }
    public boolean getFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public abstract String fulfillment();
    public abstract boolean requiresShipping();
}
