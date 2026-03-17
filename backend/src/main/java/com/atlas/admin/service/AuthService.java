package com.atlas.admin.service;

import com.atlas.admin.dto.AuthDto;
import com.atlas.admin.entity.ActivityLog.*;
import com.atlas.admin.repository.AdminUserRepository;
import com.atlas.admin.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AuthService {
    private final AdminUserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;
    private final LogService logService;

    public AuthService(AdminUserRepository u, JwtUtil j, PasswordEncoder e, LogService l) {
        this.userRepo = u; this.jwtUtil = j; this.encoder = e; this.logService = l;
    }

    public AuthDto.LoginResponse login(AuthDto.LoginRequest req) {
        var user = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getActive()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is disabled");

        if (!encoder.matches(req.getPassword(), user.getPassword()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");

        String token = jwtUtil.generate(user.getEmail(), user.getRole());
        try {
            logService.log(LogAction.LOGIN, LogEntity.Auth, user.getId().toString(), user.getEmail(), "Login: " + user.getEmail());
        } catch (Exception ignored) {}

        return new AuthDto.LoginResponse(token, user.getEmail(), user.getFullName(), user.getRole(), jwtUtil.getExpiration());
    }
}
