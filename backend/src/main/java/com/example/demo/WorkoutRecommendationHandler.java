package com.example.demo;

import java.io.InputStream;
import org.xml.sax.SAXException;
import java.io.IOException;
import javax.xml.parsers.*;
import org.w3c.dom.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class WorkoutRecommendationHandler {

    @Autowired
    private ImageRecognitionService imageRecognitionService;
    private Set<String> equipmentList;

    @PostMapping("/detect")
    public ResponseEntity<Set<String>> getEquipment(@RequestParam("files") MultipartFile[] files) {
        Set<String> allDetectedEquipment = new HashSet<>();
        System.out.println("Received " + files.length + " files.");

        try {
            for (MultipartFile file : files) {
                List<String> labels = this.imageRecognitionService.getLabels(file);
                allDetectedEquipment.addAll(labels);
            }
            this.equipmentList = allDetectedEquipment;
            return ResponseEntity.ok(allDetectedEquipment);
        } catch (Exception e) {
            System.err.println("API FAILED: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/workout")
public Workout generateWorkout(@RequestBody Map<String, List<String>> body) {
    List<String> equipmentFromRequest = body.get("equipment");
    if (equipmentFromRequest != null) {
        this.equipmentList = new HashSet<>(equipmentFromRequest);
    }

    Workout newWorkout = new Workout(); // moved OUTSIDE try block

    try {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        InputStream is = getClass().getClassLoader().getResourceAsStream("ActualExerciseDatabase.xml");
        Document doc = builder.parse(is);
        NodeList exercises = doc.getElementsByTagName("Exercise");

        Set<String> exerciseList = new HashSet<>();

        for (String targetEquipment : this.equipmentList) {
            System.out.println("Searching for equipment: '" + targetEquipment + "'");
            for (int i = 0; i < exercises.getLength(); i++) {
                Element exercise = (Element) exercises.item(i);
                String equipment = exercise.getElementsByTagName("Equipment")
                                           .item(0)
                                           .getTextContent()
                                           .trim();

                if (equipment.equalsIgnoreCase(targetEquipment.trim())) {
                    String title = exercise.getElementsByTagName("Title")
                                           .item(0)
                                           .getTextContent();
                    System.out.println("Found: " + title + " from: " + targetEquipment);
                    exerciseList.add(title);
                }
            }
        }

        if (exerciseList.contains("Barbell Bench Press")) {
            newWorkout.addExercise("Barbell Bench Press");
        } else if (exerciseList.contains("Dumbbell Bench Press")) {
            newWorkout.addExercise("Dumbbell Bench Press");
        } else if (exerciseList.contains("Chest Fly")) {
            newWorkout.addExercise("Chest Fly");
        }

        if (exerciseList.contains("Lateral Raises")) {
            newWorkout.addExercise("Lateral Raises");
        } else if (exerciseList.contains("Cable Lateral Raises")) {
            newWorkout.addExercise("Cable Lateral Raises");
        } else if (exerciseList.contains("Upright Row")) {
            newWorkout.addExercise("Upright Row");
        }

        if (exerciseList.contains("Cable Tricep Pushdown")) {
            newWorkout.addExercise("Cable Tricep Pushdown");
        } else if (exerciseList.contains("Skull Crushers")) {
            newWorkout.addExercise("Skull Crushers");
        }

        System.out.println("Total exercises found: " + exerciseList.size());

    } catch (ParserConfigurationException e) {
        System.err.println("XML parser configuration error: " + e.getMessage());
    } catch (SAXException e) {
        System.err.println("XML parsing error: " + e.getMessage());
    } catch (IOException e) {
        System.err.println("File not found or IO error: " + e.getMessage());
    }

    return newWorkout;
}
}
