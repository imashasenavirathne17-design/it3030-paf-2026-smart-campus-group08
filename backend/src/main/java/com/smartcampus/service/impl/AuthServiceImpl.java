package com.smartcampus.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smartcampus.dto.request.GoogleAuthRequest;
import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = jwtTokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = getCurrentUser(principal.getId());
        
        // Record login event
        user.getLoginHistory().add(User.LoginEvent.builder()
            .timestamp(LocalDateTime.now()).provider("local").status("SUCCESS").build());
        if (user.getLoginHistory().size() > 10) user.getLoginHistory().remove(0);
        userRepository.save(user);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
            user.getPicture(), user.getRole().name(), false);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.STUDENT)
            .provider("local")
            .build();
        user = userRepository.save(user);
        UserPrincipal principal = UserPrincipal.create(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = jwtTokenProvider.generateToken(auth);
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
            user.getPicture(), user.getRole().name(), true);
    }

    @Override
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

            GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String sub = payload.getSubject();

            Optional<User> existingUser = userRepository.findByEmail(email);
            boolean isNewUser = existingUser.isEmpty();

            User user = existingUser.orElseGet(() -> User.builder()
                .email(email).name(name).picture(picture)
                .provider("google").providerId(sub)
                .role(Role.STUDENT)
                .build());

            if (!isNewUser) {
                user.setName(name);
                user.setPicture(picture);
                user.setUpdatedAt(LocalDateTime.now());
            }

            // Record login event
            user.getLoginHistory().add(User.LoginEvent.builder()
                .timestamp(LocalDateTime.now()).provider("google").status("SUCCESS").build());
            if (user.getLoginHistory().size() > 10) user.getLoginHistory().remove(0);

            user = userRepository.save(user);
            UserPrincipal principal = UserPrincipal.create(user);
            Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            String token = jwtTokenProvider.generateToken(auth);

            return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
                user.getPicture(), user.getRole().name(), isNewUser);

        } catch (Exception e) {
            log.error("Google login failed: {}", e.getMessage());
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    public User getCurrentUser(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }


}
