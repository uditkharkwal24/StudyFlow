package com.example.studenthub;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Integer> {

    User findByUsername(String username);

    boolean existsByUsername(String username);

    // ✅ NEW: get pending teachers
    List<User> findByRoleAndApproved(String role, boolean approved);
}