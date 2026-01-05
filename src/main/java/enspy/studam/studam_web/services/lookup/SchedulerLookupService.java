package enspy.studam.studam_web.services.lookup;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.repositories.SchedulerRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SchedulerLookupService {
  private final SchedulerRepository schedulerRepository;

  public Schedule getScheduleById(int id) {
    return this.schedulerRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
  }

  public List<Schedule> getSchedulesByTeacherAndTimeTable(User teacher, Timetable timetable) {
    return this.schedulerRepository.findByTeacherAndTimetable(teacher, timetable);
  }

  public List<Schedule> getSchedulesByTeacher(User teacher) {
    return this.schedulerRepository.findByTeacher(teacher);
  }

  public List<Schedule> getSchedulesByClass(Class clazz) {
    return this.schedulerRepository.findByClass(clazz);
  }
}
