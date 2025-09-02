package com.ignacio.url_shortener_backend.util;

import java.security.SecureRandom;

public final class CodeGenerator {
    private static final char[] ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final SecureRandom RNG = new SecureRandom();

    private CodeGenerator(){}

    public static String random(int len) {
        char[] out = new char[len];
        for (int i = 0; i < len; i++) out[i] = ALPHABET[RNG.nextInt(ALPHABET.length)];
        return new String(out);
    }
}

