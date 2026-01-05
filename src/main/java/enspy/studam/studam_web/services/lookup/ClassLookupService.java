package enspy.studam.studam_web.services.lookup;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.repositories.ClassRepository;
import lombok.AllArgsConstructor;

import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.User;

@Service
@AllArgsConstructor
public class ClassLookupService {
  private final ClassRepository classRepository;

  public Class getClassById(int id) {
    return classRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found with id: " + id));
  }

  public Class getClassByName(String name) {
    return classRepository.findByName(name)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found with name: " + name));
  }

}
