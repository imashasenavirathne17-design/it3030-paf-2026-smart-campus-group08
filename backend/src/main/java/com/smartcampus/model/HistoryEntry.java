package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HistoryEntry {
    private String userId;
    private String userName;
    private String action; // e.g., "Status changed from OPEN to IN_PROGRESS"
    @Builder.Default private LocalDateTime timestamp = LocalDateTime.now();
}
