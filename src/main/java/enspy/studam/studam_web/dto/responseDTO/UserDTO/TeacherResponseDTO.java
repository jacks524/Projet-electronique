package enspy.studam.studam_web.dto.responseDTO.UserDTO;

import java.util.List;
import java.util.Set;

import enspy.studam.studam_web.dto.responseDTO.SubjectResponseDTO;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.UserRole;
import lombok.Data;

@Data
public class TeacherResponseDTO {
  private int id;
  private String name;
  private String email;
  private String phoneNumber;
  private String username;
  private String matricule;
  private boolean active;
  private List<SubjectResponseDTO> subjects; // Assuming subjects are represented as a list of strings
  private int classCount; // Number of classes the teacher is assigned to
  private int studentCount; // Total number of students in all classes

  public static TeacherResponseDTO toDTO(User user, Set<Subject> subjects) {
    TeacherResponseDTO dto = new TeacherResponseDTO();
    dto.setId(user.getId());
    dto.setName(user.getName());
    dto.setEmail(user.getEmail());
    dto.setPhoneNumber(user.getPhoneNumber());
    dto.setUsername(user.getUsername());
    dto.setMatricule(user.getMatricule());
    dto.setActive(user.isActive());
    dto.setSubjects(subjects.stream()
        .map(SubjectResponseDTO::toDTO)
        .toList()); // Convert each Subject to SubjectResponseDTO
    return dto;
  }
}
