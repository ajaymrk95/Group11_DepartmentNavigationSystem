package com.atlas.admin.service;

import com.atlas.admin.dto.AdminProfileDto;
import com.atlas.admin.entity.AdminUser;
import com.atlas.admin.exception.NotFoundException;
import com.atlas.admin.repository.AdminUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;

@Service
@Transactional
public class AdminProfileService {
    private final AdminUserRepository userRepo;
    private final PasswordEncoder encoder;

    public AdminProfileService(AdminUserRepository u, PasswordEncoder e) { this.userRepo = u; this.encoder = e; }

    private AdminUser currentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepo.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
    }

    public AdminProfileDto.ProfileResponse getProfile() {
        AdminUser u = currentUser();
        return new AdminProfileDto.ProfileResponse(u.getEmail(), u.getFullName(), u.getRole());
    }

    public AdminProfileDto.ProfileResponse updateProfile(AdminProfileDto.UpdateProfileRequest req) {
        AdminUser u = currentUser();
        u.setFullName(req.getFullName()); u.setUpdatedAt(OffsetDateTime.now());
        AdminUser saved = userRepo.save(u);
        return new AdminProfileDto.ProfileResponse(saved.getEmail(), saved.getFullName(), saved.getRole());
    }

    public void changePassword(AdminProfileDto.ChangePasswordRequest req) {
        AdminUser u = currentUser();
        if (!encoder.matches(req.getCurrentPassword(), u.getPassword()))
            throw new RuntimeException("Current password is incorrect");
        u.setPassword(encoder.encode(req.getNewPassword())); u.setUpdatedAt(OffsetDateTime.now());
        userRepo.save(u);
    }
}
