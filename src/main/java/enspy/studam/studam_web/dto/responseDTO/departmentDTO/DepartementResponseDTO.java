package enspy.studam.studam_web.dto.responseDTO.departmentDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartmentStats;
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
public class DepartementResponseDTO {
  protected int departmentId;
  protected String name;
  protected String description;
  protected String code;

  public static DepartementResponseDTO toDTO(Department department) {
    DepartementResponseDTO dto = new DepartementResponseDTO();
    dto.setDepartmentId(department.getDepartmentId());
    dto.setName(department.getName());
    dto.setDescription(department.getDescription());
    dto.setCode(department.getCode());
    return dto;
  }
}
