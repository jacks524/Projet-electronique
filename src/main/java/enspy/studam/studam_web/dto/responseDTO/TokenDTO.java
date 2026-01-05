package enspy.studam.studam_web.dto.responseDTO;

import java.util.Date;
import java.util.List;

import enspy.studam.studam_web.models.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenDTO {
  private String token;
  private List<UserRole> role;
  private Date expirationDate;
  private int departmentIdIfChief;
}
