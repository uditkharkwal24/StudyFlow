package com.example.studenthub;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Integer> {

    List<Submission> findByAssignmentId(int assignmentId);

    List<Submission> findByStudentUsername(String studentUsername);
    boolean existsByAssignmentIdAndStudentUsername(int assignmentId, String studentUsername);
}