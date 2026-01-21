package enspy.studam.studam_web.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.LinkedHashSet;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.SubjectRequestDTO;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.repositories.DepartmentRepository;
import enspy.studam.studam_web.repositories.SubjectRepository;
import enspy.studam.studam_web.repositories.UserRepository;
import enspy.studam.studam_web.repositories.ClassRepository;
import enspy.studam.studam_web.repositories.SchedulerRepository;
import enspy.studam.studam_web.services.lookup.ClassLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SubjectService {
  private final SubjectRepository subjectRepository;
  private final UserRepository userRepository;
  private final DepartmentRepository departmentRepository;
  private final UserLookupService userLookupService;
  private final SubjectLookupService subjectLookupService;
  private final ClassLookupService classLookupService;
  private final SchedulerRepository schedulerRepository;
  private final ClassRepository classRepository;

  public Subject createSubject(SubjectRequestDTO subjectRequestDTO) {

    // Verify if department exists
    Department department = this.departmentRepository.findById(subjectRequestDTO.getDepartmentId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
    List<Class> classes = new ArrayList<Class>();
    // Verify if classes exists
    if (subjectRequestDTO.getClasses() != null && !subjectRequestDTO.getClasses().isEmpty()) {
      for (int classId : subjectRequestDTO.getClasses()) {
        classes.add(classLookupService.getClassById(classId));
      }
    }

    // Création du département
    Subject subject = new Subject();
    subject.setName(subjectRequestDTO.getName());
    subject.setDescription(subjectRequestDTO.getDescription());
    subject.setCode(subjectRequestDTO.getCode());
    subject.setCredits(subjectRequestDTO.getCredits() != null ? subjectRequestDTO.getCredits() : 0);
    subject.setHeuresCoursParSemaine(
        subjectRequestDTO.getHeuresCoursParSemaine() != null ? subjectRequestDTO.getHeuresCoursParSemaine() : 0);
    subject.setDepartment(department);
    if (!classes.isEmpty()) {
      subject.setClasses(classes);
    }

    subject = subjectRepository.save(subject);

    // Assign teacher (enforce one teacher per subject)
    if (subjectRequestDTO.getTeacherId() != null) {
      User newTeacher = userLookupService.getUserById(subjectRequestDTO.getTeacherId());

      // Remove all existing teachers from this subject first
      if (subject.getTeachers() != null && !subject.getTeachers().isEmpty()) {
        for (User oldTeacher : new ArrayList<>(subject.getTeachers())) {
          oldTeacher.getSubjects().remove(subject);
          userRepository.save(oldTeacher);
        }
        subject.getTeachers().clear();
      }

      // Add the new teacher
      newTeacher.addSubject(subject);
      userRepository.save(newTeacher);
    }

    return subject;
  }

  public Subject updateSubject(int subjectId, SubjectRequestDTO subjectRequestDTO) {
    Subject subject = this.subjectLookupService.getSubjectById(subjectId);

    Department department = this.departmentRepository.findById(subjectRequestDTO.getDepartmentId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

    subject.setName(subjectRequestDTO.getName());
    subject.setDescription(subjectRequestDTO.getDescription());
    subject.setCode(subjectRequestDTO.getCode());
    subject.setCredits(subjectRequestDTO.getCredits() != null ? subjectRequestDTO.getCredits() : 0);
    subject.setHeuresCoursParSemaine(
        subjectRequestDTO.getHeuresCoursParSemaine() != null ? subjectRequestDTO.getHeuresCoursParSemaine() : 0);
    subject.setDepartment(department);

    if (subjectRequestDTO.getClasses() != null) {
      List<Class> classes = new ArrayList<Class>();
      for (int classId : subjectRequestDTO.getClasses()) {
        classes.add(classLookupService.getClassById(classId));
      }
      subject.setClasses(classes);
    }

    subject = subjectRepository.save(subject);

    // Update teacher assignment (enforce one teacher per subject)
    if (subjectRequestDTO.getTeacherId() != null) {
      User newTeacher = userLookupService.getUserById(subjectRequestDTO.getTeacherId());

      // Remove all existing teachers from this subject first
      if (subject.getTeachers() != null && !subject.getTeachers().isEmpty()) {
        for (User oldTeacher : new ArrayList<>(subject.getTeachers())) {
          oldTeacher.getSubjects().remove(subject);
          userRepository.save(oldTeacher);
        }
        subject.getTeachers().clear();
      }

      // Add the new teacher
      newTeacher.addSubject(subject);
      userRepository.save(newTeacher);
    }

    return subject;
  }

  public List<Subject> getSubjectsByDepartment(int departmentId) {
    // Verify if department exists
    Department department = this.departmentRepository.findById(departmentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

    // Get subjects list department
    return this.subjectRepository.findByDepartment(department);
  }

  public List<Subject> getSubjectsByTeacherId(int teacherId) {
    User teacher = userLookupService.getUserById(teacherId);
    Set<Subject> subjects = new LinkedHashSet<>(
        this.subjectRepository.findByTeachers(Collections.singletonList(teacher)));

    if (subjects.isEmpty()) {
      // Fallback: infer subjects from scheduled courses for this teacher
      schedulerRepository.findByTeacher(teacher).stream()
          .map(Schedule::getSubject)
          .filter(subject -> subject != null)
          .forEach(subjects::add);
    }

    return new ArrayList<>(subjects);
  }

  public void deleteSubject(int id) {
    Subject subject = this.subjectLookupService.getSubjectById(id);

    // Remove from teachers
    if (subject.getTeachers() != null) {
      for (User teacher : subject.getTeachers()) {
        teacher.getSubjects().remove(subject);
        userRepository.save(teacher);
      }
    }

    // Remove from classes
    if (subject.getClasses() != null) {
      for (Class cls : subject.getClasses()) {
        cls.getSubjects().remove(subject);
        // Ideally save class, but relation is ManyToMany mapped by subject usually or
        // Class?
        // In Subject.java: @ManyToMany(mappedBy = "subjects") private List<Class>
        // classes;
        // So Class 'owns' the relationship?
        // Class.java: @ManyToMany ... private List<Subject> subjects;
        // Typically we need to remove it from the other side too if it's bidirectional.
        // Since Class owns it (Subject is mappedBy), we MUST update Class.
      }
    }

    // Delete schedules associated with this subject
    if (subject.getSchedules() != null && !subject.getSchedules().isEmpty()) {
      schedulerRepository.deleteAll(subject.getSchedules());
    }

    this.subjectRepository.delete(subject);
  }

  public Subject getSubjectById(int id) {
    return this.subjectLookupService.getSubjectById(id);
  }
}
