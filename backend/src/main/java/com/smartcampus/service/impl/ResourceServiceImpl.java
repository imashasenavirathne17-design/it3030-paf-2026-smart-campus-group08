package com.smartcampus.service.impl;

import com.smartcampus.dto.request.CreateResourceRequest;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public List<Resource> getAllResources(String type, String location, Integer capacity, ResourceStatus status) {
        List<Resource> all = resourceRepository.findAll();
        return all.stream()
            .filter(r -> type == null || r.getType().equalsIgnoreCase(type))
            .filter(r -> location == null || r.getLocation().toLowerCase().contains(location.toLowerCase()))
            .filter(r -> capacity == null || r.getCapacity() >= capacity)
            .filter(r -> status == null || r.getStatus() == status)
            .collect(Collectors.toList());
    }

    @Override
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found: " + id));
    }

    @Override
    public Resource createResource(CreateResourceRequest req) {
        Resource resource = Resource.builder()
            .name(req.getName()).type(req.getType())
            .location(req.getLocation()).capacity(req.getCapacity())
            .description(req.getDescription())
            .availabilityWindows(req.getAvailabilityWindows())
            .status(req.getStatus())
            .build();
        return resourceRepository.save(resource);
    }

    @Override
    public Resource updateResource(String id, CreateResourceRequest req) {
        Resource resource = getResourceById(id);
        resource.setName(req.getName());
        resource.setType(req.getType());
        resource.setLocation(req.getLocation());
        resource.setCapacity(req.getCapacity());
        resource.setDescription(req.getDescription());
        resource.setAvailabilityWindows(req.getAvailabilityWindows());
        resource.setStatus(req.getStatus());
        resource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(resource);
    }

    @Override
    public void deleteResource(String id) {
        resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found: " + id));
        resourceRepository.deleteById(id);
    }
}
