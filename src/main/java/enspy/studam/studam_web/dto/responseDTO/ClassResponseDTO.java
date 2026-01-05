package enspy.studam.studam_web.dto.responseDTO;

import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDTO;
import enspy.studam.studam_web.models.Class;
import lombok.Data;

@Data
public class ClassResponseDTO {
    private int classId;
    private String name;
    private int studentNumber;
    private String code;
    private String description;
    private DepartementResponseDTO departementResponseDTO;

    public static ClassResponseDTO toDto(Class classe) {
        ClassResponseDTO departementResponseDTO = new ClassResponseDTO();
        departementResponseDTO.setClassId(classe.getClassId());
        departementResponseDTO.setDepartementResponseDTO(DepartementResponseDTO.toDTO(classe.getDepartment()));
        departementResponseDTO.setName(classe.getName());
        departementResponseDTO.setStudentNumber(classe.getStudentNumber());
        departementResponseDTO.setCode(classe.getCode());
        departementResponseDTO.setDescription(classe.getDescription());
        return departementResponseDTO;
    }
}
