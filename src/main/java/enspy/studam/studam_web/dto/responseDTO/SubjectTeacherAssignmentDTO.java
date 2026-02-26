package enspy.studam.studam_web.dto.responseDTO;

import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import lombok.Data;

@Data
public class SubjectTeacherAssignmentDTO {
  private int subjectId;
  private String subjectName;
  private String semester;
  private int teacherId;
  private String teacherName;
  private String teacherMatricule;

  public static SubjectTeacherAssignmentDTO from(Subject subject, User teacher) {
    SubjectTeacherAssignmentDTO dto = new SubjectTeacherAssignmentDTO();
    dto.setSubjectId(subject.getSubjectId());
    dto.setSubjectName(subject.getName());
    dto.setSemester(subject.getSemester());
    dto.setTeacherId(teacher.getId());
    dto.setTeacherName(teacher.getName());
    dto.setTeacherMatricule(teacher.getMatricule());
    return dto;
  }
}
