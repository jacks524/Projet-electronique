package enspy.studam.studam_web.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.responseDTO.publicDTO.PublicStudentAttendanceLookupResponseDTO;
import enspy.studam.studam_web.services.PublicStudentAttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/public/student-attendance")
@Tag(name = "Public Student Attendance", description = "Public API for student attendance lookup by matricule")
@AllArgsConstructor
public class PublicStudentAttendanceController {

  private final PublicStudentAttendanceService publicStudentAttendanceService;

  @GetMapping
  @Operation(summary = "Get student attendance by matricule", description = "Returns public attendance consultation data for a student.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Attendance consultation returned successfully."),
      @ApiResponse(responseCode = "404", description = "Student not found.")
  })
  public ResponseEntity<PublicStudentAttendanceLookupResponseDTO> getStudentAttendance(
      @RequestParam("matricule") String matricule) {
    return ResponseEntity.ok(publicStudentAttendanceService.getStudentAttendanceByMatricule(matricule));
  }
}
