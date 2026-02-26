package enspy.studam.studam_web.models;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Subject {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int subjectId;

  private String name;

  private String description;

  private String code;

  private String semester;

  private int credits;

  private int heuresCoursParSemaine;

  // Une matière appartient a un departement
  @ManyToOne
  @JoinColumn(name = "departement_id")
  private Department department;

  // Plusieurs matières peuvent avoir plusieurs enseignants
  @ManyToMany(mappedBy = "subjects")
  private Set<User> teachers = new HashSet<>();

  // Plusieurs matière peuvent appartenir a plusieurs classes
  @ManyToMany(mappedBy = "subjects")
  private List<Class> classes;

  // Plusieurs matieres peuvent avoir plusieurs schedules
  // @ManyToMany
  // @JoinTable(name = "subject_schedule", joinColumns = @JoinColumn(name =
  // "subject_id"), inverseJoinColumns = @JoinColumn(name = "schedule_id"))
  // private List<Schedule> schedules;

  // Un sujet peut avoir plusieurs schedules
  @OneToMany(mappedBy = "subject")
  private List<Schedule> schedules;

  // Un sujet peut avoir plusieurs attendanceSession
  @OneToMany(mappedBy = "subject")
  private List<AttendanceSession> attendanceSessions;

  @Override
  public int hashCode() {
    return Objects.hash(this.subjectId);
  }

  @PrePersist
  public void ensureSemester() {
    if (semester == null || semester.isBlank()) {
      semester = "S1";
    }
  }
}
