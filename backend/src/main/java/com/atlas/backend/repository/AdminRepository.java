package com.atlas.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.atlas.backend.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUsername(String username);

    Optional<Admin> findByUsernameOrEmail(String username, String email);

    Optional<Admin> findByEmail(String email);

    Optional<Admin> findByResetToken(String resetToken);

}