package com.example.qlnh.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API chatbot. Đã nằm sau JwtFilter (anyRequest().authenticated()),
 * nên chỉ người đã đăng nhập mới gọi được, và biết vai trò của người gọi.
 */
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        if (request == null || request.message() == null || request.message().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập câu hỏi."));
        }
        return ResponseEntity.ok(Map.of("reply", chatService.chat(request)));
    }
}
