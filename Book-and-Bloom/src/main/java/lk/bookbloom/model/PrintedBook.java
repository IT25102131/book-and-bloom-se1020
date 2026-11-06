package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;


public class PrintedBook extends Book {
    private int pages = 240;

    public int getPages() { return pages; }
    public void setPages(int pages) { this.pages = pages; }
    @Override public String fulfillment() { return "Delivered to your address"; }
    @Override public boolean requiresShipping() { return true; }
}
