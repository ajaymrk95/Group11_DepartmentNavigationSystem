package com.atlas.backend.service;

import java.util.Optional;
import java.util.UUID;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.atlas.backend.entity.Admin;
import com.atlas.backend.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final JavaMailSender mailSender;

    public AdminService(AdminRepository adminRepository, JavaMailSender mailSender){
        this.adminRepository = adminRepository;
        this.mailSender = mailSender;
    }

    public boolean login(String usernameOrEmail, String password){

        Optional<Admin> admin = adminRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if(admin.isPresent()){
            return admin.get().getPassword().equals(password);
        }

        return false;
    }

    public String generateResetToken(String email) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            String token = UUID.randomUUID().toString();
            admin.setResetToken(token);
            adminRepository.save(admin);
            
            // Send the email
            sendResetEmail(email, token);

            return token;
        }
        return null;
    }

    private void sendResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // Match this with your property in application.properties
            message.setFrom("atlasnavteam@gmail.com"); 
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - Atlas Admin");
            
            String resetUrl = "http://localhost:5173/admin/reset-password?token=" + token;
            message.setText("Hello,\n\nTo reset your admin password, please click the link below:\n\n" 
                            + resetUrl 
                            + "\n\nIf you did not request a password reset, please ignore this email.");
                            
            mailSender.send(message);
            System.out.println("Reset email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send reset email: " + e.getMessage());
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<Admin> adminOpt = adminRepository.findByResetToken(token);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setPassword(newPassword);
            admin.setResetToken(null); // invalidate token
            adminRepository.save(admin);
            return true;
        }
        return false;
    }

    // ── Profile management ────────────────────────────────────────────────────

    /** Returns the single admin record (there is always exactly one). */
    public Optional<Admin> getProfile() {
        return adminRepository.findAll().stream().findFirst();
    }

    /**
     * Update the admin's email address.
     * Returns false if the email is already taken by this or another record.
     */
    public boolean updateEmail(String newEmail) {
        Optional<Admin> existing = adminRepository.findByEmail(newEmail);
        Optional<Admin> adminOpt = getProfile();
        if (adminOpt.isEmpty()) return false;
        Admin admin = adminOpt.get();
        // Allow saving the same email; reject only if it belongs to a different row
        if (existing.isPresent() && !existing.get().getId().equals(admin.getId())) {
            return false; // duplicate
        }
        admin.setEmail(newEmail);
        adminRepository.save(admin);
        return true;
    }

    /**
     * Update the admin's password after verifying the current one.
     * Returns false if the current password doesn't match.
     */
    public boolean updatePassword(String currentPassword, String newPassword) {
        Optional<Admin> adminOpt = getProfile();
        if (adminOpt.isEmpty()) return false;
        Admin admin = adminOpt.get();
        if (!admin.getPassword().equals(currentPassword)) return false;
        admin.setPassword(newPassword);
        adminRepository.save(admin);
        return true;
    }

    /**
     * Update the admin's username.
     * Returns false if the username is already taken by this or another record.
     */
    public boolean updateUsername(String newUsername) {
        Optional<Admin> existing = adminRepository.findByUsername(newUsername);
        Optional<Admin> adminOpt = getProfile();
        if (adminOpt.isEmpty()) return false;
        Admin admin = adminOpt.get();
        // Allow saving the same username; reject only if it belongs to a different row
        if (existing.isPresent() && !existing.get().getId().equals(admin.getId())) {
            return false; // duplicate
        }
        admin.setUsername(newUsername);
        adminRepository.save(admin);
        return true;
    }
}