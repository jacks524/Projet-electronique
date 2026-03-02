package enspy.studam.studam_web.services.lookup;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.models.StudentCatchUpAssignment;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.repositories.AttendanceRepository;
import enspy.studam.studam_web.repositories.StudentCatchUpAssignmentRepository;
import enspy.studam.studam_web.repositories.StudentRepository;
import enspy.studam.studam_web.enumeration.AttendanceStatus;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AttendanceLookupService {
  private final AttendanceRepository attendanceRepository;
  private final StudentRepository studentRepository;
  private final StudentCatchUpAssignmentRepository studentCatchUpAssignmentRepository;

  public Attendance getAttendanceById(int attendanceId) {
    return attendanceRepository.findById(attendanceId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance not found"));
  }

  public List<Attendance> getAttendancesBySession(AttendanceSession attendanceSession) {
    List<Attendance> attendances = new ArrayList<>(attendanceRepository.findByAttendanceSession(attendanceSession));
    Class sessionClass = attendanceSession.getTimetable() != null ? attendanceSession.getTimetable().getClazz() : null;
    Subject sessionSubject = attendanceSession.getSubject();

    if (sessionClass == null || sessionSubject == null) {
      return attendances;
    }

    List<Student> eligibleStudents = getEligibleStudents(sessionClass, sessionSubject);
    for (Student student : eligibleStudents) {
      boolean alreadyPresent = attendances.stream()
          .anyMatch(attendance -> attendance.getStudent() != null
              && attendance.getStudent().getStudentId() == student.getStudentId());
      if (alreadyPresent) {
        continue;
      }

      Attendance absentAttendance = new Attendance();
      absentAttendance.setAttendanceSession(attendanceSession);
      absentAttendance.setStudent(student);
      absentAttendance.setAttendanceStatus(AttendanceStatus.ABSENT);
      absentAttendance.setPresenceLoggedAt(
          attendanceSession.getDate() != null ? attendanceSession.getDate() : java.time.LocalDateTime.now());
      absentAttendance = attendanceRepository.save(absentAttendance);
      attendances.add(absentAttendance);
    }

    return attendances;
  }

  private List<Student> getEligibleStudents(Class sessionClass, Subject sessionSubject) {
    List<Student> eligibleStudents = new ArrayList<>(studentRepository.findByClasses_ClassId(sessionClass.getClassId()));
    List<StudentCatchUpAssignment> catchUpAssignments = studentCatchUpAssignmentRepository
        .findByClazzAndSubject(sessionClass, sessionSubject);

    for (StudentCatchUpAssignment assignment : catchUpAssignments) {
      Student student = assignment.getStudent();
      if (student == null) {
        continue;
      }

      boolean alreadyIncluded = eligibleStudents.stream()
          .anyMatch(existing -> existing.getStudentId() == student.getStudentId());
      if (!alreadyIncluded) {
        eligibleStudents.add(student);
      }
    }

    return eligibleStudents;
  }

}
