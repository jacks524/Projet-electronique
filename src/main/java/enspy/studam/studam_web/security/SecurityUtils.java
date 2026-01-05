package enspy.studam.studam_web.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.User;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SecurityUtils {

  /**
   * Retrieves the currently authenticated user from the security context.
   *
   * @return the currently authenticated User object
   * @throws ResponseStatusException if the user is not authenticated
   */
  public static User getCurrentUser() {
    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }
    return user;
  }
}
