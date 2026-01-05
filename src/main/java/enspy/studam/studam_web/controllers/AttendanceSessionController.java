package enspy.studam.studam_web.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.responseDTO.AttendanceResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.AttendanceSessionResponseDTO;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.services.AttendanceSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/attendance-session")
@AllArgsConstructor
public class AttendanceSessionController {
  private final AttendanceSessionService attendanceSessionService;

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
}
