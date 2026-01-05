package enspy.studam.studam_web.controllers;

import enspy.studam.studam_web.dto.requestDTO.ClassRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.ClassResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.StudentResponseDTO;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.services.ClassService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/class")
@AllArgsConstructor
public class ClassController {

    private ClassService classService;

    @GetMapping("/all")
    @Operation(summary = "Get all classes with pagination", description = "Returns a list of all classes with pagination support.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list of classes."),
            @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<Page<ClassResponseDTO>> getAllClasses(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Class> classes = classService.getAllClasses(page, size);
        Page<ClassResponseDTO> classDTOs = classes.map(ClassResponseDTO::toDto);
        return ResponseEntity.ok(classDTOs);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get class by ID", description = "Returns a class based on ID.")
    @ApiResponse(responseCode = "200", description = "Class retrieved successfully.")
    public ResponseEntity<ClassResponseDTO> getClassById(@PathVariable int id) {
        return ResponseEntity.ok(classService.getClassById(id));
    }

    @PostMapping
    @Operation(summary = "Create new class", description = "Creates a new class.")
    @ApiResponse(responseCode = "201", description = "Class created successfully.")
    public ResponseEntity<ClassResponseDTO> createClass(@Valid @RequestBody ClassRequestDTO request) {
        return ResponseEntity.status(201).body(classService.createClass(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update class", description = "Updates an existing class.")
    @ApiResponse(responseCode = "200", description = "Class updated successfully.")
    public ResponseEntity<ClassResponseDTO> updateClass(@PathVariable int id,
            @Valid @RequestBody ClassRequestDTO request) {
        return ResponseEntity.ok(classService.updateClass(id, request));
    }

    @PostMapping("/by-department/{departmentId}")
    @Operation(summary = "Get classes by department", description = "Returns all classes of a department.")
    @ApiResponse(responseCode = "200", description = "Classes retrieved successfully.")
    public ResponseEntity<List<ClassResponseDTO>> getClassesByDepartment(@PathVariable int departmentId) {
        return ResponseEntity.ok(classService.getClassesByDepartment(departmentId));
    }

    @GetMapping("/teacher/{teacherId}")
    @Operation(summary = "Get classes by teacher", description = "Returns all classes taught by a specific teacher.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Classes retrieved successfully."),
            @ApiResponse(responseCode = "404", description = "Teacher not found."),
            @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<List<ClassResponseDTO>> getTeacherClasses(@PathVariable int teacherId) {
        List<Class> classes = this.classService.getTeacherClasses(teacherId);

        return ResponseEntity.ok().body(
                classes.stream()
                        .map(ClassResponseDTO::toDto)
                        .collect(Collectors.toList()));
    }

    @PutMapping("/{classId}/assign-subject/{subjectId}")
    @Operation(summary = "Assign subject to class", description = "Assigns a subject to a class.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Subject assigned to class successfully."),
            @ApiResponse(responseCode = "404", description = "Class or subject not found."),
            @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<Void> assignSubjectToClass(@PathVariable int classId,
            @PathVariable int subjectId) {
        classService.assignSubjectToClass(classId, subjectId);
        return ResponseEntity.ok().body(null);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete class", description = "Deletes a class by ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Class deleted successfully."),
            @ApiResponse(responseCode = "404", description = "Class not found."),
            @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<Void> deleteClass(@PathVariable int id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }

}
