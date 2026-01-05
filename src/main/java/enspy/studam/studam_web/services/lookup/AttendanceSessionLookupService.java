package enspy.studam.studam_web.services.lookup;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.repositories.AttendanceSessionRepository;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class AttendanceSessionLookupService {
  private final AttendanceSessionRepository attendanceSessionRepository;

  public AttendanceSession getAttendanceSessionById(int sessionId) {
    return attendanceSessionRepository.findById(sessionId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance session not found"));
  }

}
