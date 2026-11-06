package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;


public class AdminUser extends User {

    @Override public boolean canManageCatalog() { return true; }
    @Override public String role() { return "ADMIN"; }
}
