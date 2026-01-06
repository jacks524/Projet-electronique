package enspy.studam.studam_web.dto.responseDTO;

import lombok.Data;

@Data
public class CurrentCourseResponseDTO {
  private String serverTime;
  private String timeZone;
  private String room;
  private String courseName;
  private String startTime;
  private String endTime;
  private String dayOfWeek;
}
