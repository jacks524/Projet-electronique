package enspy.studam.studam_web.services;

import org.springframework.stereotype.Service;

import enspy.studam.studam_web.repositories.AttendanceRepository;
import enspy.studam.studam_web.repositories.StudentRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FingerPrintService {

  final AttendanceRepository attendanceRepository;

  final StudentRepository studentRepository;

}
