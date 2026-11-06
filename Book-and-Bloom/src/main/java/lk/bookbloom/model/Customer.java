package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;


public class Customer extends User {

    @Override public boolean canManageCatalog() { return false; }
    @Override public String role() { return "CUSTOMER"; }
}
