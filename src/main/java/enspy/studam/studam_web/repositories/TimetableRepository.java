package enspy.studam.studam_web.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.User;

public interface TimetableRepository extends JpaRepository<Timetable, Integer> {

  @Query("SELECT t FROM Timetable t WHERE t.startDate <= :date AND t.endDate >= :date")
  Optional<Timetable> findTimetableContainsDate(LocalDate date);

  @Query("SELECT t FROM Timetable t JOIN t.schedules s WHERE s.teacher = :teacher")
  List<Timetable> findTeacherTimetable(User teacher);

}
