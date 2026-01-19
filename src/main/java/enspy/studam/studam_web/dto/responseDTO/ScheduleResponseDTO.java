package enspy.studam.studam_web.dto.responseDTO;

import java.time.DayOfWeek;
import java.time.LocalTime;

import enspy.studam.studam_web.models.Schedule;
import lombok.Data;

@Data
public class ScheduleResponseDTO {
  private int scheduleId;
  private DayOfWeek day;
  private LocalTime startHour;
  private LocalTime endHour;
  private TimetableResponseDTO timetable;
  private SubjectResponseDTO subject;
  private UserResponseDTO teacher;

  public static ScheduleResponseDTO toDTO(Schedule schedule) {
    ScheduleResponseDTO dto = new ScheduleResponseDTO();
    dto.setScheduleId(schedule.getScheduleId());
    dto.setDay(schedule.getDay());
    dto.setStartHour(schedule.getStartHour());
    dto.setEndHour(schedule.getEndHour());
    dto.setTimetable(TimetableResponseDTO.toDTO(schedule.getTimetable()));
    dto.setSubject(SubjectResponseDTO.toDTO(schedule.getSubject()));
    dto.setTeacher(UserResponseDTO.toDTO(schedule.getTeacher()));
    return dto;
  }
}
