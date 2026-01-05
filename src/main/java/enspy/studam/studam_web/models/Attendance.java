package enspy.studam.studam_web.models;

import java.time.LocalDateTime;

import enspy.studam.studam_web.enumeration.AttendanceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Attendance {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int attendanceId;

  @Column(name = "attendance_status", nullable = false)
  private AttendanceStatus attendanceStatus;

  @Column(name = "presence_logged_at", nullable = false)
  private LocalDateTime presenceLoggedAt;

  // Un attendance est liee a un student
  @ManyToOne
  @JoinColumn(name = "student_id")
  private Student student;

  // Un attendance est liee a un schedule
  @ManyToOne
  @JoinColumn(name = "schedule_id")
  private Schedule schedule;

  // Un attendance est liee a un attendance session
  @ManyToOne
  @JoinColumn(name = "attendance_session_id")
  private AttendanceSession attendanceSession;
}
