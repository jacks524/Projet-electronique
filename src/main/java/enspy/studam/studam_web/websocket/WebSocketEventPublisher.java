package enspy.studam.studam_web.websocket;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class WebSocketEventPublisher {

  private final WebSocketBroadcastHandler broadcastHandler;
  private final ObjectMapper objectMapper;

  public WebSocketEventPublisher(WebSocketBroadcastHandler broadcastHandler, ObjectMapper objectMapper) {
    this.broadcastHandler = broadcastHandler;
    this.objectMapper = objectMapper;
  }

  public void publish(String type, Object payload) {
    Map<String, Object> message = new LinkedHashMap<>();
    message.put("type", type);
    message.put("timestamp", OffsetDateTime.now().toString());
    message.put("payload", payload);
    try {
      broadcastHandler.broadcast(objectMapper.writeValueAsString(message));
    } catch (JsonProcessingException ex) {
      // Ignore serialization issues to avoid breaking main flow.
    }
  }
}
