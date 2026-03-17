package com.atlas.admin.config;

import com.atlas.admin.entity.AdminUser;
import com.atlas.admin.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.OffsetDateTime;

@Configuration
public class DataInitializer {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initAdminUser(AdminUserRepository userRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            String email    = "admin@nitc.ac.in";
            String password = "admin123";

            if (userRepo.existsByEmail(email)) {
                AdminUser user = userRepo.findByEmail(email).get();
                if (!passwordEncoder.matches(password, user.getPassword())) {
                    log.warn("Admin password hash mismatch — re-hashing now");
                    user.setPassword(passwordEncoder.encode(password));
                    user.setUpdatedAt(OffsetDateTime.now());
                    userRepo.save(user);
                    log.info("Admin password re-hashed successfully for {}", email);
                } else {
                    log.info("Admin user OK: {}", email);
                }
            } else {
                AdminUser user = new AdminUser();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(password));
                user.setFullName("NIT Calicut Admin");
                user.setRole("ADMIN");
                user.setActive(true);
                user.setCreatedAt(OffsetDateTime.now());
                user.setUpdatedAt(OffsetDateTime.now());
                userRepo.save(user);
                log.info("Default admin user created: {}", email);
            }
        };
    }
}
