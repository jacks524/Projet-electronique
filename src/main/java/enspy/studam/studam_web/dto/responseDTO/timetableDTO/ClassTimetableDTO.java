package enspy.studam.studam_web.dto.responseDTO.timetableDTO;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import enspy.studam.studam_web.dto.responseDTO.ClassResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.SubjectDTO.MinimalSubjectDTO;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Timetable;
import lombok.Data;

@Data
public class ClassTimetableDTO {
  private int timetableId;

  private String semester;

  private LocalDate startDate;

  private LocalDate endDate;

  private List<ScheduleDTO> schedules;

  @Data
  public static class ScheduleDTO {

    private int scheduleId;

    private DayOfWeek day;

    private LocalTime startHour;

    private LocalTime endHour;

    private MinimalSubjectDTO subject;

    private UserResponseDTO teacher;

    public static ScheduleDTO toDTO(Schedule schedule, Timetable timetable) {
      ScheduleDTO dto = new ScheduleDTO();
      dto.setScheduleId(schedule.getScheduleId());
      dto.setDay(schedule.getDay());
      dto.setStartHour(schedule.getStartHour());
      dto.setEndHour(schedule.getEndHour());
      dto.setSubject(MinimalSubjectDTO.toDTO(schedule.getSubject()));
      dto.setTeacher(UserResponseDTO.toDTO(schedule.getTeacher()));
      return dto;
    }
  }

  public static ClassTimetableDTO toDTO(List<Schedule> schedules) {
    if (schedules.isEmpty()) {
      return null;
    }
    Timetable timetable = schedules.get(0).getTimetable();
    return toDTO(timetable, schedules);
  }

  public static ClassTimetableDTO toDTO(Timetable timetable, List<Schedule> schedules) {
    ClassTimetableDTO dto = new ClassTimetableDTO();
    dto.setTimetableId(timetable.getTimetableId());
    dto.setSemester(timetable.getSemester());
    dto.setStartDate(timetable.getStartDate());
    dto.setEndDate(timetable.getEndDate());
    dto.setSchedules(schedules.stream().map(s -> ScheduleDTO.toDTO(s, timetable)).toList());
    return dto;
  }
}
