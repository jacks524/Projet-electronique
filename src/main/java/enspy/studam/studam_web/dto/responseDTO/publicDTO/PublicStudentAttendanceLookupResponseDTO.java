package enspy.studam.studam_web.dto.responseDTO.publicDTO;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class PublicStudentAttendanceLookupResponseDTO {
  private PublicStudentAttendanceStudentDTO student;
  private List<PublicStudentAttendanceItemDTO> attendances = new ArrayList<>();
}
