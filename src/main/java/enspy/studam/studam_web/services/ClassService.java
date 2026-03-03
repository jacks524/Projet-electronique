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
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;
import lombok.AllArgsConstructor;
import enspy.studam.studam_web.dto.responseDTO.ClassResponseDTO;
import enspy.studam.studam_web.dto.requestDTO.ClassRequestDTO;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.AttendanceSession;
import enspy.studam.studam_web.models.Attendance;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.User;

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
    private UserLookupService userLookupService;
    private StudentRepository studentRepository;
    private TimetableRepository timetableRepository;
    private SchedulerRepository schedulerRepository;
    private AttendanceSessionRepository attendanceSessionRepository;
    private AttendanceRepository attendanceRepository;
    private WebSocketEventPublisher webSocketEventPublisher;

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
        publishClassEvent("class.created", saved);
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
        publishClassEvent("class.updated", updated);
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
        java.util.Set<Integer> classIds = new java.util.LinkedHashSet<>();

        for (Subject subject : subjects) {
            if (subject.getClasses() == null) {
                continue;
            }
            for (Class clazz : subject.getClasses()) {
                if (clazz != null && classIds.add(clazz.getClassId())) {
                    classes.add(clazz);
                }
            }
        }

        if (!classes.isEmpty()) {
            return classes;
        }

        User teacher = this.userLookupService.getUserById(teacherId);
        for (Schedule schedule : schedulerRepository.findByTeacher(teacher)) {
            if (schedule.getTimetable() == null || schedule.getTimetable().getClazz() == null) {
                continue;
            }
            Class clazz = schedule.getTimetable().getClazz();
            if (classIds.add(clazz.getClassId())) {
                classes.add(clazz);
            }
        }

        return classes;
    }

    public void assignSubjectToClass(int classId, int subjectId) {
        Class cls = this.classLookupService.getClassById(classId);
        Subject subject = this.subjectLookupService.getSubjectById(subjectId);
        List<Subject> subjects = cls.getSubjects();
        if (subjects == null) {
            subjects = new ArrayList<>();
            cls.setSubjects(subjects);
        }
        boolean alreadyAssigned = subjects.stream()
                .anyMatch(existing -> existing.getSubjectId() == subject.getSubjectId());
        if (!alreadyAssigned) {
            subjects.add(subject);
            classRepository.save(cls);
        }
        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("classId", cls.getClassId());
        payload.put("className", cls.getName());
        payload.put("subjectId", subject.getSubjectId());
        payload.put("subjectName", subject.getName());
        webSocketEventPublisher.publish("class.subject.assigned", payload);
    }

    public Page<Class> getAllClasses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return classRepository.findAll(pageable);
    }

    public void deleteClass(int id) {
        Class cls = this.classLookupService.getClassById(id);

        // OPTION A: Delete students along with the class
        List<Student> students = studentRepository.findByClasses_ClassId(cls.getClassId());

        // Delete all students of the class
        if (!students.isEmpty()) {
            studentRepository.deleteAll(students);
        }

        // Continue with timetable cleanup (attendances will be deleted via sessions)
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
        publishClassEvent("class.deleted", cls);
    }

    private void publishClassEvent(String type, Class cls) {
        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("classId", cls.getClassId());
        payload.put("name", cls.getName());
        payload.put("code", cls.getCode());
        payload.put("departmentId", cls.getDepartment() != null ? cls.getDepartment().getDepartmentId() : null);
        webSocketEventPublisher.publish(type, payload);
    }
}
