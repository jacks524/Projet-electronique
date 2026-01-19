package enspy.studam.studam_web.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import enspy.studam.studam_web.dto.responseDTO.AttendanceResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.AttendanceSessionResponseDTO;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.services.AttendanceSessionService;
import enspy.studam.studam_web.services.lookup.AttendanceSessionLookupService;
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
