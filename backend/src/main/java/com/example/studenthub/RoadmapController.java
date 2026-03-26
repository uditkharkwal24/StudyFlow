package com.example.studenthub;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@RestController
@CrossOrigin
public class RoadmapController {

    private final String API_KEY = "AIzaSyClsMVuItcwLwlY4944_wBnijhxIP9UUqA";

    @GetMapping("/getRoadmap")
    public String getRoadmap() {

       String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

        RestTemplate restTemplate = new RestTemplate();

        try {
            String requestBody = """
            {
              "contents": [{
                "parts": [{
                  "text": "Generate a BTech CSE roadmap strictly in this format:\n\n1st Year:\n- point\n- point\n\n2nd Year:\n- point\n- point\n\n3rd Year:\n- point\n- point\n\n4th Year:\n- point\n- point\n\nRules:\n- Only plain text\n- No markdown (#, *, etc)\n- No extra explanation\n- Only bullet points"
                }]
              }]
            }
            """;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, entity, Map.class);

            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            Map first = (Map) candidates.get(0);
            Map content = (Map) first.get("content");
            List parts = (List) content.get("parts");
            Map textMap = (Map) parts.get(0);

            return textMap.get("text").toString();

        } catch (Exception e) {
            e.printStackTrace();
            return e.getMessage();
        }
    }
}