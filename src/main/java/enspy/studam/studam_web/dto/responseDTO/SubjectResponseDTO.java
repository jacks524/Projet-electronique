package enspy.studam.studam_web.dto.responseDTO;

import java.util.Comparator;
import java.util.List;

import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import lombok.Data;

@Data
public class SubjectResponseDTO {
  private int subjectId;

  private String name;

  private String description;

  private String code;

  private String semester;

  private int credits;

  private int heuresCoursParSemaine;

  DepartementResponseDTO department;

  UserResponseDTO teacher;

  private List<ClassResponseDTO> classes;

  private List<Integer> classIds;

  private List<String> classNames;

  public static SubjectResponseDTO toDTO(Subject subject) {
    SubjectResponseDTO dto = new SubjectResponseDTO();
    dto.setSubjectId(subject.getSubjectId());
    dto.setName(subject.getName());
    dto.setDescription(subject.getDescription());
    dto.setCode(subject.getCode());
    dto.setSemester(subject.getSemester());
    dto.setCredits(subject.getCredits());
    dto.setHeuresCoursParSemaine(subject.getHeuresCoursParSemaine());
    dto.setDepartment(DepartementResponseDTO.toDTO(subject.getDepartment()));
    User teacher = subject.getTeachers().stream().findFirst().orElse(null);
    if (teacher != null) {
      dto.setTeacher(UserResponseDTO.toDTO(teacher));
    }
    if (subject.getClasses() != null && !subject.getClasses().isEmpty()) {
      List<Class> sortedClasses = subject.getClasses().stream()
          .filter(clazz -> clazz != null)
          .sorted(Comparator.comparing(Class::getName, String.CASE_INSENSITIVE_ORDER))
          .toList();
      dto.setClasses(sortedClasses.stream()
          .map(ClassResponseDTO::toDto)
          .toList());
      dto.setClassIds(sortedClasses.stream()
          .map(Class::getClassId)
          .toList());
      dto.setClassNames(sortedClasses.stream()
          .map(Class::getName)
          .toList());
    }
    return dto;
  }
}
