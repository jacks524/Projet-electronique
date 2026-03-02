package enspy.studam.studam_web.dto.responseDTO;

import lombok.Data;
import java.sql.Date;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import enspy.studam.studam_web.models.StudentCatchUpAssignment;

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
    private List<StudentCatchUpAssignmentResponseDTO> catchUpAssignments = new ArrayList<>();

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
        if (student.getCatchUpAssignments() != null) {
            Map<Integer, StudentCatchUpAssignmentResponseDTO> groupedAssignments = new LinkedHashMap<>();
            for (StudentCatchUpAssignment assignment : student.getCatchUpAssignments()) {
                if (assignment.getClazz() == null || assignment.getSubject() == null) {
                    continue;
                }
                StudentCatchUpAssignmentResponseDTO grouped = groupedAssignments.computeIfAbsent(
                        assignment.getClazz().getClassId(),
                        ignored -> {
                            StudentCatchUpAssignmentResponseDTO item = new StudentCatchUpAssignmentResponseDTO();
                            item.setClassId(assignment.getClazz().getClassId());
                            item.setClassName(assignment.getClazz().getName());
                            return item;
                        });
                grouped.getSubjectIds().add(assignment.getSubject().getSubjectId());
                grouped.getSubjectNames().add(assignment.getSubject().getName());
            }
            dto.setCatchUpAssignments(new ArrayList<>(groupedAssignments.values()));
        }
        return dto;
    }
}
