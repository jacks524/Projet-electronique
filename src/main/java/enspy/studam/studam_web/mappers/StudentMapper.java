package enspy.studam.studam_web.mappers;

import enspy.studam.studam_web.dto.responseDTO.StudentResponseDTO;
import enspy.studam.studam_web.models.Student;

public class StudentMapper {
    public static StudentResponseDTO toDTO(Student student) {
        StudentResponseDTO dto = new StudentResponseDTO();
        dto.setStudentId(student.getStudentId());
        dto.setMatricule(student.getMatricule());
        dto.setName(student.getName());
        dto.setBirthDate(student.getBirthDate());
        dto.setBirthPlace(student.getBirthPlace());
        dto.setEmail(student.getEmail());
        dto.setPhoneNumber(student.getPhoneNumber());
        dto.setClassName(student.getClasses().getName());
        return dto;
    }
}
