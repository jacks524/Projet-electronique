package enspy.studam.studam_web.dto.requestDTO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AttendanceRequestDTO {
  private String studentId;
  private LocalDateTime date;
  private String teacherId;
  private int subjectId;
}
