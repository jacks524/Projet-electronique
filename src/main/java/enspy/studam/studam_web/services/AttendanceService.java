package enspy.studam.studam_web.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.AttendanceRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.AttendanceUpdateRequestDTO;
import enspy.studam.studam_web.enumeration.AttendanceStatus;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.models.StudentCatchUpAssignment;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.AttendanceRepository;
import enspy.studam.studam_web.repositories.AttendanceSessionRepository;
import enspy.studam.studam_web.repositories.SchedulerRepository;
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
  private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

  private final StudentLookupService studentLookupService;
  private final AttendanceRepository attendanceRepository;
  private final UserLookupService userLookupService;
  private final SubjectService subjectService;
  private final SubjectLookupService subjectLookupService;
  private final SchedulerService schedulerService;
  private final SchedulerRepository schedulerRepository;
  private final TimetableLookupService timetableLookupService;
  private final AttendanceSessionRepository attendanceSessionRepository;
  private final AttendanceLookupService attendanceLookupService;
  private final WebSocketEventPublisher webSocketEventPublisher;

  public void saveAttendance(List<AttendanceRequestDTO> attendancesRequestDTO) {
    saveAttendance(attendancesRequestDTO, null);
  }

  public void saveAttendance(List<AttendanceRequestDTO> attendancesRequestDTO, LocalDateTime sessionDate) {
    if (attendancesRequestDTO == null || attendancesRequestDTO.isEmpty()) {
      throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
          "Attendance list must not be empty");
    }

    // Validate teacher
    User teacher = userLookupService.getUserByMatricule(attendancesRequestDTO.get(0).getTeacherId());

    // Validate subject
    Subject subject = subjectLookupService.getSubjectById(attendancesRequestDTO.get(0).getSubjectId());

    LocalDateTime effectiveSessionDate = sessionDate != null ? sessionDate : attendancesRequestDTO.get(0).getDate();
    Schedule activeSchedule = resolveActiveSchedule(teacher, subject, effectiveSessionDate);
    Timetable timetable = activeSchedule != null ? activeSchedule.getTimetable() : null;
    Class sessionClass = timetable != null ? timetable.getClazz() : null;

    List<ResolvedAttendanceCandidate> eligibleAttendances = new ArrayList<>();
    for (AttendanceRequestDTO attendanceRequestDTO : attendancesRequestDTO) {
      Student student = studentLookupService.getStudentByMatricule(attendanceRequestDTO.getStudentId());
      if (!isStudentEligibleForSession(student, sessionClass, subject)) {
        log.warn("Skipping student {} for session teacher={} subject={} class={}",
            student.getMatricule(),
            teacher.getMatricule(),
            subject.getName(),
            sessionClass != null ? sessionClass.getName() : "UNKNOWN");
        continue;
      }
      eligibleAttendances.add(new ResolvedAttendanceCandidate(attendanceRequestDTO, student));
    }

    if (eligibleAttendances.isEmpty()) {
      throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
          "No eligible students found for this attendance session");
    }

    AttendanceSession attendanceSession = new AttendanceSession();
    attendanceSession.setDate(effectiveSessionDate);
    attendanceSession.setTeacher(teacher);
    attendanceSession.setSubject(subject);
    if (timetable != null) {
      attendanceSession.setTimetable(timetable);
    } else {
      try {
        attendanceSession.setTimetable(
            this.timetableLookupService.getTimetableContainsDate(effectiveSessionDate.toLocalDate()));
      } catch (ResponseStatusException ex) {
        log.warn("No timetable found for attendance import on {}. Saving session without timetable.",
            effectiveSessionDate.toLocalDate());
        attendanceSession.setTimetable(null);
      }
    }
    attendanceSession.setValidated(true);
    attendanceSession = attendanceSessionRepository.save(attendanceSession);
    for (ResolvedAttendanceCandidate candidate : eligibleAttendances) {
      AttendanceRequestDTO attendanceRequestDTO = candidate.request();
      Student student = candidate.student();

      Attendance attendance = new Attendance();
      attendance.setStudent(student);
      attendance.setAttendanceSession(attendanceSession);
      attendance.setPresenceLoggedAt(attendanceRequestDTO.getDate());
      attendance.setAttendanceStatus(AttendanceStatus.PRESENT);
      attendance.setSchedule(activeSchedule);
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
    String semester = attendanceSession.getTimetable() != null
        ? attendanceSession.getTimetable().getSemester()
        : subject.getSemester();
    sessionPayload.put("semester", semester);
    sessionPayload.put("date", attendanceSession.getDate());
    sessionPayload.put("totalPresent", eligibleAttendances.size());
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

  private Schedule resolveActiveSchedule(User teacher, Subject subject, LocalDateTime sessionDate) {
    List<Schedule> schedules = schedulerRepository.findActiveSchedulesByTeacherAndSubject(
        teacher,
        subject,
        sessionDate.getDayOfWeek(),
        sessionDate.toLocalTime());

    if (schedules.isEmpty()) {
      log.warn("No active schedule found for teacher={} subject={} at {}",
          teacher.getMatricule(), subject.getName(), sessionDate);
      return null;
    }

    if (schedules.size() > 1) {
      throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
          "Multiple schedules match this teacher/subject/time. Please fix schedule data.");
    }

    return schedules.get(0);
  }

  private boolean isStudentEligibleForSession(Student student, Class sessionClass, Subject subject) {
    if (student == null) {
      return false;
    }

    if (sessionClass == null || subject == null) {
      return true;
    }

    if (student.getClasses() != null
        && student.getClasses().getClassId() == sessionClass.getClassId()) {
      return true;
    }

    if (student.getCatchUpAssignments() == null) {
      return false;
    }

    for (StudentCatchUpAssignment assignment : student.getCatchUpAssignments()) {
      if (assignment.getClazz() == null || assignment.getSubject() == null) {
        continue;
      }
      if (Objects.equals(assignment.getClazz().getClassId(), sessionClass.getClassId())
          && Objects.equals(assignment.getSubject().getSubjectId(), subject.getSubjectId())) {
        return true;
      }
    }
    return false;
  }

  private record ResolvedAttendanceCandidate(AttendanceRequestDTO request, Student student) {
  }

}
