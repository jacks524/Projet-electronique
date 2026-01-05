package enspy.studam.studam_web.dto.responseDTO.departmentDTO;

import java.time.LocalDate;

import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartementResponseDetailsDTO {
  private int departmentId;
  private String name;
  private String description;
  private String code;
  private DepartmentStats stats; // Assuming you want to include statistics about the department
  private UserResponseDTO departmentManager; // Assuming this is a DTO for the user managing the department
  private LocalDate createdDate; // Assuming you want to include the date when the department was created
  private LocalDate updatedDate; // Assuming you want to include the date when the department was last updated
}
