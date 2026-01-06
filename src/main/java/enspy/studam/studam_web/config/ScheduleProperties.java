package enspy.studam.studam_web.config;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@Data
@ConfigurationProperties(prefix = "app.schedule")
public class ScheduleProperties {

  private String timeZone;
  private String defaultRoom;
  private Map<String, Map<DayOfWeek, List<ScheduleSlot>>> rooms = new HashMap<>();

  @Data
  public static class ScheduleSlot {
    private LocalTime startTime;
    private LocalTime endTime;
    private String courseName;
  }
}
