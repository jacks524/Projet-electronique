package enspy.studam.studam_web.controllers.login;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.requestDTO.ChangePasswordRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.ForgotPasswordRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.LoginRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.RegisterRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.ResetPasswordRequestDTO;
import enspy.studam.studam_web.dto.requestDTO.UserUpdateRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.SubjectResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.SubjectTeacherAssignmentDTO;
import enspy.studam.studam_web.dto.responseDTO.TokenDTO;
import enspy.studam.studam_web.dto.responseDTO.UserResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.UserDTO.TeacherResponseDTO;
import enspy.studam.studam_web.dto.responseDTO.UserDTO.UsersResponseStatictics;
import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.services.LoginService;
import enspy.studam.studam_web.services.UserService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@AllArgsConstructor
@RequestMapping("/user")
public class LoginController {

  private LoginService loginService;
  private UserService userService;
  private UserLookupService userLookupService;

  @PostMapping("/register")
  @Operation(summary = "Register a new user", description = "This operation allows the registration of a new user. The user provides their details like email, username, password, and role to be registered in the system.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User successfully registered. The new user object is returned.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data. Please provide all required fields with correct format.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the registration process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
    User user = this.loginService.register(registerRequestDTO);
    return ResponseEntity.ok(user.toUserResponseDTO());
  }

  @PostMapping("/signin")
  @Operation(summary = "Sign in an existing user", description = "This operation allows an existing user to authenticate by providing a valid username and password. If the credentials are correct, a JWT token will be generated and returned.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User successfully signed in. A JWT token is returned.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenDTO.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized: Incorrect username or password. Please check the credentials and try again.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the login process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<TokenDTO> signin(@RequestBody LoginRequestDTO loginRequestDTO) {
    TokenDTO tokenDTO = this.loginService.signin(loginRequestDTO);
    return ResponseEntity.ok(tokenDTO);
  }

