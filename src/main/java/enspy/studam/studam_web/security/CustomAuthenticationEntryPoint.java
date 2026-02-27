package enspy.studam.studam_web.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
  private static final Logger LOGGER = LoggerFactory.getLogger(CustomAuthenticationEntryPoint.class);

  @Override
  public void commence(HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException) throws IOException {
    LOGGER.warn("401 Unauthorized: method={} uri={} query={} authHeaderPresent={}",
        request.getMethod(),
        request.getRequestURI(),
        request.getQueryString(),
        request.getHeader("Authorization") != null);

    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
    response.setContentType("application/json");
    response.getWriter().write("{\"error\": \"Authentication required\"}");
  }
}
