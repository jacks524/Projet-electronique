package enspy.studam.studam_web.dto.requestDTO;

import java.time.DayOfWeek;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScheduleRequestDTO {
  @NotNull(message = "Subject ID must not be null")
  private DayOfWeek day;

  @NotNull(message = "Start hour must not be null")
  private LocalTime startHour;

  @NotNull(message = "End hour must not be null")
  private LocalTime endHour;

  @NotNull(message = "Subject ID must not be null")
  private int subjectId;

  @NotNull(message = "Timetable ID must not be null")
  private int timetableId;

  @NotNull(message = "Teacher ID must not be null")
  private int teacherId;

}
