package enspy.studam.studam_web.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import enspy.studam.studam_web.dto.responseDTO.StatisticsResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.report.RecentActivityResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.report.TeacherAttendanceReportDTO;
import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.AttendanceSessionRepository;
import enspy.studam.studam_web.repositories.UserRepository;
import enspy.studam.studam_web.security.SecurityUtils;
import enspy.studam.studam_web.services.lookup.StudentLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.services.lookup.DepartmentLookupService;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/reports")
@AllArgsConstructor
public class ReportController {

  private final DepartmentLookupService departmentLookupService;
  private final UserLookupService userLookupService;
  private final StudentLookupService studentLookupService;
  private final AttendanceSessionRepository attendanceSessionRepository;
  private final UserRepository userRepository;
  private final WebSocketEventPublisher webSocketEventPublisher;

  @GetMapping("/statistics")
  public ResponseEntity<StatisticsResponseDTO> getStatistics() {
    User currentUser = SecurityUtils.getCurrentUser();
    boolean isAdmin = hasRole(currentUser, UserRoleEnum.ADMIN);
    boolean isManager = hasRole(currentUser, UserRoleEnum.DEPARTMENT_MANAGER);

    StatisticsResponseDTO statistics = new StatisticsResponseDTO();
    if (isAdmin) {
      statistics.setTotalDepartments(departmentLookupService.countDepartments());
      statistics.setTotalStudents(studentLookupService.countStudents());
      statistics.setTotalTeachers(userLookupService.countUsersByRole(UserRoleEnum.TEACHER));
      statistics.setTotalUsers(userLookupService.countAllUsers());
    } else if (isManager) {
      Department department = departmentLookupService.getDepartmentByUserIfManager(currentUser);
      statistics.setTotalDepartments(1);
      statistics.setTotalStudents(department.getClasses()
          .stream()
          .mapToInt(c -> c.getStudents().size())
          .sum());
      statistics.setTotalTeachers(department.getTeachers().size());
      statistics.setTotalUsers(department.getTeachers().size());
    } else {
      statistics.setTotalDepartments(currentUser.getDepartments().size());
      statistics.setTotalStudents(0);
      statistics.setTotalTeachers(1);
      statistics.setTotalUsers(1);
    }

    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("totalDepartments", statistics.getTotalDepartments());
    payload.put("totalStudents", statistics.getTotalStudents());
    payload.put("totalTeachers", statistics.getTotalTeachers());
    payload.put("totalUsers", statistics.getTotalUsers());
    if (currentUser != null && currentUser.getRoles() != null) {
      payload.put("role",
          currentUser.getRoles().stream().map(r -> r.getRole().name()).toList());
    } else {
      payload.put("role", java.util.List.of());
    }
    webSocketEventPublisher.publish("report.statistics.generated", payload);
    return ResponseEntity.ok(statistics);
  }

  @GetMapping("/admin/recent-activity")
  public ResponseEntity<List<RecentActivityResponseDTO>> getRecentActivity(
      @RequestParam(defaultValue = "20") int limit,
      @RequestParam(required = false) Integer departmentId) {
    User currentUser = SecurityUtils.getCurrentUser();
    boolean isAdmin = hasRole(currentUser, UserRoleEnum.ADMIN);
    boolean isManager = hasRole(currentUser, UserRoleEnum.DEPARTMENT_MANAGER);

    int pageSize = Math.max(1, Math.min(limit, 50));
    List<RecentActivityResponseDTO> activities = new ArrayList<>();

    Department departmentFilter = departmentId != null ? departmentLookupService.getDepartmentById(departmentId) : null;
    if (!isAdmin) {
      if (isManager) {
        Department managed = departmentLookupService.getDepartmentByUserIfManager(currentUser);
        if (departmentFilter != null && departmentFilter.getDepartmentId() != managed.getDepartmentId()) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this department");
        }
        departmentFilter = managed;
      } else {
        departmentFilter = null;
      }
    }

    List<AttendanceSession> sessions = departmentFilter == null
        ? attendanceSessionRepository.findRecentSessions(PageRequest.of(0, pageSize))
        : attendanceSessionRepository.findRecentSessionsByDepartment(departmentFilter, PageRequest.of(0, pageSize));
    for (AttendanceSession session : sessions) {
      if (!isAdmin && !isManager) {
        if (session.getTeacher() == null || session.getTeacher().getId() != currentUser.getId()) {
          continue;
        }
      }
      String subjectName = session.getSubject() != null ? session.getSubject().getName() : "Matiere";
      String teacherName = session.getTeacher() != null ? session.getTeacher().getName() : "Enseignant";
      activities.add(new RecentActivityResponseDTO(
          "attendance-" + session.getAttendanceSessionId(),
          "Session de presence: " + subjectName + " (" + teacherName + ")",
          session.getDate(),
          "attendance"));
    }

