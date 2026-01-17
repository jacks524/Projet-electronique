package enspy.studam.studam_web.services;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.UserDTO.TeacherResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.UserDTO.UsersResponseStatictics;
import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.DepartmentRepository;
import enspy.studam.studam_web.repositories.UserRepository;
import enspy.studam.studam_web.services.lookup.DepartmentLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {

  private final DepartmentRepository departmentRepository;

  private UserRepository userRepository;
  private UserLookupService userLookupService;
  private SubjectLookupService subjectLookupService;
  private DepartmentLookupService departmentLookupService;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return (UserDetails) this.userRepository.findByUsername(username);
  }

  @Transactional
  public Set<Subject> assignTeacherToSubject(int subjectId, int teacherId) {
    Subject subject = this.subjectLookupService.getSubjectById(subjectId);
    User teacher = this.userLookupService.getUserById(teacherId);

    boolean alreadyExists = this.subjectLookupService.isTeacherAssignToSubject(teacher, subject);

    if (alreadyExists) {
      return teacher.getSubjects();
    }

    teacher.addSubject(subject);
    this.userRepository.save(teacher);

    return teacher.getSubjects();
  }

  public List<TeacherResponseDTO> getUsersByRoleAndDepartment(UserRoleEnum role, int departmentId) {
    Department department = this.departmentLookupService.getDepartmentById(departmentId);
    List<User> users = this.userRepository.getUsersByRoleAndDepartment(role, department);

    if (users.isEmpty() && role == UserRoleEnum.DEPARTMENT_MANAGER) {
      User manager = department.getDepartmentManager();
      if (manager != null) {
        department.addTeacher(manager);
        department = this.departmentLookupService.saveDepartment(department);
        users = List.of(manager);
      }
    }
    if (role == UserRoleEnum.DEPARTMENT_MANAGER && users.size() == 1 && department.getDepartmentManager() == null) {
      department.setDepartmentManager(users.get(0));
      this.departmentLookupService.saveDepartment(department);
    }

    return users.stream().map(user -> {
      return TeacherResponseDTO.toDTO(user, user.getSubjects());
    }).toList();
  }

  public Page<UserResponseDTO> getAllUsers(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<User> userPage = userRepository.findAll(pageable);

    return userPage.map(UserResponseDTO::toDTO);
  }

  public List<UserResponseDTO> searchUsers(String searchTerm, String searchType) {
    List<User> users;
    switch (searchType.toLowerCase()) {
      case "username":
        users = userRepository.findByUsernameContainingIgnoreCase(searchTerm);
        break;
      case "name":
        users = userRepository.findByNameContainingIgnoreCase(searchTerm);
        break;
      case "email":
        users = userRepository.findByEmailContainingIgnoreCase(searchTerm);
        break;
      case "matricule":
        users = userRepository.findByMatriculeContainingIgnoreCase(searchTerm);
        break;
      case "phone":
        users = userRepository.findByPhoneNumberContainingIgnoreCase(searchTerm);
        break;
      default:
        throw new IllegalArgumentException(
            "Invalid search type: " + searchType + ". Valid types are: username, email, matricule, phone");
    }
    return users.stream()
        .map(UserResponseDTO::toDTO)
        .toList();
  }

  public UsersResponseStatictics getUserStatistics() {
    int totalUsers = this.userLookupService.countAllUsers();
    int totalTeachers = this.userLookupService.countUsersByRole(UserRoleEnum.TEACHER);
    int totalDepartmentsManagers = this.userLookupService.countUsersByRole(UserRoleEnum.DEPARTMENT_MANAGER);
    int totalAdmins = this.userLookupService.countUsersByRole(UserRoleEnum.ADMIN);
    return new UsersResponseStatictics(totalUsers, totalTeachers, totalDepartmentsManagers, totalAdmins);
  }

  public User removeSubjetToTeacher(int teacherId, int subjectId) {
    Subject subject = this.subjectLookupService.getSubjectById(subjectId);
    User teacher = this.userLookupService.getUserById(teacherId);

    boolean alreadyExists = this.subjectLookupService.isTeacherAssignToSubject(teacher, subject);
    if (alreadyExists) {
      return teacher;
    }

    teacher.removeSubject(subject);
    teacher = this.userRepository.save(teacher);
    return teacher;
  }

  public List<UserResponseDTO> getEligibleChiefs() {
    List<User> chiefs = this.userLookupService.getUserByRole(UserRoleEnum.TEACHER);
    return chiefs.stream().map(UserResponseDTO::toDTO).toList();
  }

  public void assignUserToDepartments(int teacherId, List<Integer> departments) {
    User teacher = this.userLookupService.getUserById(teacherId);
    this.departmentLookupService.assignDepartmentsToUser(departments, teacher);
  }

}
