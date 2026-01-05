package enspy.studam.studam_web.models;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

//Il s'agit ici de la classe qui représente un emploi du temps (TimeTable) dans le système.
@Entity
@Data
@NoArgsConstructor
public class Timetable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int timetableId;

  private String semester;

  private LocalDate startDate;
  private LocalDate endDate;

  // Un schedule appartient à un departement
  // @ManyToOne
  // @JoinColumn(name = "departement_id")
  // private Department department;

  // Plusieurs timetables pour plusieurs Schedule
  // @ManyToMany
  // @JoinTable(name = "timetable_schedule", joinColumns = @JoinColumn(name =
  // "timetable_id"), inverseJoinColumns = @JoinColumn(name = "schedule_id"))
  // private List<Schedule> schedules;

  // Un timetable pour plusieurs schedule
  @OneToMany(mappedBy = "timetable")
  private List<Schedule> schedules;

  // Un timetable pour plusieurs attendanceSession
  @OneToMany(mappedBy = "timetable")
  private List<AttendanceSession> attendanceSessions;

  // Un emploi du temps appartient à une classe et une classe peut avoir plusieurs
  // emplois du temps
  @ManyToOne
  private Class clazz;
}
