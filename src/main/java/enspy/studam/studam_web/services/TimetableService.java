package enspy.studam.studam_web.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.TimetableRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.TimetableResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.timetableDTO.ClassTimetableDTO;
import enspy.studam.studam_web.dto.responseDTO.timetableDTO.TeacherTimeTableDTO;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Timetable;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.TimetableRepository;
import enspy.studam.studam_web.services.lookup.ClassLookupService;
import enspy.studam.studam_web.services.lookup.SchedulerLookupService;
import enspy.studam.studam_web.services.lookup.TimetableLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.models.Class;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TimetableService {
  private final TimetableRepository timetableRepository;
  private final UserLookupService userLookupService;
  private final TimetableLookupService timetableLookupService;
  private final SchedulerLookupService schedulerLookupService;
  private final ClassLookupService classLookupService;

  public TimetableResponseDTO createTimetable(TimetableRequestDTO entity) {

    // On se rassure que la date de fin est devant la date de début
    if (entity.getEndDate().isBefore(entity.getStartDate())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "The end date cannot be before the start date.");
    }

    // On se rassure que la classe existe
    Class clazz = classLookupService.getClassById(entity.getClassId());

    Timetable timetable = new Timetable();
    timetable.setSemester(entity.getSemester());
    timetable.setStartDate(entity.getStartDate());
    timetable.setEndDate(entity.getEndDate());
    timetable.setSchedules(new ArrayList<>());
    timetable.setClazz(clazz);
    timetable = timetableRepository.save(timetable);

    return TimetableResponseDTO.toDTO(timetable);
  }

  public List<TimetableResponseDTO> getAllTimetable() {
    return this.timetableRepository.findAll().stream().map(TimetableResponseDTO::toDTO).toList();
  }

  public TeacherTimeTableDTO getTeacherTimetable(int teacherId) {
    User teacher = this.userLookupService.getUserById(teacherId);
    List<Schedule> teacherSchedules = this.schedulerLookupService.getSchedulesByTeacher(teacher);

    return TeacherTimeTableDTO.toDTO(teacherSchedules);
  }

  public ClassTimetableDTO getClassTimetable(int classId) {
    Class clazz = this.classLookupService.getClassById(classId);
    List<Schedule> classSchedules = this.schedulerLookupService.getSchedulesByClass(clazz);

    if (classSchedules.isEmpty()) {
      List<Timetable> timetables = timetableRepository.findByClazz(clazz);
      if (timetables.isEmpty()) {
        return null;
      }
      return ClassTimetableDTO.toDTO(timetables.get(0), List.of());
    }

    return ClassTimetableDTO.toDTO(classSchedules);
  }

  public void deleteTimetable(int id) {
    Timetable timetable = this.timetableLookupService.getTimetableById(id);
    this.timetableRepository.delete(timetable);
  }
}
