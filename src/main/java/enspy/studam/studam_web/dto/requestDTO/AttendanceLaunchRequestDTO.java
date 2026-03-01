package enspy.studam.studam_web.dto.requestDTO;

import java.time.LocalDate;

import lombok.Data;

@Data
public class AttendanceLaunchRequestDTO {
  private int scheduleId;
  private LocalDate date;
  private String source;
}
