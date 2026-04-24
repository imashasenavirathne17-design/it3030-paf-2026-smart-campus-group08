package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(Resource.ResourceType type);
    List<Resource> findByStatus(Resource.ResourceStatus status);
    List<Resource> findByAvailableTrue();
    List<Resource> findByLocationContainingIgnoreCase(String location);
    List<Resource> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location);
    List<Resource> findByTypeAndStatus(Resource.ResourceType type, Resource.ResourceStatus status);
}
