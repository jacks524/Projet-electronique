package enspy.studam.studam_web.dto.requestDTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClassRequestDTO {
    @NotNull(message = "Name must not be null")
    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotNull(message = "Department ID must not be null")
    private int departmentId;

    @NotNull(message = "Code must not be null")
    private String code;

    private String description;

    private int studentNumber;

}
