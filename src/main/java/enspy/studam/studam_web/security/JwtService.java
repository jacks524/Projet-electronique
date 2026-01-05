package enspy.studam.studam_web.security;

import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import enspy.studam.studam_web.dto.responseDTO.TokenDTO;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.UserRepository;
import enspy.studam.studam_web.services.lookup.DepartmentLookupService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class JwtService {

  private UserRepository userRepository;

  private DepartmentLookupService departmentLookupService;

  private final String ENCRYPTION_KEY = "CmiiogvX6ILtIiRajQuYdYqh/Kh1Nou9BBMPVi/xgQslDTb3vJA2MPRgCM8/eGJr\n";

  public TokenDTO generateJwt(String username) {

    User user = this.userRepository.findByUsername(username);
    user.setLastConnection(LocalDateTime.now());
    this.userRepository.save(user);

    Long currentTime = System.currentTimeMillis();
    Long expireTime = currentTime + 30 * 60 * 1000;

    Map<String, Object> claims = Map.of(
        "nom", user.getName(),
        Claims.EXPIRATION, expireTime,
        Claims.SUBJECT, user.getUsername());

    final String bearer = Jwts.builder()
        .expiration(new Date(expireTime))
        .issuedAt(new Date(currentTime))
        .subject(user.getUsername())
        .claims(claims)
        .signWith(this.getKey(), SignatureAlgorithm.HS256)
        .compact();
    TokenDTO tokenDTO = TokenDTO.builder().token("Bearer " + bearer).expirationDate(new Date(expireTime))
        .role(user.getRoles()).build();
    if (user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_DEPARTMENT_MANAGER"))) {
      Department department = this.departmentLookupService.getDepartmentByUserIfManager(user);
      tokenDTO.setDepartmentIdIfChief(department.getDepartmentId());
    } else {
      tokenDTO.setDepartmentIdIfChief(0);
    }
    return tokenDTO;
  }

  private Key getKey() {
    final byte[] decoder = Decoders.BASE64.decode(ENCRYPTION_KEY);
    return Keys.hmacShaKeyFor(decoder);
  }

  public String extractUsername(String token) {
    return this.getAllClaims(token, Claims::getSubject);
  }

  public boolean isTokenExpired(String token) {
    Date expirationDate = this.getAllClaims(token, Claims::getExpiration);
    return expirationDate.before(new Date());
  }

  public String generatePasswordResetToken(String email, int userId) {
    Long currentTime = System.currentTimeMillis();
    Long expireTime = currentTime + 30 * 60 * 1000; // 30 minutes

    Map<String, Object> claims = Map.of(
        "email", email,
        "userId", userId,
        Claims.EXPIRATION, expireTime,
        Claims.SUBJECT, "password-reset");

    return Jwts.builder()
        .expiration(new Date(expireTime))
        .issuedAt(new Date(currentTime))
        .subject("password-reset")
        .claims(claims)
        .signWith(this.getKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public String extractEmail(String token) {
    return this.getAllClaims(token, claims -> claims.get("email", String.class));
  }

  public Integer extractUserId(String token) {
    return this.getAllClaims(token, claims -> claims.get("userId", Integer.class));
  }

  private <T> T getAllClaims(String token, Function<Claims, T> function) {
    Claims claims = this.getClaims(token);
    return function.apply(claims);
  }

  private Claims getClaims(String token) {
    return Jwts.parser()
        .setSigningKey(this.getKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
  }
}
