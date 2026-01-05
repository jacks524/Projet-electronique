package enspy.studam.studam_web.dto.responseDTO.departmentDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DepartementResponsePreviewsDTO extends DepartementResponseDTO {

  private UserResponseDTO departmentManager; // Assuming this is a DTO for the user managing the department

  private DepartmentStats stats; // Assuming you want to include statistics about the department

  public static DepartementResponsePreviewsDTO toDTO(Department department,
      UserResponseDTO departmentManager,
      DepartmentStats stats) {
    DepartementResponsePreviewsDTO dto = new DepartementResponsePreviewsDTO();
    dto.setDepartmentId(department.getDepartmentId());
    dto.setName(department.getName());
    dto.setDescription(department.getDescription());
    dto.setCode(department.getCode());
    dto.setDepartmentManager(departmentManager);
    dto.setStats(stats);
    return dto;
  }
}
