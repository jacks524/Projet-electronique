package enspy.studam.studam_web.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.requestDTO.ScheduleRequestDTO;
import enspy.studam.studam_web.dto.responseDTO.ScheduleResponseDTO;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.services.SchedulerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/schedule")
@Tag(name = "Scheduler Management", description = "APIs for managing scheduler operations")
@AllArgsConstructor
public class ScheduleController {

  private final SchedulerService schedulerService;

  @Operation(summary = "Create a new schedule", description = "Creates a new schedule entry in the system.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Schedule successfully created."),
      @ApiResponse(responseCode = "400", description = "Invalid input data."),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the creation process.")
  })
  @PostMapping()
  public ResponseEntity<ScheduleResponseDTO> createScheduler(@RequestBody ScheduleRequestDTO entity) {
    Schedule schedule = this.schedulerService.createSchedule(entity);
    return ResponseEntity.created(null).body(ScheduleResponseDTO.toDTO(schedule));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update an existing schedule", description = "Updates an existing schedule entry in the system.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Schedule successfully updated."),
      @ApiResponse(responseCode = "400", description = "Invalid input data."),
      @ApiResponse(responseCode = "404", description = "Schedule not found."),
      @ApiResponse(responseCode = "500", description = "Internal Server Error: An unexpected error occurred during the update process.")
  })
  public ResponseEntity<ScheduleResponseDTO> updateScheduler(@RequestBody ScheduleRequestDTO entity,
      @PathVariable int id) {
    Schedule schedule = this.schedulerService.updateSchedule(id, entity);
    return ResponseEntity.ok(ScheduleResponseDTO.toDTO(schedule));
  }

}
