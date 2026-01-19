package enspy.studam.studam_web.mappers;

import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.dto.responseDTO.ClassResponseDTO;

public class ClassMapper {

    public static ClassResponseDTO toDTO(Class entity) {
        ClassResponseDTO dto = new ClassResponseDTO();
        dto.setClassId(entity.getClassId());
        dto.setName(entity.getName());
        dto.setStudentNumber(entity.getStudentNumber());
        dto.setCode(entity.getCode());
        dto.setDescription(entity.getDescription());
        if (entity.getDepartment() != null) {
            dto.setDepartementResponseDTO(enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDTO.toDTO(entity.getDepartment()));
        }
        return dto;
    }

}
