package enspy.studam.studam_web.controllers;

import enspy.studam.studam_web.dto.requestDTO.StudentRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.ImportStudentsResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.StudentResponseDTO;
import enspy.studam.studam_web.mappers.StudentMapper;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.services.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/student")
@CrossOrigin(origins = "*")
@AllArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // TODO:
    // Check about the roles

    @PostMapping
    @Operation(summary = "Create a new student", description = "Registers a new student in the system.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Student successfully created."),
            @ApiResponse(responseCode = "400", description = "Invalid input data.")
    })
    public ResponseEntity<StudentResponseDTO> createStudent(@Valid @RequestBody StudentRequestDTO dto) {
        return ResponseEntity.status(201).body(studentService.createStudent(dto));
    }

    @GetMapping
    @Operation(summary = "Retrieve all students", description = "Returns a list of all registered students.")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully.")
    public ResponseEntity<List<StudentResponseDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID", description = "Fetches a student based on their unique ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student found."),
            @ApiResponse(responseCode = "404", description = "Student not found.")
    })
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable int id) {
        return ResponseEntity.ok(StudentMapper.toDTO(studentService.getStudentById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search students by name", description = "Finds students whose names match the given query.")
    @ApiResponse(responseCode = "200", description = "List of matching students.")
    public ResponseEntity<List<StudentResponseDTO>> getStudentsByName(@RequestParam String name) {
        return ResponseEntity.ok(studentService.getStudentsByName(name));
    }

    // Version etudiant d'une classe sans pagination
    // @GetMapping("/class/{classId}")
    // @Operation(summary = "Get students by class", description = "Retrieves all
    // students in a specific class.")
    // @ApiResponse(responseCode = "200", description = "List of students in the
    // class.")
    // public ResponseEntity<List<StudentResponseDTO>>
    // getStudentsByClass(@PathVariable int classId) {
    // return ResponseEntity.ok(studentService.getStudentsByClass(classId));
    // }

    @PutMapping("/{id}")
    @Operation(summary = "Update student information", description = "Modifies details of an existing student.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student successfully updated."),
            @ApiResponse(responseCode = "404", description = "Student not found.")
    })
    public ResponseEntity<StudentResponseDTO> updateStudent(@PathVariable int id,
            @Valid @RequestBody StudentRequestDTO dto) {
        return ResponseEntity.ok(studentService.updateStudent(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a student", description = "Deletes a student from the system.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Student successfully deleted."),
            @ApiResponse(responseCode = "404", description = "Student not found.")
    })
    public ResponseEntity<Void> deleteStudent(@PathVariable int id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Imports students from a provided file (Excel xlsx/xls or CSV).
     * <p>
     * Le format attendu du fichier (CSV ou Excel) doit avoir les colonnes suivantes
     * :
     * <ul>
     * <li>matricule</li>
     * <li>name</li>
     * <li>email</li>
     * <li>phoneNumber</li>
     * <li>birthPlace</li>
     * <li>birthDate</li>
     * <li>classId</li>
     * </ul>
     * Si une ligne contient des données invalides, elle sera ignorée et ajoutée à
     * la liste des échecs,
     * pendant que les autres lignes continueront d'être traitées.
     *
     * @param file le fichier à importer (CSV ou Excel)
     * @return un objet contenant le résultat de l'importation
     */
    @PostMapping("/import")
    @Operation(summary = "Import students from file", description = "Imports students from an Excel (xlsx, xls) or CSV file.\n\n"
            + "Le format attendu du fichier (CSV ou Excel) doit avoir les colonnes suivantes :\n"
            + "- matricule\n"
            + "- name\n"
            + "- email\n"
            + "- phoneNumber\n"
            + "- birthPlace\n"
            + "- birthDate\n"
            + "- className\n\n"
            + "Si une ligne contient des données invalides, elle sera ignorée et ajoutée à la liste des échecs, "
            + "pendant que les autres lignes continueront d'être traitées.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "File processed successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid file format or data."),
            @ApiResponse(responseCode = "500", description = "Error processing file.")
    })
    public ResponseEntity<ImportStudentsResponseDTO> importStudents(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(studentService.importStudentsFromFile(file));
    }

    @GetMapping("/class/{classId}")
    @Operation(summary = "Get students by class", description = "Returns all students in a specific class.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Students retrieved successfully."),
            @ApiResponse(responseCode = "404", description = "Class not found."),
            @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<Page<StudentResponseDTO>> getStudentsByClass(
            @PathVariable int classId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Student> students = studentService.getStudentsByClass(classId, page, size);
        return ResponseEntity.ok(students.map(StudentResponseDTO::toDto));
    }

}