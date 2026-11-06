package lk.bookbloom.service;

import com.fasterxml.jackson.databind.JsonNode;
import lk.bookbloom.model.*;
import java.math.*;
import java.util.*;

public final class Rules {
    private Rules() { }
    public static String id(String prefix) { return prefix + "-" + UUID.randomUUID().toString().substring(0,12); }
    public static void require(boolean valid, String message) { if (!valid) throw new BusinessException(400, message); }
    public static String text(JsonNode input, String key, int min, int max) {
        String value = input.path(key).asText("").strip();
        require(value.length() >= min && value.length() <= max, key + " must contain " + min + "–" + max + " characters.");
        return value;
    }
    public static int number(JsonNode input, String key, int min, int max) {
        JsonNode value = input.path(key);
        require(value.isIntegralNumber() && value.canConvertToInt(), key + " must be a whole number.");
        int result = value.asInt(); require(result >= min && result <= max, key + " must be between " + min + " and " + max + "."); return result;
    }
    public static BigDecimal money(JsonNode input, String key) {
        try {
            BigDecimal result = new BigDecimal(input.path(key).asText()).setScale(2, RoundingMode.UNNECESSARY);
            require(result.compareTo(BigDecimal.ZERO) > 0 && result.compareTo(new BigDecimal("1000000")) <= 0, "Price must be positive and at most LKR 1,000,000.");
            return result;
        } catch (NumberFormatException | ArithmeticException e) { throw new BusinessException(400, "Enter a valid price with at most two decimal places."); }
    }
    public static User user(StoreState state, String id) { return state.getUsers().stream().filter(x -> x.getId().equals(id)).findFirst().orElseThrow(() -> new BusinessException(401, "Please sign in to continue.")); }
    public static User admin(StoreState state, String id) { User u = user(state,id); if (!u.canManageCatalog()) throw new BusinessException(403, "Administrator access is required."); return u; }
    public static Book book(StoreState state, String id) { return state.getBooks().stream().filter(x -> x.getId().equals(id)).findFirst().orElseThrow(() -> new BusinessException(404, "Book not found.")); }
    public static <T> T found(Optional<T> value, String name) { return value.orElseThrow(() -> new BusinessException(404, name + " not found.")); }
}
