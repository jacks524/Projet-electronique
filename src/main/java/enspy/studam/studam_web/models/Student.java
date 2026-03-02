package enspy.studam.studam_web.models;

import java.sql.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Student {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int studentId;

  @Column(unique = true, nullable = false)
  private String matricule;

  private String name;

  private Date birthDate;

  private String birthPlace;

  private String email;

  private String phoneNumber;

  // Un etudiant a plusieurs attendances
  @OneToMany(mappedBy = "student")
  private List<Attendance> attendances;

  // Plusieurs etudiant appartiennent à une classe
  @ManyToOne
  private Class classes;

  @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  private List<StudentCatchUpAssignment> catchUpAssignments;
}
