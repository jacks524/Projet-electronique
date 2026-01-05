package enspy.studam.studam_web.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class AttendanceSession {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int attendanceSessionId;

  private LocalDateTime date;

  private boolean isValidated = false;

  // Plusieurs schedule pour une seule timetable
  @ManyToOne
  @JoinColumn(name = "timetable_id")
  private Timetable timetable;

  // Plusieurs Schedule pour plusieurs pour une matière
  @ManyToOne
  @JoinColumn(name = "subject_id")
  private Subject subject;

  // Plusieurs schedule pour un prof
  @ManyToOne
  @JoinColumn(name = "teacher_id")
  private User teacher;

  // Un schedule à plusieurs attendance
  @OneToMany(mappedBy = "attendanceSession")
  private List<Attendance> attendances;

  @Override
  public int hashCode() {
    return Objects.hash(this.attendanceSessionId);
  }
}
