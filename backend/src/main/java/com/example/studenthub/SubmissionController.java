package com.example.studenthub;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class SubmissionController {

    @Autowired
    private SubmissionRepository submissionRepo;

    @Autowired
    private UserRepository userRepo;

    // ✅ SUBMIT ASSIGNMENT (STUDENT ONLY)
    @PostMapping("/submitAssignment")
    public String submitAssignment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("assignmentId") int assignmentId,
            @RequestParam("studentUsername") String studentUsername
    ) {

        try {
            String username = studentUsername.trim().toLowerCase();

            User user = userRepo.findByUsername(username);

            if (user == null || !"student".equals(user.getRole())) {
                return "Only students can submit";
            }

            // 🔥 create submissions folder
            String uploadDir = System.getProperty("user.dir") + "/submissions/";

            File folder = new File(uploadDir);
            if (!folder.exists()) {
                folder.mkdirs();
            }

            // ✅ save file
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String fullPath = uploadDir + fileName;

            File dest = new File(fullPath);
            file.transferTo(dest);

            // ✅ store relative path
            String filePath = "submissions/" + fileName;

            // ✅ save submission
            Submission s = new Submission();
            s.setAssignmentId(assignmentId);
            s.setStudentUsername(username);
            s.setFilePath(filePath);
            s.setSubmittedAt(LocalDateTime.now().toString());

            submissionRepo.save(s);

            return "Submission uploaded successfully";

        } catch (Exception e) {
            e.printStackTrace();
            return "Submission failed";
        }
    }

    @GetMapping("/hasSubmitted")
    public String hasSubmitted(
            @RequestParam int assignmentId,
            @RequestParam String username
    ) {
        boolean exists = submissionRepo
                .existsByAssignmentIdAndStudentUsername(
                        assignmentId,
                        username.trim().toLowerCase()
                );

        return String.valueOf(exists);
    }

    @GetMapping("/getSubmissions/{assignmentId}")
    public List<Submission> getSubmissions(@PathVariable int assignmentId) {
        return submissionRepo.findByAssignmentId(assignmentId);
    }
}