package enspy.studam.studam_web.dto.responseDTO.publicDTO;

import lombok.Data;

@Data
public class PublicStudentAttendanceStudentDTO {
  private int studentId;
  private String matricule;
  private String name;
  private String className;
  private String departmentName;
}
