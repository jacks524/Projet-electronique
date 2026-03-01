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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import enspy.studam.studam_web.dto.requestDTO.AttendanceRequestDTO;
import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.services.AttendanceService;
import enspy.studam.studam_web.services.FingerprintTextStore;
import enspy.studam.studam_web.services.TeacherConfigFileService;
import enspy.studam.studam_web.security.SecurityUtils;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/fingerprint")
@AllArgsConstructor
@Tag(name = "Fingerprint Management", description = "APIs for receiving data from fingerprint devices")
public class FingerPrintController {

  private static final Logger LOGGER = LoggerFactory.getLogger(FingerPrintController.class);

  private final AttendanceService attendanceService;
  private final SubjectLookupService subjectLookupService;
  private final UserLookupService userLookupService;
  private final FingerprintTextStore fingerprintTextStore;
  private final TeacherConfigFileService teacherConfigFileService;
  private final WebSocketEventPublisher webSocketEventPublisher;
  private final SecurityUtils securityUtils;

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
  @Operation(summary = "Save attendance from a text file", description = "Receives raw text lines stored on the ESP32 and saves attendance records. Header supports: millis,teacherMatricule,subjectName[,semester]. Student lines: millis,studentMatricule.")
  public ResponseEntity<String> saveAttendanceFromText(
      @RequestBody String rawText,
      @RequestParam(name = "sessionDate", required = false) String sessionDate) {
    try {
      ParsedAttendance parsed = parsePresenceText(rawText, sessionDate);
      this.attendanceService.saveAttendance(parsed.attendances, parsed.sessionDate);
      fingerprintTextStore.save(rawText, sessionDate);
      java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
      payload.put("records", parsed.attendances.size());
      payload.put("sessionDate", parsed.sessionDate);
      webSocketEventPublisher.publish("fingerprint.text.received", payload);
      return ResponseEntity.ok("Parsed successfully: " + parsed.attendances.size() + " records");
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error parsing text payload");
    } catch (ResponseStatusException ex) {
      throw ex;
    } catch (Exception ex) {
      LOGGER.error("Unexpected error while importing fingerprint text", ex);
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Fingerprint import failed: " + ex.getClass().getSimpleName() + ": " + ex.getMessage());
    }
  }

