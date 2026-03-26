package com.example.studenthub;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository repo;

    // ✅ REGISTER (FIXED)
    @PostMapping("/register")
    public String register(@RequestBody User user) {

        if (user.getUsername() == null || user.getPassword() == null) {
            return "Invalid input";
        }

        // ✅ normalize username
        String username = user.getUsername().trim().toLowerCase();

        // ✅ duplicate check
        if (repo.existsByUsername(username)) {
            return "Username already exists";
        }

        user.setUsername(username);

        if ("teacher".equals(user.getRole())) {
            user.setApproved(false);
            repo.save(user);
            return "Teacher request sent for approval";
        } else {
            user.setApproved(true);
            user.setRole("student");
            repo.save(user);
            return "Student registered successfully";
        }
    }

    // ✅ LOGIN (SAFE)
    @PostMapping("/login")
    public String login(@RequestBody User user) {

        if (user.getUsername() == null || user.getPassword() == null) {
            return "Invalid input";
        }

        String username = user.getUsername().trim().toLowerCase();
        User existing = repo.findByUsername(username);

        if (existing == null) {
            return "User not found";
        }

        if (existing.getPassword() == null ||
            !existing.getPassword().equals(user.getPassword())) {
            return "Invalid password";
        }

        if ("teacher".equals(existing.getRole()) && !existing.isApproved()) {
            return "Teacher not approved yet";
        }

        return "Login successful";
    }

    // ✅ GOOGLE LOGIN (FIXED)
    @PostMapping("/google-login")
    public String googleLogin(@RequestBody User user) {

        if (user.getUsername() == null) {
            return "Invalid user";
        }

        String username = user.getUsername().trim().toLowerCase();
        User existing = repo.findByUsername(username);

        if (existing == null) {
            user.setUsername(username);
            user.setRole("student");
            user.setApproved(true);
            user.setPassword("google_user");

            repo.save(user);
            return "User registered via Google";
        }

        return "User logged in via Google";
    }

    // ✅ GET PENDING TEACHERS
    @GetMapping("/pending-teachers")
    public List<User> getPendingTeachers() {
        return repo.findByRoleAndApproved("teacher", false);
    }

    // ✅ APPROVE TEACHER
    @PutMapping("/approve-teacher/{id}")
    public String approveTeacher(@PathVariable int id) {

        User user = repo.findById(id).orElse(null);

        if (user == null) {
            return "User not found";
        }

        user.setApproved(true);
        repo.save(user);

        return "Teacher approved successfully";
    }

    // ✅ GET USER PROFILE
    @GetMapping("/getUser/{username}")
    public User getUser(@PathVariable String username) {
        return repo.findByUsername(username.trim().toLowerCase());
    }

    // ✅ UPDATE PROFILE
    @PutMapping("/updateProfile/{username}")
    public String updateProfile(@PathVariable String username, @RequestBody User updatedUser) {

        User user = repo.findByUsername(username.trim().toLowerCase());

        if (user == null) {
            return "User not found";
        }

        user.setFullName(updatedUser.getFullName());
        user.setCourse(updatedUser.getCourse());
        user.setSection(updatedUser.getSection());
        user.setRollNumber(updatedUser.getRollNumber());

        repo.save(user);

        return "Profile updated successfully";
    }
}