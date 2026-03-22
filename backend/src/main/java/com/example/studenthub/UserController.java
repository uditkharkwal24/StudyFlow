package com.example.studenthub;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class UserController {

    @Autowired
    private UserRepository repo;

    @PostMapping("/register")
public String register(@RequestBody User user) {

    if (repo.existsByUsername(user.getUsername())) {
        return "Username already exists";
    }

    repo.save(user);
    return "Registration successful";
}

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        User u = repo.findByUsername(user.getUsername());

        if (u != null && u.getPassword().equals(user.getPassword())) {
            return "Success";
        } else {
            return "Invalid";
        }
    }
}