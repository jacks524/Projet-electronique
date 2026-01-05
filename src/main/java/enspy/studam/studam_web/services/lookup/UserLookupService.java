package enspy.studam.studam_web.services.lookup;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.UserRole;
import enspy.studam.studam_web.repositories.UserRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserLookupService {
  private final UserRepository userRepository;

  public User getUserById(int id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id" + id));
  }

  public User getUserByMatricule(String matricule) {
    return userRepository.findByMatricule(matricule)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with matricule: " + matricule));
  }

  public User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + email));
  }

  public List<User> getUserByRole(UserRoleEnum role) {
    return userRepository.findByRoles(role);
  }

  public User UpdateUserRoles(User user, UserRoleEnum role) {
    // TODO Effacer la précedente liste de role
    List<UserRole> roleList = new ArrayList<>();
    roleList.add(new UserRole(role));
    user.setRoles(roleList);
    return userRepository.save(user);
  }

  public int countUsersByRole(UserRoleEnum role) {
    return (int) userRepository.countByUserRoleEnum(role);
  }

  public int countAllUsers() {
    return (int) userRepository.count();
  }

}
