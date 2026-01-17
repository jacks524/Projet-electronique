package enspy.studam.studam_web.dto.responseDTO.report;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityResponseDTO {
  private String id;
  private String description;
  private LocalDateTime timestamp;
  private String icon;
}
