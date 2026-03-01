package enspy.studam.studam_web.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import enspy.studam.studam_web.dto.requestDTO.AttendanceLaunchRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.AttendanceResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.AttendanceSessionResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.RemoteAttendanceLaunchResponseDTO;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.services.AttendanceSessionService;
import enspy.studam.studam_web.services.RemoteAttendanceLaunchService;
import enspy.studam.studam_web.services.lookup.AttendanceSessionLookupService;
import enspy.studam.studam_web.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/attendance-session")
@AllArgsConstructor
public class AttendanceSessionController {
  private final AttendanceSessionService attendanceSessionService;
  private final AttendanceSessionLookupService attendanceSessionLookupService;
  private final RemoteAttendanceLaunchService remoteAttendanceLaunchService;
  private final SecurityUtils securityUtils;

  @GetMapping("/teacher/{teacherId}")
  @Operation(summary = "Get attendance sessions for a teacher", description = "Returns a list of attendance sessions for a specific teacher.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved attendance sessions."),
      @ApiResponse(responseCode = "404", description = "Teacher not found."),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.")
  })
  public ResponseEntity<List<AttendanceSessionResponseDTO>> getAttendanceSessionsForTeacher(
      @PathVariable int teacherId) {
    List<AttendanceSession> sessions = this.attendanceSessionService.getAttendanceSessionsForTeacher(teacherId);
    return ResponseEntity.ok().body(sessions.stream().map(AttendanceSessionResponseDTO::toDTO).toList());
  }

  @GetMapping("/{sessionId}")
  @Operation(summary = "Get list of students for attendances session by ID", description = "Returns the list of students for a specific attendance session.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved the list of students for the attendance session."),
      @ApiResponse(responseCode = "404", description = "Attendance session not found."),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.")
  })
  public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceSessionById(@PathVariable int sessionId) {
    List<Attendance> attendances = this.attendanceSessionService.getAttendancesBySessionId(sessionId);
    return ResponseEntity.ok().body(attendances.stream().map(AttendanceResponseDTO::toDTO).toList());
  }

  @GetMapping(value = "/{sessionId}/csv", produces = "text/csv")
  @Operation(summary = "Download attendance session CSV", description = "Returns a CSV file for the attendance session.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "CSV generated successfully."),
      @ApiResponse(responseCode = "404", description = "Attendance session not found.")
  })
  public ResponseEntity<String> downloadAttendanceSessionCsv(@PathVariable int sessionId) {
    AttendanceSession session = attendanceSessionLookupService.getAttendanceSessionById(sessionId);
    List<Attendance> attendances = this.attendanceSessionService.getAttendancesBySessionId(sessionId);

    String filename = buildCsvFilename(session);
    String csv = buildCsvContent(attendances);

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("text/csv"))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .body(csv);
  }

  @PostMapping("/launch")
  @Operation(summary = "Launch attendance call from web app", description = "Creates a single pending launch order for the ESP32 device.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Launch order created successfully."),
      @ApiResponse(responseCode = "400", description = "Invalid launch request."),
      @ApiResponse(responseCode = "403", description = "User cannot launch this schedule.")
  })
  public ResponseEntity<RemoteAttendanceLaunchResponseDTO> launchAttendanceCall(
      @RequestBody AttendanceLaunchRequestDTO request) {
    User currentUser = securityUtils.getCurrentUser();
    RemoteAttendanceLaunchResponseDTO response = remoteAttendanceLaunchService.createLaunchOrder(request, currentUser);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/launch/pending")
  @Operation(summary = "Consume pending attendance launch for ESP32", description = "Returns the pending web launch order once, then clears it.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Launch order consumed successfully."),
      @ApiResponse(responseCode = "204", description = "No pending launch order.")
  })
  public ResponseEntity<RemoteAttendanceLaunchResponseDTO> consumePendingLaunch() {
    RemoteAttendanceLaunchResponseDTO response = remoteAttendanceLaunchService.consumePendingLaunch();
    if (response == null) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(response);
  }

  private String buildCsvFilename(AttendanceSession session) {
    String subjectName = session.getSubject() != null ? session.getSubject().getName() : "attendance";
    String safeSubject = subjectName.replaceAll("[^A-Za-z0-9]+", "_");
    String datePart = session.getDate() != null ? session.getDate().toLocalDate().toString() : "unknown-date";
    return safeSubject + "_" + datePart + ".csv";
  }

  private String buildCsvContent(List<Attendance> attendances) {
    StringBuilder csv = new StringBuilder();
    csv.append("studentMatricule,studentName,status,loggedAt\n");
    for (Attendance attendance : attendances) {
      String matricule = attendance.getStudent() != null ? attendance.getStudent().getMatricule() : "";
      String name = attendance.getStudent() != null ? attendance.getStudent().getName() : "";
      String status = attendance.getAttendanceStatus() != null ? attendance.getAttendanceStatus().name() : "";
      String loggedAt = attendance.getPresenceLoggedAt() != null ? attendance.getPresenceLoggedAt().toString() : "";
      csv.append(escapeCsv(matricule)).append(',')
          .append(escapeCsv(name)).append(',')
          .append(escapeCsv(status)).append(',')
          .append(escapeCsv(loggedAt)).append('\n');
    }
    return csv.toString();
  }

  private String escapeCsv(String value) {
    if (value == null) {
      return "";
    }
    boolean needsQuotes = value.contains(",") || value.contains("\"") || value.contains("\n");
    String escaped = value.replace("\"", "\"\"");
    return needsQuotes ? "\"" + escaped + "\"" : escaped;
  }
}
