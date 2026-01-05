package enspy.studam.studam_web.dto.requestDTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DepartementRequestDTO {
  @NotNull(message = "Name must not be null")
  private String name;

  private String description;

  @NotNull(message = "Code must not be null")
  private String code;

  private Integer departmentManagerId; // Assuming this is the ID of the user who manages the department
}
