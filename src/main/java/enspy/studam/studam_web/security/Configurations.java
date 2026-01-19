package enspy.studam.studam_web.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.AllArgsConstructor;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class Configurations {

  private JWtFilter jWtFilter;
  private BCryptPasswordEncoder passwordEncoder;
  private final CustomAuthenticationEntryPoint authenticationEntryPoint;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity https) throws Exception {

    https.csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .authorizeHttpRequests(
            (auth) -> {
              auth.requestMatchers("/user/register", "/api/user/register").permitAll()
                  .requestMatchers("/user/signin", "/api/user/signin").permitAll()
                  .requestMatchers("/user/forgot-password", "/api/user/forgot-password").permitAll()
                  .requestMatchers("/user/reset-password", "/api/user/reset-password").permitAll()
                  .requestMatchers("/fingerprint/text", "/api/fingerprint/text").permitAll()
                  .requestMatchers("/public/time", "/api/public/time").permitAll()
                  .requestMatchers("/public/time/**", "/api/public/time/**").permitAll()
                  .requestMatchers("/ws", "/ws/**").permitAll()
                  .requestMatchers("/swagger-ui/**", "/api/swagger-ui/**").permitAll()
                  .requestMatchers("/v3/api-docs/**", "/api/v3/api-docs/**").permitAll()
                  .anyRequest().authenticated();
            })
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(authenticationEntryPoint))
        .sessionManagement(httpSecuritySessionManagementConfiguger -> httpSecuritySessionManagementConfiguger
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .addFilterBefore(jWtFilter, UsernamePasswordAuthenticationFilter.class);

    return https.build();
  }

  // Pour l'authentification on fournit a Spring Security un Gestionnaire
  // d'authentification, l'AuthenticationManager
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
      throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }

  // Pour que le gestionnaire d'authentification fonctionne correctement on lui
  // fournir un fournisseur d'authentification
  @Bean
  public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
    DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();

    daoAuthenticationProvider.setUserDetailsService(userDetailsService);
    daoAuthenticationProvider.setPasswordEncoder(this.passwordEncoder);

    return daoAuthenticationProvider;
  }
}
