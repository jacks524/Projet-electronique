package enspy.studam.studam_web.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.ScheduleRequestDTO;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.SchedulerRepository;
import enspy.studam.studam_web.services.lookup.SchedulerLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import enspy.studam.studam_web.services.lookup.TimetableLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SchedulerService {

  private final SchedulerRepository schedulerRepository;
  private final SchedulerLookupService schedulerLookupService;
  private final UserService userService;
  private final UserLookupService userLookupService;
  private final SubjectLookupService subjectLookupService;
  private final TimetableLookupService timetableLookupService;

  public Schedule getScheduleByDateAndSubjectList(LocalDateTime dateTime, List<Subject> subjects) {
    List<Schedule> schedules = schedulerRepository.findScheduleByDayTimeAndSubjects(
        dateTime.getDayOfWeek(),
        dateTime.toLocalTime(),
        subjects);

    if (schedules.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "No schedule found for the given date, time, and subjects.");
    }

    if (schedules.size() > 1) {
      // Ce cas peut indiquer un problème de données (ex: des cours qui se chevauchent
      // pour le même prof).
      // Pour l'instant, on lève une erreur pour signaler cette ambiguïté.
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Multiple schedules found, ambiguous situation. Please check schedule data.");
    }
    return schedules.get(0);
  }

  @Transactional
  public Schedule createSchedule(ScheduleRequestDTO entity) {
    User teacher = userLookupService.getUserById(entity.getTeacherId());
    Subject subject = subjectLookupService.getSubjectById(entity.getSubjectId());
    Timetable timetable = this.timetableLookupService.getTimetableById(entity.getTimetableId());

    Schedule schedule = new Schedule();
    schedule.setDay(entity.getDay());
    schedule.setStartHour(entity.getStartHour());
    schedule.setEndHour(entity.getEndHour());
    schedule.setSubject(subject);
    schedule.setTeacher(teacher);
    schedule.setTimetable(timetable);
    schedule = schedulerRepository.save(schedule);

    this.userService.assignTeacherToSubject(entity.getSubjectId(), entity.getTeacherId());

    return schedule;
  }

  public Schedule updateSchedule(int id, ScheduleRequestDTO entity) {
    Schedule schedule = schedulerLookupService.getScheduleById(id);
    User teacher = userLookupService.getUserById(entity.getTeacherId());
    Subject subject = subjectLookupService.getSubjectById(entity.getSubjectId());
    Timetable timetable = this.timetableLookupService.getTimetableById(entity.getTimetableId());

    schedule.setDay(entity.getDay());
    schedule.setStartHour(entity.getStartHour());
    schedule.setEndHour(entity.getEndHour());
    schedule.setSubject(subject);
    schedule.setTeacher(teacher);
    schedule.setTimetable(timetable);
    schedule = schedulerRepository.save(schedule);

    this.userService.assignTeacherToSubject(entity.getSubjectId(), entity.getTeacherId());

    return schedule;
  }
}
