package enspy.studam.studam_web.services;

import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.repositories.ClassRepository;
import enspy.studam.studam_web.repositories.DepartmentRepository;
import enspy.studam.studam_web.services.lookup.ClassLookupService;
import enspy.studam.studam_web.services.lookup.DepartmentLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import lombok.AllArgsConstructor;
import enspy.studam.studam_web.dto.responseDTO.ClassResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.StudentResponseDTO;
import enspy.studam.studam_web.dto.requestDTO.ClassRequestDTO;
import enspy.studam.studam_web.mappers.ClassMapper;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Subject;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ClassService {

    private ClassRepository classRepository;
    private DepartmentRepository departmentRepository;
    private DepartmentLookupService departmentLookupService;
    private SubjectService subjectService;
    private ClassLookupService classLookupService;
    private SubjectLookupService subjectLookupService;

    public ClassResponseDTO getClassById(int id) {
        Class Class = classRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Class not found with id: " + id));
        return ClassMapper.toDTO(Class);
    }

    public ClassResponseDTO createClass(ClassRequestDTO request) {

        // Verify if department exists
        Department department = this.departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found with id: " + request.getDepartmentId()));
        // Check if class with the same name already exists
        if (classRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Class with name '" + request.getName() + "' already exists.");
        }

        Class Class = new Class();
        Class.setName(request.getName().toUpperCase());
        Class.setDepartment(department);
        Class.setCode(request.getCode());
        Class.setDescription(request.getDescription());
        Class.setStudentNumber(request.getStudentNumber() != 0 ? request.getStudentNumber() : 0);
        Class saved = classRepository.save(Class);
        return ClassMapper.toDTO(saved);
    }

    public ClassResponseDTO updateClass(int id, ClassRequestDTO request) {

        // Verify if department exists
        Department department = this.departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found with id: " + request.getDepartmentId()));

        // Verify if class exists
        Class Class = classRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Class not found with id: " + id));

        Class.setName(request.getName());
        Class.setDepartment(department);
        Class.setCode(request.getCode());
        Class.setDescription(request.getDescription());
        Class.setStudentNumber(request.getStudentNumber() != 0 ? request.getStudentNumber() : 0);

        Class updated = classRepository.save(Class);
        return ClassMapper.toDTO(updated);
    }

    public List<ClassResponseDTO> getClassesByDepartment(int departmentId) {
        Department department = this.departmentLookupService.getDepartmentById(departmentId);
        return classRepository.findAll().stream()
                .filter(cls -> cls.getDepartment().equals(department))
                .map(ClassMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<Class> getTeacherClasses(int teacherId) {
        List<Subject> subjects = this.subjectService.getSubjectsByTeacherId(teacherId);
        List<Class> classes = new ArrayList<Class>();

        // Ici on suppose qu'une matière appartient à une seule classe et un seul
        // ensignant
        for (Subject subject : subjects) {
            classes.addAll(subject.getClasses());
        }

        return classes;
    }

    public void assignSubjectToClass(int classId, int subjectId) {
        Class cls = this.classLookupService.getClassById(classId);
        Subject subject = this.subjectLookupService.getSubjectById(subjectId);
        cls.getSubjects().add(subject);
        classRepository.save(cls);
    }

    public Page<Class> getAllClasses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return classRepository.findAll(pageable);
    }

    public void deleteClass(int id) {
        Class cls = this.classLookupService.getClassById(id);
        classRepository.delete(cls);
    }

}
