package enspy.studam.studam_web.dto.responseDTO.departmentDTO;

import lombok.Data;

@Data
public class DepartmentStats {
  private int totalStudents; // Assuming you want to include the total number of students in the department
  private int totalTeachers; // Assuming you want to include the total number of teachers in the department
  private int totalClasses; // Assuming you want to include the total number of classes in the department
  private int attendanceRate; // Assuming you want to include the attendance rate for the department

}
