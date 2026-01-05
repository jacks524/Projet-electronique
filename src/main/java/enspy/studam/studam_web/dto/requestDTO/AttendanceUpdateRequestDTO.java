package enspy.studam.studam_web.dto.requestDTO;

import enspy.studam.studam_web.enumeration.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceUpdateRequestDTO {
  @NotNull
  AttendanceStatus attendanceStatus;
}
