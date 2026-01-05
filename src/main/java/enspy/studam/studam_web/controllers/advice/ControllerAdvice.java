package enspy.studam.studam_web.controllers.advice;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import org.springframework.web.bind.MethodArgumentNotValidException;

@RestControllerAdvice
public class ControllerAdvice {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleMethodArgumentNotValidExcepption(
      MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();

    ex.getBindingResult().getFieldErrors().forEach(error -> {
      errors.put(error.getField(), error.getDefaultMessage());
    });

    return ResponseEntity.badRequest().body(errors);
  }

  @ExceptionHandler(HttpClientErrorException.class)
  public ResponseEntity<?> handleHttoClientErrorException(HttpClientErrorException ex) {
    return new ResponseEntity<>(ex.getStatusText(), ex.getStatusCode());
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<String> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
    ex.printStackTrace();

    return new ResponseEntity<>("Erreur dans le corps de la requête : " + ex.getMessage(), HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(InvalidFormatException.class)
  public ResponseEntity<String> handleInvalidEnumValue(InvalidFormatException ex) {
    String message = "Valeur invalide pour l'énumération: " + ex.getValue();
    if (ex.getPath() != null && !ex.getPath().isEmpty()) {
      message += " pour le champ: " + ex.getPath().get(0).getFieldName();
    }
    return ResponseEntity.status(400).body(message);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
    return new ResponseEntity<>(ex.getReason(), ex.getStatusCode());
  }
}