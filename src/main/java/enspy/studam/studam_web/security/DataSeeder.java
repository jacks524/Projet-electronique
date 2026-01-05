package enspy.studam.studam_web.security;

import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.models.UserRole;
import enspy.studam.studam_web.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;

import java.util.Collections;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {

        // Create admin user if it doesn't exist
        if (userRepository.findByUsername("admin") == null) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin1234"));
            adminUser.setRoles(Collections.singletonList(new UserRole(UserRoleEnum.ADMIN)));
            adminUser.setName("Admin");
            adminUser.setEmail("tchassidaniel@gmail.com");
            adminUser.setPhoneNumber("650829890");
            adminUser.setMatricule("ADM-0001");
            userRepository.save(adminUser);
        }
    }
}
