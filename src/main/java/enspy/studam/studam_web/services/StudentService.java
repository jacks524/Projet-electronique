package enspy.studam.studam_web.services;

import enspy.studam.studam_web.dto.requestDTO.StudentRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.ImportStudentsResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.StudentResponseDTO;
import enspy.studam.studam_web.mappers.StudentMapper;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.repositories.StudentRepository;
import enspy.studam.studam_web.services.lookup.ClassLookupService;
import enspy.studam.studam_web.repositories.ClassRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private ClassLookupService classLookupService;
    @Autowired
    private WebSocketEventPublisher webSocketEventPublisher;

    /**
     * Resolves a Class entity from StudentRequestDTO.
     * Tries to resolve by classId first, then by className if classId is not
     * provided.
     * 
     * @param dto StudentRequestDTO containing either classId or className
     * @return The resolved Class entity
     * @throws ResponseStatusException if class is not found or neither classId nor
     *                                 className is provided
     */
    private Class resolveClass(StudentRequestDTO dto) {
        if (dto.getClassId() != null) {
            return classLookupService.getClassById(dto.getClassId());
        }
        if (dto.getClassName() != null && !dto.getClassName().isEmpty()) {
            return classRepository.findByName(dto.getClassName())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Class not found with name: " + dto.getClassName()));
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Either classId or className must be provided");
    }

    public StudentResponseDTO createStudent(StudentRequestDTO dto) {
        Class classe = resolveClass(dto);

        if (this.studentRepository.existsByMatricule(dto.getMatricule())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Student with matricule '" + dto.getMatricule() + "' already exists.");
        }

        Student student = new Student();
        student.setMatricule(dto.getMatricule());
        student.setName(dto.getName());
        student.setBirthDate(dto.getBirthDate());
        student.setBirthPlace(dto.getBirthPlace());
        student.setEmail(dto.getEmail());
        student.setPhoneNumber(dto.getPhoneNumber());
        student.setClasses(classe);

        Student savedStudent = studentRepository.save(student);
        publishStudentEvent("student.created", savedStudent);
        return StudentMapper.toDTO(savedStudent);
    }

    public List<StudentResponseDTO> getAllStudents() {
        return studentRepository.findAll().stream().map(StudentMapper::toDTO).collect(Collectors.toList());
    }

    public Student getStudentById(int id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student not found with id: " + id));
    }

    public List<StudentResponseDTO> getStudentsByName(String name) {
        return studentRepository.findByNameContainingIgnoreCase(name).stream().map(StudentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<StudentResponseDTO> getStudentsByClass(int classId) {
        return studentRepository.findByClasses_ClassId(classId).stream().map(StudentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public StudentResponseDTO updateStudent(int id, StudentRequestDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student not found with id: " + id));
        Class classe = resolveClass(dto);

        student.setMatricule(dto.getMatricule());
        student.setName(dto.getName());
        student.setBirthDate(dto.getBirthDate());
        student.setBirthPlace(dto.getBirthPlace());
        student.setEmail(dto.getEmail());
        student.setPhoneNumber(dto.getPhoneNumber());
        student.setClasses(classe);

        Student updatedStudent = studentRepository.save(student);
        publishStudentEvent("student.updated", updatedStudent);
        return StudentMapper.toDTO(updatedStudent);
    }

    public void deleteStudent(int id) {
        if (!studentRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Student not found with id: " + id);
        }
        Student student = studentRepository.findById(id).orElse(null);
        studentRepository.deleteById(id);
        if (student != null) {
            publishStudentEvent("student.deleted", student);
        }
    }

    public ImportStudentsResponseDTO importStudentsFromFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name is required");
        }

        ImportStudentsResponseDTO response = new ImportStudentsResponseDTO();
        response.setSuccessfulImports(new ArrayList<>());
        response.setFailedImports(new ArrayList<>());

        try {
            if (fileName.endsWith(".csv")) {
                processCSVFile(file, response);
            } else if (fileName.endsWith(".xlsx")) {
                processExcelFile(file, response, true);
            } else if (fileName.endsWith(".xls")) {
                processExcelFile(file, response, false);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unsupported file format. Please upload a .csv, .xlsx, or .xls file");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error processing file: " + e.getMessage());
        }

        response.setTotalProcessed(response.getSuccessfulImports().size() + response.getFailedImports().size());
        response.setSuccessCount(response.getSuccessfulImports().size());
        response.setFailureCount(response.getFailedImports().size());

        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("totalProcessed", response.getTotalProcessed());
        payload.put("successCount", response.getSuccessCount());
        payload.put("failureCount", response.getFailureCount());
        webSocketEventPublisher.publish("student.imported", payload);

        return response;
    }

    private void processCSVFile(MultipartFile file, ImportStudentsResponseDTO response) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
                CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord record : csvParser) {
                try {
                    processRow(record.toMap(), (int) csvParser.getCurrentLineNumber(), response);
                } catch (Exception e) {
                    response.getFailedImports().add(new ImportStudentsResponseDTO.ImportError(
                            (int) csvParser.getCurrentLineNumber(),
                            e.getMessage(),
                            record.toString()));
                }
            }
        }
    }

    private void processExcelFile(MultipartFile file, ImportStudentsResponseDTO response, boolean isXlsx)
            throws IOException {
        try (Workbook workbook = isXlsx ? new XSSFWorkbook(file.getInputStream())
                : new HSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> headers = new HashMap<>();
            // DataFormatter permet de lire les valeurs des cellules telles qu'elles sont
            // affichées dans Excel.
            // C'est la meilleure façon de s'assurer qu'un numéro de téléphone est lu
            // comme un String, et non comme un nombre avec un ".0" ou en notation
            // scientifique.
            DataFormatter dataFormatter = new DataFormatter();

            // Map column headers to indices
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell != null) {
                    headers.put(dataFormatter.formatCellValue(cell).trim(), i);
                }
            }

            // Process each row
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                try {
                    Map<String, String> rowData = new HashMap<>();
                    headers.forEach((header, index) -> {
                        Cell cell = row.getCell(index);
                        rowData.put(header, dataFormatter.formatCellValue(cell));
                    });
                    processRow(rowData, i + 1, response);
                } catch (Exception e) {
                    response.getFailedImports().add(new ImportStudentsResponseDTO.ImportError(
                            i + 1,
                            e.getMessage(),
                            "Row " + (i + 1)));
                }
            }
        }
    }

    private void processRow(Map<String, String> rowData, int rowNumber, ImportStudentsResponseDTO response) {
        StudentRequestDTO dto = new StudentRequestDTO();

        dto.setMatricule(rowData.getOrDefault("matricule", "").trim());
        dto.setName(rowData.getOrDefault("name", "").trim());
        dto.setEmail(rowData.getOrDefault("email", "").trim());
        dto.setPhoneNumber(rowData.getOrDefault("phoneNumber", "").trim());
        dto.setBirthPlace(rowData.getOrDefault("birthPlace", "").trim());

        // Parse birthDate
        String birthDateStr = rowData.getOrDefault("birthDate", "").trim();
        if (!birthDateStr.isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("[yyyy-MM-dd][dd/MM/yyyy][dd-MM-yyyy]");
                LocalDate localDate = LocalDate.parse(birthDateStr, formatter);
                dto.setBirthDate(Date.valueOf(localDate));
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException(
                        "Format de date de naissance invalide pour la valeur '" + birthDateStr
                                + "' à la ligne " + rowNumber
                                + ". Veuillez utiliser un format comme aaaa-mm-jj ou jj/mm/aaaa.");
            }
        }

        // Parse classId
        try {
            String classIdStr = rowData.getOrDefault("className", "").trim();
            if (!classIdStr.isEmpty()) {
                dto.setClassName(classIdStr.toUpperCase());
            } else {
                throw new IllegalArgumentException("Class Name is required");
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid class Name format at row " + rowNumber);
        }

        // Validate and save the student
        try {
            StudentResponseDTO savedStudent = this.createStudent(dto);
            response.getSuccessfulImports().add(savedStudent);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error saving student at row " + rowNumber + ": " + e.getMessage());
        }
    }

    public Page<Student> getStudentsByClass(int classId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Class clazz = classLookupService.getClassById(classId);
        return studentRepository.findByClasses(clazz, pageable);
    }

    private void publishStudentEvent(String type, Student student) {
        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("studentId", student.getStudentId());
        payload.put("matricule", student.getMatricule());
        payload.put("name", student.getName());
        payload.put("classId", student.getClasses() != null ? student.getClasses().getClassId() : null);
        webSocketEventPublisher.publish(type, payload);
    }
}
