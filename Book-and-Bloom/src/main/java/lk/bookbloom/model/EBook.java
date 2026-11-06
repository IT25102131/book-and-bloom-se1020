package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;


public class EBook extends Book {
    private String fileFormat = "PDF";

    public String getFileFormat() { return fileFormat; }
    public void setFileFormat(String fileFormat) { this.fileFormat = fileFormat; }
    @Override public String fulfillment() { return "Digital edition; demo order only"; }
    @Override public boolean requiresShipping() { return false; }
}
