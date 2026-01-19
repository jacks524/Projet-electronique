package enspy.studam.studam_web.services;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.stereotype.Service;

@Service
public class FingerprintTextStore {

  private final AtomicReference<StoredFingerprintText> lastText = new AtomicReference<>();

  public void save(String rawText, String sessionDate) {
    lastText.set(new StoredFingerprintText(rawText, sessionDate, OffsetDateTime.now()));
  }

  public Optional<StoredFingerprintText> getLast() {
    return Optional.ofNullable(lastText.get());
  }

  public static final class StoredFingerprintText {
    private final String rawText;
    private final String sessionDate;
    private final OffsetDateTime receivedAt;

    private StoredFingerprintText(String rawText, String sessionDate, OffsetDateTime receivedAt) {
      this.rawText = rawText;
      this.sessionDate = sessionDate;
      this.receivedAt = receivedAt;
    }

    public String getRawText() {
      return rawText;
    }

    public String getSessionDate() {
      return sessionDate;
    }

    public OffsetDateTime getReceivedAt() {
      return receivedAt;
    }
  }
}
