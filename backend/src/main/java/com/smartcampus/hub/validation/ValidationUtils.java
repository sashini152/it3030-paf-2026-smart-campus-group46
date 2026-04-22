package com.smartcampus.hub.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class ValidationUtils {

    // Email validation pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    // Password validation pattern (min 8 chars, at least one uppercase, one lowercase, one digit, one special char)
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );

    // Name validation (letters, spaces, hyphens, apostrophes only)
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "^[a-zA-Z\\s'-]{2,50}$"
    );

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    public static boolean isValidName(String name) {
        return name != null && NAME_PATTERN.matcher(name).matches();
    }

    public static String sanitizeString(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("[<>\"'&]", "");
    }

    public static boolean containsXSS(String input) {
        if (input == null) return false;
        String lowerInput = input.toLowerCase();
        return lowerInput.contains("<script>") ||
               lowerInput.contains("javascript:") ||
               lowerInput.contains("onerror=") ||
               lowerInput.contains("onload=") ||
               lowerInput.contains("onclick=");
    }

    public static String sanitizeForXSS(String input) {
        if (input == null) return null;
        return input.replaceAll("(?i)<script.*?</script>", "")
                   .replaceAll("(?i)javascript:", "")
                   .replaceAll("(?i)on\\w+\\s*=", "")
                   .replaceAll("<", "&lt;")
                   .replaceAll(">", "&gt;")
                   .replaceAll("\"", "&quot;")
                   .replaceAll("'", "&#x27;");
    }
}
