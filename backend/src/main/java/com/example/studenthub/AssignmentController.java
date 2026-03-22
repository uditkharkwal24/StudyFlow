package com.example.studenthub;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class AssignmentController {

    @Autowired
    private AssignmentRepository repo;

    // Add assignment
    @PostMapping("/addAssignment")
    public Assignment addAssignment(@RequestBody Assignment a) {
        return repo.save(a);
    }

    // Get assignments of a specific user
    @GetMapping("/getAssignments/{userId}")
    public List<Assignment> getAssignments(@PathVariable String userId) {
        return repo.findByUserId(userId);
    }

    @DeleteMapping("/deleteAssignment/{id}")
public void deleteAssignment(@PathVariable int id) {
    repo.deleteById(id);
}
}