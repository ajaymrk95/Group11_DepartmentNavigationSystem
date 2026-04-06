package com.atlas.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.atlas.backend.entity.Admin;
import com.atlas.backend.dto.LoginRequest;
import com.atlas.backend.dto.ForgotPasswordRequest;
import com.atlas.backend.dto.ResetPasswordRequest;
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
}