package com.smartcampus.service;

import com.smartcampus.dto.request.GoogleAuthRequest;
import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;

public interface AuthService {
    AuthResponse googleLogin(GoogleAuthRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    User getCurrentUser(String userId);

}
