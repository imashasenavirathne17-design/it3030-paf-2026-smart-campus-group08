package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceDto;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceDto.Response> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ResourceDto.Response getById(String id) {
        return toResponse(resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id)));
    }

    public List<ResourceDto.Response> search(String query) {
        return resourceRepository
                .findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(query, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ResourceDto.Response> filterByType(Resource.ResourceType type) {
        return resourceRepository.findByType(type).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ResourceDto.Response> filterByStatus(Resource.ResourceStatus status) {
        return resourceRepository.findByStatus(status).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ResourceDto.Response> getAvailable() {
        return resourceRepository.findByAvailableTrue().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public ResourceDto.Response create(ResourceDto.Request request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .amenities(request.getAmenities())
                .available(request.isAvailable())
                .status(Resource.ResourceStatus.AVAILABLE)
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    public ResourceDto.Response update(String id, ResourceDto.Request request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setBuilding(request.getBuilding());
        resource.setFloor(request.getFloor());
        resource.setDescription(request.getDescription());
        resource.setImageUrl(request.getImageUrl());
        resource.setAmenities(request.getAmenities());
        resource.setAvailable(request.isAvailable());
        return toResponse(resourceRepository.save(resource));
    }

    public ResourceDto.Response updateStatus(String id, Resource.ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));
        resource.setStatus(status);
        resource.setAvailable(status == Resource.ResourceStatus.AVAILABLE);
        return toResponse(resourceRepository.save(resource));
    }

    public void delete(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource", id);
        }
        resourceRepository.deleteById(id);
    }

    public ResourceDto.Response toResponse(Resource r) {
        return ResourceDto.Response.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .building(r.getBuilding())
                .floor(r.getFloor())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .amenities(r.getAmenities())
                .available(r.isAvailable())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
