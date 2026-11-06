package lk.bookbloom.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.bookbloom.model.StoreState;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.nio.file.*;
import java.util.function.Function;

/** One atomic, human-readable UTF-8 .txt snapshot keeps orders and stock consistent. */
@Repository
@ConditionalOnProperty(name="bookbloom.storage", havingValue="file", matchIfMissing=true)
public class FileStoreRepository implements StoreRepository, AutoCloseable {
    private final ObjectMapper mapper;
    private final Path file;
    private final FileChannel lockChannel;
    private final FileLock processLock;
    private StoreState state;

    public FileStoreRepository(ObjectMapper mapper, @Value("${bookbloom.data-dir}") String directory) throws IOException {
        this.mapper = mapper;
        Path dir = Path.of(directory).toAbsolutePath();
        Files.createDirectories(dir);
        file = dir.resolve("bookstore.txt");
        lockChannel = FileChannel.open(dir.resolve("store.lock"), StandardOpenOption.CREATE, StandardOpenOption.WRITE);
        FileLock acquired;
        try { acquired = lockChannel.tryLock(); }
        catch (OverlappingFileLockException e) { lockChannel.close(); throw new IOException("This data directory is already in use.", e); }
        if (acquired == null) { lockChannel.close(); throw new IOException("This data directory is already in use."); }
        processLock = acquired;
        try {
            state = Files.exists(file) ? mapper.readValue(file.toFile(), StoreState.class) : new StoreState();
            if (state.getSchemaVersion() != 1) throw new IOException("Unsupported data schema. Original file was preserved.");
        } catch (IOException | RuntimeException e) { close(); throw e; }
    }

    @Override public synchronized StoreState snapshot() { return copy(state); }

    @Override public synchronized <T> T transaction(Function<StoreState,T> action) {
        StoreState candidate = copy(state);
        T result = action.apply(candidate); // Validation failure leaves disk and memory unchanged.
        Path temp = null;
        try {
            byte[] bytes = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(candidate);
            temp = Files.createTempFile(file.getParent(), "store-", ".tmp");
            try (FileChannel channel = FileChannel.open(temp, StandardOpenOption.WRITE)) {
                ByteBuffer buffer = ByteBuffer.wrap(bytes);
                while (buffer.hasRemaining()) channel.write(buffer);
                channel.force(true);
            }
            // Fail safely when the filesystem cannot perform an atomic replace.
            Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            state = copy(candidate);
            return result;
        } catch (IOException e) { throw new IllegalStateException("Could not save changes. Please check data-folder permissions.", e); }
        finally { if (temp != null) try { Files.deleteIfExists(temp); } catch (IOException ignored) { } }
    }

    private StoreState copy(StoreState value) {
        try { return mapper.readValue(mapper.writeValueAsBytes(value), StoreState.class); }
        catch (IOException e) { throw new IllegalStateException("Could not read store data.", e); }
    }
    @PreDestroy @Override public void close() throws IOException { if (processLock.isValid()) processLock.release(); lockChannel.close(); }
}
