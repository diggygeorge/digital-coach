package com.example.demo;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import java.io.InputStream;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service // This tells Spring to manage this class
public class ImageRecognitionService {

    private volatile Client client;
    private final String apiKey;
    private final String[] availableEquipment;

    // 1. Create the strict instruction template
    private static final String PROMPT_TEMPLATE = """
        You are the backend vision processor for a fitness application. 
        Analyze this image and identify ONLY the primary piece(s) of workout equipment.
        
        CRITICAL RULES:
        1. Ignore people, clothing, floors, walls, colors, and background objects.
        2. You must map the equipment strictly to the provided approved database keys.
        3. Do not invent labels. If it is not in the list, ignore it.
        
        Approved Database Keys: [%s]
        
        Return a comma-separated list of the matched keys only. Do not include any conversational text.
        """;

    public ImageRecognitionService(@Value("${gemini.api.key}") String apiKey) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.availableEquipment = loadEquipmentValues();
    }

    private Client getClient() {
        if (apiKey.isEmpty()) {
            throw new IllegalStateException(
                    "Gemini API key is not configured. Set GEMINI_API_KEY in the environment or backend/.env.");
        }

        if (client == null) {
            client = Client.builder()
                    .apiKey(apiKey)
                    .build();
        }

        return client;
    }

    private String[] loadEquipmentValues() {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            ClassPathResource resource = new ClassPathResource("ExerciseDatabase.xml");
            try (InputStream inputStream = resource.getInputStream()) {
                Document document = builder.parse(inputStream);
                XPath xpath = XPathFactory.newInstance().newXPath();
                XPathExpression expression = xpath.compile("//Equipment");
                NodeList nodes = (NodeList) expression.evaluate(document, XPathConstants.NODESET);

                Set<String> distinctEquipment = new LinkedHashSet<>();
                for (int i = 0; i < nodes.getLength(); i++) {
                    String value = nodes.item(i).getTextContent().trim();
                    if (!value.isEmpty()) {
                        distinctEquipment.add(value);
                    }
                }

                return distinctEquipment.toArray(new String[0]);
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load equipment list from ExerciseDatabase.xml", e);
        }
    }

    /**
     * Identifies objects/labels from an uploaded file using Gemini
     */
    public List<String> getLabels(MultipartFile file) {
        try {
            // Extract bytes and determine MIME type from the uploaded file
            byte[] imageBytes = file.getBytes();
            String mimeType = file.getContentType();
            if (mimeType == null || mimeType.isEmpty()) {
                mimeType = "image/jpeg"; // Fallback MIME type
            }

            // Create the image part
            Part imagePart = Part.fromBytes(imageBytes, mimeType);

            // 3. Inject the equipment list into the prompt template
            String engineeredPrompt = String.format(PROMPT_TEMPLATE, String.join(", ", availableEquipment));
            Part promptPart = Part.fromText(engineeredPrompt);

            // Bundle into a single Content object
            Content inputContent = Content.fromParts(imagePart, promptPart);

            // 4. Call the Gemini API (Upgraded to 2.5-flash for better instruction following)
            GenerateContentResponse response = getClient().models.generateContent(
                    "gemini-2.5-flash-lite",
                    inputContent,
                    null
            );

            // Parse the text response back into a List<String>
            String responseText = response.text();
            if (responseText != null && !responseText.isEmpty()) {
                return Arrays.stream(responseText.split(","))
                        .map(String::trim) 
                        .filter(label -> !label.isEmpty()) // Filter out any empty strings
                        .collect(Collectors.toList());
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze image with Gemini: " + e.getMessage(), e);
        }

        return List.of(); 
    }
}
