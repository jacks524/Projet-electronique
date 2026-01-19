package enspy.studam.studam_web.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
  User findByUsername(String username);

  List<User> findByUsernameContainingIgnoreCase(String username);

  List<User> findByNameContainingIgnoreCase(String name);

  List<User> findByEmailContainingIgnoreCase(String email);

  List<User> findByMatriculeContainingIgnoreCase(String matricule);

  List<User> findByPhoneNumberContainingIgnoreCase(String phoneNumber);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  boolean existsByPhoneNumber(String phoneNumber);

  boolean existsByMatricule(String matricule);

  @Query("SELECT u FROM User u JOIN u.roles r JOIN u.departments d WHERE r.role = :role AND d = :department")
  List<User> getUsersByRoleAndDepartment(UserRoleEnum role, Department department);

  Optional<User> findByMatricule(String matricule);

  Optional<User> findByEmail(String email);

  @Query("SELECT u FROM User u JOIN u.roles r WHERE r.role = :roles")
  List<User> findByRoles(UserRoleEnum roles);

  long countByRoles(List<UserRole> roles);

  @Query("SELECT COUNT(DISTINCT u.id) FROM User u JOIN u.roles r WHERE r.role = :role")
  long countByUserRoleEnum(UserRoleEnum role);

  @Query("SELECT u FROM User u WHERE u.createdDate IS NOT NULL ORDER BY u.createdDate DESC")
  List<User> findRecentUsers(Pageable pageable);

  @Query("SELECT DISTINCT u FROM User u JOIN u.departments d WHERE d = :department AND u.createdDate IS NOT NULL ORDER BY u.createdDate DESC")
  List<User> findRecentUsersByDepartment(Department department, Pageable pageable);
}