  @PutMapping("/change-password")
  @Operation(summary = "Change user password", description = "This operation allows a user to change their password by providing the old password and the new password. The user must be authenticated to perform this operation.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Password successfully changed.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data. Please provide the old password and the new password.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "401", description = "Unauthorized: User must be authenticated to change the password.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the password change process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequestDTO changePasswordRequestDTO) {
    this.loginService.changePassword(changePasswordRequestDTO);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/forgot-password")
  @Operation(summary = "Request password reset", description = "Send a password reset link to the user's email address.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Reset password email sent successfully"),
      @ApiResponse(responseCode = "404", description = "User not found with the provided email"),
      @ApiResponse(responseCode = "500", description = "Failed to send reset password email")
  })
  public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
    loginService.forgotPassword(request);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/reset-password")
  @Operation(summary = "Reset password", description = "Reset user's password using the token received in email", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Password reset successfully"),
      @ApiResponse(responseCode = "400", description = "Invalid or expired token"),
      @ApiResponse(responseCode = "404", description = "User not found"),
      @ApiResponse(responseCode = "500", description = "Error resetting password")
  })
  public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
    loginService.resetPassword(request);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/{userId}")
  @Operation(summary = "Get user by ID", description = "This operation retrieves a user by their unique ID.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User successfully retrieved. The user object is returned.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: User with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<UserResponseDTO> getUserById(@PathVariable int userId) {
    User user = this.loginService.getUserById(userId);
    return ResponseEntity.ok(UserResponseDTO.toDTO(user));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a user", description = "This operation updates an existing user.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User successfully updated.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid input data. Please provide all required fields with correct format.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "404", description = "Not Found: User with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the update process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<UserResponseDTO> updateUser(@PathVariable int id,
      @Valid @RequestBody UserUpdateRequestDTO userRequestDTO) {
    User updatedUser = this.loginService.updateUser(id, userRequestDTO);
    return ResponseEntity.ok(updatedUser.toUserResponseDTO());
  }

  @DeleteMapping("/{userId}")
  @Operation(summary = "Delete a user", description = "This operation deletes an existing user.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User successfully deleted.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "404", description = "Not Found: User with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the deletion process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<Void> deleteUser(@PathVariable int userId) {
    this.loginService.deleteUser(userId);
    return ResponseEntity.ok().build();
  }

  @PutMapping("/desactivate/{id}")
  @Operation(summary = "Desactivate a user", description = "This operation desactivates an existing user.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User successfully desactivated.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: User with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the desactivation process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<UserResponseDTO> desactivateUser(@PathVariable int id) {
    User desactivatedUser = this.loginService.desactivateUser(id);
    return ResponseEntity.ok(desactivatedUser.toUserResponseDTO());
  }

  @PutMapping("/activate/{id}")
  @Operation(summary = "Activate a user", description = "This operation activates an existing user.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User successfully activated.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: User with the specified ID does not exist.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the activation process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<UserResponseDTO> activateUser(@PathVariable int id) {
    User activatedUser = this.loginService.activateUser(id);
    return ResponseEntity.ok(activatedUser.toUserResponseDTO());
  }

  @PutMapping("/{teacherId}/assign-to-subject/{subjectId}")
  @Operation(summary = "Assign a teacher to a subject", description = "This operation assigns a teacher to a subject.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully assigned teacher to subject.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectTeacherAssignmentDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: Subject or teacher not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the assignment process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<List<SubjectTeacherAssignmentDTO>> assignTeacherToSubject(@PathVariable int subjectId,
      @PathVariable int teacherId) {
    User teacher = this.userLookupService.getUserById(teacherId);
    List<SubjectTeacherAssignmentDTO> response = this.userService.assignTeacherToSubject(subjectId, teacherId).stream()
        .map(subject -> SubjectTeacherAssignmentDTO.from(subject, teacher))
        .collect(Collectors.toList());
    return ResponseEntity.ok().body(response);
  }

  @PutMapping("{teacherId}/remove-subjet/{subjectId}")
  public ResponseEntity<TeacherResponseDTO> removeSubjetToTeacher(@PathVariable int teacherId,
      @PathVariable int subjectId) {
    User teacher = this.userService.removeSubjetToTeacher(teacherId, subjectId);
    return ResponseEntity.ok().body(this.userService.buildTeacherResponse(teacher));
  }

  @PutMapping("/{teacherId}/assign-to-departments")
  @Operation(summary = "Assign a user to multiple departments", description = "This operation assigns a user to multiple departments.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully assigned user to departments."),
      @ApiResponse(responseCode = "404", description = "Not Found: One or more departments or user not found.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the assignment process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<UserResponseDTO> assignUserToDepartments(@RequestBody List<Integer> departments,
      @PathVariable int teacherId) {
    this.userService.assignUserToDepartments(teacherId, departments);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/{role}/department/{departmentId}")
  @Operation(summary = "Get users by role(TEACHER, DEPARTMENT_MANAGER) and department", description = "This operation retrieves a list of users based on their role(TEACHER, DEPARTMENT_MANAGER) and department.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved users by role and department.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeacherResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Not Found: No users found for the specified role and department.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<List<TeacherResponseDTO>> getUsersByRoleAndDepartment(
      @PathVariable UserRoleEnum role, @PathVariable int departmentId) {
    List<TeacherResponseDTO> users = this.userService.getUsersByRoleAndDepartment(role, departmentId);
    return ResponseEntity.ok(users);
  }

  @GetMapping
  @Operation(summary = "Get all users with pagination", description = "This operation retrieves a paginated list of all users in the system.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved paginated list of users."),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    Page<UserResponseDTO> users = this.userService.getAllUsers(page, size);
    return ResponseEntity.ok(users);
  }

  @GetMapping("/eligible-chiefs")
  @Operation(summary = "Get eligible chiefs", description = "This operation retrieves a list of eligible chiefs.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved list of eligible chiefs.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO[].class))),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<List<UserResponseDTO>> getEligibleChiefs() {
    List<UserResponseDTO> chiefs = this.userService.getEligibleChiefs();
    return ResponseEntity.ok(chiefs);
  }

  @GetMapping("/search")
  @Operation(summary = "Search users by different criteria", description = "This operation searches for users based on the specified criteria (name, username, email, matricule, or phone).", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved users matching the search criteria.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Bad Request: Invalid search type provided.", content = @Content(mediaType = "application/json")),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the search process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<?> searchUsers(
      @RequestParam String searchTerm,
      @RequestParam(name = "type") String searchType) {
    try {
      List<UserResponseDTO> users = this.userService.searchUsers(searchTerm, searchType);
      return ResponseEntity.ok(users);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @GetMapping("/statistics")
  @Operation(summary = "Get user statistics", description = "This operation retrieves statistics about users, including the total number of users and the count of users by role.", tags = {
      "User Management" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved user statistics.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the retrieval process.", content = @Content(mediaType = "application/json"))
  })
  public ResponseEntity<UsersResponseStatictics> getUserStatistics() {
    UsersResponseStatictics statistics = this.userService.getUserStatistics();
    return ResponseEntity.ok(statistics);
  }

  @GetMapping("/teacher/{teacherId}")
  public ResponseEntity<TeacherResponseDTO> getTeacherById(@PathVariable int teacherId) {
    User teacher = this.userLookupService.getUserById(teacherId);
    return ResponseEntity.ok().body(this.userService.buildTeacherResponse(teacher));
  }
}
