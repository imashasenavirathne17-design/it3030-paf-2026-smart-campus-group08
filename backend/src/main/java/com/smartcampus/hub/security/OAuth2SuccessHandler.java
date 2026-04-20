package com.smartcampus.hub.security;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${cors.allowed-origins}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        String googleId = oauth2User.getAttribute("sub");

        // Upsert user in MongoDB
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating new user: {}", email);
            return User.builder()
                    .email(email)
                    .name(name)
                    .picture(picture)
                    .googleId(googleId)
                    .roles(Set.of(User.Role.USER))
                    .active(true)
                    .notificationsEnabled(true)
                    .emailNotifications(true)
                    .build();
        });

        // Update picture/name in case it changed
        user.setName(name);
        user.setPicture(picture);
        user.setActive(true);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        String redirectUrl = frontendUrl.split(",")[0] + "/auth/callback?token=" + token;
        log.info("OAuth2 login success for: {} — redirecting", email);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
