package enspy.studam.studam_web.dto.requestDTO;

import java.util.List;

import enspy.studam.studam_web.enumeration.UserRoleEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {

  @NotNull(message = "Name must be not null")
  String name;

  @NotNull(message = "Email must be not null")
  String email;

  @NotNull(message = "Password must be not null")
  @NotBlank(message = "Password must br not blank")
  String password;

  @NotNull(message = "phoneNumber must be not null")
  @Size(min = 9, max = 12)
  String phoneNumber;

  @NotNull(message = "username must be not null")
  String username;

  @NotNull(message = "role must be not null")
  UserRoleEnum role;

  @NotNull(message = "matricule must be not null")
  String matricule;

  List<Integer> departmentsIds;

  List<Integer> subjectIds;

  Boolean active;
}
