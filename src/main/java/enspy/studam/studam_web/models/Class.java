package enspy.studam.studam_web.models;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(uniqueConstraints = { @UniqueConstraint(columnNames = { "code", "name" }) })
public class Class {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int classId;

  @Column(unique = true, nullable = false)
  private String name;

  private String code;

  private String description;

  private int studentNumber;

  // Plusieurs classe pour plusieurs matières
  @ManyToMany
  @JoinTable(name = "class_subject", joinColumns = @JoinColumn(name = "class_id"), inverseJoinColumns = @JoinColumn(name = "subject_id"))
  private List<Subject> subjects;

  // Une classe appartient à un Departement
  @ManyToOne
  @JoinColumn(name = "departement_id")
  private Department department;

  // Une classe à un emploi du temps
  @OneToMany(mappedBy = "clazz")
  private List<Timetable> timetables;

  // Une classe à plusieurs étudiant
  @OneToMany(mappedBy = "classes")
  private List<Student> students;
}
