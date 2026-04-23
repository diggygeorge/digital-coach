package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        Map<String, Object> response = new HashMap<>();

        // Validation
        if (name == null || name.isBlank()) {
            response.put("success", false);
            response.put("error", "Name is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (email == null || !email.contains("@")) {
            response.put("success", false);
            response.put("error", "Valid email is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (password == null || password.length() < 6) {
            response.put("success", false);
            response.put("error", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if email exists
        if (userRepository.existsByEmail(email)) {
            response.put("success", false);
            response.put("error", "An account with this email already exists");
            return ResponseEntity.badRequest().body(response);
        }

        // Create user
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        response.put("success", true);
        response.put("user", Map.of("name", user.getName(), "email", user.getEmail(), "id", user.getId()));
        return ResponseEntity.ok(response);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Map<String, Object> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            response.put("success", false);
            response.put("error", "No account found with this email");
            return ResponseEntity.status(401).body(response);
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("success", false);
            response.put("error", "Incorrect password");
            return ResponseEntity.status(401).body(response);
        }

        response.put("success", true);
        response.put("user", Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "id", user.getId()
        ));
        return ResponseEntity.ok(response);
    }

    // PUT /api/auth/profile — update user profile
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");

        Map<String, Object> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            response.put("success", false);
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }

        User user = optionalUser.get();

        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("age")) user.setAge(((Number) body.get("age")).intValue());
        if (body.containsKey("height")) user.setHeight(((Number) body.get("height")).intValue());
        if (body.containsKey("currentWeight")) user.setCurrentWeight(((Number) body.get("currentWeight")).doubleValue());
        if (body.containsKey("targetWeight")) user.setTargetWeight(((Number) body.get("targetWeight")).doubleValue());
        if (body.containsKey("bodyFat")) user.setBodyFat(((Number) body.get("bodyFat")).doubleValue());
        if (body.containsKey("level")) user.setLevel((String) body.get("level"));
        if (body.containsKey("goalType")) user.setGoalType((String) body.get("goalType"));
        if (body.containsKey("workoutDaysPerWeek")) user.setWorkoutDaysPerWeek(((Number) body.get("workoutDaysPerWeek")).intValue());

        userRepository.save(user);

        response.put("success", true);
        response.put("user", Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "id", user.getId()
        ));
        return ResponseEntity.ok(response);
    }

    // GET /api/auth/profile/{email} — get user profile
    @GetMapping("/profile/{email}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            response.put("success", false);
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }

        User user = optionalUser.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("age", user.getAge());
        profile.put("height", user.getHeight());
        profile.put("currentWeight", user.getCurrentWeight());
        profile.put("targetWeight", user.getTargetWeight());
        profile.put("bodyFat", user.getBodyFat());
        profile.put("level", user.getLevel());
        profile.put("goalType", user.getGoalType());
        profile.put("workoutDaysPerWeek", user.getWorkoutDaysPerWeek());

        response.put("success", true);
        response.put("profile", profile);
        return ResponseEntity.ok(response);
    }
}
