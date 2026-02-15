package enspy.studam.studam_web.services;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import enspy.studam.studam_web.models.SystemSetting;
import enspy.studam.studam_web.repositories.SystemSettingRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SystemSettingService {

  private static final String ADMIN_SETTINGS_KEY = "ADMIN_SYSTEM_SETTINGS";

  private final SystemSettingRepository systemSettingRepository;
  private final ObjectMapper objectMapper;

  public Map<String, Object> getAdminSettings() {
    try {
      return systemSettingRepository.findBySettingKey(ADMIN_SETTINGS_KEY)
          .map(SystemSetting::getSettingValue)
          .map(this::toMap)
          .orElse(Collections.emptyMap());
    } catch (Exception e) {
      throw new IllegalStateException("Impossible de charger les parametres systeme.", e);
    }
  }

  public Map<String, Object> saveAdminSettings(Map<String, Object> payload) {
    try {
      SystemSetting setting = systemSettingRepository.findBySettingKey(ADMIN_SETTINGS_KEY)
          .orElseGet(() -> {
            SystemSetting created = new SystemSetting();
            created.setSettingKey(ADMIN_SETTINGS_KEY);
            return created;
          });

      setting.setSettingValue(objectMapper.writeValueAsString(payload == null ? Collections.emptyMap() : payload));
      setting.setUpdatedAt(LocalDateTime.now());
      systemSettingRepository.save(setting);
      return payload == null ? Collections.emptyMap() : payload;
    } catch (Exception e) {
      throw new IllegalStateException("Impossible d'enregistrer les parametres systeme.", e);
    }
  }

  private Map<String, Object> toMap(String json) {
    try {
      if (json == null || json.isBlank()) {
        return Collections.emptyMap();
      }
      return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
      });
    } catch (Exception e) {
      return Collections.emptyMap();
    }
  }
}
