package enspy.studam.studam_web.dto.responseDTO;

import lombok.Data;
import java.sql.Date;

@Data
public class StudentResponseDTO {
    private int studentId;
    private String matricule;
    private String name;
    private Date birthDate;
    private String birthPlace;
    private String email;
    private String phoneNumber;
    private Integer classId;
    private String className;

    public static StudentResponseDTO toDto(enspy.studam.studam_web.models.Student student) {
        StudentResponseDTO dto = new StudentResponseDTO();
        dto.setStudentId(student.getStudentId());
        dto.setMatricule(student.getMatricule());
        dto.setName(student.getName());
        dto.setBirthDate(student.getBirthDate());
        dto.setBirthPlace(student.getBirthPlace());
        dto.setEmail(student.getEmail());
        dto.setPhoneNumber(student.getPhoneNumber());
        if (student.getClasses() != null) {
            dto.setClassName(student.getClasses().getName());
            dto.setClassId(student.getClasses().getClassId());
        }
        return dto;
    }
}