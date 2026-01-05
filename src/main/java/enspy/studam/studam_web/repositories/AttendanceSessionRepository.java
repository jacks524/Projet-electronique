package enspy.studam.studam_web.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.User;

import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Integer> {

  List<AttendanceSession> findByTeacher(User teacher);
}
