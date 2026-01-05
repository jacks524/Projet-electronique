package enspy.studam.studam_web.services.lookup;

import java.util.Collections;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.SubjectRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SubjectLookupService {
  private final SubjectRepository subjectRepository;

  public Subject getSubjectById(int subjectId) {
    return this.subjectRepository.findById(subjectId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));
  }

  public boolean isTeacherAssignToSubject(User teacher, Subject subject) {
    return this.subjectRepository.existsBySubjectIdAndTeachers(subject.getSubjectId(), Collections.singleton(teacher));
  }

}
