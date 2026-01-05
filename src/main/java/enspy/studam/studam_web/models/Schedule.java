package enspy.studam.studam_web.models;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Schedule {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int scheduleId;

  @Enumerated(EnumType.STRING)
  private DayOfWeek day;
  private LocalTime startHour;
  private LocalTime endHour;

  // Plusieurs schedule peuvent appartenir pour plusieur timetable
  // @ManyToMany(mappedBy = "schedules")
  // private List<Timetable> timetables;

  // Plusieurs schedule pour une seule timetable
  @ManyToOne
  @JoinColumn(name = "timetable_id")
  private Timetable timetable;

  // Plusieurs Schedule pour plusieurs matières
  // @ManyToMany(mappedBy = "schedules")
  // private List<Subject> subjects;

  // Plusieurs Schedule pour plusieurs pour une matière
  @ManyToOne
  @JoinColumn(name = "subject_id")
  private Subject subject;

  // Plusieurs schedule pour un prof
  @ManyToOne
  @JoinColumn(name = "teacher_id")
  private User teacher;

  // Un schedule à plusieurs attendance
  @OneToMany(mappedBy = "schedule")
  private List<Attendance> attendances;

  @Override
  public int hashCode() {
    return Objects.hash(this.scheduleId);
  }
}
