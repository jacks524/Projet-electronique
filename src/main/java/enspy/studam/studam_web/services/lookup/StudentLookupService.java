package enspy.studam.studam_web.services.lookup;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.Student;
import enspy.studam.studam_web.repositories.StudentRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StudentLookupService {
  private final StudentRepository studentRepository;

  public Student getStudentById(int id) {
    return studentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with id: " + id));
  }

  public Student getStudentByMatricule(String matricule) {
    return studentRepository.findByMatricule(matricule)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with matricule: " + matricule));
  }

  public int countStudents() {
    return (int) studentRepository.count();
  }
}
