package enspy.studam.studam_web.dto.requestDTO;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.sql.Date;
import java.util.List;

@Data
public class StudentRequestDTO {
    @NotNull(message = "Matricule must not be null")
    private String matricule;

    @NotNull(message = "Name must not be null")
    @NotBlank(message = "Name must not be blank")
    private String name;

    // @NotNull(message = "Birth date must not be null")
    private Date birthDate;

    // @NotNull(message = "Birth place must not be null")
    private String birthPlace;

    // @NotNull(message = "Email must not be null")
    @Email(message = "Invalid email format")
    private String email;

    // @NotNull(message = "Phone number must not be null")
    @Size(min = 9, max = 12, message = "Phone number must be between 9 and 12 digits")
    private String phoneNumber;

    private Integer classId;

    private String className;

    private List<StudentCatchUpAssignmentRequestDTO> catchUpAssignments;
}
