package enspy.studam.studam_web.dto.responseDTO.report;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAttendanceReportDTO {
  private int id;
  private String teacherName;
  private String departmentName;
  private LocalDateTime date;
  private String courseName;
  private String semester;
  private String status;
}
