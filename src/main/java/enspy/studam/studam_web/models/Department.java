package enspy.studam.studam_web.models;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import enspy.studam.studam_web.dto.responseDTO.departmentDTO.DepartementResponseDTO;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Department {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int departmentId;

  private String name;

  private String description;

  private LocalDate createdDate;

  private LocalDate updatedDate;

  @Column(unique = true, nullable = false)
  private String code;

  // Un departement a ou non un chef de departement
  @OneToOne
  @JoinColumn(name = "department_manager_id", referencedColumnName = "id")
  private User departmentManager;

  // Un departement à plusieurs matieres
  @OneToMany(cascade = CascadeType.ALL, mappedBy = "department")
  @JsonIgnore
  private List<Subject> subjects;

  // Un departement à plusieurs enseignants
  @ManyToMany()
  @JoinTable(name = "departement_teacher", joinColumns = @JoinColumn(name = "departement_id"), inverseJoinColumns = @JoinColumn(name = "teacher_id"))
  @JsonIgnore
  private Set<User> teachers = new HashSet<>();;

  // Un departement à plusieurs classes
  @OneToMany(mappedBy = "department")
  @JsonIgnore
  private List<Class> classes;

  // Un departement à plusieurs TimeTable
  // @OneToMany(cascade = CascadeType.ALL, mappedBy = "department")
  // private List<TimeTable> timetables;

  public void addTeacher(User teacher) {
    this.teachers.add(teacher);
    teacher.getDepartments().add(this);
  }

  public void removeTeacher(User teacher) {
    this.teachers.remove(teacher);
    teacher.getDepartments().remove(this);
  }

  @Override
  public int hashCode() {
    return Objects.hash(departmentId);
  }
}
