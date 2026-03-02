package enspy.studam.studam_web.mappers;

import enspy.studam.studam_web.dto.responseDTO.StudentResponseDTO;
import enspy.studam.studam_web.models.Student;

public class StudentMapper {
    public static StudentResponseDTO toDTO(Student student) {
        return StudentResponseDTO.toDto(student);
    }
}
