package enspy.studam.studam_web.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.AttendanceLaunchRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.RemoteAttendanceLaunchResponseDTO;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.services.lookup.SchedulerLookupService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RemoteAttendanceLaunchService {
  private final SchedulerLookupService schedulerLookupService;
  private final AtomicLong launchIdSequence = new AtomicLong(1);

  private RemoteAttendanceLaunchResponseDTO pendingLaunch;

  public synchronized RemoteAttendanceLaunchResponseDTO createLaunchOrder(
      AttendanceLaunchRequestDTO request,
      User currentUser) {
    if (request == null || request.getScheduleId() <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid scheduleId is required");
    }

    Schedule schedule = schedulerLookupService.getScheduleById(request.getScheduleId());
    User teacher = schedule.getTeacher();
    if (teacher == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected schedule has no teacher");
    }

    if (currentUser == null || teacher.getId() != currentUser.getId()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only launch your own attendance call");
    }

    String subjectName = schedule.getSubject() != null ? schedule.getSubject().getName() : null;
    if (subjectName == null || subjectName.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected schedule has no subject");
    }

    String semester = schedule.getTimetable() != null ? schedule.getTimetable().getSemester()
        : (schedule.getSubject() != null ? schedule.getSubject().getSemester() : null);
    if (semester == null || semester.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected schedule has no semester");
    }

    LocalDate requestedDate = request.getDate() != null ? request.getDate() : LocalDate.now();
    String className = schedule.getTimetable() != null && schedule.getTimetable().getClazz() != null
        ? schedule.getTimetable().getClazz().getName()
        : null;
    String source = request.getSource() != null && !request.getSource().isBlank() ? request.getSource() : "WEB_APP";

    pendingLaunch = new RemoteAttendanceLaunchResponseDTO(
        launchIdSequence.getAndIncrement(),
        schedule.getScheduleId(),
        requestedDate,
        teacher.getMatricule(),
        teacher.getName(),
        subjectName,
        semester,
        className,
        source,
        LocalDateTime.now(),
        false);

    return pendingLaunch;
  }

  public synchronized RemoteAttendanceLaunchResponseDTO consumePendingLaunch() {
    if (pendingLaunch == null) {
      return null;
    }

    RemoteAttendanceLaunchResponseDTO response = pendingLaunch;
    response.setConsumed(true);
    pendingLaunch = null;
    return response;
  }
}
