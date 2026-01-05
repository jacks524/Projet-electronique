package enspy.studam.studam_web.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.Student;

import java.util.List;
import java.util.Optional;
import enspy.studam.studam_web.models.Class;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByNameContainingIgnoreCase(String name);

    List<Student> findByClasses_ClassId(int classId);

    Page<Student> findByClasses(Class classes, Pageable pageable);

    Optional<Student> findByMatricule(String matricule);

    boolean existsByMatricule(String matricule);
}
