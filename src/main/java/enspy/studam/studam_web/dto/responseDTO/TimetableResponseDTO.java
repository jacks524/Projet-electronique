package enspy.studam.studam_web.dto.responseDTO;

import java.time.LocalDate;

import enspy.studam.studam_web.models.Timetable;
import lombok.Data;

@Data
public class TimetableResponseDTO {
  private int timetableId;

  private String semester;

  private LocalDate startDate;

  private LocalDate endDate;

  public static TimetableResponseDTO toDTO(Timetable timetable) {
    TimetableResponseDTO dto = new TimetableResponseDTO();
    dto.setTimetableId(timetable.getTimetableId());
    dto.setSemester(timetable.getSemester());
    dto.setStartDate(timetable.getStartDate());
    dto.setEndDate(timetable.getEndDate());

    return dto;
  }
}
