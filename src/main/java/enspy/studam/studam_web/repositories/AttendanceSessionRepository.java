package enspy.studam.studam_web.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Integer> {

  List<AttendanceSession> findByTeacher(User teacher);

  @Query("""
      SELECT a FROM AttendanceSession a
      WHERE (:teacher IS NULL OR a.teacher = :teacher)
        AND (:department IS NULL OR a.subject.department = :department)
        AND (:startDate IS NULL OR a.date >= :startDate)
        AND (:endDate IS NULL OR a.date <= :endDate)
      """)
  List<AttendanceSession> searchSessions(User teacher, Department department, LocalDateTime startDate,
      LocalDateTime endDate);

  @Query("SELECT a FROM AttendanceSession a ORDER BY a.date DESC")
  List<AttendanceSession> findRecentSessions(Pageable pageable);
}
