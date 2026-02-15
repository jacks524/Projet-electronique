package enspy.studam.studam_web.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.services.SystemSettingService;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/system-settings")
public class SystemSettingController {

  private final SystemSettingService systemSettingService;

  @GetMapping("/admin")
  public ResponseEntity<Map<String, Object>> getAdminSettings() {
    return ResponseEntity.ok(systemSettingService.getAdminSettings());
  }

  @PutMapping("/admin")
  public ResponseEntity<Map<String, Object>> updateAdminSettings(@RequestBody Map<String, Object> payload) {
    return ResponseEntity.ok(systemSettingService.saveAdminSettings(payload));
  }
}
