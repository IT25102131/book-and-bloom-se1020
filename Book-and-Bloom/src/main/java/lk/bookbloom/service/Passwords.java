package lk.bookbloom.service;

import java.security.*;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/** Salted password hashing; plaintext passwords never enter the data file. */
public final class Passwords {
    private static final int ITERATIONS = 210_000;
    private Passwords() { }
    public static String hash(String password) {
        byte[] salt = new byte[16]; new SecureRandom().nextBytes(salt);
        return ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt) + ":" + derive(password, salt, ITERATIONS);
    }
    public static boolean matches(String password, String stored) {
        try {
            String[] parts = stored.split(":");
            byte[] expected = Base64.getDecoder().decode(parts[2]);
            byte[] actual = Base64.getDecoder().decode(derive(password, Base64.getDecoder().decode(parts[1]), Integer.parseInt(parts[0])));
            return MessageDigest.isEqual(expected, actual);
        } catch (RuntimeException e) { return false; }
    }
    private static String derive(String password, byte[] salt, int iterations) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, 256);
        try { return Base64.getEncoder().encodeToString(SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded()); }
        catch (GeneralSecurityException e) { throw new IllegalStateException(e); }
        finally { spec.clearPassword(); }
    }
}
