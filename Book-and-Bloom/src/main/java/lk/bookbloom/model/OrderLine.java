package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;


public class OrderLine {
    private String bookId;
    private String title;
    private BigDecimal unitPrice;
    private int quantity;
    private boolean shipping;

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public boolean getShipping() { return shipping; }
    public void setShipping(boolean shipping) { this.shipping = shipping; }

}
