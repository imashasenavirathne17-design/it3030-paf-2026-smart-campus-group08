package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.UserDto;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto.Response getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return toResponse(user);
    }

    public List<UserDto.Response> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserDto.Response updatePreferences(String userId, UserDto.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setNotificationsEnabled(request.isNotificationsEnabled());
        user.setEmailNotifications(request.isEmailNotifications());
        return toResponse(userRepository.save(user));
    }

    public UserDto.Response updateRoles(String userId, UserDto.RoleUpdate request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setRoles(request.getRoles());
        return toResponse(userRepository.save(user));
    }

    public UserDto.Response toResponse(User user) {
        return UserDto.Response.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .picture(user.getPicture())
                .roles(user.getRoles())
                .active(user.isActive())
                .notificationsEnabled(user.isNotificationsEnabled())
                .emailNotifications(user.isEmailNotifications())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
