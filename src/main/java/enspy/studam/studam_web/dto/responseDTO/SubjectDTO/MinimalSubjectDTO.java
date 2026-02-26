package enspy.studam.studam_web.dto.responseDTO.SubjectDTO;

import lombok.Data;

@Data
public class MinimalSubjectDTO {
  private int subjectId;
  private String name;
  private String description;
  private String code;
  private String semester;

  public static MinimalSubjectDTO toDTO(enspy.studam.studam_web.models.Subject subject) {
    MinimalSubjectDTO dto = new MinimalSubjectDTO();
    dto.setSubjectId(subject.getSubjectId());
    dto.setName(subject.getName());
    dto.setDescription(subject.getDescription());
    dto.setCode(subject.getCode());
    dto.setSemester(subject.getSemester());
    return dto;
  }
}
