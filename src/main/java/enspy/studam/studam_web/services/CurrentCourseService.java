package enspy.studam.studam_web.services;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import enspy.studam.studam_web.config.ScheduleProperties;
import enspy.studam.studam_web.dto.responseDTO.CurrentCourseResponseDTO;

@Service
public class CurrentCourseService {

  private static final DateTimeFormatter ISO_OFFSET = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
  private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

  private final ScheduleProperties scheduleProperties;

  public CurrentCourseService(ScheduleProperties scheduleProperties) {
    this.scheduleProperties = scheduleProperties;
  }

  public CurrentCourseResponseDTO getCurrentCourse(String room) {
    ZoneId zoneId = resolveZoneId(scheduleProperties.getTimeZone());
    ZonedDateTime now = ZonedDateTime.now(zoneId);
    CurrentCourseResponseDTO response = new CurrentCourseResponseDTO();

    String resolvedRoom = resolveRoom(room);
    response.setServerTime(now.format(ISO_OFFSET));
    response.setTimeZone(zoneId.getId());
    response.setRoom(resolvedRoom);
    response.setDayOfWeek(now.getDayOfWeek().toString());

    ScheduleProperties.ScheduleSlot slot = findCurrentSlot(resolvedRoom, now.getDayOfWeek(), now.toLocalTime());
    if (slot == null) {
      response.setCourseName("Aucun cours");
      return response;
    }

    response.setCourseName(slot.getCourseName());
    response.setStartTime(slot.getStartTime().format(TIME_FORMAT));
    response.setEndTime(slot.getEndTime().format(TIME_FORMAT));
    return response;
  }

  private String resolveRoom(String room) {
    if (room != null && !room.isBlank()) {
      return room;
    }
    return scheduleProperties.getDefaultRoom();
  }

  private ZoneId resolveZoneId(String timeZone) {
    if (timeZone == null || timeZone.isBlank()) {
      return ZoneId.systemDefault();
    }
    try {
      return ZoneId.of(timeZone);
    } catch (Exception ex) {
      return ZoneId.systemDefault();
    }
  }

  private ScheduleProperties.ScheduleSlot findCurrentSlot(String room, DayOfWeek dayOfWeek, LocalTime currentTime) {
    if (room == null || room.isBlank()) {
      return null;
    }
    Map<DayOfWeek, List<ScheduleProperties.ScheduleSlot>> roomSchedule = scheduleProperties.getRooms().get(room);
    if (roomSchedule == null) {
      return null;
    }
    List<ScheduleProperties.ScheduleSlot> slots = roomSchedule.get(dayOfWeek);
    if (slots == null) {
      return null;
    }

    for (ScheduleProperties.ScheduleSlot slot : slots) {
      if (!currentTime.isBefore(slot.getStartTime()) && currentTime.isBefore(slot.getEndTime())) {
        return slot;
      }
    }
    return null;
  }
}
