package enspy.studam.studam_web.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import enspy.studam.studam_web.models.SystemSetting;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
  Optional<SystemSetting> findBySettingKey(String settingKey);
}
