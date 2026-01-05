package enspy.studam.studam_web.controllers;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.requestDTO.AttendanceUpdateRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.attendanceDTO.AttendanceDetailsResponseDTO;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.services.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/attendance")
@AllArgsConstructor
public class AttendanceController {
  private final AttendanceService attendanceService;
  // On donne l'id de la matière, l'id de la classe et on récupère la liste des
  // heures d'absences des étudiants de la classe pendant le semestre en cours

  @PutMapping("/{AttendanceId}")
  @Operation(summary = "Update attendance by ID", description = "This operation updates an attendance record by its ID.", tags = {
      "Attendance Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Attendance successfully updated."),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data."),
      @ApiResponse(responseCode = "404", description = "Not Found: Attendance record not found."),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the update process.")
  })
  public void updateAttendanceById(@RequestBody AttendanceUpdateRequestDTO attendanceUpdateRequestDTO,
      @PathVariable int AttendanceId) {
    this.attendanceService.updateAttendanceById(attendanceUpdateRequestDTO, AttendanceId);
  }

  @GetMapping("/student/{studentId}")
  @Operation(summary = "Get attendance by student ID", description = "This operation retrieves attendance records for a specific student by their ID.", tags = {
      "Attendance Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Attendance records successfully retrieved."),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid student ID."),
      @ApiResponse(responseCode = "404", description = "Not Found: Student not found."),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.")
  })
  public ResponseEntity<Page<AttendanceDetailsResponseDTO>> getAttendanceByStudentId(@PathVariable int studentId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    Page<Attendance> attendanceRecords = this.attendanceService.getAttendanceByStudentId(studentId, page, size);
    return ResponseEntity.ok(attendanceRecords.map(AttendanceDetailsResponseDTO::toDTO));
  }
}
