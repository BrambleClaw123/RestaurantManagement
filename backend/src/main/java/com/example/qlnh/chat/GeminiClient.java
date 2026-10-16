package com.example.qlnh.chat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gọi Google Gemini API (generateContent) qua REST.
 * Không dùng SDK nên không cần thêm thư viện vào pom.xml.
 */
@Component
public class GeminiClient {

    private static final String ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.5-flash-lite}")
    private String model;

    private final RestClient rest = RestClient.create();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> generate(List<Map<String, Object>> contents,
                                        String systemPrompt,
                                        List<Map<String, Object>> functionDeclarations) {
        Map<String, Object> body = new HashMap<>();
        body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))));
        body.put("contents", contents);
        if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
            body.put("tools", List.of(Map.of("functionDeclarations", functionDeclarations)));
        }
        body.put("generationConfig", Map.of("temperature", 0.3));

        return rest.post()
                .uri(String.format(ENDPOINT, model))
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);
    }
}
