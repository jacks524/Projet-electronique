package enspy.studam.studam_web.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.SubjectRequestDTO;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.repositories.DepartmentRepository;
import enspy.studam.studam_web.repositories.SubjectRepository;
import enspy.studam.studam_web.services.lookup.ClassLookupService;
import enspy.studam.studam_web.services.lookup.SubjectLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SubjectService {
  private final SubjectRepository subjectRepository;
  private final DepartmentRepository departmentRepository;
  private final UserLookupService userLookupService;
  private final SubjectLookupService subjectLookupService;
  private final ClassLookupService classLookupService;

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
    subject.setDepartment(department);
    if (!classes.isEmpty()) {
      subject.setClasses(classes);
    }
    return subjectRepository.save(subject);
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
    List<Subject> subjects = this.subjectRepository.findByTeachers(Collections.singletonList(teacher));
    if (subjects.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No subjects found for teacher with id: " + teacherId);
    }
    return subjects;
  }

  public void deleteSubject(int id) {
    Subject subject = this.subjectLookupService.getSubjectById(id);
    this.subjectRepository.delete(subject);
  }

  public Subject getSubjectById(int id) {
    return this.subjectLookupService.getSubjectById(id);
  }
}
