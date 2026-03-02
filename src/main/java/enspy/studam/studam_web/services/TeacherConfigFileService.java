package enspy.studam.studam_web.services;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import enspy.studam.studam_web.enumeration.UserRoleEnum;
import enspy.studam.studam_web.models.Class;
import enspy.studam.studam_web.models.Department;
import enspy.studam.studam_web.models.Schedule;
import enspy.studam.studam_web.models.Subject;
import enspy.studam.studam_web.models.User;
import enspy.studam.studam_web.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherConfigFileService {

  private static final Pattern LEVEL_PATTERN = Pattern.compile("(?<!\\d)([1-5])(?!\\d)");
  private static final String GENERATED_SOURCE = "GENERATED";
  private static final String MANUAL_SOURCE = "MANUAL";

  private final UserRepository userRepository;
  private volatile StoredTeacherConfig publishedConfig;

  public StoredTeacherConfig publishGeneratedConfig() {
    String rawText = buildGlobalConfigText();
    StoredTeacherConfig stored = new StoredTeacherConfig(rawText, GENERATED_SOURCE, OffsetDateTime.now());
    publishedConfig = stored;
    return stored;
  }

  public StoredTeacherConfig publishRawConfig(String rawText) {
    if (rawText == null || rawText.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Configuration text is empty");
    }
    String normalizedRawText = normalizePublishedRawConfig(rawText);
    StoredTeacherConfig stored = new StoredTeacherConfig(normalizedRawText, MANUAL_SOURCE, OffsetDateTime.now());
    publishedConfig = stored;
    return stored;
  }

  public Optional<StoredTeacherConfig> getPublishedConfig() {
    return Optional.ofNullable(publishedConfig);
  }

  private String buildGlobalConfigText() {
    List<User> teachers = userRepository.findByRoles(UserRoleEnum.TEACHER);
    teachers.sort(Comparator.comparing(User::getMatricule, String.CASE_INSENSITIVE_ORDER));

    StringBuilder builder = new StringBuilder();
    builder.append("#FORMAT=PROF_CONFIG_V1\n");
    builder.append("#MATRICULE;NOM_COMPLET;DEPARTEMENTS;AFFECTATIONS\n");
    builder.append("#DEPARTEMENTS: GIND=genie_industriel, GI=genie_informatique, GEL=genie_electrique\n");

    for (User teacher : teachers) {
      String teacherLine = buildTeacherLine(teacher);
      builder.append(teacherLine).append('\n');
    }
    return builder.toString();
  }

  private String normalizePublishedRawConfig(String rawText) {
    String[] lines = rawText.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1);
    List<String> normalizedLines = new ArrayList<>();

    for (String rawLine : lines) {
      String line = rawLine == null ? "" : rawLine.trim();
      if (line.isEmpty()) {
        continue;
      }
      if (line.startsWith("#")) {
        continue;
      }
      normalizedLines.add(normalizeTeacherConfigLine(line));
    }

    StringBuilder builder = new StringBuilder();
    builder.append("#FORMAT=PROF_CONFIG_V1\n");
    builder.append("#MATRICULE;NOM_COMPLET;DEPARTEMENTS;AFFECTATIONS\n");
    builder.append("#DEPARTEMENTS: GIND=genie_industriel, GI=genie_informatique, GEL=genie_electrique\n");
    for (String normalizedLine : normalizedLines) {
      builder.append(normalizedLine).append('\n');
    }
    return builder.toString();
  }

  private String normalizeTeacherConfigLine(String line) {
    String[] parts = line.split(";", 4);
    String matricule = parts.length > 0 ? cleanField(parts[0]) : "";
    String fullName = parts.length > 1 ? cleanField(parts[1]) : "";
    String assignmentsPart = parts.length > 3 ? parts[3].trim() : "";

    if (!matricule.isBlank()) {
      Optional<User> teacher = userRepository.findByMatricule(matricule);
      if (teacher.isPresent() && teacher.get().getRoles() != null
          && teacher.get().getRoles().stream().anyMatch(role -> role.getRole() == UserRoleEnum.TEACHER)) {
        return buildTeacherLine(teacher.get());
      }
    }

    LinkedHashSet<String> normalizedAssignments = new LinkedHashSet<>();
    Map<String, Map<Integer, TreeSet<String>>> departmentLevelSemesters = new LinkedHashMap<>();

    int start = 0;
    while (start < assignmentsPart.length()) {
      int bar = assignmentsPart.indexOf('|', start);
      String assignment = (bar >= 0) ? assignmentsPart.substring(start, bar) : assignmentsPart.substring(start);
      assignment = assignment.trim();

      int p1 = assignment.indexOf(':');
      int p2 = assignment.indexOf(':', p1 + 1);
      int p3 = assignment.indexOf(':', p2 + 1);
      if (p1 > 0 && p2 > p1 && p3 > p2) {
        String departmentCode = cleanField(assignment.substring(0, p1));
        String rawLevel = assignment.substring(p1 + 1, p2).trim();
        String semester = normalizeSemester(assignment.substring(p2 + 1, p3));
        String subjectName = cleanField(assignment.substring(p3 + 1));
        Integer level = normalizeLevel(rawLevel);

        if (!departmentCode.isBlank() && level != null && !subjectName.isBlank()) {
          normalizedAssignments.add(departmentCode + ":" + level + ":" + semester + ":" + subjectName);
          departmentLevelSemesters
              .computeIfAbsent(departmentCode, key -> new LinkedHashMap<>())
              .computeIfAbsent(level, key -> new TreeSet<>())
              .add(semester);
        }
      }

      if (bar < 0) {
        break;
      }
      start = bar + 1;
    }

    if (normalizedAssignments.isEmpty()) {
      return String.join(";",
          matricule,
          fullName,
          parts.length > 2 ? cleanField(parts[2]) : "",
          assignmentsPart);
    }

    List<String> departmentParts = new ArrayList<>();
    for (Map.Entry<String, Map<Integer, TreeSet<String>>> entry : departmentLevelSemesters.entrySet()) {
      departmentParts.add(buildDepartmentsPart(entry.getKey(), entry.getValue()));
    }

    return String.join(";",
        matricule,
        fullName,
        String.join("|", departmentParts),
        String.join("|", normalizedAssignments));
  }

  private Integer normalizeLevel(String rawLevel) {
    if (rawLevel == null || rawLevel.isBlank()) {
      return null;
    }

    Matcher matcher = LEVEL_PATTERN.matcher(rawLevel.trim().toUpperCase());
    if (matcher.find()) {
      return Integer.parseInt(matcher.group(1));
    }
    return null;
  }

  private String buildTeacherLine(User teacher) {
    String matricule = cleanField(teacher.getMatricule());
    String fullName = cleanField(teacher.getName());
    List<Department> departments = teacher.getDepartments() == null ? List.of()
        : teacher.getDepartments().stream()
            .sorted(Comparator.comparing(Department::getCode, String.CASE_INSENSITIVE_ORDER))
            .toList();

    List<String> departmentParts = new ArrayList<>();
    List<String> assignments = new ArrayList<>();

    for (Department department : departments) {
      DepartmentLineData data = buildDepartmentLineData(teacher, department);
      departmentParts.add(data.departmentPart());
      assignments.addAll(data.assignments());
    }

    String departmentsPart = departmentParts.isEmpty() ? "" : String.join("|", departmentParts);
    String assignmentsPart = assignments.isEmpty() ? "" : String.join("|", assignments);

    return String.join(";",
        matricule,
        fullName,
        departmentsPart,
        assignmentsPart);
  }

  private DepartmentLineData buildDepartmentLineData(User teacher, Department department) {
    int departmentId = department.getDepartmentId();
    String departmentCode = cleanField(department.getCode());

    List<Subject> subjects = teacher.getSubjects() == null ? List.of()
        : teacher.getSubjects().stream()
            .filter(subject -> subject.getDepartment() != null
                && subject.getDepartment().getDepartmentId() == departmentId)
            .sorted(Comparator.comparing(Subject::getName, String.CASE_INSENSITIVE_ORDER))
            .toList();

    Map<Integer, TreeSet<String>> departmentLevelSemesters = new LinkedHashMap<>();
    LinkedHashSet<String> assignments = new LinkedHashSet<>();
    for (Subject subject : subjects) {
      Map<Integer, TreeSet<String>> subjectLevelSemesters = buildSubjectLevelSemesters(subject, teacher, departmentId);
      List<Integer> orderedLevels = new ArrayList<>(subjectLevelSemesters.keySet());
      Collections.sort(orderedLevels);

      for (Integer level : orderedLevels) {
        TreeSet<String> semesters = subjectLevelSemesters.get(level);
        departmentLevelSemesters.computeIfAbsent(level, key -> new TreeSet<>()).addAll(semesters);
        for (String semester : semesters) {
          assignments.add(departmentCode + ":" + level + ":" + semester + ":" + cleanField(subject.getName()));
        }
      }
    }

    String departmentPart = buildDepartmentsPart(departmentCode, departmentLevelSemesters);
    return new DepartmentLineData(departmentPart, new ArrayList<>(assignments));
  }

  private Map<Integer, TreeSet<String>> buildSubjectLevelSemesters(Subject subject, User teacher, int departmentId) {
    Map<Integer, TreeSet<String>> result = new LinkedHashMap<>();
    String subjectSemester = normalizeSemester(subject.getSemester());

    if (subject.getSchedules() != null) {
      for (Schedule schedule : subject.getSchedules()) {
        if (schedule == null || schedule.getTeacher() == null || schedule.getTeacher().getId() != teacher.getId()) {
          continue;
        }
        if (schedule.getTimetable() == null || schedule.getTimetable().getClazz() == null) {
          continue;
        }

        Class clazz = schedule.getTimetable().getClazz();
        if (clazz.getDepartment() == null || clazz.getDepartment().getDepartmentId() != departmentId) {
          continue;
        }

        String semester = normalizeSemester(schedule.getTimetable().getSemester());
        for (Integer level : extractLevelsFromClass(clazz)) {
          result.computeIfAbsent(level, key -> new TreeSet<>()).add(semester);
        }
      }
    }

    // If the teacher has explicit schedules for this subject, trust them and do not
    // widen the mapping with all classes attached globally to the subject.
    if (!result.isEmpty()) {
      return result;
    }

    List<Class> classes = subject.getClasses();
    if (classes != null) {
      for (Class clazz : classes) {
        if (clazz == null || clazz.getDepartment() == null
            || clazz.getDepartment().getDepartmentId() != departmentId) {
          continue;
        }
        for (Integer level : extractLevelsFromClass(clazz)) {
          result.computeIfAbsent(level, key -> new TreeSet<>(List.of(subjectSemester)));
        }
      }
    }

    if (result.isEmpty()) {
      result.put(0, new TreeSet<>(List.of(subjectSemester)));
      return result;
    }

    return result;
  }

  private TreeSet<Integer> extractLevelsFromClass(Class clazz) {
    TreeSet<Integer> levels = new TreeSet<>();
    String source = (clazz.getCode() == null ? "" : clazz.getCode()) + " "
        + (clazz.getName() == null ? "" : clazz.getName());
    Matcher matcher = LEVEL_PATTERN.matcher(source);
    while (matcher.find()) {
      levels.add(Integer.parseInt(matcher.group(1)));
    }
    return levels;
  }

  private String buildDepartmentsPart(String departmentCode, Map<Integer, TreeSet<String>> levelSemesters) {
    if (levelSemesters.isEmpty()) {
      return departmentCode;
    }

    List<Integer> levels = new ArrayList<>(levelSemesters.keySet());
    Collections.sort(levels);

    List<String> levelParts = new ArrayList<>();
    for (Integer level : levels) {
      TreeSet<String> semesters = levelSemesters.get(level);
      String semesterPart = (semesters == null || semesters.isEmpty()) ? "S1" : String.join("|", semesters);
      levelParts.add(level + "(" + semesterPart + ")");
    }

    return departmentCode + "(" + String.join(",", levelParts) + ")";
  }

  private String normalizeSemester(String semester) {
    if (semester == null || semester.isBlank()) {
      return "S1";
    }
    String normalized = semester.trim().toUpperCase();
    if ("S1".equals(normalized) || "S2".equals(normalized)) {
      return normalized;
    }
    if (normalized.contains("1")) {
      return "S1";
    }
    if (normalized.contains("2")) {
      return "S2";
    }
    return "S1";
  }

  private String cleanField(String value) {
    if (value == null) {
      return "";
    }
    return value
        .replace(';', ' ')
        .replace('|', ' ')
        .replace(':', ' ')
        .replace('(', ' ')
        .replace(')', ' ')
        .replace('\n', ' ')
        .replace('\r', ' ')
        .trim();
  }

  private record DepartmentLineData(String departmentPart, List<String> assignments) {
  }

  public static final class StoredTeacherConfig {
    private final String rawText;
    private final String source;
    private final OffsetDateTime publishedAt;

    public StoredTeacherConfig(String rawText, String source, OffsetDateTime publishedAt) {
      this.rawText = rawText;
      this.source = source;
      this.publishedAt = publishedAt;
    }

    public String getRawText() {
      return rawText;
    }

    public String getSource() {
      return source;
    }

    public OffsetDateTime getPublishedAt() {
      return publishedAt;
    }
  }
}
