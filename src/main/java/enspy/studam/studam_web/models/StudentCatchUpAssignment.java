package enspy.studam.studam_web.models;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = { "student_id", "class_id", "subject_id" })
})
public class StudentCatchUpAssignment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int assignmentId;

  @ManyToOne(optional = false)
  @JoinColumn(name = "student_id")
  private Student student;

  @ManyToOne(optional = false)
  @JoinColumn(name = "class_id")
  private Class clazz;

  @ManyToOne(optional = false)
  @JoinColumn(name = "subject_id")
  private Subject subject;

  @Override
  public int hashCode() {
    return Objects.hash(this.assignmentId);
  }
}
