package enspy.studam.studam_web.dto.responseDTO;

import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import lombok.Data;

@Data
public class SubjectResponseDTO {
  private int subjectId;

  private String name;

  private String description;

  private String code;

  private int credits;

  private int heuresCoursParSemaine;

  DepartementResponseDTO department;

  UserResponseDTO teacher;

  public static SubjectResponseDTO toDTO(Subject subject) {
    SubjectResponseDTO dto = new SubjectResponseDTO();
    dto.setSubjectId(subject.getSubjectId());
    dto.setName(subject.getName());
    dto.setDescription(subject.getDescription());
    dto.setCode(subject.getCode());
    dto.setCredits(subject.getCredits());
    dto.setHeuresCoursParSemaine(subject.getHeuresCoursParSemaine());
    dto.setDepartment(DepartementResponseDTO.toDTO(subject.getDepartment()));
    User teacher = subject.getTeachers().stream().findFirst().orElse(null);
    if (teacher != null) {
      dto.setTeacher(UserResponseDTO.toDTO(teacher));
    }
    return dto;
  }
}
