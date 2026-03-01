package enspy.studam.studam_web.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import enspy.studam.studam_web.models.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class JWtFilter extends OncePerRequestFilter {
  private static final Logger LOGGER = LoggerFactory.getLogger(JWtFilter.class);

  private JwtService jwtService;

  private UserDetailsService userDetailsService;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String uri = request.getRequestURI();
    if (uri == null) return false;

    // Routes explicitement publiques pour les appareils ESP32.
    return uri.equals("/fingerprint/text")
        || uri.equals("/api/fingerprint/text")
        || uri.equals("/attendance-session/launch/pending")
        || uri.equals("/api/attendance-session/launch/pending")
        || uri.equals("/fingerprint/config/published")
        || uri.equals("/api/fingerprint/config/published");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {

    String token = null;
    String username = null;
    boolean isTokenExpired = false;

    String authorization = request.getHeader("Authorization");

    if (authorization != null && !authorization.isBlank()) {
      token = authorization.trim();
      // Accepte:
      // - "Bearer <jwt>"
      // - "<jwt>"
      // - "Bearer Bearer <jwt>" (erreur client frequente)
      if (token.startsWith("Bearer ")) token = token.substring(7).trim();
      if (token.startsWith("Bearer ")) token = token.substring(7).trim();
      try {
        isTokenExpired = jwtService.isTokenExpired(token);
        // tokenDansLaBD = this.jwtService.tokenByValue(token);
        username = jwtService.extractUsername(token);
      } catch (Exception ex) {
        LOGGER.warn("JWT parsing failed on path {}: {}", request.getRequestURI(), ex.getMessage());
      }
    }
    if (!isTokenExpired
        && username != null
        // && tokenDansLaBD.getUtilisateur().getEmail().equals(username)
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      User utilisateur = (User) userDetailsService.loadUserByUsername(username);
      UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(utilisateur,
          token, utilisateur.getAuthorities());
      SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    filterChain.doFilter(request, response);

  }

}
