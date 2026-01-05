package enspy.studam.studam_web.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class User implements UserDetails {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int id;

  private String name;

  private String email;

  private String password;

  private String phoneNumber;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(unique = true, nullable = false)
  private String matricule;

  private LocalDateTime lastConnection;

  private LocalDateTime createdDate;

  @Column(columnDefinition = "boolean default true")
  private boolean isActive = true;

  @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private List<UserRole> roles;

  @ManyToMany
  @JoinTable(name = "teacher_subjects", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "subject_id"))
  private Set<Subject> subjects = new HashSet<>();

  @OneToMany(mappedBy = "teacher")
  private List<Schedule> schedules;

  @OneToMany(mappedBy = "teacher")
  private List<AttendanceSession> attendanceSessions;

  // Plusieurs profs peuvent enseigner dans plusieurs departement
  @ManyToMany(mappedBy = "teachers")
  private Set<Department> departments = new HashSet<>();

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Collection<GrantedAuthority> roleList = new ArrayList<>();
    for (UserRole role : this.roles) {
      roleList.add(new SimpleGrantedAuthority("ROLE_" + role.getRole().name()));
    }
    return roleList;
  }

  @Override
  public String getPassword() {
    return this.password;
  }

  @Override
  public String getUsername() {
    return this.username;
  }

  public void addSubject(Subject subject) {
    this.subjects.add(subject);
    subject.getTeachers().add(this);
  }

  public void removeSubject(Subject subject) {
    this.subjects.remove(subject);
    subject.getTeachers().remove(this);
  }

  public UserResponseDTO toUserResponseDTO() {
    UserResponseDTO userResponseDTO = new UserResponseDTO();
    userResponseDTO.setId(this.id);
    userResponseDTO.setName(this.name);
    userResponseDTO.setEmail(this.email);
    userResponseDTO.setPhoneNumber(this.phoneNumber);
    userResponseDTO.setUsername(this.username);
    userResponseDTO.setRoles(this.roles);
    return userResponseDTO;
  }
}
