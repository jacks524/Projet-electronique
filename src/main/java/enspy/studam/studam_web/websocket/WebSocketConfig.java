package enspy.studam.studam_web.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

  private final WebSocketBroadcastHandler broadcastHandler;

  public WebSocketConfig(WebSocketBroadcastHandler broadcastHandler) {
    this.broadcastHandler = broadcastHandler;
  }

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(broadcastHandler, "/ws")
        .setAllowedOriginPatterns("*");
  }
}
