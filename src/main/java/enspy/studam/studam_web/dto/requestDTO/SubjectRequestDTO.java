package enspy.studam.studam_web.dto.requestDTO;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubjectRequestDTO {

  @NotNull(message = "Name is required")
  private String name;

  @NotNull(message = "Description is required")
  private String description;

  @NotNull(message = "Code is required")
  private String code;

  private Integer credits;

  private Integer heuresCoursParSemaine;

  @NotNull(message = "Department ID is required")
  private int departmentId;

  private Integer teacherId;

  private List<Integer> classes;
}