  @GetMapping(value = "/text", produces = "text/plain")
  @Operation(summary = "Get last attendance text payload", description = "Returns the last raw TXT payload received from a fingerprint device.")
  public ResponseEntity<String> getLastAttendanceText() {
    FingerprintTextStore.StoredFingerprintText stored = fingerprintTextStore.getLast()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No text payload available"));
    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_PLAIN)
        .header(HttpHeaders.LAST_MODIFIED, stored.getReceivedAt().toString())
        .header("X-Session-Date", stored.getSessionDate() != null ? stored.getSessionDate() : "")
        .body(stored.getRawText());
  }

  @PostMapping(value = "/config/publish", produces = "text/plain")
  @Operation(summary = "Publish teacher configuration TXT for ESP32", description = "Generates (or stores manually) a global TXT config for all teachers/departments, then publishes it for device download.")
  public ResponseEntity<String> publishTeacherConfig(
      @RequestBody(required = false) String rawText) {
    User currentUser = securityUtils.getCurrentUser();
    ensureAdminAccess(currentUser);

    TeacherConfigFileService.StoredTeacherConfig published = (rawText != null && !rawText.isBlank())
        ? teacherConfigFileService.publishRawConfig(rawText)
        : teacherConfigFileService.publishGeneratedConfig();

    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("scope", "GLOBAL");
    payload.put("source", published.getSource());
    payload.put("publishedAt", published.getPublishedAt());
    webSocketEventPublisher.publish("fingerprint.config.published", payload);

    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_PLAIN)
        .header("X-Config-Source", published.getSource())
        .header(HttpHeaders.LAST_MODIFIED, published.getPublishedAt().toString())
        .body(published.getRawText());
  }

  @GetMapping(value = "/config/published", produces = "text/plain")
  @Operation(summary = "Download published teacher configuration TXT", description = "Used by ESP32 to download the latest published global config.")
  public ResponseEntity<String> getPublishedTeacherConfig() {
    TeacherConfigFileService.StoredTeacherConfig stored = teacherConfigFileService.getPublishedConfig()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "No published configuration available"));

    String fileName = "config_professeurs.txt";
    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_PLAIN)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
        .header("X-Config-Source", stored.getSource())
        .header(HttpHeaders.LAST_MODIFIED, stored.getPublishedAt().toString())
        .body(stored.getRawText());
  }

  private ParsedAttendance parsePresenceText(String rawText, String sessionDate) throws IOException {
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

    String headerTeacher = null;
    String headerSubjectName = null;
    String headerSemester = null;
    Integer subjectId = null;
    Long headerMillis = null;
    boolean footerSeen = false;

    while ((line = reader.readLine()) != null) {
      lineNumber++;
      line = line.trim();
      if (line.isEmpty() || line.startsWith("---")) {
        if (line.startsWith("---")) {
          if (footerSeen) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Multiple footer lines detected at line " + lineNumber);
          }
          footerSeen = true;
          String footerTeacher = extractFooterTeacher(line);
          if (footerTeacher == null || headerTeacher == null || !footerTeacher.equals(headerTeacher)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Footer teacher matricule mismatch at line " + lineNumber);
          }
        }
        continue;
      }
      if (footerSeen) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Data found after footer line at " + lineNumber);
      }

      char delimiter = line.contains(";") ? ';' : ',';
      String[] parts = line.split(java.util.regex.Pattern.quote(String.valueOf(delimiter)), -1);
      if (headerTeacher == null) {
        if (parts.length < 3) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid header line at " + lineNumber);
        }
        headerMillis = parseMillis(parts[0].trim(), lineNumber);
        headerTeacher = parts[1].trim();
        headerSubjectName = parts[2].trim();
        headerSemester = parts.length >= 4 ? normalizeSemester(parts[3].trim()) : null;

        User teacher = resolveTeacher(headerTeacher);
        Subject subject = resolveSubject(headerSubjectName, headerSemester);
        subjectId = subject.getSubjectId();
        if (teacher == null || subjectId == null) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown teacher or subject in header");
        }
        continue;
      }

      if (parts.length < 2) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid student line at " + lineNumber);
      }

      long elapsedMillis = parseMillis(parts[0].trim(), lineNumber);
      String studentMatricule = parts[1].trim();
      long relativeMillis = headerMillis == null ? elapsedMillis : Math.max(0L, elapsedMillis - headerMillis);

      AttendanceRequestDTO dto = new AttendanceRequestDTO();
      dto.setStudentId(studentMatricule);
      dto.setTeacherId(headerTeacher);
      dto.setSubjectId(subjectId);
      dto.setDate(baseDate.plus(Duration.ofMillis(relativeMillis)));
      attendances.add(dto);
    }

    if (headerTeacher == null || headerSubjectName == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing header line");
    }

    if (!footerSeen) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing session footer line");
    }

    if (attendances.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No attendance records found in payload");
    }

    LocalDateTime sessionStart = baseDate;
    return new ParsedAttendance(attendances, sessionStart);
  }

  private long parseMillis(String value, int lineNumber) {
    try {
      return Long.parseLong(value);
    } catch (NumberFormatException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid millis at line " + lineNumber);
    }
  }

  private String extractFooterTeacher(String line) {
    String normalized = line.replace("---", "").trim();
    String prefix = "SESSION TERMINEE PAR:";
    if (!normalized.startsWith(prefix)) {
      return null;
    }
    return normalized.substring(prefix.length()).trim();
  }

  private User resolveTeacher(String matricule) {
    try {
      return userLookupService.getUserByMatricule(matricule);
    } catch (ResponseStatusException ex) {
      LOGGER.warn("Unknown teacher matricule received in fingerprint text: {}", matricule);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown teacher matricule: " + matricule);
    }
  }

  private Subject resolveSubject(String subjectName, String semester) {
    try {
      if (semester != null && !semester.isBlank()) {
        return subjectLookupService.getSubjectByNameAndSemester(subjectName, semester);
      }
      return subjectLookupService.getSubjectByName(subjectName);
    } catch (ResponseStatusException ex) {
      LOGGER.warn("Unknown subject received in fingerprint text: {} ({})", subjectName, semester);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Unknown subject: " + subjectName + (semester != null ? " for semester " + semester : ""));
    }
  }

  private String normalizeSemester(String semester) {
    if (semester == null || semester.isBlank()) {
      return null;
    }
    String normalized = semester.trim().toUpperCase();
    if ("S1".equals(normalized) || "S2".equals(normalized)) {
      return normalized;
    }
    if (normalized.contains("1")) {
      return "S1";
    }
    if (normalized.contains("2")) {
      return "S2";
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid semester value in TXT header");
  }

  private void ensureAdminAccess(User currentUser) {
    if (!hasRole(currentUser, UserRoleEnum.ADMIN)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can publish global config");
    }
  }

  private boolean hasRole(User user, UserRoleEnum role) {
    return user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getRole() == role);
  }

  private static final class ParsedAttendance {
    private final List<AttendanceRequestDTO> attendances;
    private final LocalDateTime sessionDate;

    private ParsedAttendance(List<AttendanceRequestDTO> attendances, LocalDateTime sessionDate) {
      this.attendances = attendances;
      this.sessionDate = sessionDate;
    }
  }
}
