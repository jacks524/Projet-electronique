package enspy.studam.studam_web.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.responseDTO.CurrentCourseResponseDTO;
import enspy.studam.studam_web.services.CurrentCourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/public/time")
@Tag(name = "Public Time", description = "Public APIs for time and current course")
@AllArgsConstructor
public class PublicTimeController {

  private final CurrentCourseService currentCourseService;

  @GetMapping
  @Operation(summary = "Get server time and current course", description = "Returns server time in ISO8601 and the current course if any.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Time and current course returned successfully.")
  })
  public ResponseEntity<CurrentCourseResponseDTO> getServerTimeAndCourse(
      @RequestParam(name = "room", required = false) String room) {
    return ResponseEntity.ok(currentCourseService.getCurrentCourse(room));
  }
}
