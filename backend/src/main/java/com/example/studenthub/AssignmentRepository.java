package com.example.studenthub;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {

    List<Assignment> findByUserId(String userId);
    List<Assignment> findByCreatedBy(String createdBy);

List<Assignment> findByCourseAndSection(String course, String section);
}