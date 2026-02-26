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

  private String semester;

  private LocalDateTime date;

  public static AttendanceSessionResponseDTO toDTO(AttendanceSession attendanceSession) {
    AttendanceSessionResponseDTO dto = new AttendanceSessionResponseDTO();
    dto.setAttendanceSessionId(attendanceSession.getAttendanceSessionId());
    dto.setDate(attendanceSession.getDate());
    dto.setSubject(attendanceSession.getSubject() != null ? MinimalSubjectDTO.toDTO(attendanceSession.getSubject()) : null);
    dto.setClazz(attendanceSession.getTimetable() != null && attendanceSession.getTimetable().getClazz() != null
        ? ClassResponseDTO.toDto(attendanceSession.getTimetable().getClazz())
        : null);
    dto.setSemester(attendanceSession.getTimetable() != null ? attendanceSession.getTimetable().getSemester()
        : (attendanceSession.getSubject() != null ? attendanceSession.getSubject().getSemester() : null));
    return dto;
  }
}
