package lk.bookbloom.repository;

import lk.bookbloom.model.StoreState;
import java.util.function.Function;

/** Abstraction: services know transactions, not JSON or filesystem details. */
public interface StoreRepository {
    StoreState snapshot();
    <T> T transaction(Function<StoreState,T> action);
}
