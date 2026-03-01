package enspy.studam.studam_web.services;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import enspy.studam.studam_web.dto.responseDTO.publicDTO.PublicStudentAttendanceItemDTO;
import enspy.studam.studam_web.dto.responseDTO.publicDTO.PublicStudentAttendanceLookupResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.publicDTO.PublicStudentAttendanceStudentDTO;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.repositories.AttendanceRepository;
import enspy.studam.studam_web.repositories.SchedulerRepository;
import enspy.studam.studam_web.services.lookup.StudentLookupService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PublicStudentAttendanceService {

  private final StudentLookupService studentLookupService;
  private final AttendanceRepository attendanceRepository;
  private final SchedulerRepository schedulerRepository;

  public PublicStudentAttendanceLookupResponseDTO getStudentAttendanceByMatricule(String matricule) {
    Student student = studentLookupService.getStudentByMatricule(matricule);
    List<Attendance> attendances = attendanceRepository.findByStudentOrderByPresenceLoggedAtDesc(student);

    PublicStudentAttendanceLookupResponseDTO response = new PublicStudentAttendanceLookupResponseDTO();
    response.setStudent(toStudentDto(student));
    response.setAttendances(attendances.stream()
        .map(this::toAttendanceItemDto)
        .collect(Collectors.toList()));
    return response;
  }

  private PublicStudentAttendanceStudentDTO toStudentDto(Student student) {
    PublicStudentAttendanceStudentDTO dto = new PublicStudentAttendanceStudentDTO();
    dto.setStudentId(student.getStudentId());
    dto.setMatricule(student.getMatricule());
    dto.setName(student.getName());
    dto.setClassName(student.getClasses() != null ? student.getClasses().getName() : null);
    dto.setDepartmentName(
        student.getClasses() != null && student.getClasses().getDepartment() != null
            ? student.getClasses().getDepartment().getName()
            : null);
    return dto;
  }

  private PublicStudentAttendanceItemDTO toAttendanceItemDto(Attendance attendance) {
    AttendanceSession session = attendance.getAttendanceSession();
    Schedule schedule = resolveSchedule(attendance);

    PublicStudentAttendanceItemDTO dto = new PublicStudentAttendanceItemDTO();
    dto.setAttendanceId(attendance.getAttendanceId());
    dto.setSubjectName(session != null && session.getSubject() != null ? session.getSubject().getName() : null);
    dto.setSubjectCode(session != null && session.getSubject() != null ? session.getSubject().getCode() : null);
    dto.setTeacherName(session != null && session.getTeacher() != null ? session.getTeacher().getName() : null);
    dto.setClassName(
        session != null && session.getTimetable() != null && session.getTimetable().getClazz() != null
            ? session.getTimetable().getClazz().getName()
            : attendance.getStudent() != null && attendance.getStudent().getClasses() != null
                ? attendance.getStudent().getClasses().getName()
                : null);
    dto.setSessionDate(session != null ? session.getDate() : attendance.getPresenceLoggedAt());
    dto.setDay(resolveDay(schedule, session, attendance));
    dto.setStartHour(schedule != null ? schedule.getStartHour() : null);
    dto.setEndHour(schedule != null ? schedule.getEndHour() : null);
    dto.setStatus(attendance.getAttendanceStatus());
    return dto;
  }

  private DayOfWeek resolveDay(Schedule schedule, AttendanceSession session, Attendance attendance) {
    if (schedule != null && schedule.getDay() != null) {
      return schedule.getDay();
    }
    LocalDateTime reference = session != null ? session.getDate() : attendance.getPresenceLoggedAt();
    return reference != null ? reference.getDayOfWeek() : null;
  }

  private Schedule resolveSchedule(Attendance attendance) {
    if (attendance.getSchedule() != null) {
      return attendance.getSchedule();
    }

    AttendanceSession session = attendance.getAttendanceSession();
    if (session == null || session.getTeacher() == null || session.getSubject() == null || session.getTimetable() == null
        || session.getDate() == null) {
      return null;
    }

    DayOfWeek targetDay = session.getDate().getDayOfWeek();
    LocalTime targetTime = session.getDate().toLocalTime();

    List<Schedule> candidates = schedulerRepository
        .findByTeacherAndTimetableAndSubject(session.getTeacher(), session.getTimetable(), session.getSubject())
        .stream()
        .filter(schedule -> schedule.getDay() == targetDay)
        .sorted(Comparator.comparing(Schedule::getStartHour, Comparator.nullsLast(Comparator.naturalOrder())))
        .collect(Collectors.toList());

    if (candidates.isEmpty()) {
      return null;
    }

    return candidates.stream()
        .filter(schedule -> schedule.getStartHour() != null
            && schedule.getEndHour() != null
            && !targetTime.isBefore(schedule.getStartHour())
            && !targetTime.isAfter(schedule.getEndHour()))
        .findFirst()
        .orElse(candidates.get(0));
  }
}
