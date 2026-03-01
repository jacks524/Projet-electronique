package enspy.studam.studam_web.repositories;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Timetable;

@Repository
public interface SchedulerRepository extends JpaRepository<Schedule, Integer> {

  @Query("SELECT DISTINCT s FROM Schedule s WHERE s.day = :dayOfWeek AND :time >= s.startHour AND :time <= s.endHour AND s.subject IN :subjects")
  List<Schedule> findScheduleByDayTimeAndSubjects(
      @Param("dayOfWeek") DayOfWeek dayOfWeek,
      @Param("time") LocalTime time,
      @Param("subjects") List<Subject> subjects);

  List<Schedule> findByTeacher(User teacher);

  List<Schedule> findByTeacherAndTimetable(User teacher, Timetable timetable);

  List<Schedule> findByTeacherAndTimetableAndSubject(User teacher, Timetable timetable, Subject subject);

  List<Schedule> findByTimetable(Timetable timetable);

  @Query("SELECT s FROM Schedule s JOIN s.timetable t WHERE t.clazz = :clazz")
  List<Schedule> findByClass(Class clazz);
}
