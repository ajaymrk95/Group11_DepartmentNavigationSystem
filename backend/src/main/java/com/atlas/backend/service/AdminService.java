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
}