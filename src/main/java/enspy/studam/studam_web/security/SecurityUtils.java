package enspy.studam.studam_web.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SecurityUtils {

  private final UserRepository userRepository;

  public User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()
        || authentication instanceof AnonymousAuthenticationToken) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }

    Object principal = authentication.getPrincipal();
    if (principal instanceof User user) {
      return user;
    }

    if (principal instanceof String username && !username.isBlank()
        && !"anonymousUser".equalsIgnoreCase(username)) {
      User user = userRepository.findByUsername(username);
      if (user != null) {
        return user;
      }
    }

    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
  }
}
