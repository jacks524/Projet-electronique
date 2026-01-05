package enspy.studam.studam_web.dto.responseDTO.attendanceDTO;

import enspy.studam.studam_web.dto.responseDTO.AttendanceSessionResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.ClassResponseDTO;
import enspy.studam.studam_web.enumeration.AttendanceStatus;
import lombok.Data;

@Data
public class AttendanceDetailsResponseDTO {
  private int attendanceId;

  private String studentName;

  private String studentMatricule;

  private AttendanceStatus attendanceStatus;

  private AttendanceSessionResponseDTO attendanceSessionResponseDTO;

  public static AttendanceDetailsResponseDTO toDTO(enspy.studam.studam_web.models.Attendance attendance) {
    AttendanceDetailsResponseDTO dto = new AttendanceDetailsResponseDTO();
    dto.setAttendanceId(attendance.getAttendanceId());
    dto.setStudentName(attendance.getStudent().getName());
    dto.setStudentMatricule(attendance.getStudent().getMatricule());
    dto.setAttendanceStatus(attendance.getAttendanceStatus());
    dto.setAttendanceSessionResponseDTO(AttendanceSessionResponseDTO.toDTO(attendance.getAttendanceSession()));
    return dto;
  }
}
