package enspy.studam.studam_web.controllers;

import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.requestDTO.SubjectRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.SubjectResponseDTO;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.services.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@AllArgsConstructor
@RequestMapping("/subject")
@Tag(name = "Subject Management", description = "APIs for managing subjects")
public class SubjectController {

  private final SubjectService subjectService;

  @PostMapping
  @Operation(summary = "Create a new subject", description = "This operation allows the creation of a new subject.", tags = {
      "Subject Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Subject successfully created.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the creation process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<SubjectResponseDTO> createSubject(@RequestBody @Valid SubjectRequestDTO subjectRequestDTO) {
    Subject subject = this.subjectService.createSubject(subjectRequestDTO);
    return ResponseEntity.ok().body(SubjectResponseDTO.toDTO(subject));
  }


  @PutMapping("/{id}")
  @Operation(summary = "Update subject", description = "Updates an existing subject.", tags = { "Subject Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Subject successfully updated.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "404", description = "Not Found: Subject not found.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<SubjectResponseDTO> updateSubject(@PathVariable int id,
      @RequestBody @Valid SubjectRequestDTO subjectRequestDTO) {
    Subject subject = this.subjectService.updateSubject(id, subjectRequestDTO);
    return ResponseEntity.ok().body(SubjectResponseDTO.toDTO(subject));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get subject by ID", description = "This operation retrieves a subject by its ID.", tags = {
      "Subject Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Subject successfully retrieved.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: Subject not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<SubjectResponseDTO> getSubjectById(@PathVariable int id) {
    Subject subject = this.subjectService.getSubjectById(id);
    return ResponseEntity.ok().body(SubjectResponseDTO.toDTO(subject));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a subject", description = "This operation allows the deletion of a subject by its ID.", tags = {
      "Subject Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Subject successfully deleted.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "404", description = "Not Found: Subject not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = " 500", description = "Internal Server Error: An unexpected error occurred during the deletion process.")
  })
  public ResponseEntity<Void> deleteSubject(@PathVariable int id) {
    this.subjectService.deleteSubject(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/by-department/{departmentId}")
  @Operation(summary = "Get subjects by department", description = "This operation retrieves a list of subjects for a given department.", tags = {
      "Subject Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved subjects.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Subject.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: Department not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<List<SubjectResponseDTO>> getSubjectsByDepartment(@PathVariable int departmentId) {
    List<Subject> subjects = this.subjectService.getSubjectsByDepartment(departmentId);
    return ResponseEntity.ok().body(subjects.stream().map(SubjectResponseDTO::toDTO).toList());
  }

  @GetMapping("/teacher/{teacherId}")
  @Operation(summary = "Get subjects by teacher ID", description = "This operation retrieves a list of subjects taught by a specific teacher.", tags = {
      "Subject Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved subjects.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: Teacher not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<Set<SubjectResponseDTO>> getSubjectsByTeacherId(@PathVariable int teacherId) {
    List<Subject> subjects = this.subjectService.getSubjectsByTeacherId(teacherId);

    return ResponseEntity.ok().body(subjects.stream().map(SubjectResponseDTO::toDTO).collect(Collectors.toSet()));
  }

}
