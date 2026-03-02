package enspy.studam.studam_web.dto.requestDTO;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class StudentCatchUpAssignmentRequestDTO {
  private Integer classId;

  private String className;

  @NotEmpty(message = "At least one subject must be provided for a catch-up assignment")
  private List<Integer> subjectIds;
}
