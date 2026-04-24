package com.smartcampus.service;

import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.model.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User updateUserRole(String userId, UpdateRoleRequest request);
    User updateUser(String userId, User userData);
    void deleteUser(String userId);
    User updatePreferences(String userId, java.util.Map<String, Boolean> preferences);
    List<User> getTechnicians();
}
