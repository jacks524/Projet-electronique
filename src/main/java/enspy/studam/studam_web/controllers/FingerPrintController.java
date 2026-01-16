package enspy.studam.studam_web.controllers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import enspy.studam.studam_web.dto.requestDTO.AttendanceRequestDTO;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.services.AttendanceService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
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
  private final SubjectLookupService subjectLookupService;

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

  @PostMapping(value = "/text", consumes = "text/plain")
  @Operation(summary = "Save attendance from a text file", description = "Receives raw text lines stored on the ESP32 and saves attendance records. Each line uses comma or semicolon delimiter: millis,teacherMatricule,subjectName,studentMatricule.")
  public ResponseEntity<String> saveAttendanceFromText(
      @RequestBody String rawText,
      @RequestParam(name = "sessionDate", required = false) String sessionDate) {
    try {
      List<AttendanceRequestDTO> attendances = parsePresenceText(rawText, sessionDate);
      this.attendanceService.saveAttendance(attendances);
      return ResponseEntity.ok("Parsed successfully: " + attendances.size() + " records");
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error parsing text payload");
    }
  }

  private List<AttendanceRequestDTO> parsePresenceText(String rawText, String sessionDate) throws IOException {
    List<AttendanceRequestDTO> attendances = new ArrayList<>();
    BufferedReader reader = new BufferedReader(new StringReader(rawText));
    String line;
    int lineNumber = 0;

    LocalDateTime baseDate = LocalDateTime.now();
    if (sessionDate != null && !sessionDate.isBlank()) {
      try {
        baseDate = LocalDateTime.parse(sessionDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
      } catch (Exception ex) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sessionDate format");
      }
    }

    String expectedTeacher = null;
    Integer expectedSubjectId = null;

    while ((line = reader.readLine()) != null) {
      lineNumber++;
      line = line.trim();
      if (line.isEmpty() || line.startsWith("---")) {
        continue;
      }

      char delimiter = line.contains(";") ? ';' : ',';
      String[] parts = line.split(java.util.regex.Pattern.quote(String.valueOf(delimiter)), -1);
      if (parts.length < 4) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid line at " + lineNumber);
      }

      long elapsedMillis;
      try {
        elapsedMillis = Long.parseLong(parts[0].trim());
      } catch (NumberFormatException ex) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid millis at line " + lineNumber);
      }

      String teacherMatricule = parts[1].trim();
      String subjectName = parts[2].trim();
      String studentMatricule = parts[3].trim();

      Subject subject = subjectLookupService.getSubjectByName(subjectName);
      int subjectId = subject.getSubjectId();

      if (expectedTeacher == null) {
        expectedTeacher = teacherMatricule;
        expectedSubjectId = subjectId;
      } else if (!expectedTeacher.equals(teacherMatricule) || !expectedSubjectId.equals(subjectId)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Mixed teacher or subject detected at line " + lineNumber);
      }

      AttendanceRequestDTO dto = new AttendanceRequestDTO();
      dto.setStudentId(studentMatricule);
      dto.setTeacherId(teacherMatricule);
      dto.setSubjectId(subjectId);
      dto.setDate(baseDate.plus(Duration.ofMillis(elapsedMillis)));
      attendances.add(dto);
    }

    if (attendances.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No attendance records found in payload");
    }

    return attendances;
  }
}
