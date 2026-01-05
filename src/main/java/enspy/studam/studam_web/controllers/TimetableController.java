package enspy.studam.studam_web.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.requestDTO.TimetableRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.TimetableResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.timetableDTO.ClassTimetableDTO;
import enspy.studam.studam_web.dto.responseDTO.timetableDTO.TeacherTimeTableDTO;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.services.TimetableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/timetable")
@Tag(name = "Timetable Management", description = "APIs for managing timetables")
@AllArgsConstructor
public class TimetableController {

  private final TimetableService timetableService;

  @PostMapping()
  @Operation(summary = "Create a new timetable", description = "This operation allows the creation of a new timetable for a specific academic year and semester.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Timetable successfully created.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimetableResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data, for example, the year is in the past.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the creation process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<TimetableResponseDTO> createTimetable(@Valid @RequestBody TimetableRequestDTO entity) {

    return new ResponseEntity<>(timetableService.createTimetable(entity), HttpStatus.CREATED);
  }

  @GetMapping()
  @Operation(summary = "Get all timetables", description = "This operation retrieves a list of all existing timetables.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved all timetables.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimetableResponseDTO.class))),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<List<TimetableResponseDTO>> getAllTimetable() {
    return ResponseEntity.ok(timetableService.getAllTimetable());
  }

  @GetMapping("/teacher/{teacherId}")
  @Operation(summary = "Get teacher timetable", description = "This operation retrieves the timetable for a specific teacher.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved teacher timetable.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeacherTimeTableDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: Teacher not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<TeacherTimeTableDTO> getTeacherTimetable(@PathVariable int teacherId) {
    return ResponseEntity.ok()
        .body(this.timetableService.getTeacherTimetable(teacherId));

  }

  @GetMapping("/class/{classId}")
  @Operation(summary = "Get class timetable", description = "This operation retrieves the timetable for a specific class.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved class timetable."),
      @ApiResponse(responseCode = "404", description = "Not Found: Class not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<ClassTimetableDTO> getClassTimetable(@PathVariable int classId) {
    return ResponseEntity.ok(this.timetableService.getClassTimetable(classId));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a timetable", description = "This operation deletes an existing timetable by its ID.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Timetable successfully deleted."),
      @ApiResponse(responseCode = "404", description = "Not Found: Timetable with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the deletion process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<Void> deleteTimetable(@PathVariable int id) {
    timetableService.deleteTimetable(id);
    return ResponseEntity.noContent().build();
  }
}
