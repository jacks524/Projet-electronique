package enspy.studam.studam_web.dto.responseDTO.publicDTO;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

import enspy.studam.studam_web.enumeration.AttendanceStatus;
import lombok.Data;

@Data
public class PublicStudentAttendanceItemDTO {
  private int attendanceId;
  private String subjectName;
  private String subjectCode;
  private String teacherName;
  private String className;
  private LocalDateTime sessionDate;
  private DayOfWeek day;
  private LocalTime startHour;
  private LocalTime endHour;
  private AttendanceStatus status;
}
