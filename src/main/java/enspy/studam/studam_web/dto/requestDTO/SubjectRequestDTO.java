package enspy.studam.studam_web.dto.requestDTO;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SubjectRequestDTO {

  @NotBlank(message = "Name is required")
  private String name;

  @NotBlank(message = "Description is required")
  private String description;

  @NotBlank(message = "Code is required")
  private String code;

  @NotBlank(message = "Semester is required")
  @Pattern(regexp = "^(?i)(S1|S2)$", message = "Semester must be S1 or S2")
  private String semester;

  private Integer credits;

  private Integer heuresCoursParSemaine;

  @NotNull(message = "Department ID is required")
  private int departmentId;

  private Integer teacherId;

  private List<Integer> classes;

  private Integer classId;
}
