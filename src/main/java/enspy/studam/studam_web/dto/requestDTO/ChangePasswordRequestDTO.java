package enspy.studam.studam_web.dto.requestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangePasswordRequestDTO {

  @NotNull(message = "Old password must not be null")
  @NotBlank(message = "Old password must not be blank")
  private String oldPassword;

  @NotNull(message = "New password must not be null")
  @NotBlank(message = "New password must not be blank")
  private String newPassword;
}