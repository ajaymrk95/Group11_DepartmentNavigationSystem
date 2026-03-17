package com.atlas.admin.controller;

import com.atlas.admin.dto.AdminProfileDto;
import com.atlas.admin.service.AdminProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/profile")
public class AdminProfileController {

    private final AdminProfileService profileService;

    public AdminProfileController(AdminProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<AdminProfileDto.ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    @PutMapping
    public ResponseEntity<AdminProfileDto.ProfileResponse> updateProfile(
            @Valid @RequestBody AdminProfileDto.UpdateProfileRequest req) {
        return ResponseEntity.ok(profileService.updateProfile(req));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody AdminProfileDto.ChangePasswordRequest req) {
        profileService.changePassword(req);
        return ResponseEntity.noContent().build();
    }
}
