package enspy.studam.studam_web.services;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.dto.requestDTO.ChangePasswordRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.ForgotPasswordRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.LoginRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.RegisterRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.ResetPasswordRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.UserUpdateRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.TokenDTO;
import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.UserRole;
import enspy.studam.studam_web.repositories.UserRepository;
import enspy.studam.studam_web.security.JwtService;
import enspy.studam.studam_web.security.SecurityUtils;
import enspy.studam.studam_web.services.lookup.DepartmentLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import enspy.studam.studam_web.websocket.WebSocketEventPublisher;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LoginService {

  private UserRepository userRepository;
  private JwtService jwtService;
  private AuthenticationManager authenticationManager;
  private EmailService emailService;
  private final UserLookupService userLookupService;
  private final DepartmentLookupService departmentLookupService;
  private final WebSocketEventPublisher webSocketEventPublisher;

  public void forgotPassword(ForgotPasswordRequestDTO requestDTO) {
    User user = this.userLookupService.getUserByEmail(requestDTO.getEmail());

    // Générer un token JWT avec l'email et l'ID de l'utilisateur
    String token = jwtService.generatePasswordResetToken(user.getEmail(), user.getId());

    try {
      emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
    } catch (MessagingException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send reset password email");
    }
  }

  public void resetPassword(ResetPasswordRequestDTO requestDTO) {
    // Vérifier et extraire les informations du token
    if (jwtService.isTokenExpired(requestDTO.getToken())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset password token has expired");
    }

    String email = jwtService.extractEmail(requestDTO.getToken());
    Integer userId = jwtService.extractUserId(requestDTO.getToken());

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    // Vérifier que l'email dans le token correspond à l'utilisateur
    if (!user.getEmail().equals(email)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token");
    }

    // Mettre à jour le mot de passe
    user.setPassword(new BCryptPasswordEncoder().encode(requestDTO.getNewPassword()));
    userRepository.save(user);
  }

  public User register(RegisterRequestDTO registerRequestDTO) {

    // On vérifie si l'utilisateur existe déjà
    if (this.userRepository.existsByEmail(registerRequestDTO.getEmail())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
    }
    if (this.userRepository.existsByUsername(registerRequestDTO.getUsername())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
    }

    if (this.userRepository.existsByPhoneNumber(registerRequestDTO.getPhoneNumber())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number already exists");
    }

    if (this.userRepository.existsByMatricule(registerRequestDTO.getMatricule())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Matricule already exists");
    }

    if (registerRequestDTO.getDepartmentsIds() != null && !registerRequestDTO.getDepartmentsIds().isEmpty()) {
      registerRequestDTO.getDepartmentsIds().forEach(departmentId -> {
        departmentLookupService.getDepartmentById(departmentId);
      });
    }

    if (registerRequestDTO.getRole() == UserRoleEnum.DEPARTMENT_MANAGER) {
      if (registerRequestDTO.getDepartmentsIds() == null || registerRequestDTO.getDepartmentsIds().size() != 1) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Department manager must belong to exactly one department");
      }
      Department department = departmentLookupService.getDepartmentById(registerRequestDTO.getDepartmentsIds().get(0));
      if (department.getDepartmentManager() != null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Department already has a manager");
      }
    }

    User user = new User();

    user.setEmail(registerRequestDTO.getEmail());
    user.setName(registerRequestDTO.getName());
    user.setUsername(registerRequestDTO.getUsername());
    user.setPassword(new BCryptPasswordEncoder().encode(registerRequestDTO.getPassword()));
    user.setPhoneNumber(registerRequestDTO.getPhoneNumber());
    user.setMatricule(registerRequestDTO.getMatricule());
    if (registerRequestDTO.getActive() != null) {
      user.setActive(registerRequestDTO.getActive());
    } else {
      user.setActive(true);
    }
    user.setCreatedDate(LocalDateTime.now());

    UserRole role = new UserRole(registerRequestDTO.getRole());
    List<UserRole> roles = new ArrayList<>();
    roles.add(role);
    user.setRoles(roles);

    user = this.userRepository.save(user);

    try {
      emailService.sendWelcomeEmail(user.getEmail(), user.getName(), user.getUsername(),
          registerRequestDTO.getPassword(), registerRequestDTO.getRole().name());
    } catch (MessagingException e) {
      // Handle exception here
      e.printStackTrace();
    }

    // Assign departments if provided
    if (registerRequestDTO.getDepartmentsIds() != null && !registerRequestDTO.getDepartmentsIds().isEmpty()) {
      if (registerRequestDTO.getRole() == UserRoleEnum.DEPARTMENT_MANAGER) {
        departmentLookupService.assignDepartmentManager(registerRequestDTO.getDepartmentsIds().get(0), user);
      } else {
        departmentLookupService.assignDepartmentsToUser(registerRequestDTO.getDepartmentsIds(), user);
      }
    }

    webSocketEventPublisher.publish("user.created", java.util.Map.of(
        "userId", user.getId(),
        "name", user.getName(),
        "role", registerRequestDTO.getRole().name(),
        "active", user.isActive(),
        "departmentsIds", registerRequestDTO.getDepartmentsIds() == null
            ? java.util.List.of()
            : registerRequestDTO.getDepartmentsIds()));
    return user;
  }

  public TokenDTO signin(LoginRequestDTO loginRequestDTO) {
    // On vérifie si l'utilisateur existe
    if (!this.userRepository.existsByUsername(loginRequestDTO.username())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "username or password is not correct");
    }
    // On vérifie si l'utilisateur est actif
    User user = this.userRepository.findByUsername(loginRequestDTO.username());
    if (!user.isActive()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not active");
    }
    // On vérifie si les credentials sont correctes
    Authentication authentication = authenticationManager
        .authenticate(new UsernamePasswordAuthenticationToken(loginRequestDTO.username(), loginRequestDTO.password()));
    if (authentication.isAuthenticated()) {
      return this.jwtService.generateJwt(loginRequestDTO.username());
    }
    // Si les credentials ne sont pas correctes, on lance une exception qui sera
    // capturé par le controller
    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "username or password is not correct");
  }

  // Modification du mot de passe
  public UserResponseDTO changePassword(ChangePasswordRequestDTO changePasswordRequestDTO) {
    User user = SecurityUtils.getCurrentUser();

    // Vérification de l'ancien mot de passe
    if (!new BCryptPasswordEncoder().matches(changePasswordRequestDTO.getOldPassword(), user.getPassword())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    // Mise à jour du mot de passe
    user.setPassword(new BCryptPasswordEncoder().encode(changePasswordRequestDTO.getNewPassword()));
    user = this.userRepository.save(user);

    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("userId", user.getId());
    payload.put("username", user.getUsername());
    webSocketEventPublisher.publish("user.password.changed", payload);
    return user.toUserResponseDTO();
  }

  public User updateUser(int id, UserUpdateRequestDTO userRequestDTO) {
    User user = this.userLookupService.getUserById(id);
    UserRoleEnum currentRole = user.getRoles().stream().findFirst()
        .map(UserRole::getRole).orElse(null);
    UserRoleEnum targetRole = userRequestDTO.getRole() != null ? userRequestDTO.getRole() : currentRole;
    user.setName(userRequestDTO.getName());
    user.setUsername(userRequestDTO.getUsername());
    user.setEmail(userRequestDTO.getEmail());
    user.setPhoneNumber(userRequestDTO.getPhoneNumber());
    user.setMatricule(userRequestDTO.getMatricule());
    if (userRequestDTO.getActive() != null) {
      user.setActive(userRequestDTO.getActive());
    }
    if (userRequestDTO.getRole() != null) {
      user = this.userLookupService.UpdateUserRoles(user, userRequestDTO.getRole());
    }
    if (userRequestDTO.getDepartmentsIds() != null) {
      if (targetRole == UserRoleEnum.DEPARTMENT_MANAGER) {
        if (userRequestDTO.getDepartmentsIds().size() != 1) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
              "Department manager must belong to exactly one department");
        }
        departmentLookupService.assignDepartmentManager(userRequestDTO.getDepartmentsIds().get(0), user);
      }
      departmentLookupService.updateDepartmentsForUser(userRequestDTO.getDepartmentsIds(), user);
    }
    user = this.userRepository.save(user);

    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("userId", user.getId());
    payload.put("name", user.getName());
    payload.put("role", targetRole != null ? targetRole.name() : null);
    payload.put("active", user.isActive());
    payload.put("departmentsIds", userRequestDTO.getDepartmentsIds() == null
        ? java.util.List.of()
        : userRequestDTO.getDepartmentsIds());
    webSocketEventPublisher.publish("user.updated", payload);
    return user;
  }

  public User desactivateUser(int id) {
    User user = this.userLookupService.getUserById(id);
    user.setActive(false);
    user = this.userRepository.save(user);
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("userId", user.getId());
    payload.put("active", user.isActive());
    webSocketEventPublisher.publish("user.deactivated", payload);
    return user;
  }

  public User activateUser(int id) {
    User user = this.userLookupService.getUserById(id);
    user.setActive(true);
    user = this.userRepository.save(user);
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("userId", user.getId());
    payload.put("active", user.isActive());
    webSocketEventPublisher.publish("user.activated", payload);
    return user;
  }

  @Transactional
  public void deleteUser(int userId) {
    User user = this.userLookupService.getUserById(userId);

    // Supprimer les liens entre l'utilisateur et les matières
    for (Subject subject : user.getSubjects()) {
      subject.getTeachers().remove(user); // Rompre le lien dans l'autre sens
    }
    user.getSubjects().clear(); // Rompre le lien côté utilisateur

    // Supprimer tous les liens ManyToMany avec les départements
    for (Department dept : user.getDepartments()) {
      dept.getTeachers().remove(user);
    }
    user.getDepartments().clear();

    // Maintenant, tu peux supprimer l'utilisateur en toute sécurité
    userRepository.delete(user);
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
    payload.put("userId", userId);
    payload.put("name", user.getName());
    payload.put("username", user.getUsername());
    webSocketEventPublisher.publish("user.deleted", payload);

  }

  public User getUserById(int userId) {
    return this.userLookupService.getUserById(userId);
  }
}
