package enspy.studam.studam_web.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Subject;
import java.util.List;
import java.util.Optional;
import enspy.studam.studam_web.models.User;
import java.util.Set;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {

  List<Subject> findByDepartment(Department department);

  List<Subject> findByTeachers(List<User> teachers);

  Optional<Subject> findByNameIgnoreCase(String name);

  boolean existsBySubjectIdAndTeachers(int id, Set<User> teachers);
}
