package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByTypeIgnoreCase(String type);
    List<Resource> findByLocationContainingIgnoreCase(String location);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
    java.util.Optional<Resource> findByName(String name);
}
