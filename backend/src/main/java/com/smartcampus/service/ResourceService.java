package com.smartcampus.service;

import com.smartcampus.dto.request.CreateResourceRequest;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import java.util.List;

public interface ResourceService {
    List<Resource> getAllResources(String type, String location, Integer capacity, ResourceStatus status);
    Resource getResourceById(String id);
    Resource createResource(CreateResourceRequest request);
    Resource updateResource(String id, CreateResourceRequest request);
    void deleteResource(String id);
}
