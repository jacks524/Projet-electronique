package enspy.studam.studam_web.controllers;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import enspy.studam.studam_web.dto.requestDTO.AttendanceRequestDTO;
import enspy.studam.studam_web.services.AttendanceService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/fingerprint")
@AllArgsConstructor
@Tag(name = "Fingerprint Management", description = "APIs for receiving data from fingerprint devices")
public class FingerPrintController {

  private final AttendanceService attendanceService;

  @Hidden
  @PostMapping("/saveBySchedule")
  @Operation(summary = "Save attendance from a fingerprint device", description = "Receives attendance data, typically from a fingerprint scanner, parses it, and saves it. The endpoint expects a raw JSON string with snake_case keys.")
  @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Raw JSON string from the fingerprint device.", required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "Sample Payload", value = "{\n  \"student_id\": 1,\n  \"date\": \"2024-05-21T10:00:00\",\n  \"teacher_id\": 1\n}")))
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Attendance data parsed and processed successfully.", content = @Content(mediaType = "text/plain")),
      @ApiResponse(responseCode = "400", description = "Bad Request: Error parsing the request body or invalid data.", content = @Content(mediaType = "text/plain"))
  })
  public ResponseEntity<String> saveAttendanceOld(@RequestBody String attendanceDTO) {
    try {
      ObjectMapper objectMapper = new ObjectMapper();
      JsonNode jsonNode = objectMapper.readTree(attendanceDTO);

      String studentId = jsonNode.get("student_id").asText();
      String presenceLoggedDate = jsonNode.get("date").asText();
      String teacherId = jsonNode.get("teacher_id").asText();

      DateTimeFormatter formatter = DateTimeFormatter
          .ofPattern("[yyyy-MM-dd'T'HH:mm][dd/MM/yyyy'T'HH:mm][dd-MM-yyyy'T'HH:mm]");
      LocalDateTime localDateTime = LocalDateTime.parse(presenceLoggedDate, formatter);

      AttendanceRequestDTO attendanceRequestDTO = new AttendanceRequestDTO();
      attendanceRequestDTO.setStudentId(studentId);
      attendanceRequestDTO.setDate(localDateTime);
      attendanceRequestDTO.setTeacherId(teacherId);

      this.attendanceService.saveAttendanceOld(attendanceRequestDTO);

      // Log or process the extracted data as needed
      return ResponseEntity.ok("Parsed successfully: " + studentId + ", " + localDateTime + ", " + teacherId);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Error parsing attendanceDTO: " + e.getMessage());
    }
  }

  @PostMapping()
  @Operation(summary = "Save attendance from a fingerprint device", description = "Receives attendance data, typically from a fingerprint scanner, parses it, and saves it. The endpoint expects a raw JSON string with snake_case keys.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Attendance data parsed and processed successfully."),
      @ApiResponse(responseCode = "400", description = "Bad Request: Error parsing the request body or invalid data.")
  })
  public ResponseEntity<String> saveAttendance(@RequestBody List<AttendanceRequestDTO> attendancesDTO) {
    try {

      this.attendanceService.saveAttendance(attendancesDTO);

      // Log or process the extracted data as needed
      return ResponseEntity.ok("Parsed successfully: ");
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Error parsing attendanceDTO: " + e.getMessage());
    }
  }
}
