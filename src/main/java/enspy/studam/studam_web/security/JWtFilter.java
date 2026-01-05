package enspy.studam.studam_web.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import enspy.studam.studam_web.models.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class JWtFilter extends OncePerRequestFilter {

  private JwtService jwtService;

  private UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {

    String token = null;
    String username = null;
    boolean isTokenExpired = false;

    String authorization = request.getHeader("Authorization");

    if (authorization != null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
      isTokenExpired = jwtService.isTokenExpired(token);
      // tokenDansLaBD = this.jwtService.tokenByValue(token);
      username = jwtService.extractUsername(token);
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
