package enspy.studam.studam_web.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import enspy.studam.studam_web.dto.responseDTO.StatisticsResponseDTO;
import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.services.DepartmentService;
import enspy.studam.studam_web.services.lookup.DepartmentLookupService;
import enspy.studam.studam_web.services.lookup.StudentLookupService;
import enspy.studam.studam_web.services.lookup.UserLookupService;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/reports")
@AllArgsConstructor
public class ReportController {

  private final DepartmentLookupService departmentLookupService;
  private final UserLookupService userLookupService;
  private final StudentLookupService studentLookupService;

  @GetMapping("/statistics")
  public ResponseEntity<StatisticsResponseDTO> getStatistics() {
    StatisticsResponseDTO statistics = new StatisticsResponseDTO();
    statistics.setTotalDepartments(departmentLookupService.countDepartments());
    statistics.setTotalStudents(studentLookupService.countStudents());
    statistics.setTotalTeachers(userLookupService.countUsersByRole(UserRoleEnum.TEACHER));
    statistics.setTotalUsers(userLookupService.countAllUsers());

    return ResponseEntity.ok(statistics);
  }
}
