package com.example.qlnh.chat;

import java.util.List;

/**
 * Body của POST /api/chat.
 * history: các lượt hội thoại trước (role = "user" | "model") để chatbot nhớ ngữ cảnh.
 */
public record ChatRequest(String message, List<Turn> history) {
    public record Turn(String role, String text) { }
}
