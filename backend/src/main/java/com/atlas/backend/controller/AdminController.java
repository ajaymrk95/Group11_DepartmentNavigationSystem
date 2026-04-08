package com.atlas.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.atlas.backend.entity.Admin;
import com.atlas.backend.dto.LoginRequest;
import com.atlas.backend.dto.ForgotPasswordRequest;
import com.atlas.backend.dto.ResetPasswordRequest;
import com.atlas.backend.dto.UpdateEmailRequest;
import com.atlas.backend.dto.UpdatePasswordRequest;
import com.atlas.backend.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService){
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){

        boolean success = adminService.login(
                request.getUsername(),
                request.getPassword()
        );

        if(success){
            return ResponseEntity.ok("Login successful");
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String token = adminService.generateResetToken(request.getEmail());
        if (token != null) {
            // In a real application, you would email this token.
            System.out.println("RESET TOKEN GENERATED FOR " + request.getEmail() + " -> " + token);
            return ResponseEntity.ok("If an account with that email exists, a password reset link has been generated.");
        }
        // Still return OK to prevent email enumeration
        return ResponseEntity.ok("If an account with that email exists, a password reset link has been generated.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean success = adminService.resetPassword(request.getToken(), request.getNewPassword());
        if (success) {
            return ResponseEntity.ok("Password has been successfully reset.");
        }
        return ResponseEntity.status(400).body("Invalid or expired reset token.");
    }

    // ── Profile endpoints ─────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        return adminService.getProfile()
                .<ResponseEntity<?>>map(admin -> ResponseEntity.ok(
                        Map.of("username", admin.getUsername() != null ? admin.getUsername() : "",
                               "email",    admin.getEmail()    != null ? admin.getEmail()    : "")))
                .orElseGet(() -> ResponseEntity.status(404).body("Admin not found."));
    }

    @PutMapping("/profile/email")
    public ResponseEntity<?> updateEmail(@RequestBody UpdateEmailRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }
        boolean success = adminService.updateEmail(request.getEmail().trim());
        if (success) {
            return ResponseEntity.ok("Email updated successfully.");
        }
        return ResponseEntity.status(409).body("Email is already in use.");
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequest request) {
        if (request.getCurrentPassword() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Both currentPassword and newPassword are required.");
        }
        if (request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body("New password must be at least 6 characters.");
        }
        boolean success = adminService.updatePassword(request.getCurrentPassword(), request.getNewPassword());
        if (success) {
            return ResponseEntity.ok("Password updated successfully.");
        }
        return ResponseEntity.status(400).body("Current password is incorrect.");
    }

    @PutMapping("/profile/username")
    public ResponseEntity<?> updateUsername(@RequestBody com.atlas.backend.dto.UpdateUsernameRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body("Username is required.");
        }
        boolean success = adminService.updateUsername(request.getUsername().trim());
        if (success) {
            return ResponseEntity.ok("Username updated successfully.");
        }
        return ResponseEntity.status(409).body("Username is already in use.");
    }
}