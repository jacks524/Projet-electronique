package enspy.studam.studam_web.dto.responseDTO;

import java.time.LocalDateTime;
import java.util.List;

import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.UserRole;
import lombok.Data;

@Data
public class UserResponseDTO {
  private int id;
  private String name;
  private String email;
  private String phoneNumber;
  private String username;
  private String matricule;
  private List<UserRole> roles;

  private List<String> departmentsNames;
  private LocalDateTime lastConnection;

  public static UserResponseDTO toDTO(User user) {
    UserResponseDTO dto = new UserResponseDTO();
    dto.setId(user.getId());
    dto.setName(user.getName());
    dto.setEmail(user.getEmail());
    dto.setPhoneNumber(user.getPhoneNumber());
    dto.setUsername(user.getUsername());
    dto.setRoles(user.getRoles());
    dto.setMatricule(user.getMatricule());
    dto.setDepartmentsNames(user.getDepartments().stream()
        .map(department -> department.getName())
        .toList());
    dto.setLastConnection(user.getLastConnection());

    return dto;
  }
}
