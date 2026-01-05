package enspy.studam.studam_web.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {
  boolean existsByCode(String code);

  @Query("SELECT d FROM Department d WHERE d.departmentManager = :user")
  Optional<Department> getDepartmentByUserIfManager(User user);
}
