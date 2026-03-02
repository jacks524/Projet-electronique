package enspy.studam.studam_web.dto.responseDTO;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class StudentCatchUpAssignmentResponseDTO {
  private Integer classId;
  private String className;
  private List<Integer> subjectIds = new ArrayList<>();
  private List<String> subjectNames = new ArrayList<>();
}
