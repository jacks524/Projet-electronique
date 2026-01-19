package enspy.studam.studam_web.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.DepartementRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDetailsDTO;
import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponsePreviewsDTO;
import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartmentStats;
import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.DepartmentRepository;
import enspy.studam.studam_web.services.lookup.DepartmentLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DepartmentService {

  private final DepartmentRepository departementRepository;
  private final DepartmentLookupService departmentLookupService;
  private final UserLookupService userLookupService;
  private final WebSocketEventPublisher webSocketEventPublisher;

  @Transactional
  public DepartementResponseDTO createDepartement(DepartementRequestDTO departementRequestDTO) {

    // Validate if code is unique
    if (departementRepository.existsByCode(departementRequestDTO.getCode())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Department code must be unique");
    }

    Department department = new Department();

    department.setName(departementRequestDTO.getName());
    department.setCode(departementRequestDTO.getCode());
    department.setDescription(departementRequestDTO.getDescription());
    department.setCreatedDate(LocalDate.now());
    department.setUpdatedDate(LocalDate.now());

    department = departementRepository.save(department);

    if (departementRequestDTO.getDepartmentManagerId() == null) {
      publishDepartmentEvent("department.created", department);
      return DepartementResponseDTO.toDTO(department);
    }
    // Validate if user exists
    User user = userLookupService.getUserById(departementRequestDTO.getDepartmentManagerId());

    // Validate if user in not already a manager of another department
    if (user.getAuthorities().contains("ROLE_DEPARTMENT_MANAGER")) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "User is already a manager of another department");
    }
    // Assign the user as the department manager
    department.addTeacher(user);
    department.setDepartmentManager(user);
    department = departementRepository.save(department);

    user = this.userLookupService.UpdateUserRoles(user, UserRoleEnum.DEPARTMENT_MANAGER);

    publishDepartmentEvent("department.created", department);
    publishDepartmentManagerAssigned(department, user);
    return DepartementResponseDTO.toDTO(department);
  }

  public List<DepartementResponsePreviewsDTO> getAllDepartements() {
    List<Department> departements = departmentLookupService.getAllDepartements();
    ArrayList<DepartementResponsePreviewsDTO> responseList = new ArrayList<>();
    for (Department department : departements) {
      DepartmentStats stats = this.getDepartmentStats(department); // Populate this with actual stats if needed
      User manager = department.getDepartmentManager();
      UserResponseDTO managerDTO = null;
      if (manager != null) {
        managerDTO = manager.toUserResponseDTO();
      }
      DepartementResponsePreviewsDTO dto = DepartementResponsePreviewsDTO.toDTO(department, managerDTO, stats);
      responseList.add(dto);
    }

    return responseList;

  }

  @Transactional
  public DepartementResponseDTO updateDepartement(int id, DepartementRequestDTO departementRequestDTO) {
    Department department = departmentLookupService.getDepartmentById(id);

    // Mise à jour des informations de base du département
    department.setName(departementRequestDTO.getName());
    department.setCode(departementRequestDTO.getCode());
    department.setDescription(departementRequestDTO.getDescription());
    department.setUpdatedDate(LocalDate.now());

    // Logique de mise à jour du chef de département
    updateDepartmentManager(department, departementRequestDTO.getDepartmentManagerId());

    Department updatedDepartment = departementRepository.save(department);
    publishDepartmentEvent("department.updated", updatedDepartment);
    return DepartementResponseDTO.toDTO(updatedDepartment);
  }

  private void updateDepartmentManager(Department department, Integer newManagerId) {
    User currentManager = department.getDepartmentManager();

    // Cas 1: Le nouveau manager est le même que l'actuel, ou aucun changement n'est
    // demandé.
    if (newManagerId != null && currentManager != null && newManagerId.equals(currentManager.getId())) {
      return; // Pas de changement
    }

    // Cas 2: Il y a un manager actuel, il faut potentiellement lui retirer son
    // rôle.
    if (currentManager != null) {
      // On lui assigne le rôle d'enseignant standard
      this.userLookupService.UpdateUserRoles(currentManager, UserRoleEnum.TEACHER);
      department.setDepartmentManager(null);
    }

    // Cas 3: Un nouveau manager est assigné.
    if (newManagerId != null) {
      User newManager = userLookupService.getUserById(newManagerId);

      // Vérifier si le nouvel utilisateur est déjà manager d'un autre département
      boolean isAlreadyManager = newManager.getRoles().stream()
          .anyMatch(role -> role.getRole() == UserRoleEnum.DEPARTMENT_MANAGER);
      if (isAlreadyManager) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "This user is already a manager of another department.");
      }

      // Assigner le nouveau rôle et ajouter l'utilisateur au département si
      // nécessaire
      department.setDepartmentManager(newManager);
      department.addTeacher(newManager); // addTeacher gère l'ajout s'il n'est pas déjà présent
      userLookupService.UpdateUserRoles(newManager, UserRoleEnum.DEPARTMENT_MANAGER);
      this.departementRepository.save(department);
      publishDepartmentManagerAssigned(department, newManager);
    }
  }

  public void deleteDepartment(int id) {
    Department department = departmentLookupService.getDepartmentById(id);
    // TODO Remettre l'enseignant qui est chef de departement dans son role normal
    departementRepository.delete(department);
    publishDepartmentEvent("department.deleted", department);
  }

  public DepartementResponseDetailsDTO getDepartmentDetailsById(int id) {
    Department department = departmentLookupService.getDepartmentById(id);

    DepartementResponseDetailsDTO responseDTO = new DepartementResponseDetailsDTO();
    responseDTO.setDepartmentId(department.getDepartmentId());
    responseDTO.setName(department.getName());
    responseDTO.setDescription(department.getDescription());
    responseDTO.setCode(department.getCode());
    responseDTO.setCreatedDate(department.getCreatedDate());
    responseDTO.setUpdatedDate(department.getUpdatedDate());

    // Assuming you want to include statistics about the department
    responseDTO.setStats(this.getDepartmentStats(department)); // Populate this with actual stats if needed

    User manager = department.getDepartmentManager();
    if (manager == null) {
      responseDTO.setDepartmentManager(null);
    } else {
      responseDTO.setDepartmentManager(manager.toUserResponseDTO());
    }

    return responseDTO;
  }

  private DepartmentStats getDepartmentStats(Department department) {
    DepartmentStats stats = new DepartmentStats();
    stats.setTotalClasses(department.getClasses().size());
    stats.setTotalStudents(department.getClasses()
        .stream()
        .mapToInt(c -> c.getStudents().size())
        .sum());
    stats.setTotalTeachers(department.getTeachers().size());
    stats.setAttendanceRate(0); // TODO: Calculate actual attendance rate if needed
    return stats;
  }

  private void publishDepartmentEvent(String type, Department department) {
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("departmentId", department.getDepartmentId());
    payload.put("name", department.getName());
    payload.put("code", department.getCode());
    payload.put("updatedDate", department.getUpdatedDate());
    webSocketEventPublisher.publish(type, payload);
  }

  private void publishDepartmentManagerAssigned(Department department, User manager) {
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("departmentId", department.getDepartmentId());
    payload.put("departmentName", department.getName());
    payload.put("managerId", manager.getId());
    payload.put("managerName", manager.getName());
    webSocketEventPublisher.publish("department.manager.assigned", payload);
  }
}
