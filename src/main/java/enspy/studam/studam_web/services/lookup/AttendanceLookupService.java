package enspy.studam.studam_web.services.lookup;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
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
    return attendanceRepository.findByAttendanceSession(attendanceSession);
  }

}
