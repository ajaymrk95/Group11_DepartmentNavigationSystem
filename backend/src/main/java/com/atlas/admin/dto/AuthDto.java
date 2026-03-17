package com.atlas.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDto {
    public static class LoginRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
        public LoginRequest() {}
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private String email;
        private String fullName;
        private String role;
        private long expiresIn;
        public LoginResponse() {}
        public LoginResponse(String token, String email, String fullName, String role, long expiresIn) {
            this.token = token; this.email = email; this.fullName = fullName;
            this.role = role; this.expiresIn = expiresIn;
        }
        public String getToken() { return token; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public long getExpiresIn() { return expiresIn; }
    }
}
