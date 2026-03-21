package com.atlas.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.atlas.backend.entity.Admin;
import com.atlas.backend.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository){
        this.adminRepository = adminRepository;
    }

    public boolean login(String username, String password){

        Optional<Admin> admin = adminRepository.findByUsername(username);

        if(admin.isPresent()){
            return admin.get().getPassword().equals(password);
        }

        return false;
    }
}