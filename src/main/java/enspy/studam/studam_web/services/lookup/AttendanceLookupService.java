package enspy.studam.studam_web.services.lookup;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.enumeration.AttendanceStatus;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.repositories.AttendanceRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AttendanceLookupService {
  private final AttendanceRepository attendanceRepository;

  public Attendance getAttendanceById(int attendanceId) {
    return attendanceRepository.findById(attendanceId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance not found"));
  }

  public List<Attendance> getAttendancesBySession(AttendanceSession attendanceSession) {
    // Verify if attendance session is validated
    // if not validated, we need to complete the list with absent students
    if (!attendanceSession.isValidated()) {
      List<Student> students = attendanceSession.getTimetable().getClazz().getStudents();
      for (Student student : students) {
        Attendance attendance = attendanceRepository.findByAttendanceSessionAndStudent(attendanceSession, student)
            .get();
        if (attendance == null) {
          attendance = new Attendance();
          attendance.setAttendanceSession(attendanceSession);
          attendance.setStudent(student);
          attendance.setAttendanceStatus(AttendanceStatus.ABSENT);
          attendance.setPresenceLoggedAt(LocalDateTime.now());
          attendanceRepository.save(attendance);

        }
      }
    }

    ArrayList<Attendance> attendances = new ArrayList<>();
    attendances.addAll(attendanceRepository.findByAttendanceSession(attendanceSession));
    List<Student> absentStudents = attendanceSession.getTimetable().getClazz().getStudents();
    // Retirer les étudiant présent de la liste
    for (Attendance attendance : attendances) {
      absentStudents.remove(attendance.getStudent());
    }
    for (Student student : absentStudents) {
      Attendance attendance = new Attendance();
      attendance.setAttendanceSession(attendanceSession);
      attendance.setAttendanceStatus(AttendanceStatus.ABSENT);
      attendance.setStudent(student);
      attendances.add(attendance);
    }
    return attendances;
  }

}
