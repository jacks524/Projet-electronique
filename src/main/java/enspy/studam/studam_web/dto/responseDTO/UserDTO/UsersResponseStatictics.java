package enspy.studam.studam_web.dto.responseDTO.UserDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsersResponseStatictics {
  private int totalUsers;
  private int totalTeachers;
  private int totalDepartmentsManagers;
  private int totalAdmins;
}
