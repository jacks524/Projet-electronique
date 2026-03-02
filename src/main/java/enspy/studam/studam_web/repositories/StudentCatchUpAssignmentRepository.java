package enspy.studam.studam_web.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.models.StudentCatchUpAssignment;
import enspy.studam.studam_web.models.Subject;

@Repository
public interface StudentCatchUpAssignmentRepository extends JpaRepository<StudentCatchUpAssignment, Integer> {
  List<StudentCatchUpAssignment> findByStudent(Student student);

  void deleteByStudent(Student student);

  List<StudentCatchUpAssignment> findByClazzAndSubject(Class clazz, Subject subject);
}
