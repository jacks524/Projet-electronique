package enspy.studam.studam_web.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.Class;

@Repository
public interface ClassRepository extends JpaRepository<Class, Integer> {

    List<Class> findByDepartmentDepartmentId(int departmentId);

    List<Class> findByNameContainingIgnoreCase(String name);

    boolean existsByName(String name);

    Optional<Class> findByName(String name);

}