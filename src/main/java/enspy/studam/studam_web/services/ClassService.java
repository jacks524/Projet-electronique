package enspy.studam.studam_web.services;

import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.repositories.ClassRepository;
import enspy.studam.studam_web.repositories.StudentRepository;
import enspy.studam.studam_web.repositories.TimetableRepository;
import enspy.studam.studam_web.repositories.SchedulerRepository;
import enspy.studam.studam_web.repositories.AttendanceSessionRepository;
import enspy.studam.studam_web.repositories.AttendanceRepository;
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
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.Schedule;

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
    private StudentRepository studentRepository;
    private TimetableRepository timetableRepository;
    private SchedulerRepository schedulerRepository;
    private AttendanceSessionRepository attendanceSessionRepository;
    private AttendanceRepository attendanceRepository;

    public ClassResponseDTO getClassById(int id) {
        Class cls = classRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Class not found with id: " + id));
        ClassResponseDTO dto = ClassResponseDTO.toDto(cls);
        dto.setStudentNumber((int) studentRepository.countByClasses_ClassId(cls.getClassId()));
        return dto;
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
        ClassResponseDTO dto = ClassResponseDTO.toDto(saved);
        dto.setStudentNumber((int) studentRepository.countByClasses_ClassId(saved.getClassId()));
        return dto;
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
        ClassResponseDTO dto = ClassResponseDTO.toDto(updated);
        dto.setStudentNumber((int) studentRepository.countByClasses_ClassId(updated.getClassId()));
        return dto;
    }

    public List<ClassResponseDTO> getClassesByDepartment(int departmentId) {
        Department department = this.departmentLookupService.getDepartmentById(departmentId);
        return classRepository.findAll().stream()
                .filter(cls -> cls.getDepartment().equals(department))
                .map(cls -> {
                    ClassResponseDTO dto = ClassResponseDTO.toDto(cls);
                    dto.setStudentNumber((int) studentRepository.countByClasses_ClassId(cls.getClassId()));
                    return dto;
                })
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

        List<Student> students = studentRepository.findByClasses_ClassId(cls.getClassId());
        for (Student student : students) {
            student.setClasses(null);
        }
        if (!students.isEmpty()) {
            studentRepository.saveAll(students);
        }

        List<Timetable> timetables = timetableRepository.findByClazz(cls);
        for (Timetable timetable : timetables) {
            List<AttendanceSession> sessions = attendanceSessionRepository.findByTimetable(timetable);
            for (AttendanceSession session : sessions) {
                List<Attendance> attendances = attendanceRepository.findByAttendanceSession(session);
                if (!attendances.isEmpty()) {
                    attendanceRepository.deleteAll(attendances);
                }
            }
            if (!sessions.isEmpty()) {
                attendanceSessionRepository.deleteAll(sessions);
            }

            List<Schedule> schedules = schedulerRepository.findByTimetable(timetable);
            if (!schedules.isEmpty()) {
                schedulerRepository.deleteAll(schedules);
            }
        }
        if (!timetables.isEmpty()) {
            timetableRepository.deleteAll(timetables);
        }

        classRepository.delete(cls);
    }

}
