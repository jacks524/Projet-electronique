package enspy.studam.studam_web.dto.responseDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemoteAttendanceLaunchResponseDTO {
  private long launchId;
  private int scheduleId;
  private LocalDate date;
  private String teacherMatricule;
  private String teacherName;
  private String subjectName;
  private String semester;
  private String className;
  private String source;
  private LocalDateTime createdAt;
  private boolean consumed;
}
