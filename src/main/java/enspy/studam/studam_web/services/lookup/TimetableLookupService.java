package enspy.studam.studam_web.services.lookup;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.repositories.TimetableRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TimetableLookupService {
  private final TimetableRepository timetableRepository;

  public Timetable getTimetableById(int timetableId) {
    return this.timetableRepository.findById(timetableId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Timetable not found"));
  }

  public Timetable getTimetableContainsDate(LocalDate date) {
    return this.timetableRepository.findTimetableContainsDate(date).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No actual timetable found"));
  }
}
