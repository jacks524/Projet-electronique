package enspy.studam.studam_web.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import enspy.studam.studam_web.dto.requestDTO.AttendanceRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.AttendanceUpdateRequestDTO;
import enspy.studam.studam_web.enumeration.AttendanceStatus;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.AttendanceRepository;
import enspy.studam.studam_web.repositories.AttendanceSessionRepository;
import enspy.studam.studam_web.services.lookup.AttendanceLookupService;
import enspy.studam.studam_web.services.lookup.StudentLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import enspy.studam.studam_web.services.lookup.TimetableLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AttendanceService {
  private final StudentLookupService studentLookupService;
  private final AttendanceRepository attendanceRepository;
  private final UserLookupService userLookupService;
  private final SubjectService subjectService;
  private final SubjectLookupService subjectLookupService;
  private final SchedulerService schedulerService;
  private final TimetableLookupService timetableLookupService;
  private final AttendanceSessionRepository attendanceSessionRepository;
  private final AttendanceLookupService attendanceLookupService;
  private final WebSocketEventPublisher webSocketEventPublisher;

  public void saveAttendance(List<AttendanceRequestDTO> attendancesRequestDTO) {
    saveAttendance(attendancesRequestDTO, null);
  }

  public void saveAttendance(List<AttendanceRequestDTO> attendancesRequestDTO, LocalDateTime sessionDate) {
    // Validate teacher
    User teacher = userLookupService.getUserByMatricule(attendancesRequestDTO.get(0).getTeacherId());

    // Validate subject
    Subject subject = subjectLookupService.getSubjectById(attendancesRequestDTO.get(0).getSubjectId());

    AttendanceSession attendanceSession = new AttendanceSession();
    attendanceSession.setDate(sessionDate != null ? sessionDate : attendancesRequestDTO.get(0).getDate());
    attendanceSession.setTeacher(teacher);
    attendanceSession.setSubject(subject);
    attendanceSession.setTimetable(
        this.timetableLookupService.getTimetableContainsDate(attendancesRequestDTO.get(0).getDate().toLocalDate()));
    attendanceSession.setValidated(true);
    attendanceSession = attendanceSessionRepository.save(attendanceSession);
    for (AttendanceRequestDTO attendanceRequestDTO : attendancesRequestDTO) {
      Student student = studentLookupService.getStudentByMatricule(attendanceRequestDTO.getStudentId());

      Attendance attendance = new Attendance();
      attendance.setStudent(student);
      attendance.setAttendanceSession(attendanceSession);
      attendance.setPresenceLoggedAt(attendanceRequestDTO.getDate());
      attendance.setAttendanceStatus(AttendanceStatus.PRESENT);
      attendance = attendanceRepository.save(attendance);

      java.util.Map<String, Object> attendancePayload = new java.util.LinkedHashMap<>();
      attendancePayload.put("attendanceId", attendance.getAttendanceId());
      attendancePayload.put("studentId", student.getStudentId());
      attendancePayload.put("studentName", student.getName());
      attendancePayload.put("sessionId", attendanceSession.getAttendanceSessionId());
      attendancePayload.put("status", attendance.getAttendanceStatus());
      attendancePayload.put("loggedAt", attendance.getPresenceLoggedAt());
      webSocketEventPublisher.publish("attendance.created", attendancePayload);
    }
    java.util.Map<String, Object> sessionPayload = new java.util.LinkedHashMap<>();
    sessionPayload.put("sessionId", attendanceSession.getAttendanceSessionId());
    sessionPayload.put("teacherId", teacher.getId());
    sessionPayload.put("teacherName", teacher.getName());
    sessionPayload.put("subjectId", subject.getSubjectId());
    sessionPayload.put("subjectName", subject.getName());
    sessionPayload.put("date", attendanceSession.getDate());
    sessionPayload.put("totalPresent", attendancesRequestDTO.size());
    webSocketEventPublisher.publish("attendance.session.created", sessionPayload);
  }

  public void saveAttendanceOld(AttendanceRequestDTO attendanceRequestDTO) {
    // Validate student
    Student student = studentLookupService.getStudentByMatricule(attendanceRequestDTO.getStudentId());

    // Validate teacher
    User teacher = userLookupService.getUserByMatricule(attendanceRequestDTO.getTeacherId());

    // Create and save attendance record
    Attendance attendance = new Attendance();
    attendance.setStudent(student);

    // On recherche le schedule associé à l'enregistrement de présence
    // On retrouve d'abord les matières de l'enseignant
    List<Subject> subjects = this.subjectService.getSubjectsByTeacherId(teacher.getId());
    Schedule schedule = this.schedulerService.getScheduleByDateAndSubjectList(attendanceRequestDTO.getDate(), subjects);

    attendance.setSchedule(schedule);
    attendance.setPresenceLoggedAt(attendanceRequestDTO.getDate());
    attendance.setAttendanceStatus(AttendanceStatus.PRESENT);
    attendanceRepository.save(attendance);
  }

  public void updateAttendanceById(AttendanceUpdateRequestDTO attendanceUpdateRequestDTO, int attendanceId) {
    Attendance attendance = this.attendanceLookupService.getAttendanceById(attendanceId);
    attendance.setAttendanceStatus(attendanceUpdateRequestDTO.getAttendanceStatus());
    attendanceRepository.save(attendance);
    java.util.Map<String, Object> attendancePayload = new java.util.LinkedHashMap<>();
    attendancePayload.put("attendanceId", attendance.getAttendanceId());
    attendancePayload.put("status", attendance.getAttendanceStatus());
    attendancePayload.put("studentId",
        attendance.getStudent() != null ? attendance.getStudent().getStudentId() : null);
    attendancePayload.put("sessionId",
        attendance.getAttendanceSession() != null
            ? attendance.getAttendanceSession().getAttendanceSessionId()
            : null);
    webSocketEventPublisher.publish("attendance.updated", attendancePayload);
  }

  public Page<Attendance> getAttendanceByStudentId(int studentId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    Student student = this.studentLookupService.getStudentById(studentId);
    return attendanceRepository.findByStudent(student, pageable);
  }

}
