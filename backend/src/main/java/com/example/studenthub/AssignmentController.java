package com.example.studenthub;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class AssignmentController {

    @Autowired
    private AssignmentRepository repo;

    @Autowired
    private UserRepository userRepo;

    // ✅ OLD METHOD (optional)
    @PostMapping("/addAssignment")
    public String addAssignment(@RequestBody Assignment a) {

        if (a.getUserId() == null) {
            return "Invalid user";
        }

        String username = a.getUserId().trim().toLowerCase();
        User user = userRepo.findByUsername(username);

        if (user == null) {
            return "User not found";
        }

        if (!"teacher".equals(user.getRole())) {
            return "Only teachers can add assignments";
        }

        a.setUserId(username);
        repo.save(a);

        return "Assignment added successfully";
    }

    // 🔥 FILE UPLOAD METHOD (FIXED)
    @PostMapping("/uploadAssignment")
    public String uploadAssignment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("topic") String topic,
            @RequestParam("dueDate") String dueDate,
            @RequestParam("section") String section,
            @RequestParam("course") String course,
            @RequestParam("createdBy") String createdBy
    ) {

        try {
            // ✅ normalize username
            String username = createdBy.trim().toLowerCase();

            User user = userRepo.findByUsername(username);

            if (user == null || !"teacher".equals(user.getRole())) {
                return "Only teachers can upload assignments";
            }

            // 🔥 ABSOLUTE PATH (IMPORTANT FIX)
            String uploadDir = System.getProperty("user.dir") + "/uploads/";

            File folder = new File(uploadDir);
            if (!folder.exists()) {
                folder.mkdirs();
            }

            // ✅ generate file name
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String fullPath = uploadDir + fileName;

            // ✅ save file
            File dest = new File(fullPath);
            file.transferTo(dest);

            // ✅ store relative path (for URL access)
            String filePath = "uploads/" + fileName;

            // ✅ save assignment in DB
            Assignment a = new Assignment();
            a.setTopic(topic);
            a.setDueDate(dueDate);
            a.setSection(section);
            a.setCourse(course);
            a.setCreatedBy(username);
            a.setFilePath(filePath);

            repo.save(a);

            return "Assignment uploaded successfully";

        } catch (Exception e) {
            e.printStackTrace();
            return "Upload failed";
        }
    }

    // ✅ Get assignments by teacher
    @GetMapping("/getAssignments/{userId}")
    public List<Assignment> getAssignments(@PathVariable String userId) {
        return repo.findByUserId(userId.trim().toLowerCase());
    }

    // ✅ Get all assignments (students)
    @GetMapping("/getAssignmentsForUser")
public List<Assignment> getAssignmentsForUser(@RequestParam String username) {

    User user = userRepo.findByUsername(username.trim().toLowerCase());

    if (user == null) {
        return List.of();
    }

    // 👨‍🏫 TEACHER → see their own assignments
    if ("teacher".equals(user.getRole())) {
        return repo.findByCreatedBy(user.getUsername());
    }

    // 👨‍🎓 STUDENT → see by course + section
    return repo.findByCourseAndSection(
        user.getCourse(),
        user.getSection()
    );
}

    // ✅ Delete assignment
    @DeleteMapping("/deleteAssignment/{id}")
    public void deleteAssignment(@PathVariable int id) {
        repo.deleteById(id);
    }
}