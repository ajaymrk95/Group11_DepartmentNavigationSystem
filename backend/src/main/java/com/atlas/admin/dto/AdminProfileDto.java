package com.atlas.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdminProfileDto {
    public static class ProfileResponse {
        private String email;
        private String fullName;
        private String role;
        public ProfileResponse() {}
        public ProfileResponse(String email, String fullName, String role) {
            this.email = email; this.fullName = fullName; this.role = role;
        }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
    }

    public static class ChangePasswordRequest {
        @NotBlank private String currentPassword;
        @NotBlank @Size(min = 6) private String newPassword;
        public ChangePasswordRequest() {}
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class UpdateProfileRequest {
        @NotBlank private String fullName;
        public UpdateProfileRequest() {}
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }
}
