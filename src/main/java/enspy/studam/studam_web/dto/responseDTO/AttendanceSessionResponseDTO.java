package enspy.studam.studam_web.dto.responseDTO;

import java.time.LocalDateTime;

import enspy.studam.studam_web.dto.responseDTO.SubjectDTO.MinimalSubjectDTO;
import enspy.studam.studam_web.models.AttendanceSession;
import lombok.Data;

@Data
public class AttendanceSessionResponseDTO {
  private int attendanceSessionId;

  private MinimalSubjectDTO subject;

  private ClassResponseDTO clazz;

  private LocalDateTime date;

  public static AttendanceSessionResponseDTO toDTO(AttendanceSession attendanceSession) {
    AttendanceSessionResponseDTO dto = new AttendanceSessionResponseDTO();
    dto.setAttendanceSessionId(attendanceSession.getAttendanceSessionId());
    dto.setDate(attendanceSession.getDate());
    dto.setSubject(MinimalSubjectDTO.toDTO(attendanceSession.getSubject()));
    dto.setClazz(ClassResponseDTO.toDto(attendanceSession.getTimetable().getClazz()));
    return dto;
  }
}