    if (isAdmin) {
      List<User> users = departmentFilter == null
          ? userRepository.findRecentUsers(PageRequest.of(0, pageSize))
          : userRepository.findRecentUsersByDepartment(departmentFilter, PageRequest.of(0, pageSize));
      for (User user : users) {
        activities.add(new RecentActivityResponseDTO(
            "user-" + user.getId(),
            "Nouvel utilisateur: " + user.getName(),
            user.getCreatedDate(),
            "user"));
      }
    }

    activities.sort(Comparator.comparing(RecentActivityResponseDTO::getTimestamp,
        Comparator.nullsLast(Comparator.reverseOrder())));
    if (activities.size() > pageSize) {
      activities = activities.subList(0, pageSize);
    }
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("limit", pageSize);
    payload.put("departmentId", departmentFilter != null ? departmentFilter.getDepartmentId() : null);
    payload.put("total", activities.size());
    webSocketEventPublisher.publish("report.recent-activity.generated", payload);
    return ResponseEntity.ok(activities);
  }

  @GetMapping("/teachers-attendance")
  public ResponseEntity<List<TeacherAttendanceReportDTO>> getTeachersAttendance(
      @RequestParam(required = false) Integer departmentId,
      @RequestParam(required = false) Integer teacherId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
      @RequestParam(required = false) String status) {

    if (startDate == null || endDate == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startDate and endDate are required");
    }

    User currentUser = SecurityUtils.getCurrentUser();
    boolean isAdmin = hasRole(currentUser, UserRoleEnum.ADMIN);
    boolean isManager = hasRole(currentUser, UserRoleEnum.DEPARTMENT_MANAGER);

    Department department = departmentId != null ? departmentLookupService.getDepartmentById(departmentId) : null;
    User teacher = teacherId != null ? userLookupService.getUserById(teacherId) : null;

    if (!isAdmin) {
      if (isManager) {
        Department managed = departmentLookupService.getDepartmentByUserIfManager(currentUser);
        if (department != null && department.getDepartmentId() != managed.getDepartmentId()) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this department");
        }
        department = managed;
        if (teacher != null && (teacher.getDepartments() == null
            || teacher.getDepartments().stream()
                .noneMatch(dep -> dep.getDepartmentId() == managed.getDepartmentId()))) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Teacher not in your department");
        }
      } else {
        if (teacher != null && teacher.getId() != currentUser.getId()) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this teacher");
        }
        final Department checkDepartment = department;
        if (department != null && (currentUser.getDepartments() == null
            || currentUser.getDepartments().stream()
                .noneMatch(dep -> dep.getDepartmentId() == checkDepartment.getDepartmentId()))) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this department");
        }
        teacher = currentUser;
      }
    }

    LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
    LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

    List<AttendanceSession> sessions = attendanceSessionRepository.searchSessions(teacher, department, startDateTime,
        endDateTime);

    String normalizedStatus = status != null ? status.trim().toUpperCase() : null;
    if (normalizedStatus != null && !normalizedStatus.isEmpty()
        && !normalizedStatus.equals("ALL")
        && !normalizedStatus.equals("VALIDATED")
        && !normalizedStatus.equals("PENDING")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value");
    }

    List<TeacherAttendanceReportDTO> results = new ArrayList<>();
    for (AttendanceSession session : sessions) {
      boolean validated = session.isValidated();
      String sessionStatus = validated ? "VALIDATED" : "PENDING";
      if (normalizedStatus != null && !normalizedStatus.isEmpty()
          && !normalizedStatus.equals("ALL")
          && !sessionStatus.equals(normalizedStatus)) {
        continue;
      }
      String departmentName = session.getSubject() != null && session.getSubject().getDepartment() != null
          ? session.getSubject().getDepartment().getName()
          : (department != null ? department.getName() : null);
      results.add(new TeacherAttendanceReportDTO(
          session.getAttendanceSessionId(),
          session.getTeacher() != null ? session.getTeacher().getName() : null,
          departmentName,
          session.getDate(),
          session.getSubject() != null ? session.getSubject().getName() : null,
          sessionStatus));
    }

    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("departmentId", department != null ? department.getDepartmentId() : null);
    payload.put("teacherId", teacher != null ? teacher.getId() : null);
    payload.put("startDate", startDate);
    payload.put("endDate", endDate);
    payload.put("status", normalizedStatus != null ? normalizedStatus : "ALL");
    payload.put("total", results.size());
    webSocketEventPublisher.publish("report.teachers-attendance.generated", payload);
    return ResponseEntity.ok(results);
  }

  private boolean hasRole(User user, UserRoleEnum role) {
    if (user == null || user.getRoles() == null) {
      return false;
    }
    return user.getRoles().stream().anyMatch(r -> r.getRole() == role);
  }
}
