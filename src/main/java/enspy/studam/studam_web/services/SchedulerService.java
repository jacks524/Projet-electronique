package enspy.studam.studam_web.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.ScheduleRequestDTO;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.ClassRepository;
import enspy.studam.studam_web.repositories.SchedulerRepository;
import enspy.studam.studam_web.services.lookup.SchedulerLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import enspy.studam.studam_web.services.lookup.TimetableLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SchedulerService {

  private final ClassRepository classRepository;
  private final SchedulerRepository schedulerRepository;
  private final SchedulerLookupService schedulerLookupService;
  private final UserService userService;
  private final UserLookupService userLookupService;
  private final SubjectLookupService subjectLookupService;
  private final TimetableLookupService timetableLookupService;
  private final WebSocketEventPublisher webSocketEventPublisher;

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
    ensureSubjectAssignedToTimetableClass(timetable, subject);

    publishScheduleEvent("schedule.created", schedule);
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
    ensureSubjectAssignedToTimetableClass(timetable, subject);

    publishScheduleEvent("schedule.updated", schedule);
    return schedule;
  }

  private void ensureSubjectAssignedToTimetableClass(Timetable timetable, Subject subject) {
    if (timetable == null || timetable.getClazz() == null || subject == null) {
      return;
    }

    Class clazz = timetable.getClazz();
    List<Subject> subjects = clazz.getSubjects();
    if (subjects == null) {
      subjects = new ArrayList<>();
      clazz.setSubjects(subjects);
    }

    boolean alreadyAssigned = subjects.stream()
        .anyMatch(existing -> existing.getSubjectId() == subject.getSubjectId());
    if (!alreadyAssigned) {
      subjects.add(subject);
      classRepository.save(clazz);
    }
  }

  private void publishScheduleEvent(String type, Schedule schedule) {
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("scheduleId", schedule.getScheduleId());
    payload.put("day", schedule.getDay());
    payload.put("startHour", schedule.getStartHour());
    payload.put("endHour", schedule.getEndHour());
    payload.put("subjectId", schedule.getSubject() != null ? schedule.getSubject().getSubjectId() : null);
    payload.put("teacherId", schedule.getTeacher() != null ? schedule.getTeacher().getId() : null);
    payload.put("timetableId", schedule.getTimetable() != null ? schedule.getTimetable().getTimetableId() : null);
    webSocketEventPublisher.publish(type, payload);
  }

  public void deleteSchedule(int id) {
    Schedule schedule = schedulerLookupService.getScheduleById(id);
    schedulerRepository.delete(schedule);
    publishScheduleEvent("schedule.deleted", schedule);
  }
}
