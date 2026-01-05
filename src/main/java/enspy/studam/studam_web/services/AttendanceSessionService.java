package enspy.studam.studam_web.services;

import java.util.List;

import org.springframework.stereotype.Service;

import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.AttendanceSessionRepository;
import enspy.studam.studam_web.services.lookup.AttendanceLookupService;
import enspy.studam.studam_web.services.lookup.AttendanceSessionLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AttendanceSessionService {
  private AttendanceSessionRepository attendanceSessionRepository;
  private UserLookupService userLookupService;
  private AttendanceLookupService attendanceLookupService;
  private AttendanceSessionLookupService attendanceSessionLookupService;

  public List<AttendanceSession> getAttendanceSessionsForTeacher(int teacherId) {
    User teacher = this.userLookupService.getUserById(teacherId);
    return this.attendanceSessionRepository.findByTeacher(teacher);
  }

  public List<Attendance> getAttendancesBySessionId(int sessionId) {
    AttendanceSession session = this.attendanceSessionLookupService.getAttendanceSessionById(sessionId);

    return this.attendanceLookupService.getAttendancesBySession(session);
    // TODO Completer la liste avec les étudiant absent
  }

}
