package enspy.studam.studam_web.dto.responseDTO;

import enspy.studam.studam_web.enumeration.AttendanceStatus;
import enspy.studam.studam_web.models.Attendance;
import lombok.Data;

@Data
public class AttendanceResponseDTO {
  private int attendanceId;

  private String studentName;

  private String studentMatricule;

  private AttendanceStatus attendanceStatus;

  public static AttendanceResponseDTO toDTO(Attendance attendance) {
    AttendanceResponseDTO dto = new AttendanceResponseDTO();
    dto.setAttendanceId(attendance.getAttendanceId());
    dto.setStudentName(attendance.getStudent().getName());
    dto.setStudentMatricule(attendance.getStudent().getMatricule());
    dto.setAttendanceStatus(attendance.getAttendanceStatus());
    return dto;
  }
}
