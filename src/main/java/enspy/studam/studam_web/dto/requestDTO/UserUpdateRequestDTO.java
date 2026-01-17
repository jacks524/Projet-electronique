package enspy.studam.studam_web.dto.requestDTO;

import java.util.List;

import enspy.studam.studam_web.enumeration.UserRoleEnum;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequestDTO {
  @NotNull(message = "Name must be not null")
  String name;

  @NotNull(message = "Email must be not null")
  String email;

  @NotNull(message = "phoneNumber must be not null")
  @Size(min = 9, max = 12)
  String phoneNumber;

  @NotNull(message = "username must be not null")
  String username;

  @NotNull(message = "matricule must be not null")
  String matricule;

  UserRoleEnum role;

  List<Integer> departmentsIds;

  Boolean active;
}
