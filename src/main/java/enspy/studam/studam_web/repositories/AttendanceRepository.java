package enspy.studam.studam_web.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Student;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

  List<Attendance> findByAttendanceSession(AttendanceSession attendanceSession);

  Page<Attendance> findByStudent(Student student, Pageable pageable);

  Optional<Attendance> findByAttendanceSessionAndStudent(AttendanceSession attendanceSession, Student student);
}
