package enspy.studam.studam_web.dto.requestDTO;

import java.time.LocalDate;
import java.time.Year;

import org.springframework.format.annotation.NumberFormat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TimetableRequestDTO {

  @NotNull(message = "Semester must not be null")
  private String semester;

  @NotNull(message = "Start date must not be null")
  private LocalDate startDate;

  @NotNull(message = "End date must not be null")
  private LocalDate endDate;

  @NotNull(message = "Class ID must not be null")
  @NumberFormat(style = NumberFormat.Style.NUMBER)
  private int classId;

}
