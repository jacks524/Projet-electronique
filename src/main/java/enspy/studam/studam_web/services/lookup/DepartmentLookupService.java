package enspy.studam.studam_web.services.lookup;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.DepartmentRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DepartmentLookupService {
  private final DepartmentRepository departmentRepository;

  public List<Department> getAllDepartements() {
    return departmentRepository.findAll();
  }

  public Department getDepartmentById(int id) {
    return departmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
  }

  public int countDepartments() {
    return (int) departmentRepository.count();
  }

  public Department getDepartmentByUserIfManager(User user) {
    Department department = departmentRepository.getDepartmentByUserIfManager(user)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "The user is not a manager of any department"));
    return department;
  }

  @Transactional
  public Department saveDepartment(Department department) {
    return departmentRepository.save(department);
  }

  @Transactional
  public void assignDepartmentsToUser(List<Integer> departmentsIds, User user) {
    for (int departmentId : departmentsIds) {
      Department department = this.getDepartmentById(departmentId);
      department.addTeacher(user);
      departmentRepository.save(department);
    }
  }

  @Transactional
  public void updateDepartmentsForUser(List<Integer> departmentsIds, User user) {
    for (Department department : new java.util.HashSet<>(user.getDepartments())) {
      department.removeTeacher(user);
      departmentRepository.save(department);
    }
    if (departmentsIds == null || departmentsIds.isEmpty()) {
      return;
    }
    assignDepartmentsToUser(departmentsIds, user);
  }
}
