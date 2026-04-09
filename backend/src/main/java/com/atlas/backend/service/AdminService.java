package com.atlas.backend.service;

import java.util.Optional;
import java.util.UUID;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.mindrot.jbcrypt.BCrypt;

import com.atlas.backend.entity.Admin;
import com.atlas.backend.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final JavaMailSender mailSender; // (We will leave this injected to avoid breaking constructor, though unused now)

    @Value("${app.frontend.url:https://group11-department-navigation-syste.vercel.app}")
    private String frontendUrl;

    @Value("${EMAILJS_SERVICE_ID}")
    private String emailjsServiceId;

    @Value("${EMAILJS_TEMPLATE_ID}")
    private String emailjsTemplateId;
    
    @Value("${EMAILJS_PUBLIC_KEY}")
    private String emailjsPublicKey;

    @Value("${EMAILJS_PRIVATE_KEY}")
    private String emailjsPrivateKey;

    public AdminService(AdminRepository adminRepository, JavaMailSender mailSender){
        this.adminRepository = adminRepository;
        this.mailSender = mailSender;
    }

    public boolean login(String usernameOrEmail, String password){

        Optional<Admin> admin = adminRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if(admin.isPresent()){
            String storedPassword = admin.get().getPassword();
            // Automatically upgrade plain-text passwords to BCrypt when they log in
            if (storedPassword != null && !storedPassword.startsWith("$2a$") && !storedPassword.startsWith("$2b$") && !storedPassword.startsWith("$2y$")) {
                if (storedPassword.equals(password)) {
                    admin.get().setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
                    adminRepository.save(admin.get());
                    return true;
                }
                return false;
            }
            boolean match = BCrypt.checkpw(password, storedPassword);
            System.out.println("DEBUG LOGIN: BCrypt.checkpw result: " + match);
            return match;
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
            String resetUrl = frontendUrl + "/admin/reset-password?token=" + token;

            String jsonBody = String.format(
                "{\"service_id\":\"%s\",\"template_id\":\"%s\",\"user_id\":\"%s\",\"accessToken\":\"%s\",\"template_params\":{\"to_email\":\"%s\",\"reset_link\":\"%s\"}}",
                emailjsServiceId, emailjsTemplateId, emailjsPublicKey, emailjsPrivateKey, toEmail, resetUrl
            );

            // Execute POST request to EmailJS
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.emailjs.com/api/v1.0/email/send"))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            java.net.http.HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                    .send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            // EmailJS often returns 'OK' instead of empty body on 200
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("Reset email sent successfully to " + toEmail + " via EmailJS.");
            } else {
                System.err.println("EmailJS API Error: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Failed to send reset email: " + e.getMessage());
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<Admin> adminOpt = adminRepository.findByResetToken(token);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
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
        String storedPassword = admin.getPassword();
        
        boolean currentMatches = false;
        if (storedPassword != null && !storedPassword.startsWith("$2a$") && !storedPassword.startsWith("$2b$") && !storedPassword.startsWith("$2y$")) {
            currentMatches = storedPassword.equals(currentPassword);
        } else {
            currentMatches = BCrypt.checkpw(currentPassword, storedPassword);
        }
        
        if (!currentMatches) return false;
        
        admin.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
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