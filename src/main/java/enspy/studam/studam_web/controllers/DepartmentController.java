package enspy.studam.studam_web.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.requestDTO.DepartementRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDetailsDTO;
import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponsePreviewsDTO;
import enspy.studam.studam_web.services.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/departments")
@Tag(name = "Department Management", description = "APIs for managing departments")
public class DepartmentController {

  private final DepartmentService departmentService;

  @PostMapping(consumes = "application/json", produces = "application/json")
  @Operation(summary = "Create a new department", description = "This operation allows the creation of a new department.", tags = {
      "Department Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Department successfully created.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DepartementResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the creation process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<DepartementResponseDTO> createDepartement(
      @Valid @RequestBody DepartementRequestDTO departementRequestDTO) {
    DepartementResponseDTO departementResponseDTO = departmentService.createDepartement(departementRequestDTO);

    return ResponseEntity.created(null).body(departementResponseDTO);
  }

  @GetMapping("/all")
  @Operation(summary = "Get all departments", description = "This operation retrieves a list of all departments.", tags = {
      "Department Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved all departments.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DepartementResponseDTO.class))),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<List<DepartementResponsePreviewsDTO>> getAllDepartements() {
    return ResponseEntity.ok(departmentService.getAllDepartements());
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a department", description = "This operation updates an existing department.", tags = {
      "Department Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Department successfully updated.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DepartementResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "404", description = "Not Found: Department with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the update process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<DepartementResponseDTO> updateDepartement(@PathVariable int id,
      @Valid @RequestBody DepartementRequestDTO departementRequestDTO) {
    return ResponseEntity.ok(departmentService.updateDepartement(id, departementRequestDTO));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @Operation(summary = "Delete a department", description = "This operation deletes an existing department. Only administrators can perform this operation.", tags = {
      "Department Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Department successfully deleted."),
      @ApiResponse(responseCode = "403", description = "Forbidden: User does not have admin privileges.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "404", description = "Not Found: Department with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the deletion process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<Void> deleteDepartment(@PathVariable int id) {
    departmentService.deleteDepartment(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get a department by ID", description = "This operation retrieves a specific department by its ID.", tags = {
      "Department Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved the department.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DepartementResponseDetailsDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: Department with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<DepartementResponseDetailsDTO> getDepartmentDetailsById(@PathVariable int id) {
    DepartementResponseDetailsDTO departementResponseDTO = departmentService.getDepartmentDetailsById(id);
    return ResponseEntity.ok(departementResponseDTO);
  }
}
