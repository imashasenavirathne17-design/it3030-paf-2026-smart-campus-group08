package com.smartcampus.hub.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    public ResourceNotFoundException(String entity, String id) {
        super(entity + " not found with id: " + id);
    }
}
