package com.atlas.admin.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${atlas.jwt.secret}")
    private String secret;

    @Value("${atlas.jwt.expiration}")
    private long expiration;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generate(String email, String role) {
        Date now = new Date();
        return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expiration))
            .signWith(key())
            .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(key()).build()
            .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validate(String token) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException e) { return false; }
    }

    public long getExpiration() { return expiration; }
}
